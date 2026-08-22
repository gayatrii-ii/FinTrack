import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { AnalyticsService } from '../services/analytics.service';
import { sendSuccess } from '../utils/response';
import { TransactionType } from '../types';

export class AnalyticsController {
  static async getOverview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
      const overview = await AnalyticsService.getOverview(req.user!.id, startDate, endDate);
      sendSuccess(res, overview, 'Analytics overview retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getSpendingTrend(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
      const trend = await AnalyticsService.getSpendingTrend(req.user!.id, startDate, endDate);
      sendSuccess(res, trend, 'Spending trend retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getCategoryBreakdown(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate, type } = req.query as {
        startDate?: string;
        endDate?: string;
        type?: TransactionType;
      };
      const breakdown = await AnalyticsService.getCategoryBreakdown(
        req.user!.id,
        startDate,
        endDate,
        type || TransactionType.EXPENSE
      );
      sendSuccess(res, breakdown, 'Category breakdown retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getMonthlyComparison(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const months = req.query.months ? parseInt(req.query.months as string, 10) : 6;
      const comparison = await AnalyticsService.getMonthlyComparison(req.user!.id, months);
      sendSuccess(res, comparison, 'Monthly comparison retrieved');
    } catch (error) {
      next(error);
    }
  }
}
