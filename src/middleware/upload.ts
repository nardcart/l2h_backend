import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';
import { getAllowedMimeTypes } from '../utils/upload';

// Use memory storage for Vercel Blob upload
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  const allowedTypes = getAllowedMimeTypes('all');
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images and videos are allowed.'));
  }
};

// Multer configuration
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
    fieldSize: 10 * 1024 * 1024, // 10MB max field size (for blog content, etc.)
    fields: 20, // Max number of non-file fields
  },
});

// Single file upload
export const uploadSingle = (fieldName: string) => upload.single(fieldName);

// Multiple files upload
export const uploadMultiple = (fieldName: string, maxCount: number = 10) => 
  upload.array(fieldName, maxCount);

// Multiple fields upload
export const uploadFields = (fields: { name: string; maxCount: number }[]) => 
  upload.fields(fields);

// Ebook-specific upload (allows images and PDFs)
export const ebookUpload = multer({
  storage,
  fileFilter: (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'application/pdf',
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images (JPG, PNG, WebP) and PDF files are allowed.'));
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
  },
});

