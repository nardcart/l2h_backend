import { Router } from 'express';
import * as fileManagerController from '../controllers/file-manager.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require admin authentication
router.get('/', authenticate, authorize('admin'), fileManagerController.listFiles);
router.get('/info', authenticate, authorize('admin'), fileManagerController.getFileInfo);
router.delete('/', authenticate, authorize('admin'), fileManagerController.deleteFile);
router.post('/bulk-delete', authenticate, authorize('admin'), fileManagerController.bulkDeleteFiles);

export default router;

