import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createCategorySchema } from '../validators/category.validator';

const router = Router();

router.use(authenticate);

router.get('/', CategoryController.getCategories);
router.post('/', validate(createCategorySchema), CategoryController.createCategory);

export default router;
