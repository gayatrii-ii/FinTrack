import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt';
import { sendError } from '../utils/response';
import prisma from '../config/prisma';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    currency: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendError(res, 'Authentication required. No token provided.', 401);
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      sendError(res, 'Authentication required. Invalid token format.', 401);
      return;
    }

    const decoded: TokenPayload = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        currency: true,
      },
    });

    if (!user) {
      sendError(res, 'User no longer exists or session expired.', 401);
      return;
    }

    req.user = user;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      sendError(res, 'Authentication token has expired. Please log in again.', 401);
      return;
    }
    if (error.name === 'JsonWebTokenError') {
      sendError(res, 'Invalid authentication token.', 401);
      return;
    }
    sendError(res, 'Authentication failed.', 401);
  }
};
