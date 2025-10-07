import { put, del } from '@vercel/blob';
import { isBlobAvailable, BLOB_READ_WRITE_TOKEN } from '../config/blob';
import crypto from 'crypto';
import path from 'path';

export interface UploadResult {
  key: string;
  url: string;
  size: number;
  mimetype: string;
}

export const uploadToBlob = async (
  file: Express.Multer.File,
  folder: string = 'uploads'
): Promise<UploadResult> => {
  try {
    // Check if Vercel Blob is configured
    if (!isBlobAvailable()) {
      throw new Error('Vercel Blob not configured. Please set BLOB_READ_WRITE_TOKEN in .env file.');
    }

    // Generate unique filename with random suffix
    const fileExt = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, fileExt);
    const fileName = `${baseName}-${crypto.randomBytes(8).toString('hex')}${fileExt}`;
    const pathname = `${folder}/${fileName}`;
    
    // Upload to Vercel Blob
    const blob = await put(pathname, file.buffer, {
      access: 'public',
      token: BLOB_READ_WRITE_TOKEN(),
      contentType: file.mimetype,
      addRandomSuffix: false, // We already added our own suffix
    });
    
    return {
      key: blob.pathname,
      url: blob.url,
      size: file.size,
      mimetype: file.mimetype,
    };
  } catch (error) {
    console.error('Error uploading to Vercel Blob:', error);
    throw new Error('Failed to upload file');
  }
};

export const deleteFromBlob = async (url: string): Promise<void> => {
  try {
    // Check if Vercel Blob is configured
    if (!isBlobAvailable()) {
      throw new Error('Vercel Blob not configured. Please set BLOB_READ_WRITE_TOKEN in .env file.');
    }

    await del(url, {
      token: BLOB_READ_WRITE_TOKEN(),
    });
    
    console.log(`✅ Deleted file from Vercel Blob: ${url}`);
  } catch (error) {
    console.error('Error deleting from Vercel Blob:', error);
    throw new Error('Failed to delete file');
  }
};

export const getAllowedMimeTypes = (type: 'image' | 'video' | 'all'): string[] => {
  const imageMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
  ];
  
  const videoMimes = [
    'video/mp4',
    'video/webm',
    'video/ogg',
  ];
  
  switch (type) {
    case 'image':
      return imageMimes;
    case 'video':
      return videoMimes;
    case 'all':
      return [...imageMimes, ...videoMimes];
    default:
      return imageMimes;
  }
};

export const validateFileType = (
  file: Express.Multer.File,
  allowedTypes: string[]
): boolean => {
  return allowedTypes.includes(file.mimetype);
};

export const validateFileSize = (
  file: Express.Multer.File,
  maxSizeMB: number
): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};
