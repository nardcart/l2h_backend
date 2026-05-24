import { Router } from 'express';
import * as candidateController from '../controllers/candidate.controller';
import * as candidateUploadController from '../controllers/candidate-upload.controller';
import { authenticate, authorize } from '../middleware/auth';
import { candidateUpload } from '../middleware/upload';

const router = Router();

router.post('/upload/resume', candidateUpload.single('file'), candidateUploadController.uploadCandidateResume);
router.post('/upload/photograph', candidateUpload.single('file'), candidateUploadController.uploadCandidatePhotograph);
router.post('/upload/video', candidateUpload.single('file'), candidateUploadController.uploadCandidateVideo);
router.post('/register', candidateController.registerCandidate);
router.post('/login', candidateController.loginCandidate);
router.get('/', candidateController.getPublicCandidates);
router.get('/me', authenticate, authorize('candidate'), candidateController.getCandidateProfile);
router.put('/me', authenticate, authorize('candidate'), candidateController.updateCandidateProfile);

router.get('/admin/all', authenticate, authorize('admin'), candidateController.getAdminCandidates);
router.get('/admin/:id', authenticate, authorize('admin'), candidateController.getAdminCandidateById);
router.put('/admin/:id', authenticate, authorize('admin'), candidateController.updateAdminCandidate);
router.patch('/admin/:id/status', authenticate, authorize('admin'), candidateController.updateCandidateStatus);
router.delete('/admin/:id', authenticate, authorize('admin'), candidateController.deleteCandidate);

router.get('/:id', candidateController.getPublicCandidateById);

export default router;
