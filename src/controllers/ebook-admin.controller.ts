import { Request, Response } from 'express';
import Ebook from '../models/Ebook';
import EbookUser from '../models/EbookUser';
import { sendDownloadEmail, sendBulkDownloadEmails } from '../utils/emailService';

// Helper function to generate slug
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}

/**
 * Get all ebooks for admin (includes inactive)
 */
export const getAllEbooksAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;

    const query: any = {};

    if (status !== undefined) {
      query.status = Number(status);
    }

    if (search) {
      query.$text = { $search: search as string };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const ebooks = await Ebook.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Ebook.countDocuments(query);

    res.json({
      status: true,
      data: ebooks,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    console.error('Error fetching ebooks:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to fetch ebooks',
      error: error.message,
    });
  }
};

/**
 * Create new ebook
 */
export const createEbook = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      description,
      image,
      brochure,
      category,
      tags,
      author,
      publishYear,
      language,
      pageCount,
      fileSize,
      status,
      position,
      featured,
    } = req.body;

    // Validate required fields
    if (!name || !image || !brochure) {
      res.status(400).json({
        status: false,
        message: 'Name, image, and brochure are required',
      });
      return;
    }

    // Generate slug
    const slug = generateSlug(name);

    // Check if slug already exists
    const existingEbook = await Ebook.findOne({ slug });
    if (existingEbook) {
      res.status(400).json({
        status: false,
        message: 'An ebook with this name already exists',
      });
      return;
    }

    const ebook = await Ebook.create({
      name,
      slug,
      description,
      image,
      brochure,
      category,
      tags: Array.isArray(tags) ? tags : (tags ? JSON.parse(tags) : []),
      author,
      publishYear,
      language: language || 'English',
      pageCount,
      fileSize,
      status: status !== undefined ? Number(status) : 1,
      position: position || 0,
      featured: featured || false,
    });

    res.status(201).json({
      status: true,
      message: 'Ebook created successfully',
      data: ebook,
    });
  } catch (error: any) {
    console.error('Error creating ebook:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to create ebook',
      error: error.message,
    });
  }
};

/**
 * Update ebook
 */
export const updateEbook = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const ebook = await Ebook.findById(id);
    if (!ebook) {
      res.status(404).json({
        status: false,
        message: 'Ebook not found',
      });
      return;
    }

    // Update slug if name changed
    if (updateData.name && updateData.name !== ebook.name) {
      updateData.slug = generateSlug(updateData.name);
    }

    // Handle tags
    if (updateData.tags && typeof updateData.tags === 'string') {
      updateData.tags = JSON.parse(updateData.tags);
    }

    Object.assign(ebook, updateData);
    await ebook.save();

    res.json({
      status: true,
      message: 'Ebook updated successfully',
      data: ebook,
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: 'Failed to update ebook',
      error: error.message,
    });
  }
};

/**
 * Delete ebook
 */
export const deleteEbook = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const ebook = await Ebook.findById(id);
    if (!ebook) {
      res.status(404).json({
        status: false,
        message: 'Ebook not found',
      });
      return;
    }

    await ebook.deleteOne();

    res.json({
      status: true,
      message: 'Ebook deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: 'Failed to delete ebook',
      error: error.message,
    });
  }
};

/**
 * Get download analytics dashboard
 */
export const getDownloadDashboard = async (_req: Request, res: Response): Promise<void> => {
  try {
    // Total emails/downloads
    const totalDownloads = await EbookUser.countDocuments();

    // User downloads (type 1)
    const userDownloads = await EbookUser.countDocuments({ type: 1 });

    // Admin sends (type 2)
    const adminSends = await EbookUser.countDocuments({ type: 2 });

    // Unique users
    const uniqueUsers = await EbookUser.distinct('email');

    // Top ebooks
    const topEbooks = await EbookUser.aggregate([
      {
        $group: {
          _id: '$ebookId',
          ebookName: { $first: '$ebookName' },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Downloads by date (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const downloadsByDate = await EbookUser.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      status: true,
      data: {
        totalDownloads,
        userDownloads,
        adminSends,
        uniqueUsers: uniqueUsers.length,
        topEbooks,
        downloadsByDate,
      },
    });
  } catch (error: any) {
    console.error('Error fetching dashboard:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to fetch dashboard data',
      error: error.message,
    });
  }
};

/**
 * Get all downloads with filters
 */
export const getAllDownloads = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 50,
      search,
      ebookId,
      type,
      startDate,
      endDate,
    } = req.query;

    const query: any = {};

    // Search filter (email or name)
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
      ];
    }

    // Ebook filter
    if (ebookId) {
      query.ebookId = ebookId;
    }

    // Type filter (1=user, 2=admin)
    if (type) {
      query.type = Number(type);
    }

    // Date range filter
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const downloads = await EbookUser.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('ebookId', 'name image');

    const total = await EbookUser.countDocuments(query);

    res.json({
      status: true,
      data: downloads,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    console.error('Error fetching downloads:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to fetch downloads',
      error: error.message,
    });
  }
};

/**
 * Get email count for specific ebook
 */
export const getEbookEmailCount = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const totalCount = await EbookUser.countDocuments({ ebookId: id });
    const userDownloads = await EbookUser.countDocuments({ ebookId: id, type: 1 });
    const adminSends = await EbookUser.countDocuments({ ebookId: id, type: 2 });
    const uniqueEmails = await EbookUser.distinct('email', { ebookId: id });

    res.json({
      status: true,
      data: {
        totalCount,
        userDownloads,
        adminSends,
        uniqueEmails: uniqueEmails.length,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: 'Failed to fetch email count',
      error: error.message,
    });
  }
};

/**
 * Send ebook to single email (Admin)
 */
export const sendEbookToEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, name, ebookId } = req.body;

    // Validate required fields
    if (!email || !ebookId) {
      res.status(400).json({
        status: false,
        message: 'Email and ebookId are required',
      });
      return;
    }

    // Validate ebook exists
    const ebook = await Ebook.findById(ebookId);
    if (!ebook) {
      res.status(404).json({
        status: false,
        message: 'Ebook not found',
      });
      return;
    }

    // Construct download URL
    const downloadUrl = ebook.brochure.startsWith('http')
      ? ebook.brochure
      : `${process.env.S3_URL || process.env.VITE_API_URL}/uploads/ebook/${ebook.brochure}`;

    // Send email
    await sendDownloadEmail(email, name || 'Valued User', ebook.name, downloadUrl);

    // Save to database
    await EbookUser.create({
      name: name || 'Admin Send',
      email,
      mobile: '',
      countryCode: '+91',
      ebookName: ebook.name,
      ebookId: ebook._id,
      emailSent: true,
      type: 2, // Admin send
      typeDescription: 'admin-single-send',
      sentBy: 'admin',
      sentByUserId: (req as any).user?._id, // If auth middleware adds user
    });

    // Increment download count
    ebook.downloadCount += 1;
    await ebook.save();

    res.json({
      status: true,
      message: 'Ebook sent successfully',
      data: {
        email,
        ebookName: ebook.name,
      },
    });
  } catch (error: any) {
    console.error('Error sending ebook:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to send ebook',
      error: error.message,
    });
  }
};

/**
 * Send ebook to multiple emails (Bulk - Admin)
 */
export const bulkSendEbook = async (req: Request, res: Response): Promise<void> => {
  try {
    const { emails, ebookId } = req.body;

    // Validate required fields
    if (!emails || !Array.isArray(emails) || emails.length === 0 || !ebookId) {
      res.status(400).json({
        status: false,
        message: 'Emails array and ebookId are required',
      });
      return;
    }

    // Validate ebook exists
    const ebook = await Ebook.findById(ebookId);
    if (!ebook) {
      res.status(404).json({
        status: false,
        message: 'Ebook not found',
      });
      return;
    }

    // Construct download URL
    const downloadUrl = ebook.brochure.startsWith('http')
      ? ebook.brochure
      : `${process.env.S3_URL || process.env.VITE_API_URL}/uploads/ebook/${ebook.brochure}`;

    // Send bulk emails
    const result = await sendBulkDownloadEmails(emails, ebook.name, downloadUrl);

    // Save successful sends to database
    const ebookUsers = result.success.map((email) => ({
      name: 'Bulk Send',
      email,
      mobile: '',
      countryCode: '+91',
      ebookName: ebook.name,
      ebookId: ebook._id,
      emailSent: true,
      type: 2, // Admin send
      typeDescription: 'admin-bulk-send',
      sentBy: 'admin',
      sentByUserId: (req as any).user?._id,
    }));

    if (ebookUsers.length > 0) {
      await EbookUser.insertMany(ebookUsers);
    }

    // Update download count
    ebook.downloadCount += result.success.length;
    await ebook.save();

    res.json({
      status: true,
      message: `Sent to ${result.success.length} emails`,
      data: {
        totalSent: result.success.length,
        totalFailed: result.failed.length,
        successEmails: result.success,
        failedEmails: result.failed,
        ebookName: ebook.name,
      },
    });
  } catch (error: any) {
    console.error('Error bulk sending ebook:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to bulk send ebook',
      error: error.message,
    });
  }
};

/**
 * Export downloads to CSV
 */
export const exportDownloadsCSV = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ebookId, type, startDate, endDate } = req.query;

    const query: any = {};

    if (ebookId) {
      query.ebookId = ebookId;
    }

    if (type) {
      query.type = Number(type);
    }

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      };
    }

    const downloads = await EbookUser.find(query)
      .sort({ createdAt: -1 })
      .populate('ebookId', 'name')
      .lean();

    // Format data for CSV
    const csvRows = [];
    
    // CSV Header
    csvRows.push([
      'Name',
      'Email',
      'Mobile',
      'Ebook Name',
      'Type',
      'Type Description',
      'Downloaded At',
      'IP Address'
    ].join(','));

    // CSV Data rows
    downloads.forEach((download: any) => {
      csvRows.push([
        `"${download.name || ''}"`,
        `"${download.email || ''}"`,
        `"${download.mobile || ''}"`,
        `"${download.ebookName || ''}"`,
        `"${download.type === 1 ? 'User Download' : 'Admin Send'}"`,
        `"${download.typeDescription || ''}"`,
        `"${new Date(download.downloadedAt || download.createdAt).toLocaleString()}"`,
        `"${download.ipAddress || ''}"`,
      ].join(','));
    });

    const csv = csvRows.join('\n');

    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', 'attachment; filename=ebook-downloads.csv');
    res.send(csv);
  } catch (error: any) {
    console.error('Error exporting CSV:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to export CSV',
      error: error.message,
    });
  }
};

