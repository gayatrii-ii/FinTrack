import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { sendError } from '../utils/response';

export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      if (parsed.body) req.body = parsed.body;
      if (parsed.query) (req as any).validatedQuery = parsed.query;
      if (parsed.params) (req as any).validatedParams = parsed.params;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors: Record<string, string[]> = {};

        error.errors.forEach((err) => {
          const path = err.path.slice(1).join('.') || 'root';
          if (!formattedErrors[path]) {
            formattedErrors[path] = [];
          }
          formattedErrors[path].push(err.message);
        });

        const firstMessage = error.errors[0]?.message || 'Validation failed';
        sendError(res, firstMessage, 422, formattedErrors);
        return;
      }

      sendError(res, 'Internal validation error occurred.', 500);
    }
  };
};
