import { Response } from 'express';
import User from '../models/User';
import Blog from '../models/Blog';
import { AuthRequest } from '../middleware/auth';

// Get all users (admin only)
export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, role, page = 1, limit = 10 } = req.query;
    
    const query: any = {};
    
    // Search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by role
    if (role && role !== 'all') {
      query.role = role;
    }
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(skip);
    
    const total = await User.countDocuments(query);
    
    // Get post counts for each user
    const usersWithPostCounts = await Promise.all(
      users.map(async (user) => {
        const postCount = await Blog.countDocuments({ authorId: user._id });
        return {
          ...user.toJSON(),
          postCount
        };
      })
    );
    
    res.status(200).json({
      status: true,
      data: {
        users: usersWithPostCounts,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// Get single user by ID (admin only)
export const getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id).select('-password');
    
    if (!user) {
      res.status(404).json({
        status: false,
        message: 'User not found'
      });
      return;
    }
    
    // Get post count
    const postCount = await Blog.countDocuments({ authorId: user._id });
    
    res.status(200).json({
      status: true,
      data: {
        ...user.toJSON(),
        postCount
      }
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};

// Create new user (admin only)
export const createUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password, name, role, bio, image, facebook, twitter, linkedin, instagram, youtube } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        status: false,
        message: 'User with this email already exists'
      });
      return;
    }
    
    // Create new user
    const user = await User.create({
      email,
      password,
      name,
      role: role || 'user',
      bio,
      image,
      facebook,
      twitter,
      linkedin,
      instagram,
      youtube,
      isActive: true
    });
    
    res.status(201).json({
      status: true,
      message: 'User created successfully',
      data: user.toJSON()
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: 'Error creating user',
      error: error.message
    });
  }
};

// Update user (admin only)
export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { email, name, role, bio, image, facebook, twitter, linkedin, instagram, youtube, isActive } = req.body;
    
    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({
        status: false,
        message: 'User not found'
      });
      return;
    }
    
    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(400).json({
          status: false,
          message: 'Email already in use by another user'
        });
        return;
      }
    }
    
    // Update user fields
    if (email) user.email = email;
    if (name) user.name = name;
    if (role) user.role = role;
    if (bio !== undefined) user.bio = bio;
    if (image !== undefined) user.image = image;
    if (facebook !== undefined) user.facebook = facebook;
    if (twitter !== undefined) user.twitter = twitter;
    if (linkedin !== undefined) user.linkedin = linkedin;
    if (instagram !== undefined) user.instagram = instagram;
    if (youtube !== undefined) user.youtube = youtube;
    if (isActive !== undefined) user.isActive = isActive;
    
    await user.save();
    
    res.status(200).json({
      status: true,
      message: 'User updated successfully',
      data: user.toJSON()
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: 'Error updating user',
      error: error.message
    });
  }
};

// Update user password (admin only)
export const updateUserPassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    
    if (!password || password.length < 6) {
      res.status(400).json({
        status: false,
        message: 'Password must be at least 6 characters'
      });
      return;
    }
    
    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({
        status: false,
        message: 'User not found'
      });
      return;
    }
    
    user.password = password;
    await user.save();
    
    res.status(200).json({
      status: true,
      message: 'Password updated successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: 'Error updating password',
      error: error.message
    });
  }
};

// Delete user (admin only)
export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Prevent admin from deleting themselves
    if (req.user?.userId === id) {
      res.status(400).json({
        status: false,
        message: 'You cannot delete your own account'
      });
      return;
    }
    
    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({
        status: false,
        message: 'User not found'
      });
      return;
    }
    
    // Check if user has posts
    const postCount = await Blog.countDocuments({ authorId: id });
    if (postCount > 0) {
      res.status(400).json({
        status: false,
        message: `Cannot delete user with ${postCount} existing posts. Please reassign or delete their posts first.`
      });
      return;
    }
    
    await User.findByIdAndDelete(id);
    
    res.status(200).json({
      status: true,
      message: 'User deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
};

// Toggle user active status (admin only)
export const toggleUserStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Prevent admin from deactivating themselves
    if (req.user?.userId === id) {
      res.status(400).json({
        status: false,
        message: 'You cannot deactivate your own account'
      });
      return;
    }
    
    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({
        status: false,
        message: 'User not found'
      });
      return;
    }
    
    user.isActive = !user.isActive;
    await user.save();
    
    res.status(200).json({
      status: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: user.toJSON()
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: 'Error toggling user status',
      error: error.message
    });
  }
};

// Get user statistics (admin only)
export const getUserStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments();
    const adminCount = await User.countDocuments({ role: 'admin' });
    const authorCount = await User.countDocuments({ role: 'author' });
    const userCount = await User.countDocuments({ role: 'user' });
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User.countDocuments({ isActive: false });
    
    res.status(200).json({
      status: true,
      data: {
        total: totalUsers,
        byRole: {
          admin: adminCount,
          author: authorCount,
          user: userCount
        },
        byStatus: {
          active: activeUsers,
          inactive: inactiveUsers
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: 'Error fetching user statistics',
      error: error.message
    });
  }
};

