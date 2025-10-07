import { Request, Response } from 'express';
import Ebook from '../models/Ebook';
import EbookUser from '../models/EbookUser';
import { sendDownloadEmail } from '../utils/emailService';

/**
 * Get all active ebooks (Public)
 */
export const getEbooks = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      category,
      search,
      page = 1,
      limit = 12,
      featured,
    } = req.query;

    const query: any = { status: 1 };

    // Category filter
    if (category) {
      query.category = category;
    }

    // Featured filter
    if (featured === 'true') {
      query.featured = true;
    }

    // Search filter
    if (search) {
      query.$text = { $search: search as string };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const ebooks = await Ebook.find(query)
      .sort({ position: 1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select('-__v');

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
 * Get single ebook by ID or slug (Public)
 */
export const getEbookById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const ebook = await Ebook.findOne({
      $or: [{ _id: id }, { slug: id }],
      status: 1,
    });

    if (!ebook) {
      res.status(404).json({
        status: false,
        message: 'Ebook not found',
      });
      return;
    }

    // Increment view count
    ebook.viewCount += 1;
    await ebook.save();

    res.json({
      status: true,
      data: ebook,
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: 'Failed to fetch ebook',
      error: error.message,
    });
  }
};

/**
 * Request and Send Ebook Download (No OTP - Direct)
 */
export const downloadEbook = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      email,
      mobile,
      countryCode = '+91',
      ebookId,
      stateId,
      cityId,
      hearAbout,
    } = req.body;

    // Validate required fields
    if (!name || !email || !ebookId) {
      res.status(400).json({
        status: false,
        message: 'Name, email, and ebookId are required',
      });
      return;
    }

    // Validate ebook exists
    const ebook = await Ebook.findById(ebookId);
    if (!ebook || ebook.status !== 1) {
      res.status(404).json({
        status: false,
        message: 'Ebook not found or inactive',
      });
      return;
    }

    // Get user IP and user agent
    const ipAddress = (req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress) as string;
    const userAgent = req.headers['user-agent'];

    // Save download record
    await EbookUser.create({
      name,
      email,
      mobile: mobile || '',
      countryCode,
      stateId,
      cityId,
      ebookName: ebook.name,
      ebookId: ebook._id,
      hearAbout,
      ipAddress,
      userAgent,
      emailSent: true,
      type: 1, // User download
      typeDescription: 'user-direct-download',
      sentBy: 'user',
    });

    // Increment download count
    ebook.downloadCount += 1;
    await ebook.save();

    // Construct download URL
    const downloadUrl = ebook.brochure.startsWith('http')
      ? ebook.brochure
      : `${process.env.S3_URL || process.env.VITE_API_URL}/uploads/ebook/${ebook.brochure}`;

    // Send download email
    try {
      await sendDownloadEmail(email, name, ebook.name, downloadUrl);
    } catch (emailError) {
      console.error('Email send failed:', emailError);
      // Continue even if email fails - user can still download
    }

    res.json({
      status: true,
      message: 'Ebook sent to your email successfully!',
      data: {
        downloadUrl,
        ebookName: ebook.name,
        fileName: ebook.brochure,
        email,
      },
    });
  } catch (error: any) {
    console.error('Error downloading ebook:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to send ebook',
      error: error.message,
    });
  }
};

/**
 * Get popular ebooks
 */
export const getPopularEbooks = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = Number(req.query.limit) || 6;

    const ebooks = await Ebook.find({ status: 1 })
      .sort({ downloadCount: -1 })
      .limit(limit)
      .select('-__v');

    res.json({
      status: true,
      data: ebooks,
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: 'Failed to fetch popular ebooks',
      error: error.message,
    });
  }
};


