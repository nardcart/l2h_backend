import { Request, Response } from 'express';
import { isBlobAvailable } from '../config/blob';
import { uploadToBlob } from '../utils/upload';

export const uploadCompanyLogo = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        status: false,
        message: 'No company logo uploaded',
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

    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      res.status(400).json({
        status: false,
        message: 'Invalid file type. Only JPG, PNG, and WebP images are allowed.',
      });
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (req.file.size > maxSize) {
      res.status(400).json({
        status: false,
        message: 'Company logo too large. Maximum size is 10MB.',
      });
      return;
    }

    const result = await uploadToBlob(req.file, 'companies/logos');

    res.status(200).json({
      status: true,
      message: 'Company logo uploaded successfully',
      data: {
        url: result.url,
        key: result.key,
        size: result.size,
        fileName: req.file.originalname,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: 'Failed to upload company logo',
      error: error.message,
    });
  }
};
