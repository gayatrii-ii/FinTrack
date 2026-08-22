export type TransactionType = 'INCOME' | 'EXPENSE';
export const TransactionType = {
  INCOME: 'INCOME' as const,
  EXPENSE: 'EXPENSE' as const,
};

export type Frequency = 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'YEARLY';
export const Frequency = {
  DAILY: 'DAILY' as const,
  WEEKLY: 'WEEKLY' as const,
  BIWEEKLY: 'BIWEEKLY' as const,
  MONTHLY: 'MONTHLY' as const,
  YEARLY: 'YEARLY' as const,
};

export type RecurringStatus = 'ACTIVE' | 'PAUSED' | 'CANCELLED';
export const RecurringStatus = {
  ACTIVE: 'ACTIVE' as const,
  PAUSED: 'PAUSED' as const,
  CANCELLED: 'CANCELLED' as const,
};
