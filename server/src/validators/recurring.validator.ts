import { z } from 'zod';

export const createRecurringSchema = z.object({
  body: z.object({
    categoryId: z.string().min(1, 'Category is required'),
    title: z.string().min(1, 'Title is required').max(100),
    description: z.string().max(255).optional().nullable(),
    amount: z.number().positive('Amount must be greater than zero'),
    type: z.enum(['INCOME', 'EXPENSE']),
    frequency: z.enum(['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'YEARLY']).default('MONTHLY'),
    startDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
    nextOccurrence: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  }),
});

export const updateRecurringSchema = z.object({
  params: z.object({
    id: z.string().uuid().or(z.string().min(1)),
  }),
  body: z.object({
    categoryId: z.string().min(1).optional(),
    title: z.string().min(1).max(100).optional(),
    description: z.string().max(255).optional().nullable(),
    amount: z.number().positive().optional(),
    type: z.enum(['INCOME', 'EXPENSE']).optional(),
    frequency: z.enum(['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'YEARLY']).optional(),
    nextOccurrence: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
    status: z.enum(['ACTIVE', 'PAUSED', 'CANCELLED']).optional(),
  }),
});
