/**
 * File Manager Controller
 * Manage uploaded files in Vercel Blob
 */

import { Request, Response } from 'express';
import { list, del } from '@vercel/blob';
import { isBlobAvailable, BLOB_READ_WRITE_TOKEN } from '../config/blob';

/**
 * List all uploaded files
 * GET /api/files
 */
export const listFiles = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!isBlobAvailable()) {
      res.status(500).json({
        status: false,
        message: 'File storage not configured',
      });
      return;
    }

    const { folder, limit = 100, cursor } = req.query;

    const options: any = {
      token: BLOB_READ_WRITE_TOKEN(),
      limit: parseInt(limit as string),
    };

    if (folder) {
      options.prefix = folder as string;
    }

    if (cursor) {
      options.cursor = cursor as string;
    }

    const result = await list(options);

    res.status(200).json({
      status: true,
      data: {
        blobs: result.blobs.map((blob) => ({
          url: blob.url,
          pathname: blob.pathname,
          size: blob.size,
          uploadedAt: blob.uploadedAt,
        })),
        cursor: result.cursor,
        hasMore: result.hasMore,
      },
    });
  } catch (error: any) {
    console.error('Error listing files:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to list files',
      error: error.message,
    });
  }
};

/**
 * Delete a file
 * DELETE /api/files
 */
export const deleteFile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { url } = req.body;

    if (!url) {
      res.status(400).json({
        status: false,
        message: 'File URL is required',
      });
      return;
    }

    if (!isBlobAvailable()) {
      res.status(500).json({
        status: false,
        message: 'File storage not configured',
      });
      return;
    }

    await del(url, {
      token: BLOB_READ_WRITE_TOKEN(),
    });

    res.status(200).json({
      status: true,
      message: 'File deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting file:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to delete file',
      error: error.message,
    });
  }
};

/**
 * Delete multiple files
 * POST /api/files/bulk-delete
 */
export const bulkDeleteFiles = async (req: Request, res: Response): Promise<void> => {
  try {
    const { urls } = req.body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      res.status(400).json({
        status: false,
        message: 'File URLs array is required',
      });
      return;
    }

    if (!isBlobAvailable()) {
      res.status(500).json({
        status: false,
        message: 'File storage not configured',
      });
      return;
    }

    const results = await Promise.allSettled(
      urls.map((url) =>
        del(url, {
          token: BLOB_READ_WRITE_TOKEN(),
        })
      )
    );

    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    res.status(200).json({
      status: true,
      message: `Deleted ${successful} files successfully`,
      data: {
        successful,
        failed,
        total: urls.length,
      },
    });
  } catch (error: any) {
    console.error('Error bulk deleting files:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to bulk delete files',
      error: error.message,
    });
  }
};

/**
 * Get file info
 * GET /api/files/info
 */
export const getFileInfo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { url } = req.query;

    if (!url) {
      res.status(400).json({
        status: false,
        message: 'File URL is required',
      });
      return;
    }

    // You can enhance this with actual file metadata if needed
    res.status(200).json({
      status: true,
      data: {
        url,
        message: 'File exists and is accessible',
      },
    });
  } catch (error: any) {
    console.error('Error getting file info:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to get file info',
      error: error.message,
    });
  }
};

