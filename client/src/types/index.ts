export type TransactionType = 'INCOME' | 'EXPENSE';

export type Frequency = 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'YEARLY';

export type RecurringStatus = 'ACTIVE' | 'PAUSED' | 'CANCELLED';

export interface User {
  id: string;
  name: string;
  email: string;
  currency: string;
  createdAt: string;
}

export interface Category {
  id: string;
  userId?: string | null;
  name: string;
  type: TransactionType;
  icon?: string | null;
  color?: string | null;
  isSystem: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  categoryId: string;
  recurringId?: string | null;
  amount: number;
  type: TransactionType;
  description: string;
  date: string;
  isRecurring: boolean;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  recurring?: RecurringTransaction | null;
}

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  amount: number;
  month: number;
  year: number;
  alertThreshold: number;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  spent?: number;
  remaining?: number;
  percentage?: number;
  isExceeded?: boolean;
  isWarning?: boolean;
}

export interface BudgetSummary {
  totalBudgeted: number;
  totalSpent: number;
  totalRemaining: number;
  overallPercentage: number;
  isExceeded: boolean;
}

export interface BudgetsResponse {
  month: number;
  year: number;
  summary: BudgetSummary;
  budgets: Budget[];
}

export interface RecurringTransaction {
  id: string;
  userId: string;
  categoryId: string;
  title: string;
  description?: string | null;
  amount: number;
  type: TransactionType;
  frequency: Frequency;
  startDate: string;
  nextOccurrence: string;
  status: RecurringStatus;
  lastProcessedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  category?: Category;
}

export interface AnalyticsOverview {
  dateRange: {
    startDate: string;
    endDate: string;
  };
  currentBalance: number;
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number;
  transactionCount: number;
  topExpenseCategory: {
    name: string;
    color: string;
    icon: string;
    amount: number;
  } | null;
  largestExpense: {
    id: string;
    description: string;
    amount: number;
    date: string;
    categoryName: string;
  } | null;
  largestIncome: {
    id: string;
    description: string;
    amount: number;
    date: string;
    categoryName: string;
  } | null;
}

export interface SpendingTrendPoint {
  date: string;
  income: number;
  expense: number;
  net: number;
}

export interface CategoryBreakdownItem {
  categoryId: string;
  name: string;
  color: string;
  icon: string;
  amount: number;
  count: number;
  percentage: number;
}

export interface CategoryBreakdownResponse {
  totalAmount: number;
  type: TransactionType;
  breakdown: CategoryBreakdownItem[];
}

export interface MonthlyComparisonPoint {
  label: string;
  month: number;
  year: number;
  income: number;
  expense: number;
  savings: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
  meta?: PaginationMeta;
}
