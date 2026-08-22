import prisma from '../config/prisma';
import bcrypt from 'bcryptjs';

export async function ensureDemoDataExists() {
  try {
    const demoEmail = 'demo@fintrack.app';
    const userCount = await prisma.user.count();

    if (userCount > 0) {
      return;
    }

    console.log('[FinTrack AutoSeed] Initializing demo data on cloud startup...');

    const hashedPassword = await bcrypt.hash('Password123!', 12);
    const user = await prisma.user.create({
      data: {
        name: 'Alex Morgan',
        email: demoEmail,
        password: hashedPassword,
        currency: 'INR',
      },
    });

    const categoriesData = [
      { name: 'Food & Dining', type: 'EXPENSE', icon: 'utensils', color: '#EF4444' },
      { name: 'Transport', type: 'EXPENSE', icon: 'car', color: '#F97316' },
      { name: 'Shopping', type: 'EXPENSE', icon: 'shopping-bag', color: '#EC4899' },
      { name: 'Bills & Utilities', type: 'EXPENSE', icon: 'receipt', color: '#EAB308' },
      { name: 'Entertainment', type: 'EXPENSE', icon: 'film', color: '#8B5CF6' },
      { name: 'Healthcare', type: 'EXPENSE', icon: 'heart-pulse', color: '#06B6D4' },
      { name: 'Education', type: 'EXPENSE', icon: 'graduation-cap', color: '#3B82F6' },
      { name: 'Travel', type: 'EXPENSE', icon: 'plane', color: '#14B8A6' },
      { name: 'Subscriptions', type: 'EXPENSE', icon: 'credit-card', color: '#6366F1' },
      { name: 'Other Expense', type: 'EXPENSE', icon: 'more-horizontal', color: '#64748B' },
      { name: 'Salary', type: 'INCOME', icon: 'banknote', color: '#10B981' },
      { name: 'Freelance', type: 'INCOME', icon: 'laptop', color: '#059669' },
      { name: 'Business', type: 'INCOME', icon: 'briefcase', color: '#0D9488' },
      { name: 'Investments', type: 'INCOME', icon: 'trending-up', color: '#16A34A' },
      { name: 'Other Income', type: 'INCOME', icon: 'plus-circle', color: '#22C55E' },
    ];

    const createdCategories: Record<string, string> = {};

    for (const cat of categoriesData) {
      const created = await prisma.category.create({
        data: {
          userId: user.id,
          name: cat.name,
          type: cat.type,
          icon: cat.icon,
          color: cat.color,
          isSystem: true,
        },
      });
      createdCategories[cat.name] = created.id;
    }

    const nextMonthDate = new Date();
    nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);

    const recurringItems = [
      {
        title: 'Senior Software Engineer Salary',
        categoryName: 'Salary',
        type: 'INCOME',
        amount: 95000,
        frequency: 'MONTHLY',
        day: 1,
      },
      {
        title: 'Apartment Rent - Indiranagar',
        categoryName: 'Bills & Utilities',
        type: 'EXPENSE',
        amount: 24000,
        frequency: 'MONTHLY',
        day: 5,
      },
      {
        title: 'High-Speed Fiber Broadband',
        categoryName: 'Bills & Utilities',
        type: 'EXPENSE',
        amount: 1199,
        frequency: 'MONTHLY',
        day: 10,
      },
      {
        title: 'Cult.fit Gym & Fitness Membership',
        categoryName: 'Healthcare',
        type: 'EXPENSE',
        amount: 2500,
        frequency: 'MONTHLY',
        day: 1,
      },
      {
        title: 'Netflix Premium 4K Plan',
        categoryName: 'Subscriptions',
        type: 'EXPENSE',
        amount: 649,
        frequency: 'MONTHLY',
        day: 14,
      },
      {
        title: 'Spotify Family Plan',
        categoryName: 'Subscriptions',
        type: 'EXPENSE',
        amount: 179,
        frequency: 'MONTHLY',
        day: 18,
      },
    ];

    for (const item of recurringItems) {
      const nextDate = new Date(nextMonthDate.getFullYear(), nextMonthDate.getMonth(), item.day);
      await prisma.recurringTransaction.create({
        data: {
          userId: user.id,
          categoryId: createdCategories[item.categoryName],
          title: item.title,
          amount: item.amount,
          type: item.type,
          frequency: item.frequency,
          nextOccurrence: nextDate,
          status: 'ACTIVE',
        },
      });
    }

    const now = new Date();
    const transactionsToCreate: any[] = [];

    for (let monthOffset = 5; monthOffset >= 0; monthOffset--) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
      const y = targetDate.getFullYear();
      const m = targetDate.getMonth();

      transactionsToCreate.push({
        userId: user.id,
        categoryId: createdCategories['Salary'],
        amount: 95000,
        type: 'INCOME',
        description: 'Monthly Salary Credit - TechCorp',
        date: new Date(y, m, 1, 9, 30),
        isRecurring: true,
      });

      transactionsToCreate.push({
        userId: user.id,
        categoryId: createdCategories['Bills & Utilities'],
        amount: 24000,
        type: 'EXPENSE',
        description: 'Apartment Monthly Rent',
        date: new Date(y, m, 5, 10, 0),
        isRecurring: true,
      });

      transactionsToCreate.push({
        userId: user.id,
        categoryId: createdCategories['Bills & Utilities'],
        amount: 1199,
        type: 'EXPENSE',
        description: 'ACT Fibernet 300 Mbps bill',
        date: new Date(y, m, 10, 14, 0),
        isRecurring: true,
      });

      transactionsToCreate.push({
        userId: user.id,
        categoryId: createdCategories['Subscriptions'],
        amount: 649,
        type: 'EXPENSE',
        description: 'Netflix 4K Subscription',
        date: new Date(y, m, 14, 8, 15),
        isRecurring: true,
      });

      transactionsToCreate.push({
        userId: user.id,
        categoryId: createdCategories['Subscriptions'],
        amount: 179,
        type: 'EXPENSE',
        description: 'Spotify Premium Family',
        date: new Date(y, m, 18, 11, 0),
        isRecurring: true,
      });

      transactionsToCreate.push({
        userId: user.id,
        categoryId: createdCategories['Healthcare'],
        amount: 2500,
        type: 'EXPENSE',
        description: 'Cult.fit Monthly Membership',
        date: new Date(y, m, 1, 7, 0),
        isRecurring: true,
      });

      if (monthOffset % 2 === 0) {
        transactionsToCreate.push({
          userId: user.id,
          categoryId: createdCategories['Freelance'],
          amount: 28000 + (monthOffset * 1500),
          type: 'INCOME',
          description: 'UI/UX Design Contract - FinTech Client',
          date: new Date(y, m, 12, 16, 0),
          isRecurring: false,
        });
      }

      if (monthOffset % 3 === 0) {
        transactionsToCreate.push({
          userId: user.id,
          categoryId: createdCategories['Investments'],
          amount: 5400,
          type: 'INCOME',
          description: 'Quarterly Mutual Fund Dividend',
          date: new Date(y, m, 22, 11, 30),
          isRecurring: false,
        });
      }

      const groceryDays = [3, 9, 16, 23];
      groceryDays.forEach((day, index) => {
        transactionsToCreate.push({
          userId: user.id,
          categoryId: createdCategories['Food & Dining'],
          amount: 2200 + (index * 450) + (monthOffset * 80),
          type: 'EXPENSE',
          description: index % 2 === 0 ? 'Nature Basket Groceries' : 'Blinkit Quick Delivery',
          date: new Date(y, m, day, 18, 45),
          isRecurring: false,
        });
      });

      const diningDays = [4, 8, 15, 19, 26];
      diningDays.forEach((day, index) => {
        transactionsToCreate.push({
          userId: user.id,
          categoryId: createdCategories['Food & Dining'],
          amount: 850 + (index * 320),
          type: 'EXPENSE',
          description: index % 2 === 0 ? 'Third Wave Coffee Roasters' : 'Dinner with friends at Toit',
          date: new Date(y, m, day, 20, 30),
          isRecurring: false,
        });
      });

      const transportDays = [2, 7, 11, 17, 21, 25];
      transportDays.forEach((day, index) => {
        transactionsToCreate.push({
          userId: user.id,
          categoryId: createdCategories['Transport'],
          amount: 450 + (index * 110),
          type: 'EXPENSE',
          description: index % 2 === 0 ? 'Uber Premier - Office Commute' : 'Shell Petrol Station Fuel',
          date: new Date(y, m, day, 9, 0),
          isRecurring: false,
        });
      });

      transactionsToCreate.push({
        userId: user.id,
        categoryId: createdCategories['Shopping'],
        amount: 3200 + (monthOffset * 600),
        type: 'EXPENSE',
        description: 'Amazon India Electronics & Books',
        date: new Date(y, m, 13, 15, 20),
        isRecurring: false,
      });

      transactionsToCreate.push({
        userId: user.id,
        categoryId: createdCategories['Entertainment'],
        amount: 1400,
        type: 'EXPENSE',
        description: 'PVR IMAX Movie Tickets & Popcorn',
        date: new Date(y, m, 20, 19, 0),
        isRecurring: false,
      });
    }

    await prisma.transaction.createMany({
      data: transactionsToCreate,
    });

    const curMonth = now.getMonth() + 1;
    const curYear = now.getFullYear();

    const budgetsToCreate = [
      { categoryName: 'Food & Dining', amount: 18000, alertThreshold: 80 },
      { categoryName: 'Shopping', amount: 10000, alertThreshold: 85 },
      { categoryName: 'Transport', amount: 6000, alertThreshold: 80 },
      { categoryName: 'Bills & Utilities', amount: 28000, alertThreshold: 90 },
      { categoryName: 'Entertainment', amount: 4000, alertThreshold: 75 },
      { categoryName: 'Healthcare', amount: 5000, alertThreshold: 80 },
    ];

    for (const b of budgetsToCreate) {
      await prisma.budget.create({
        data: {
          userId: user.id,
          categoryId: createdCategories[b.categoryName],
          amount: b.amount,
          month: curMonth,
          year: curYear,
          alertThreshold: b.alertThreshold,
        },
      });
    }

    console.log('[FinTrack AutoSeed] ✅ Auto-seeding completed with 143 historical transactions!');
  } catch (err: any) {
    console.error('[FinTrack AutoSeed] Seed check skipped or failed:', err.message);
  }
}
