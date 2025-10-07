import express from 'express';
import * as ebookAdminController from '../controllers/ebook-admin.controller';
import * as ebookUploadController from '../controllers/ebook-upload.controller';
import { authMiddleware } from '../middleware/auth';
import { ebookUpload } from '../middleware/upload';

const router = express.Router();

// All admin routes require authentication
// Uncomment the line below when auth is ready
// router.use(authMiddleware);

// File uploads (must be before other routes)
router.post('/upload/image', ebookUpload.single('file'), ebookUploadController.uploadEbookImage);
router.post('/upload/pdf', ebookUpload.single('file'), ebookUploadController.uploadEbookPDF);

// Ebook CRUD
router.get('/ebooks', ebookAdminController.getAllEbooksAdmin);
router.post('/ebooks', ebookAdminController.createEbook);
router.put('/ebooks/:id', ebookAdminController.updateEbook);
router.delete('/ebooks/:id', ebookAdminController.deleteEbook);

// Download analytics
router.get('/downloads/dashboard', ebookAdminController.getDownloadDashboard);
router.get('/downloads', ebookAdminController.getAllDownloads);
router.get('/downloads/export', ebookAdminController.exportDownloadsCSV);

// Email count
router.get('/ebooks/:id/email-count', ebookAdminController.getEbookEmailCount);

// Email management
router.post('/send-ebook', ebookAdminController.sendEbookToEmail);
router.post('/bulk-send-ebook', ebookAdminController.bulkSendEbook);

export default router;


