import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { TransactionService } from '../services/transaction.service';
import { sendSuccess } from '../utils/response';

export class TransactionController {
  static async getTransactions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const filters = (req as any).validatedQuery || req.query;
      const result = await TransactionService.getTransactions(req.user!.id, filters);
      sendSuccess(res, result.transactions, 'Transactions retrieved', 200, result.meta);
    } catch (error) {
      next(error);
    }
  }

  static async getTransactionById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const transaction = await TransactionService.getTransactionById(req.user!.id, req.params.id);
      sendSuccess(res, transaction, 'Transaction retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async createTransaction(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const transaction = await TransactionService.createTransaction(req.user!.id, req.body);
      sendSuccess(res, transaction, 'Transaction created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateTransaction(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const transaction = await TransactionService.updateTransaction(
        req.user!.id,
        req.params.id,
        req.body
      );
      sendSuccess(res, transaction, 'Transaction updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deleteTransaction(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await TransactionService.deleteTransaction(req.user!.id, req.params.id);
      sendSuccess(res, result, 'Transaction deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}
