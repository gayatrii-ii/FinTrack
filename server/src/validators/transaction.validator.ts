import { z } from 'zod';

export const createTransactionSchema = z.object({
  body: z.object({
    amount: z.number().positive('Amount must be greater than zero'),
    type: z.enum(['INCOME', 'EXPENSE'], {
      errorMap: () => ({ message: 'Transaction type must be INCOME or EXPENSE' }),
    }),
    categoryId: z.string().min(1, 'Category is required'),
    description: z.string().min(1, 'Description is required').max(255),
    date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
    isRecurring: z.boolean().optional().default(false),
    recurringId: z.string().optional().nullable(),
  }),
});

export const updateTransactionSchema = z.object({
  params: z.object({
    id: z.string().uuid().or(z.string().min(1)),
  }),
  body: z.object({
    amount: z.number().positive('Amount must be greater than zero').optional(),
    type: z.enum(['INCOME', 'EXPENSE']).optional(),
    categoryId: z.string().min(1).optional(),
    description: z.string().min(1).max(255).optional(),
    date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
    isRecurring: z.boolean().optional(),
    recurringId: z.string().optional().nullable(),
  }),
});

export const getTransactionsQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    type: z.enum(['INCOME', 'EXPENSE']).optional(),
    categoryId: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    sortBy: z.enum(['date', 'amount', 'createdAt', 'description']).optional().default('date'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
    page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).optional().default('20'),
  }),
});
