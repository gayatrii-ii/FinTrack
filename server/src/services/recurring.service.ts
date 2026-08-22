import prisma from '../config/prisma';
import { Frequency, RecurringStatus, TransactionType } from '@prisma/client';
import { AppError } from '../middleware/error.middleware';

export interface CreateRecurringDto {
  categoryId: string;
  title: string;
  description?: string | null;
  amount: number;
  type: TransactionType;
  frequency: Frequency;
  startDate?: string | Date;
  nextOccurrence: string | Date;
}

export interface UpdateRecurringDto {
  categoryId?: string;
  title?: string;
  description?: string | null;
  amount?: number;
  type?: TransactionType;
  frequency?: Frequency;
  nextOccurrence?: string | Date;
  status?: RecurringStatus;
}

export class RecurringService {
  static calculateNextOccurrence(currentDate: Date, frequency: Frequency): Date {
    const next = new Date(currentDate);
    switch (frequency) {
      case Frequency.DAILY:
        next.setDate(next.getDate() + 1);
        break;
      case Frequency.WEEKLY:
        next.setDate(next.getDate() + 7);
        break;
      case Frequency.BIWEEKLY:
        next.setDate(next.getDate() + 14);
        break;
      case Frequency.MONTHLY:
        next.setMonth(next.getMonth() + 1);
        break;
      case Frequency.YEARLY:
        next.setFullYear(next.getFullYear() + 1);
        break;
      default:
        next.setMonth(next.getMonth() + 1);
    }
    return next;
  }

  static async getRecurring(userId: string) {
    return prisma.recurringTransaction.findMany({
      where: { userId },
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
        nextOccurrence: 'asc',
      },
    });
  }

  static async getUpcoming(userId: string, limit = 5) {
    return prisma.recurringTransaction.findMany({
      where: {
        userId,
        status: RecurringStatus.ACTIVE,
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
        nextOccurrence: 'asc',
      },
      take: limit,
    });
  }

  static async createRecurring(userId: string, data: CreateRecurringDto) {
    const category = await prisma.category.findFirst({
      where: {
        id: data.categoryId,
        OR: [{ userId }, { isSystem: true, userId: null }],
      },
    });

    if (!category) {
      throw new AppError('Category not found.', 404);
    }

    return prisma.recurringTransaction.create({
      data: {
        userId,
        categoryId: data.categoryId,
        title: data.title,
        description: data.description,
        amount: data.amount,
        type: data.type,
        frequency: data.frequency,
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        nextOccurrence: new Date(data.nextOccurrence),
        status: RecurringStatus.ACTIVE,
      },
      include: {
        category: true,
      },
    });
  }

  static async updateRecurring(userId: string, id: string, data: UpdateRecurringDto) {
    const existing = await prisma.recurringTransaction.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new AppError('Recurring transaction not found or unauthorized access.', 404);
    }

    if (data.categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: data.categoryId,
          OR: [{ userId }, { isSystem: true, userId: null }],
        },
      });
      if (!category) {
        throw new AppError('Category not found.', 404);
      }
    }

    return prisma.recurringTransaction.update({
      where: { id },
      data: {
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.frequency !== undefined && { frequency: data.frequency }),
        ...(data.nextOccurrence !== undefined && { nextOccurrence: new Date(data.nextOccurrence) }),
        ...(data.status !== undefined && { status: data.status }),
      },
      include: {
        category: true,
      },
    });
  }

  static async deleteRecurring(userId: string, id: string) {
    const existing = await prisma.recurringTransaction.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new AppError('Recurring transaction not found or unauthorized access.', 404);
    }

    await prisma.recurringTransaction.delete({
      where: { id },
    });

    return { id };
  }

  static async processDue(userId: string) {
    const now = new Date();

    const dueRecurring = await prisma.recurringTransaction.findMany({
      where: {
        userId,
        status: RecurringStatus.ACTIVE,
        nextOccurrence: {
          lte: now,
        },
      },
    });

    const generatedTransactions = [];

    for (const rec of dueRecurring) {
      const transaction = await prisma.transaction.create({
        data: {
          userId,
          categoryId: rec.categoryId,
          amount: rec.amount,
          type: rec.type,
          description: `${rec.title} (Recurring)`,
          date: rec.nextOccurrence,
          isRecurring: true,
          recurringId: rec.id,
        },
      });

      const nextDate = this.calculateNextOccurrence(rec.nextOccurrence, rec.frequency);

      await prisma.recurringTransaction.update({
        where: { id: rec.id },
        data: {
          nextOccurrence: nextDate,
          lastProcessedAt: now,
        },
      });

      generatedTransactions.push(transaction);
    }

    return {
      processedCount: generatedTransactions.length,
      transactions: generatedTransactions,
    };
  }
}
