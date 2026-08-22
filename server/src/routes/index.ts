import { Router } from 'express';
import authRoutes from './auth.routes';
import categoryRoutes from './category.routes';
import transactionRoutes from './transaction.routes';
import budgetRoutes from './budget.routes';
import recurringRoutes from './recurring.routes';
import analyticsRoutes from './analytics.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/transactions', transactionRoutes);
router.use('/budgets', budgetRoutes);
router.use('/recurring', recurringRoutes);
router.use('/analytics', analyticsRoutes);

export default router;
