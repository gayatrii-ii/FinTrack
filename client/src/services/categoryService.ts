import api from './api';
import { Category, ApiResponse, TransactionType } from '../types';

export const categoryService = {
  async getCategories(type?: TransactionType): Promise<Category[]> {
    const params = type ? { type } : {};
    const res = await api.get<ApiResponse<Category[]>>('/categories', { params });
    return res.data.data || [];
  },

  async createCategory(data: {
    name: string;
    type: TransactionType;
    icon?: string;
    color?: string;
  }): Promise<Category> {
    const res = await api.post<ApiResponse<Category>>('/categories', data);
    return res.data.data!;
  },
};
