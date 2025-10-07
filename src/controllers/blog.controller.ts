import { Request, Response } from 'express';
import Blog from '../models/Blog';
import BlogCategory from '../models/BlogCategory';
import { uploadToBlob } from '../utils/upload';

export const getAllBlogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      status = 'published', 
      category, 
      tag, 
      search,
      page = 1, 
      limit = 10,
      sort = '-publishedAt'
    } = req.query;

    const query: any = {};

    // Filter by status (skip filter if status is 'all')
    if (status && status !== 'all') {
      query.status = status;
    }

    // Filter by category
    if (category) {
      const categoryDoc = await BlogCategory.findOne({ slug: category });
      if (categoryDoc) query.categoryId = categoryDoc._id;
    }

    // Filter by tag
    if (tag) query.tags = tag;

    // Search functionality
    if (search) {
      query.$text = { $search: search as string };
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .populate('authorId', 'name email image bio')
        .populate('categoryId', 'name slug')
        .sort(sort as string)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Blog.countDocuments(query),
    ]);

    res.status(200).json({
      status: true,
      data: blogs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: 'Error fetching blogs',
      error: error.message,
    });
  }
};

export const getBlogBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;

    const blog = await Blog.findOne({ slug })
      .populate('authorId', 'name email image bio facebook twitter linkedin instagram youtube')
      .populate('categoryId', 'name slug')
      .populate('relatedBlogs', 'title slug coverImage excerpt publishedAt');

    if (!blog) {
      res.status(404).json({
        status: false,
        message: 'Blog not found',
      });
      return;
    }

    // Increment view count
    blog.viewCount += 1;
    await blog.save();

    res.status(200).json({
      status: true,
      data: blog,
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: 'Error fetching blog',
      error: error.message,
    });
  }
};

export const getBlogById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id)
      .populate('authorId', 'name email image bio')
      .populate('categoryId', 'name slug');

    if (!blog) {
      res.status(404).json({
        status: false,
        message: 'Blog not found',
      });
      return;
    }

    res.status(200).json({
      status: true,
      data: blog,
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: 'Error fetching blog',
      error: error.message,
    });
  }
};

export const createBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const {
      title,
      slug,
      description,
      content, // Frontend sends 'content'
      coverImage: coverImageUrl,
      excerpt,
      tags,
      isVideo,
      videoType,
      videoUrl,
      status,
      categoryId,
      metaTitle,
      metaDescription,
      metaKeywords,
    } = req.body;

    // Use 'content' if provided, otherwise fall back to 'description'
    const blogDescription = content || description;

    // Parse tags if it's a JSON string
    let parsedTags = tags || [];
    if (typeof tags === 'string') {
      try {
        parsedTags = JSON.parse(tags);
      } catch (e) {
        parsedTags = [];
      }
    }

    // Handle file upload if present
    let coverImage = coverImageUrl;
    const uploadedFile = (req as any).file;
    if (uploadedFile) {
      // Check if Vercel Blob is configured
      const isBlobConfigured = !!process.env.BLOB_READ_WRITE_TOKEN;
      
      if (isBlobConfigured) {
        try {
          // Upload to Vercel Blob
          const uploadResult = await uploadToBlob(uploadedFile, 'blog-covers');
          coverImage = uploadResult.url;
          console.log('✅ Cover image uploaded to Vercel Blob:', coverImage);
        } catch (error) {
          console.error('❌ Failed to upload cover image to Vercel Blob:', error);
          console.log('⚠️  Using placeholder image instead');
          coverImage = 'https://placehold.co/800x400?font=roboto&text=Upload+Failed';
        }
      } else {
        console.log('⚠️  Vercel Blob not configured, using placeholder image');
        console.log('💡 To enable Vercel Blob uploads: Set BLOB_READ_WRITE_TOKEN in backend/.env');
        coverImage = 'https://placehold.co/800x400?font=roboto&text=Image+Preview';
      }
    }

    const blog = await Blog.create({
      title,
      slug,
      description: blogDescription,
      coverImage: coverImage || 'https://placehold.co/800x400?font=roboto',
      excerpt,
      tags: parsedTags,
      isVideo: isVideo === 'true' || isVideo === true,
      videoType,
      videoUrl,
      status: status || 'draft',
      categoryId,
      authorId: userId,
      metaTitle,
      metaDescription,
      metaKeywords,
    });

    // Update category post count ONLY if status is published
    if (blog.status === 'published') {
      await BlogCategory.findByIdAndUpdate(categoryId, { $inc: { postCount: 1 } });
    }

    const populatedBlog = await Blog.findById(blog._id)
      .populate('authorId', 'name email')
      .populate('categoryId', 'name slug');

    res.status(201).json({
      status: true,
      message: 'Blog created successfully',
      data: populatedBlog,
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: 'Error creating blog',
      error: error.message,
    });
  }
};

export const updateBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;
    const userRole = (req as any).user?.role;

    const blog = await Blog.findById(id);
    if (!blog) {
      res.status(404).json({
        status: false,
        message: 'Blog not found',
      });
      return;
    }

    // Check permissions
    if (userRole !== 'admin' && blog.authorId.toString() !== userId) {
      res.status(403).json({
        status: false,
        message: 'You do not have permission to update this blog',
      });
      return;
    }

    // Handle file upload if present
    const uploadedFile = (req as any).file;
    if (uploadedFile) {
      // Check if Vercel Blob is configured
      const isBlobConfigured = !!process.env.BLOB_READ_WRITE_TOKEN;
      
      if (isBlobConfigured) {
        try {
          // Upload new cover image to Vercel Blob
          const uploadResult = await uploadToBlob(uploadedFile, 'blog-covers');
          req.body.coverImage = uploadResult.url;
          console.log('✅ Cover image updated in Vercel Blob:', uploadResult.url);
        } catch (error) {
          console.error('❌ Failed to upload cover image to Vercel Blob:', error);
          console.log('⚠️  Using placeholder image instead');
          req.body.coverImage = 'https://placehold.co/800x400?font=roboto&text=Upload+Failed';
        }
      } else {
        console.log('⚠️  Vercel Blob not configured, using placeholder image');
        console.log('💡 To enable Vercel Blob uploads: Set BLOB_READ_WRITE_TOKEN in backend/.env');
        req.body.coverImage = 'https://placehold.co/800x400?font=roboto&text=Image+Preview';
      }
    }

    // Parse tags if it's a JSON string
    if (req.body.tags && typeof req.body.tags === 'string') {
      try {
        req.body.tags = JSON.parse(req.body.tags);
      } catch (e) {
        // Keep original if parse fails
      }
    }

    // Convert isVideo to boolean if it's a string
    if (req.body.isVideo !== undefined) {
      req.body.isVideo = req.body.isVideo === 'true' || req.body.isVideo === true;
    }

    // Handle content field (frontend sends 'content' but model uses 'description')
    if (req.body.content) {
      req.body.description = req.body.content;
      delete req.body.content;
    }

    // Track changes for category post count updates
    const oldStatus = blog.status;
    const oldCategoryId = blog.categoryId.toString();
    const newStatus = req.body.status || oldStatus;
    const newCategoryId = req.body.categoryId || oldCategoryId;

    // Update the blog
    const updatedBlog = await Blog.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('authorId', 'name email')
      .populate('categoryId', 'name slug');

    // Update category post counts based on changes
    
    // Case 1: Status changed from draft to published
    if (oldStatus !== 'published' && newStatus === 'published') {
      await BlogCategory.findByIdAndUpdate(newCategoryId, { $inc: { postCount: 1 } });
    }
    
    // Case 2: Status changed from published to draft/archived
    if (oldStatus === 'published' && newStatus !== 'published') {
      await BlogCategory.findByIdAndUpdate(oldCategoryId, { $inc: { postCount: -1 } });
    }
    
    // Case 3: Category changed while published
    if (oldCategoryId !== newCategoryId && newStatus === 'published') {
      // Decrement old category
      await BlogCategory.findByIdAndUpdate(oldCategoryId, { $inc: { postCount: -1 } });
      // Increment new category (only if not already counted in Case 1)
      if (oldStatus === 'published') {
        await BlogCategory.findByIdAndUpdate(newCategoryId, { $inc: { postCount: 1 } });
      }
    }

    res.status(200).json({
      status: true,
      message: 'Blog updated successfully',
      data: updatedBlog,
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: 'Error updating blog',
      error: error.message,
    });
  }
};

export const deleteBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;
    const userRole = (req as any).user?.role;

    const blog = await Blog.findById(id);
    if (!blog) {
      res.status(404).json({
        status: false,
        message: 'Blog not found',
      });
      return;
    }

    // Check permissions
    if (userRole !== 'admin' && blog.authorId.toString() !== userId) {
      res.status(403).json({
        status: false,
        message: 'You do not have permission to delete this blog',
      });
      return;
    }

    await Blog.findByIdAndDelete(id);

    // Update category post count ONLY if the blog was published
    if (blog.status === 'published') {
      await BlogCategory.findByIdAndUpdate(blog.categoryId, { $inc: { postCount: -1 } });
    }

    res.status(200).json({
      status: true,
      message: 'Blog deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: 'Error deleting blog',
      error: error.message,
    });
  }
};

export const getRelatedBlogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit as string) || 3;

    const blog = await Blog.findById(id);
    if (!blog) {
      res.status(404).json({
        status: false,
        message: 'Blog not found',
      });
      return;
    }

    // Find related blogs by category and tags
    const relatedBlogs = await Blog.find({
      _id: { $ne: id },
      status: 'published',
      $or: [
        { categoryId: blog.categoryId },
        { tags: { $in: blog.tags } },
      ],
    })
      .select('title slug coverImage excerpt publishedAt')
      .limit(limit)
      .sort('-publishedAt');

    res.status(200).json({
      status: true,
      data: relatedBlogs,
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: 'Error fetching related blogs',
      error: error.message,
    });
  }
};

