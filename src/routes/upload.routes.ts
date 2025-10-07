import { Router } from 'express';
import * as uploadController from '../controllers/upload.controller';
import * as directUploadController from '../controllers/direct-upload.controller';
import { authenticate, authorize } from '../middleware/auth';
import { uploadSingle, uploadMultiple } from '../middleware/upload';

const router = Router();

// Health check endpoint (no auth required)
router.get('/health', directUploadController.uploadHealth);

// Direct upload for frontend (requires auth)
router.post(
  '/direct',
  authenticate,
  authorize('author', 'admin'),
  uploadSingle('file'),
  directUploadController.directUpload
);

// All upload routes require authentication
router.post(
  '/image',
  authenticate,
  authorize('author', 'admin'),
  uploadSingle('image'),
  uploadController.uploadImage
);

router.post(
  '/video',
  authenticate,
  authorize('author', 'admin'),
  uploadSingle('video'),
  uploadController.uploadVideo
);

router.post(
  '/images',
  authenticate,
  authorize('author', 'admin'),
  uploadMultiple('images', 10),
  uploadController.uploadMultipleImages
);

export default router;

