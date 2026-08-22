import prisma from '../config/prisma';
import { TransactionType } from '../types';
import { AppError } from '../middleware/error.middleware';

export interface CreateBudgetDto {
  categoryId: string;
  amount: number;
  month: number;
  year: number;
  alertThreshold?: number;
}

export interface UpdateBudgetDto {
  amount?: number;
  alertThreshold?: number;
}

export class BudgetService {
  static async getBudgets(userId: string, month?: number, year?: number) {
    const now = new Date();
    const targetMonth = month || now.getMonth() + 1;
    const targetYear = year || now.getFullYear();

    const startDate = new Date(Date.UTC(targetYear, targetMonth - 1, 1, 0, 0, 0));
    const endDate = new Date(Date.UTC(targetYear, targetMonth, 0, 23, 59, 59, 999));

    const budgets = await prisma.budget.findMany({
      where: {
        userId,
        month: targetMonth,
        year: targetYear,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
            type: true,
          },
        },
      },
      orderBy: {
        amount: 'desc',
      },
    });

    const categorySpending = await prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        userId,
        type: TransactionType.EXPENSE,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const spendingMap = new Map<string, number>();
    categorySpending.forEach((item) => {
      spendingMap.set(item.categoryId, item._sum.amount || 0);
    });

    let totalBudgeted = 0;
    let totalSpent = 0;

    const budgetsWithMetrics = budgets.map((b) => {
      const spent = spendingMap.get(b.categoryId) || 0;
      const remaining = Math.max(0, b.amount - spent);
      const percentage = b.amount > 0 ? Math.min(999, Math.round((spent / b.amount) * 100)) : 0;
      const isExceeded = spent > b.amount;
      const isWarning = percentage >= b.alertThreshold && !isExceeded;

      totalBudgeted += b.amount;
      totalSpent += spent;

      return {
        ...b,
        spent,
        remaining,
        percentage,
        isExceeded,
        isWarning,
      };
    });

    const totalRemaining = Math.max(0, totalBudgeted - totalSpent);
    const overallPercentage =
      totalBudgeted > 0 ? Math.min(999, Math.round((totalSpent / totalBudgeted) * 100)) : 0;

    return {
      month: targetMonth,
      year: targetYear,
      summary: {
        totalBudgeted,
        totalSpent,
        totalRemaining,
        overallPercentage,
        isExceeded: totalSpent > totalBudgeted,
      },
      budgets: budgetsWithMetrics,
    };
  }

  static async createBudget(userId: string, data: CreateBudgetDto) {
    const category = await prisma.category.findFirst({
      where: {
        id: data.categoryId,
        OR: [{ userId }, { isSystem: true, userId: null }],
      },
    });

    if (!category) {
      throw new AppError('Category not found.', 404);
    }

    const existing = await prisma.budget.findFirst({
      where: {
        userId,
        categoryId: data.categoryId,
        month: data.month,
        year: data.year,
      },
    });

    if (existing) {
      throw new AppError(
        `A budget for '${category.name}' already exists for ${data.month}/${data.year}. Please edit it instead.`,
        409
      );
    }

    const budget = await prisma.budget.create({
      data: {
        userId,
        categoryId: data.categoryId,
        amount: data.amount,
        month: data.month,
        year: data.year,
        alertThreshold: data.alertThreshold || 80,
      },
      include: {
        category: true,
      },
    });

    return budget;
  }

  static async updateBudget(userId: string, id: string, data: UpdateBudgetDto) {
    const existing = await prisma.budget.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new AppError('Budget not found or unauthorized access.', 404);
    }

    const updated = await prisma.budget.update({
      where: { id },
      data: {
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.alertThreshold !== undefined && { alertThreshold: data.alertThreshold }),
      },
      include: {
        category: true,
      },
    });

    return updated;
  }

  static async deleteBudget(userId: string, id: string) {
    const existing = await prisma.budget.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new AppError('Budget not found or unauthorized access.', 404);
    }

    await prisma.budget.delete({
      where: { id },
    });

    return { id };
  }
}
