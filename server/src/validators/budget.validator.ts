import { z } from 'zod';

export const createBudgetSchema = z.object({
  body: z.object({
    categoryId: z.string().min(1, 'Category is required'),
    amount: z.number().positive('Budget amount must be greater than zero'),
    month: z.number().int().min(1).max(12),
    year: z.number().int().min(2000).max(2100),
    alertThreshold: z.number().min(1).max(100).optional().default(80),
  }),
});

export const updateBudgetSchema = z.object({
  params: z.object({
    id: z.string().uuid().or(z.string().min(1)),
  }),
  body: z.object({
    amount: z.number().positive('Budget amount must be greater than zero').optional(),
    alertThreshold: z.number().min(1).max(100).optional(),
  }),
});

export const getBudgetsQuerySchema = z.object({
  query: z.object({
    month: z.string().regex(/^\d+$/).transform(Number).optional(),
    year: z.string().regex(/^\d+$/).transform(Number).optional(),
  }),
});
