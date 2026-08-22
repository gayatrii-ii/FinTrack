import api from './api';
import { Budget, BudgetsResponse, ApiResponse } from '../types';

export interface CreateBudgetInput {
  categoryId: string;
  amount: number;
  month: number;
  year: number;
  alertThreshold?: number;
}

export interface UpdateBudgetInput {
  amount?: number;
  alertThreshold?: number;
}

export const budgetService = {
  async getBudgets(month?: number, year?: number): Promise<BudgetsResponse> {
    const params = {
      ...(month && { month }),
      ...(year && { year }),
    };
    const res = await api.get<ApiResponse<BudgetsResponse>>('/budgets', { params });
    return res.data.data!;
  },

  async createBudget(data: CreateBudgetInput): Promise<Budget> {
    const res = await api.post<ApiResponse<Budget>>('/budgets', data);
    return res.data.data!;
  },

  async updateBudget(id: string, data: UpdateBudgetInput): Promise<Budget> {
    const res = await api.put<ApiResponse<Budget>>(`/budgets/${id}`, data);
    return res.data.data!;
  },

  async deleteBudget(id: string): Promise<void> {
    await api.delete(`/budgets/${id}`);
  },
};
