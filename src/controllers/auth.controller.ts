import { Request, Response } from 'express';
import User from '../models/User';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        status: false,
        message: 'User with this email already exists',
      });
      return;
    }

    // Create new user
    const user = await User.create({
      email,
      password,
      name,
      role: role || 'user',
    });

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: (user._id as any).toString(),
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: (user._id as any).toString(),
      email: user.email,
      role: user.role,
    });

    res.status(201).json({
      status: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: 'Error registering user',
      error: error.message,
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user with password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401).json({
        status: false,
        message: 'Invalid email or password',
      });
      return;
    }

    // Check if user is active
    if (!user.isActive) {
      res.status(403).json({
        status: false,
        message: 'Account is disabled',
      });
      return;
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({
        status: false,
        message: 'Invalid email or password',
      });
      return;
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: (user._id as any).toString(),
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: (user._id as any).toString(),
      email: user.email,
      role: user.role,
    });

    res.status(200).json({
      status: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: 'Error logging in',
      error: error.message,
    });
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        status: false,
        message: 'Refresh token is required',
      });
      return;
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      res.status(401).json({
        status: false,
        message: 'Invalid or expired refresh token',
      });
      return;
    }

    // Generate new access token
    const accessToken = generateAccessToken({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    });

    res.status(200).json({
      status: true,
      message: 'Token refreshed successfully',
      data: { accessToken },
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: 'Error refreshing token',
      error: error.message,
    });
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        status: false,
        message: 'User not found',
      });
      return;
    }

    res.status(200).json({
      status: true,
      data: user,
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: 'Error fetching profile',
      error: error.message,
    });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const { name, bio, facebook, twitter, linkedin, instagram, youtube } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        name,
        bio,
        facebook,
        twitter,
        linkedin,
        instagram,
        youtube,
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      res.status(404).json({
        status: false,
        message: 'User not found',
      });
      return;
    }

    res.status(200).json({
      status: true,
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: 'Error updating profile',
      error: error.message,
    });
  }
};



