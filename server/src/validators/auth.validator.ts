import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
    email: z.string().email('Please enter a valid email address').toLowerCase(),
    password: z.string().min(6, 'Password must be at least 6 characters').max(100, 'Password is too long'),
    currency: z.string().default('INR'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Please enter a valid email address').toLowerCase(),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    currency: z.string().min(1).max(10).optional(),
  }),
});
