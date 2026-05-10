import { Router } from 'express';
import * as alumniController from '../controllers/alumni.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.post('/', alumniController.createAlumni);
router.get('/', alumniController.getPublicAlumni);

router.get('/admin/all', authenticate, authorize('admin'), alumniController.getAdminAlumni);
router.get('/:id', authenticate, authorize('admin'), alumniController.getAlumniById);
router.put('/:id', authenticate, authorize('admin'), alumniController.updateAlumni);
router.patch('/:id/status', authenticate, authorize('admin'), alumniController.updateAlumniStatus);
router.delete('/:id', authenticate, authorize('admin'), alumniController.deleteAlumni);

export default router;
