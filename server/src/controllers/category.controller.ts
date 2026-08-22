import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { CategoryService } from '../services/category.service';
import { sendSuccess } from '../utils/response';
import { TransactionType } from '../types';

export class CategoryController {
  static async getCategories(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const type = req.query.type as TransactionType | undefined;
      const categories = await CategoryService.getUserCategories(req.user!.id, type);
      sendSuccess(res, categories, 'Categories fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async createCategory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const category = await CategoryService.createCustomCategory(req.user!.id, req.body);
      sendSuccess(res, category, 'Custom category created successfully', 201);
    } catch (error) {
      next(error);
    }
  }
}
