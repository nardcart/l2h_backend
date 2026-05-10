import { Request, Response } from 'express';
import { isBlobAvailable } from '../config/blob';
import { uploadToBlob } from '../utils/upload';

export const uploadAlumniProfileImage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        status: false,
        message: 'No profile image uploaded',
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

    const maxSize = 20 * 1024 * 1024; // 20MB
    if (req.file.size > maxSize) {
      res.status(400).json({
        status: false,
        message: 'Profile image too large. Maximum size is 20MB.',
      });
      return;
    }

    const result = await uploadToBlob(req.file, 'alumni/profile-images');

    res.json({
      status: true,
      message: 'Profile image uploaded successfully',
      data: {
        url: result.url,
        key: result.key,
        size: result.size,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: 'Failed to upload profile image',
      error: error.message,
    });
  }
};

export const uploadAlumniCertificate = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        status: false,
        message: 'No certificate file uploaded',
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

    if (req.file.mimetype !== 'application/pdf') {
      res.status(400).json({
        status: false,
        message: 'Invalid file type. Only PDF files are allowed.',
      });
      return;
    }

    const maxSize = 100 * 1024 * 1024; // 100MB
    if (req.file.size > maxSize) {
      res.status(400).json({
        status: false,
        message: 'Certificate PDF too large. Maximum size is 100MB.',
      });
      return;
    }

    const result = await uploadToBlob(req.file, 'alumni/certificates');

    res.json({
      status: true,
      message: 'Certificate uploaded successfully',
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
      message: 'Failed to upload certificate PDF',
      error: error.message,
    });
  }
};
