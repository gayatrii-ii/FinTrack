import api from './api';
import {
  AnalyticsOverview,
  SpendingTrendPoint,
  CategoryBreakdownResponse,
  MonthlyComparisonPoint,
  ApiResponse,
  TransactionType,
} from '../types';

export const analyticsService = {
  async getOverview(startDate?: string, endDate?: string): Promise<AnalyticsOverview> {
    const params = {
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    };
    const res = await api.get<ApiResponse<AnalyticsOverview>>('/analytics/overview', { params });
    return res.data.data!;
  },

  async getSpendingTrend(startDate?: string, endDate?: string): Promise<SpendingTrendPoint[]> {
    const params = {
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    };
    const res = await api.get<ApiResponse<SpendingTrendPoint[]>>('/analytics/spending-trend', {
      params,
    });
    return res.data.data || [];
  },

  async getCategoryBreakdown(
    startDate?: string,
    endDate?: string,
    type: TransactionType = 'EXPENSE'
  ): Promise<CategoryBreakdownResponse> {
    const params = {
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      type,
    };
    const res = await api.get<ApiResponse<CategoryBreakdownResponse>>('/analytics/category-breakdown', {
      params,
    });
    return res.data.data!;
  },

  async getMonthlyComparison(months = 6): Promise<MonthlyComparisonPoint[]> {
    const res = await api.get<ApiResponse<MonthlyComparisonPoint[]>>('/analytics/monthly-comparison', {
      params: { months },
    });
    return res.data.data || [];
  },
};
