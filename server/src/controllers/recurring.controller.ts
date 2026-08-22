import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { RecurringService } from '../services/recurring.service';
import { sendSuccess } from '../utils/response';

export class RecurringController {
  static async getRecurring(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const items = await RecurringService.getRecurring(req.user!.id);
      sendSuccess(res, items, 'Recurring transactions retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getUpcoming(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 5;
      const items = await RecurringService.getUpcoming(req.user!.id, limit);
      sendSuccess(res, items, 'Upcoming recurring transactions retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async createRecurring(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const item = await RecurringService.createRecurring(req.user!.id, req.body);
      sendSuccess(res, item, 'Recurring transaction created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateRecurring(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const item = await RecurringService.updateRecurring(req.user!.id, req.params.id, req.body);
      sendSuccess(res, item, 'Recurring transaction updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deleteRecurring(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await RecurringService.deleteRecurring(req.user!.id, req.params.id);
      sendSuccess(res, result, 'Recurring transaction deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  static async processDue(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await RecurringService.processDue(req.user!.id);
      sendSuccess(res, result, `Processed ${result.processedCount} due recurring transactions`);
    } catch (error) {
      next(error);
    }
  }
}
