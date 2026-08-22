import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { sendError } from '../utils/response';
import { config } from '../config/env';

export class AppError extends Error {
  statusCode: number;
  errors?: Record<string, string[]>;

  constructor(message: string, statusCode = 400, errors?: Record<string, string[]>) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (config.nodeEnv !== 'production') {
    console.error('Error stack:', err);
  }

  // Handle custom AppError
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode, err.errors);
    return;
  }

  // Handle Prisma Known Request Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': {
        const target = (err.meta?.target as string[])?.join(', ') || 'field';
        sendError(res, `A record with this ${target} already exists.`, 409);
        return;
      }
      case 'P2025': {
        sendError(res, 'Requested record was not found.', 404);
        return;
      }
      case 'P2003': {
        sendError(res, 'Cannot perform operation due to existing related records.', 409);
        return;
      }
      default: {
        sendError(res, `Database error: ${err.message}`, 400);
        return;
      }
    }
  }

  // Handle Prisma Validation Errors
  if (err instanceof Prisma.PrismaClientValidationError) {
    sendError(res, 'Invalid data provided to database query.', 422);
    return;
  }

  // Fallback internal server error
  const message =
    config.nodeEnv === 'production' ? 'Internal server error occurred.' : err.message || 'Server error';
  sendError(res, message, 500);
};
