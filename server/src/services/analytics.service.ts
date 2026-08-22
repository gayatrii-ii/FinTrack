import prisma from '../config/prisma';
import { TransactionType } from '@prisma/client';

export class AnalyticsService {
  private static parseDateRange(startDateStr?: string, endDateStr?: string) {
    let start: Date;
    let end: Date;

    if (startDateStr) {
      start = new Date(startDateStr);
    } else {
      const now = new Date();
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    if (endDateStr) {
      end = new Date(endDateStr);
      end.setHours(23, 59, 59, 999);
    } else {
      end = new Date();
      end.setHours(23, 59, 59, 999);
    }

    return { start, end };
  }

  static async getOverview(userId: string, startDateStr?: string, endDateStr?: string) {
    const { start, end } = this.parseDateRange(startDateStr, endDateStr);

    const [allIncome, allExpense] = await Promise.all([
      prisma.transaction.aggregate({
        where: { userId, type: TransactionType.INCOME },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { userId, type: TransactionType.EXPENSE },
        _sum: { amount: true },
      }),
    ]);

    const totalBalance = (allIncome._sum.amount || 0) - (allExpense._sum.amount || 0);

    const periodWhere = {
      userId,
      date: { gte: start, lte: end },
    };

    const [periodIncome, periodExpense, periodCount, largestExpense, largestIncome] =
      await Promise.all([
        prisma.transaction.aggregate({
          where: { ...periodWhere, type: TransactionType.INCOME },
          _sum: { amount: true },
        }),
        prisma.transaction.aggregate({
          where: { ...periodWhere, type: TransactionType.EXPENSE },
          _sum: { amount: true },
        }),
        prisma.transaction.count({ where: periodWhere }),
        prisma.transaction.findFirst({
          where: { ...periodWhere, type: TransactionType.EXPENSE },
          orderBy: { amount: 'desc' },
          include: { category: true },
        }),
        prisma.transaction.findFirst({
          where: { ...periodWhere, type: TransactionType.INCOME },
          orderBy: { amount: 'desc' },
          include: { category: true },
        }),
      ]);

    const income = periodIncome._sum.amount || 0;
    const expense = periodExpense._sum.amount || 0;
    const savings = income - expense;
    const savingsRate = income > 0 ? Math.round(((income - expense) / income) * 100) : 0;

    const categorySpending = await prisma.transaction.groupBy({
      by: ['categoryId'],
      where: { ...periodWhere, type: TransactionType.EXPENSE },
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: 1,
    });

    let topCategory = null;
    if (categorySpending.length > 0) {
      const cat = await prisma.category.findUnique({
        where: { id: categorySpending[0].categoryId },
      });
      if (cat) {
        topCategory = {
          name: cat.name,
          color: cat.color,
          icon: cat.icon,
          amount: categorySpending[0]._sum.amount || 0,
        };
      }
    }

    return {
      dateRange: {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      },
      currentBalance: totalBalance,
      totalIncome: income,
      totalExpenses: expense,
      netSavings: savings,
      savingsRate,
      transactionCount: periodCount,
      topExpenseCategory: topCategory,
      largestExpense: largestExpense
        ? {
            id: largestExpense.id,
            description: largestExpense.description,
            amount: largestExpense.amount,
            date: largestExpense.date,
            categoryName: largestExpense.category.name,
          }
        : null,
      largestIncome: largestIncome
        ? {
            id: largestIncome.id,
            description: largestIncome.description,
            amount: largestIncome.amount,
            date: largestIncome.date,
            categoryName: largestIncome.category.name,
          }
        : null,
    };
  }

  static async getSpendingTrend(userId: string, startDateStr?: string, endDateStr?: string) {
    const { start, end } = this.parseDateRange(startDateStr, endDateStr);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: start, lte: end },
      },
      orderBy: { date: 'asc' },
      select: {
        date: true,
        amount: true,
        type: true,
      },
    });

    const trendMap = new Map<string, { income: number; expense: number }>();

    transactions.forEach((tx) => {
      const dateKey = tx.date.toISOString().split('T')[0];
      const existing = trendMap.get(dateKey) || { income: 0, expense: 0 };
      if (tx.type === TransactionType.INCOME) {
        existing.income += tx.amount;
      } else {
        existing.expense += tx.amount;
      }
      trendMap.set(dateKey, existing);
    });

    const trendData = Array.from(trendMap.entries()).map(([date, values]) => ({
      date,
      income: Math.round(values.income * 100) / 100,
      expense: Math.round(values.expense * 100) / 100,
      net: Math.round((values.income - values.expense) * 100) / 100,
    }));

    return trendData;
  }

  static async getCategoryBreakdown(
    userId: string,
    startDateStr?: string,
    endDateStr?: string,
    type: TransactionType = TransactionType.EXPENSE
  ) {
    const { start, end } = this.parseDateRange(startDateStr, endDateStr);

    const categoryGroups = await prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        userId,
        type,
        date: { gte: start, lte: end },
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          amount: 'desc',
        },
      },
    });

    const categoryIds = categoryGroups.map((g) => g.categoryId);
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
    });

    const catMap = new Map(categories.map((c) => [c.id, c]));

    const totalAmount = categoryGroups.reduce(
      (sum, group) => sum + (group._sum.amount || 0),
      0
    );

    const breakdown = categoryGroups.map((group) => {
      const cat = catMap.get(group.categoryId);
      const amount = group._sum.amount || 0;
      const percentage = totalAmount > 0 ? Math.round((amount / totalAmount) * 1000) / 10 : 0;

      return {
        categoryId: group.categoryId,
        name: cat?.name || 'Uncategorized',
        color: cat?.color || '#64748B',
        icon: cat?.icon || 'tag',
        amount: Math.round(amount * 100) / 100,
        count: group._count.id,
        percentage,
      };
    });

    return {
      totalAmount: Math.round(totalAmount * 100) / 100,
      type,
      breakdown,
    };
  }

  static async getMonthlyComparison(userId: string, monthsCount = 6) {
    const now = new Date();
    const result = [];

    for (let i = monthsCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthNum = d.getMonth() + 1;
      const yearNum = d.getFullYear();

      const startDate = new Date(Date.UTC(yearNum, monthNum - 1, 1, 0, 0, 0));
      const endDate = new Date(Date.UTC(yearNum, monthNum, 0, 23, 59, 59, 999));

      const monthName = d.toLocaleString('default', { month: 'short' });
      const label = `${monthName} ${yearNum}`;

      const [incomeAgg, expenseAgg] = await Promise.all([
        prisma.transaction.aggregate({
          where: {
            userId,
            type: TransactionType.INCOME,
            date: { gte: startDate, lte: endDate },
          },
          _sum: { amount: true },
        }),
        prisma.transaction.aggregate({
          where: {
            userId,
            type: TransactionType.EXPENSE,
            date: { gte: startDate, lte: endDate },
          },
          _sum: { amount: true },
        }),
      ]);

      const income = incomeAgg._sum.amount || 0;
      const expense = expenseAgg._sum.amount || 0;
      const savings = income - expense;

      result.push({
        label,
        month: monthNum,
        year: yearNum,
        income: Math.round(income * 100) / 100,
        expense: Math.round(expense * 100) / 100,
        savings: Math.round(savings * 100) / 100,
      });
    }

    return result;
  }
}
