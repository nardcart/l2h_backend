import { Request, Response } from 'express';
import BlogComment from '../models/BlogComment';
import OTP from '../models/OTP';
import { generateOTP, getOTPExpiryDate } from '../utils/otp';
import { sendOTPEmail } from '../config/email';

export const submitComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { blogId, name, email, mobile, countryCode, comment } = req.body;

    // Generate OTP
    const otp = generateOTP(6);
    const expiresAt = getOTPExpiryDate(10);

    // Store OTP in database
    await OTP.create({
      email,
      otp,
      purpose: 'comment',
      expiresAt,
    });

    // Send OTP via email
    await sendOTPEmail(email, otp, 'Blog Comment Verification');

    // Store comment data in session or temporary storage
    // For now, we'll send it back to be resubmitted with OTP
    res.status(200).json({
      status: true,
      message: 'OTP sent to your email. Please verify to submit comment.',
      data: {
        email,
        requiresOTP: true,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: 'Error submitting comment',
      error: error.message,
    });
  }
};

export const verifyOTPAndSubmitComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { blogId, name, email, mobile, countryCode, comment, otp } = req.body;

    // Find and verify OTP
    const otpRecord = await OTP.findOne({
      email,
      otp,
      purpose: 'comment',
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      res.status(400).json({
        status: false,
        message: 'Invalid or expired OTP',
      });
      return;
    }

    // Check attempts
    if (otpRecord.attempts >= 3) {
      res.status(400).json({
        status: false,
        message: 'Maximum OTP attempts exceeded. Please request a new OTP.',
      });
      return;
    }

    // Mark OTP as used
    otpRecord.isUsed = true;
    await otpRecord.save();

    // Create comment
    const newComment = await BlogComment.create({
      blogId,
      name,
      email,
      mobile,
      countryCode,
      comment,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      status: 'pending', // Comments require admin approval
    });

    res.status(201).json({
      status: true,
      message: 'Comment submitted successfully and is pending approval',
      data: newComment,
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: 'Error verifying OTP and submitting comment',
      error: error.message,
    });
  }
};

export const getCommentsByBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const { blogId } = req.params;
    const { status = 'approved' } = req.query;

    const comments = await BlogComment.find({
      blogId,
      status,
    }).sort('-createdAt');

    res.status(200).json({
      status: true,
      data: comments,
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: 'Error fetching comments',
      error: error.message,
    });
  }
};

export const moderateComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'

    const comment = await BlogComment.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!comment) {
      res.status(404).json({
        status: false,
        message: 'Comment not found',
      });
      return;
    }

    res.status(200).json({
      status: true,
      message: `Comment ${status} successfully`,
      data: comment,
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: 'Error moderating comment',
      error: error.message,
    });
  }
};

export const deleteComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const comment = await BlogComment.findByIdAndDelete(id);

    if (!comment) {
      res.status(404).json({
        status: false,
        message: 'Comment not found',
      });
      return;
    }

    res.status(200).json({
      status: true,
      message: 'Comment deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: 'Error deleting comment',
      error: error.message,
    });
  }
};



