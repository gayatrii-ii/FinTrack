import api from './api';
import { RecurringTransaction, ApiResponse, TransactionType, Frequency, RecurringStatus } from '../types';

export interface CreateRecurringInput {
  categoryId: string;
  title: string;
  description?: string | null;
  amount: number;
  type: TransactionType;
  frequency: Frequency;
  startDate?: string;
  nextOccurrence: string;
}

export interface UpdateRecurringInput {
  categoryId?: string;
  title?: string;
  description?: string | null;
  amount?: number;
  type?: TransactionType;
  frequency?: Frequency;
  nextOccurrence?: string;
  status?: RecurringStatus;
}

export const recurringService = {
  async getRecurring(): Promise<RecurringTransaction[]> {
    const res = await api.get<ApiResponse<RecurringTransaction[]>>('/recurring');
    return res.data.data || [];
  },

  async getUpcoming(limit = 5): Promise<RecurringTransaction[]> {
    const res = await api.get<ApiResponse<RecurringTransaction[]>>('/recurring/upcoming', {
      params: { limit },
    });
    return res.data.data || [];
  },

  async createRecurring(data: CreateRecurringInput): Promise<RecurringTransaction> {
    const res = await api.post<ApiResponse<RecurringTransaction>>('/recurring', data);
    return res.data.data!;
  },

  async updateRecurring(id: string, data: UpdateRecurringInput): Promise<RecurringTransaction> {
    const res = await api.put<ApiResponse<RecurringTransaction>>(`/recurring/${id}`, data);
    return res.data.data!;
  },

  async deleteRecurring(id: string): Promise<void> {
    await api.delete(`/recurring/${id}`);
  },

  async processDue(): Promise<{ processedCount: number }> {
    const res = await api.post<ApiResponse<{ processedCount: number }>>('/recurring/process-due');
    return res.data.data!;
  },
};
