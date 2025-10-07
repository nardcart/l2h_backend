import { Router } from 'express';
import * as categoryController from '../controllers/category.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', categoryController.getAllCategories);
router.get('/:slug', categoryController.getCategoryBySlug);

// Protected routes (Admin only)
router.post('/', authenticate, authorize('admin'), categoryController.createCategory);
router.put('/:id', authenticate, authorize('admin'), categoryController.updateCategory);
router.delete('/:id', authenticate, authorize('admin'), categoryController.deleteCategory);

export default router;



