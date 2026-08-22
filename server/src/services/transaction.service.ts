import prisma from '../config/prisma';
import { TransactionType } from '@prisma/client';
import { AppError } from '../middleware/error.middleware';

export interface GetTransactionsFilter {
  search?: string;
  type?: TransactionType;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: 'date' | 'amount' | 'createdAt' | 'description';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CreateTransactionDto {
  amount: number;
  type: TransactionType;
  categoryId: string;
  description: string;
  date: string | Date;
  isRecurring?: boolean;
  recurringId?: string | null;
}

export interface UpdateTransactionDto {
  amount?: number;
  type?: TransactionType;
  categoryId?: string;
  description?: string;
  date?: string | Date;
  isRecurring?: boolean;
  recurringId?: string | null;
}

export class TransactionService {
  static async getTransactions(userId: string, filter: GetTransactionsFilter) {
    const page = filter.page || 1;
    const limit = filter.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {
      userId,
    };

    if (filter.type) {
      where.type = filter.type;
    }

    if (filter.categoryId) {
      where.categoryId = filter.categoryId;
    }

    if (filter.search && filter.search.trim() !== '') {
      where.description = {
        contains: filter.search.trim(),
        mode: 'insensitive',
      };
    }

    if (filter.startDate || filter.endDate) {
      where.date = {};
      if (filter.startDate) {
        where.date.gte = new Date(filter.startDate);
      }
      if (filter.endDate) {
        const end = new Date(filter.endDate);
        end.setHours(23, 59, 59, 999);
        where.date.lte = end;
      }
    }

    const sortBy = filter.sortBy || 'date';
    const sortOrder = filter.sortOrder || 'desc';

    const [total, transactions] = await Promise.all([
      prisma.transaction.count({ where }),
      prisma.transaction.findMany({
        where,
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
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      transactions,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  static async getTransactionById(userId: string, id: string) {
    const transaction = await prisma.transaction.findFirst({
      where: { id, userId },
      include: {
        category: true,
        recurring: true,
      },
    });

    if (!transaction) {
      throw new AppError('Transaction not found or unauthorized access.', 404);
    }

    return transaction;
  }

  static async createTransaction(userId: string, data: CreateTransactionDto) {
    const category = await prisma.category.findFirst({
      where: {
        id: data.categoryId,
        OR: [{ userId }, { isSystem: true, userId: null }],
      },
    });

    if (!category) {
      throw new AppError('Specified category does not exist.', 400);
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId,
        amount: data.amount,
        type: data.type,
        categoryId: data.categoryId,
        description: data.description,
        date: new Date(data.date),
        isRecurring: data.isRecurring || false,
        recurringId: data.recurringId || null,
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
    });

    return transaction;
  }

  static async updateTransaction(userId: string, id: string, data: UpdateTransactionDto) {
    const existing = await prisma.transaction.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new AppError('Transaction not found or unauthorized access.', 404);
    }

    if (data.categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: data.categoryId,
          OR: [{ userId }, { isSystem: true, userId: null }],
        },
      });
      if (!category) {
        throw new AppError('Specified category does not exist.', 400);
      }
    }

    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.date !== undefined && { date: new Date(data.date) }),
        ...(data.isRecurring !== undefined && { isRecurring: data.isRecurring }),
        ...(data.recurringId !== undefined && { recurringId: data.recurringId }),
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
    });

    return updated;
  }

  static async deleteTransaction(userId: string, id: string) {
    const existing = await prisma.transaction.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new AppError('Transaction not found or unauthorized access.', 404);
    }

    await prisma.transaction.delete({
      where: { id },
    });

    return { id };
  }
}
