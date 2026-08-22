import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/overview', AnalyticsController.getOverview);
router.get('/spending-trend', AnalyticsController.getSpendingTrend);
router.get('/category-breakdown', AnalyticsController.getCategoryBreakdown);
router.get('/monthly-comparison', AnalyticsController.getMonthlyComparison);

export default router;
