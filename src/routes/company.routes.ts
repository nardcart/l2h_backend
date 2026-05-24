import { Router } from 'express';
import * as companyController from '../controllers/company.controller';
import * as companyUploadController from '../controllers/company-upload.controller';
import { authenticate, authorize } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.post('/upload/logo', upload.single('file'), companyUploadController.uploadCompanyLogo);
router.post('/register', companyController.registerCompany);
router.post('/login', companyController.loginCompany);
router.get('/', companyController.getPublicCompanies);
router.get('/me', authenticate, authorize('company'), companyController.getCompanyProfile);
router.put('/me', authenticate, authorize('company'), companyController.updateCompanyProfile);

router.get('/admin/all', authenticate, authorize('admin'), companyController.getAdminCompanies);
router.get('/admin/:id', authenticate, authorize('admin'), companyController.getAdminCompanyById);
router.put('/admin/:id', authenticate, authorize('admin'), companyController.updateAdminCompany);
router.patch('/admin/:id/status', authenticate, authorize('admin'), companyController.updateCompanyStatus);
router.delete('/admin/:id', authenticate, authorize('admin'), companyController.deleteCompany);

router.get('/:id', companyController.getPublicCompanyById);

export default router;
