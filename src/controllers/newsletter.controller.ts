import { Request, Response } from 'express';
import Newsletter from '../models/Newsletter';
import OTP from '../models/OTP';
import { generateOTP, getOTPExpiryDate } from '../utils/otp';
import { sendOTPEmail, sendNewsletterWelcomeEmail } from '../config/email';

export const subscribe = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, name } = req.body;

    // Check if already subscribed
    const existing = await Newsletter.findOne({ email });
    if (existing) {
      if (existing.isActive) {
        res.status(400).json({
          status: false,
          message: 'Email is already subscribed',
        });
        return;
      }
      
      // Reactivate if previously unsubscribed
      existing.isActive = true;
      existing.subscribedAt = new Date();
      await existing.save();
      
      res.status(200).json({
        status: true,
        message: 'Subscription reactivated successfully',
      });
      return;
    }

    // Generate OTP for verification
    const otp = generateOTP(6);
    const expiresAt = getOTPExpiryDate(10);

    await OTP.create({
      email,
      otp,
      purpose: 'newsletter',
      expiresAt,
    });

    // Send OTP
    await sendOTPEmail(email, otp, 'Newsletter Subscription');

    res.status(200).json({
      status: true,
      message: 'OTP sent to your email. Please verify to complete subscription.',
      data: {
        email,
        requiresOTP: true,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: 'Error subscribing to newsletter',
      error: error.message,
    });
  }
};

export const verifyAndSubscribe = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, name, otp } = req.body;

    // Find and verify OTP
    const otpRecord = await OTP.findOne({
      email,
      otp,
      purpose: 'newsletter',
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

    // Mark OTP as used
    otpRecord.isUsed = true;
    await otpRecord.save();

    // Create newsletter subscription
    const subscription = await Newsletter.create({
      email,
      name,
      isActive: true,
    });

    // Send welcome email
    await sendNewsletterWelcomeEmail(email, name);

    res.status(201).json({
      status: true,
      message: 'Successfully subscribed to newsletter',
      data: subscription,
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: 'Error verifying and subscribing',
      error: error.message,
    });
  }
};

export const unsubscribe = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    const subscription = await Newsletter.findOne({ email });
    
    if (!subscription) {
      res.status(404).json({
        status: false,
        message: 'Subscription not found',
      });
      return;
    }

    subscription.isActive = false;
    subscription.unsubscribedAt = new Date();
    await subscription.save();

    res.status(200).json({
      status: true,
      message: 'Successfully unsubscribed from newsletter',
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: 'Error unsubscribing from newsletter',
      error: error.message,
    });
  }
};

export const getAllSubscribers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { isActive = true } = req.query;
    
    const subscribers = await Newsletter.find({ isActive }).sort('-subscribedAt');

    res.status(200).json({
      status: true,
      data: subscribers,
      total: subscribers.length,
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: 'Error fetching subscribers',
      error: error.message,
    });
  }
};



