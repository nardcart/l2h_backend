import { Router } from 'express';
import * as blogController from '../controllers/blog.controller';
import { authenticate, authorize } from '../middleware/auth';
import { uploadSingle } from '../middleware/upload';

const router = Router();

// Public routes
router.get('/', blogController.getAllBlogs);
router.get('/slug/:slug', blogController.getBlogBySlug);
router.get('/:id/related', blogController.getRelatedBlogs);

// Protected routes (Author & Admin)
router.get('/:id', authenticate, authorize('author', 'admin'), blogController.getBlogById);
router.post('/', authenticate, authorize('author', 'admin'), uploadSingle('coverImage'), blogController.createBlog);
router.put('/:id', authenticate, authorize('author', 'admin'), uploadSingle('coverImage'), blogController.updateBlog);
router.delete('/:id', authenticate, authorize('author', 'admin'), blogController.deleteBlog);

export default router;

