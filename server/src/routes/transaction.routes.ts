import { Router } from 'express';
import { TransactionController } from '../controllers/transaction.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createTransactionSchema,
  updateTransactionSchema,
  getTransactionsQuerySchema,
} from '../validators/transaction.validator';

const router = Router();

router.use(authenticate);

router.get('/', validate(getTransactionsQuerySchema), TransactionController.getTransactions);
router.post('/', validate(createTransactionSchema), TransactionController.createTransaction);
router.get('/:id', TransactionController.getTransactionById);
router.put('/:id', validate(updateTransactionSchema), TransactionController.updateTransaction);
router.delete('/:id', TransactionController.deleteTransaction);

export default router;
