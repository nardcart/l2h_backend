import { Router } from 'express';
import authRoutes from './auth.routes';
import blogRoutes from './blog.routes';
import categoryRoutes from './category.routes';
import commentRoutes from './comment.routes';
import uploadRoutes from './upload.routes';
import newsletterRoutes from './newsletter.routes';
import fileManagerRoutes from './file-manager.routes';
import ebookRoutes from './ebook.routes';
import ebookAdminRoutes from './ebook-admin.routes';
import userRoutes from './user.routes';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.status(200).json({
    status: true,
    message: 'L2H Blog API is running',
    timestamp: new Date().toISOString(),
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/blogs', blogRoutes);
router.use('/categories', categoryRoutes);
router.use('/comments', commentRoutes);
router.use('/upload', uploadRoutes);
router.use('/newsletter', newsletterRoutes);
router.use('/files', fileManagerRoutes);
router.use('/ebooks', ebookRoutes);
router.use('/admin/ebooks', ebookAdminRoutes);
router.use('/admin/users', userRoutes);

export default router;

