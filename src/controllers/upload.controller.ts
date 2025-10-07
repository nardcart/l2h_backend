import { Request, Response } from 'express';
import { uploadToBlob, validateFileType, validateFileSize, getAllowedMimeTypes } from '../utils/upload';

export const uploadImage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        status: false,
        message: 'No file uploaded',
      });
      return;
    }

    // Validate file type
    const allowedTypes = getAllowedMimeTypes('image');
    if (!validateFileType(req.file, allowedTypes)) {
      res.status(400).json({
        status: false,
        message: 'Invalid file type. Only images are allowed.',
      });
      return;
    }

    // Validate file size (5MB for images)
    if (!validateFileSize(req.file, 5)) {
      res.status(400).json({
        status: false,
        message: 'File size exceeds 5MB limit',
      });
      return;
    }

    // Upload to Vercel Blob
    const result = await uploadToBlob(req.file, 'blog-images');

    res.status(200).json({
      status: true,
      message: 'Image uploaded successfully',
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: 'Error uploading image',
      error: error.message,
    });
  }
};

export const uploadVideo = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        status: false,
        message: 'No file uploaded',
      });
      return;
    }

    // Validate file type
    const allowedTypes = getAllowedMimeTypes('video');
    if (!validateFileType(req.file, allowedTypes)) {
      res.status(400).json({
        status: false,
        message: 'Invalid file type. Only videos are allowed.',
      });
      return;
    }

    // Validate file size (50MB for videos)
    if (!validateFileSize(req.file, 50)) {
      res.status(400).json({
        status: false,
        message: 'File size exceeds 50MB limit',
      });
      return;
    }

    // Upload to Vercel Blob
    const result = await uploadToBlob(req.file, 'blog-videos');

    res.status(200).json({
      status: true,
      message: 'Video uploaded successfully',
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: 'Error uploading video',
      error: error.message,
    });
  }
};

export const uploadMultipleImages = async (req: Request, res: Response): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      res.status(400).json({
        status: false,
        message: 'No files uploaded',
      });
      return;
    }

    const allowedTypes = getAllowedMimeTypes('image');
    const results = [];

    for (const file of files) {
      // Validate each file
      if (!validateFileType(file, allowedTypes)) {
        continue; // Skip invalid files
      }
      
      if (!validateFileSize(file, 5)) {
        continue; // Skip files that are too large
      }

      const result = await uploadToBlob(file, 'blog-images');
      results.push(result);
    }

    res.status(200).json({
      status: true,
      message: `${results.length} images uploaded successfully`,
      data: results,
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: 'Error uploading images',
      error: error.message,
    });
  }
};

