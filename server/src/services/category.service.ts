import prisma from '../config/prisma';
import { TransactionType } from '../types';
import { AppError } from '../middleware/error.middleware';

export const defaultSystemCategories = [
  // Expense
  { name: 'Food & Dining', type: TransactionType.EXPENSE, icon: 'utensils', color: '#EF4444' },
  { name: 'Transport', type: TransactionType.EXPENSE, icon: 'car', color: '#F97316' },
  { name: 'Shopping', type: TransactionType.EXPENSE, icon: 'shopping-bag', color: '#EC4899' },
  { name: 'Bills & Utilities', type: TransactionType.EXPENSE, icon: 'receipt', color: '#EAB308' },
  { name: 'Entertainment', type: TransactionType.EXPENSE, icon: 'film', color: '#8B5CF6' },
  { name: 'Healthcare', type: TransactionType.EXPENSE, icon: 'heart-pulse', color: '#06B6D4' },
  { name: 'Education', type: TransactionType.EXPENSE, icon: 'graduation-cap', color: '#3B82F6' },
  { name: 'Travel', type: TransactionType.EXPENSE, icon: 'plane', color: '#14B8A6' },
  { name: 'Subscriptions', type: TransactionType.EXPENSE, icon: 'credit-card', color: '#6366F1' },
  { name: 'Other Expense', type: TransactionType.EXPENSE, icon: 'more-horizontal', color: '#64748B' },
  // Income
  { name: 'Salary', type: TransactionType.INCOME, icon: 'banknote', color: '#10B981' },
  { name: 'Freelance', type: TransactionType.INCOME, icon: 'laptop', color: '#059669' },
  { name: 'Business', type: TransactionType.INCOME, icon: 'briefcase', color: '#0D9488' },
  { name: 'Investments', type: TransactionType.INCOME, icon: 'trending-up', color: '#16A34A' },
  { name: 'Other Income', type: TransactionType.INCOME, icon: 'plus-circle', color: '#22C55E' },
];

export class CategoryService {
  static async seedSystemCategoriesForUser(userId: string) {
    const existing = await prisma.category.count({ where: { userId } });
    if (existing === 0) {
      await prisma.category.createMany({
        data: defaultSystemCategories.map((cat) => ({
          userId,
          name: cat.name,
          type: cat.type,
          icon: cat.icon,
          color: cat.color,
          isSystem: true,
        })),
      });
    }
  }

  static async getUserCategories(userId: string, type?: TransactionType) {
    const where: any = {
      OR: [{ userId }, { isSystem: true, userId: null }],
    };

    if (type) {
      where.type = type;
    }

    return prisma.category.findMany({
      where,
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
    });
  }

  static async createCustomCategory(
    userId: string,
    data: { name: string; type: TransactionType; icon?: string; color?: string }
  ) {
    const existing = await prisma.category.findFirst({
      where: {
        userId,
        name: data.name,
        type: data.type,
      },
    });

    if (existing) {
      throw new AppError(`A ${data.type.toLowerCase()} category named '${data.name}' already exists.`, 409);
    }

    return prisma.category.create({
      data: {
        userId,
        name: data.name,
        type: data.type,
        icon: data.icon || 'tag',
        color: data.color || '#64748B',
        isSystem: false,
      },
    });
  }
}
