/**
 * Direct Upload Controller for Frontend
 * Provides a simple endpoint for uploading images directly from the frontend
 */

import { Request, Response } from 'express';
import { uploadToBlob } from '../utils/upload';
import { isBlobAvailable } from '../config/blob';

/**
 * Upload a single image and return the URL
 * POST /api/upload/direct
 */
export const directUpload = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      res.status(400).json({
        status: false,
        message: 'No file uploaded. Please select a file.',
      });
      return;
    }

    // Check if Vercel Blob is configured
    if (!isBlobAvailable()) {
      console.error('❌ BLOB_READ_WRITE_TOKEN not configured');
      res.status(500).json({
        status: false,
        message: 'File upload service not configured. Please contact administrator.',
        error: 'BLOB_READ_WRITE_TOKEN not set in environment',
      });
      return;
    }

    // Validate file type (images only)
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
    ];

    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      res.status(400).json({
        status: false,
        message: 'Invalid file type. Only images (JPG, PNG, WebP, GIF) are allowed.',
      });
      return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (req.file.size > maxSize) {
      res.status(400).json({
        status: false,
        message: 'File too large. Maximum size is 10MB.',
      });
      return;
    }

    console.log('📤 Uploading file:', req.file.originalname);
    console.log('   Size:', (req.file.size / 1024).toFixed(2), 'KB');
    console.log('   Type:', req.file.mimetype);

    // Upload to Vercel Blob
    const result = await uploadToBlob(req.file, 'blog-images');

    console.log('✅ Upload successful:', result.url);

    res.status(200).json({
      status: true,
      message: 'Image uploaded successfully',
      data: {
        url: result.url,
        key: result.key,
        size: result.size,
        mimetype: result.mimetype,
      },
    });
  } catch (error: any) {
    console.error('❌ Upload error:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to upload image',
      error: error.message,
    });
  }
};

/**
 * Health check for upload service
 * GET /api/upload/health
 */
export const uploadHealth = async (_req: Request, res: Response): Promise<void> => {
  res.status(200).json({
    status: true,
    message: 'Upload service is running',
    configured: isBlobAvailable(),
    blobToken: process.env.BLOB_READ_WRITE_TOKEN ? 'Set ✅' : 'Missing ❌',
  });
};

