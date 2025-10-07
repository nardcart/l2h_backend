import express from 'express';
import * as ebookController from '../controllers/ebook.controller';

const router = express.Router();

// Public routes
router.get('/', ebookController.getEbooks);
router.get('/popular', ebookController.getPopularEbooks);
router.get('/:id', ebookController.getEbookById);

// Download flow (No OTP - Direct)
router.post('/download', ebookController.downloadEbook);

export default router;


