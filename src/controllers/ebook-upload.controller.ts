/**
 * Ebook Upload Controller
 * Handles uploads for ebook cover images and PDF files
 */

import { Request, Response } from 'express';
import { uploadToBlob } from '../utils/upload';
import { isBlobAvailable } from '../config/blob';

/**
 * Upload ebook cover image
 * POST /api/ebooks/upload/image
 */
export const uploadEbookImage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        status: false,
        message: 'No file uploaded',
      });
      return;
    }

    if (!isBlobAvailable()) {
      res.status(500).json({
        status: false,
        message: 'Upload service not configured',
      });
      return;
    }

    // Validate image file type
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      res.status(400).json({
        status: false,
        message: 'Invalid file type. Only JPG, PNG, and WebP images are allowed.',
      });
      return;
    }

    // Validate file size (5MB limit for images)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (req.file.size > maxSize) {
      res.status(400).json({
        status: false,
        message: 'Image too large. Maximum size is 5MB.',
      });
      return;
    }

    console.log('📤 Uploading ebook image:', req.file.originalname);

    // Upload to Vercel Blob
    const result = await uploadToBlob(req.file, 'ebook-images');

    console.log('✅ Ebook image uploaded:', result.url);

    res.json({
      status: true,
      message: 'Image uploaded successfully',
      data: {
        url: result.url,
        key: result.key,
        size: result.size,
      },
    });
  } catch (error: any) {
    console.error('❌ Image upload error:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to upload image',
      error: error.message,
    });
  }
};

/**
 * Upload ebook PDF file
 * POST /api/ebooks/upload/pdf
 */
export const uploadEbookPDF = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        status: false,
        message: 'No file uploaded',
      });
      return;
    }

    if (!isBlobAvailable()) {
      res.status(500).json({
        status: false,
        message: 'Upload service not configured',
      });
      return;
    }

    // Validate PDF file type
    if (req.file.mimetype !== 'application/pdf') {
      res.status(400).json({
        status: false,
        message: 'Invalid file type. Only PDF files are allowed.',
      });
      return;
    }

    // Validate file size (50MB limit for PDFs)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (req.file.size > maxSize) {
      res.status(400).json({
        status: false,
        message: 'PDF too large. Maximum size is 50MB.',
      });
      return;
    }

    console.log('📤 Uploading ebook PDF:', req.file.originalname);
    console.log('   Size:', (req.file.size / 1024 / 1024).toFixed(2), 'MB');

    // Upload to Vercel Blob
    const result = await uploadToBlob(req.file, 'ebook-pdfs');

    console.log('✅ Ebook PDF uploaded:', result.url);

    res.json({
      status: true,
      message: 'PDF uploaded successfully',
      data: {
        url: result.url,
        key: result.key,
        size: result.size,
        fileName: req.file.originalname,
      },
    });
  } catch (error: any) {
    console.error('❌ PDF upload error:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to upload PDF',
      error: error.message,
    });
  }
};

