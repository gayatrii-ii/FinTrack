import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { BudgetService } from '../services/budget.service';
import { sendSuccess } from '../utils/response';

export class BudgetController {
  static async getBudgets(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const month = req.query.month ? parseInt(req.query.month as string, 10) : undefined;
      const year = req.query.year ? parseInt(req.query.year as string, 10) : undefined;

      const result = await BudgetService.getBudgets(req.user!.id, month, year);
      sendSuccess(res, result, 'Budgets retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async createBudget(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const budget = await BudgetService.createBudget(req.user!.id, req.body);
      sendSuccess(res, budget, 'Budget created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateBudget(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const budget = await BudgetService.updateBudget(req.user!.id, req.params.id, req.body);
      sendSuccess(res, budget, 'Budget updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deleteBudget(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await BudgetService.deleteBudget(req.user!.id, req.params.id);
      sendSuccess(res, result, 'Budget deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}
