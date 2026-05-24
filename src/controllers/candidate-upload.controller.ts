import { Request, Response } from 'express';
import { isBlobAvailable } from '../config/blob';
import { uploadToBlob } from '../utils/upload';

export const uploadCandidateResume = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        status: false,
        message: 'No resume file uploaded',
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

    const maxSize = 10 * 1024 * 1024;
    if (req.file.size > maxSize) {
      res.status(400).json({
        status: false,
        message: 'Resume too large. Maximum size is 10MB.',
      });
      return;
    }

    const result = await uploadToBlob(req.file, 'candidates/resumes');

    res.status(200).json({
      status: true,
      message: 'Resume uploaded successfully',
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
      message: 'Failed to upload resume',
      error: error.message,
    });
  }
};

export const uploadCandidatePhotograph = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        status: false,
        message: 'No photograph uploaded',
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
        message: 'Photograph too large. Maximum size is 10MB.',
      });
      return;
    }

    const result = await uploadToBlob(req.file, 'candidates/photographs');

    res.status(200).json({
      status: true,
      message: 'Photograph uploaded successfully',
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
      message: 'Failed to upload photograph',
      error: error.message,
    });
  }
};

export const uploadCandidateVideo = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        status: false,
        message: 'No video uploaded',
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

    if (!req.file.mimetype.startsWith('video/')) {
      res.status(400).json({
        status: false,
        message: 'Invalid file type. Only video files are allowed.',
      });
      return;
    }

    const maxSize = 50 * 1024 * 1024;
    if (req.file.size > maxSize) {
      res.status(400).json({
        status: false,
        message: 'Video too large. Maximum size is 50MB.',
      });
      return;
    }

    const result = await uploadToBlob(req.file, 'candidates/videos');

    res.status(200).json({
      status: true,
      message: 'Video uploaded successfully',
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
      message: 'Failed to upload video',
      error: error.message,
    });
  }
};
