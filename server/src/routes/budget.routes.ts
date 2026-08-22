import { Router } from 'express';
import { BudgetController } from '../controllers/budget.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createBudgetSchema,
  updateBudgetSchema,
  getBudgetsQuerySchema,
} from '../validators/budget.validator';

const router = Router();

router.use(authenticate);

router.get('/', validate(getBudgetsQuerySchema), BudgetController.getBudgets);
router.post('/', validate(createBudgetSchema), BudgetController.createBudget);
router.put('/:id', validate(updateBudgetSchema), BudgetController.updateBudget);
router.delete('/:id', BudgetController.deleteBudget);

export default router;
