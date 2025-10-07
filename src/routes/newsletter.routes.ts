import { Router } from 'express';
import * as newsletterController from '../controllers/newsletter.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/subscribe', newsletterController.subscribe);
router.post('/verify', newsletterController.verifyAndSubscribe);
router.post('/unsubscribe', newsletterController.unsubscribe);

// Protected routes (Admin only)
router.get('/', authenticate, authorize('admin'), newsletterController.getAllSubscribers);

export default router;



