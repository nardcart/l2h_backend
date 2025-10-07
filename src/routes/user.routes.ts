import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication and admin role
router.use(authenticate, authorize('admin'));

// User management routes
router.get('/', userController.getAllUsers);
router.get('/stats', userController.getUserStats);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.patch('/:id/password', userController.updateUserPassword);
router.patch('/:id/toggle-status', userController.toggleUserStatus);
router.delete('/:id', userController.deleteUser);

export default router;

