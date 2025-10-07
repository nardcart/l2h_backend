import { Router } from 'express';
import * as commentController from '../controllers/comment.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/submit', commentController.submitComment);
router.post('/verify', commentController.verifyOTPAndSubmitComment);
router.get('/blog/:blogId', commentController.getCommentsByBlog);

// Protected routes (Admin only)
router.put('/:id/moderate', authenticate, authorize('admin'), commentController.moderateComment);
router.delete('/:id', authenticate, authorize('admin'), commentController.deleteComment);

export default router;



