import api from './api';
import { Transaction, ApiResponse, TransactionType, PaginationMeta } from '../types';

export interface TransactionFilterParams {
  search?: string;
  type?: TransactionType;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: 'date' | 'amount' | 'createdAt' | 'description';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CreateTransactionInput {
  amount: number;
  type: TransactionType;
  categoryId: string;
  description: string;
  date: string;
  isRecurring?: boolean;
  recurringId?: string | null;
}

export interface UpdateTransactionInput {
  amount?: number;
  type?: TransactionType;
  categoryId?: string;
  description?: string;
  date?: string;
  isRecurring?: boolean;
  recurringId?: string | null;
}

export const transactionService = {
  async getTransactions(
    params?: TransactionFilterParams
  ): Promise<{ transactions: Transaction[]; meta: PaginationMeta }> {
    const res = await api.get<ApiResponse<Transaction[]>>('/transactions', { params });
    return {
      transactions: res.data.data || [],
      meta: res.data.meta || { total: 0, page: 1, limit: 20, totalPages: 0 },
    };
  },

  async getTransactionById(id: string): Promise<Transaction> {
    const res = await api.get<ApiResponse<Transaction>>(`/transactions/${id}`);
    return res.data.data!;
  },

  async createTransaction(data: CreateTransactionInput): Promise<Transaction> {
    const res = await api.post<ApiResponse<Transaction>>('/transactions', data);
    return res.data.data!;
  },

  async updateTransaction(id: string, data: UpdateTransactionInput): Promise<Transaction> {
    const res = await api.put<ApiResponse<Transaction>>(`/transactions/${id}`, data);
    return res.data.data!;
  },

  async deleteTransaction(id: string): Promise<void> {
    await api.delete(`/transactions/${id}`);
  },
};
