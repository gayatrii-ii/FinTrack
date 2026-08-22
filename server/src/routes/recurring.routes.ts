import { Router } from 'express';
import { RecurringController } from '../controllers/recurring.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createRecurringSchema,
  updateRecurringSchema,
} from '../validators/recurring.validator';

const router = Router();

router.use(authenticate);

router.get('/', RecurringController.getRecurring);
router.get('/upcoming', RecurringController.getUpcoming);
router.post('/', validate(createRecurringSchema), RecurringController.createRecurring);
router.post('/process-due', RecurringController.processDue);
router.put('/:id', validate(updateRecurringSchema), RecurringController.updateRecurring);
router.delete('/:id', RecurringController.deleteRecurring);

export default router;
