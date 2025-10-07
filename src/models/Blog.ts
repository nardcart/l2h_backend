import mongoose, { Schema, Document, Types } from 'mongoose';
import slugify from 'slugify';

export interface IBlog extends Document {
  title: string;
  slug: string;
  description: string;
  coverImage: string;
  excerpt?: string;
  tags: string[];
  isVideo: boolean;
  videoType?: 'file' | 'embed';
  videoUrl?: string;
  status: 'draft' | 'published' | 'archived';
  publishedAt?: Date;
  viewCount: number;
  position: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  categoryId: Types.ObjectId;
  authorId: Types.ObjectId;
  relatedBlogs: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const blogSchema = new Schema<IBlog>(
  {
    title: {
      type: String,
      required: [true, 'Blog title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Blog content is required'],
    },
    coverImage: {
      type: String,
      required: false, // Optional - can be added later
      default: 'https://via.placeholder.com/800x400',
    },
    excerpt: {
      type: String,
      maxlength: [300, 'Excerpt cannot exceed 300 characters'],
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    isVideo: {
      type: Boolean,
      default: false,
    },
    videoType: {
      type: String,
      enum: ['file', 'embed', null],
      default: null,
    },
    videoUrl: String,
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
      index: true,
    },
    publishedAt: {
      type: Date,
      index: true,
    },
    viewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    position: {
      type: Number,
      default: 0,
    },
    metaTitle: {
      type: String,
      maxlength: [60, 'Meta title cannot exceed 60 characters'],
    },
    metaDescription: {
      type: String,
      maxlength: [160, 'Meta description cannot exceed 160 characters'],
    },
    metaKeywords: String,
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'BlogCategory',
      required: [true, 'Category is required'],
      index: true,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
      index: true,
    },
    relatedBlogs: [{
      type: Schema.Types.ObjectId,
      ref: 'Blog',
    }],
  },
  {
    timestamps: true,
  }
);

// Auto-generate slug from title before saving
blogSchema.pre('save', function (next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = slugify(this.title, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g,
    });
  }
  
  // Auto-generate excerpt from description if not provided
  if (!this.excerpt && this.description) {
    const plainText = this.description.replace(/<[^>]*>/g, '');
    this.excerpt = plainText.substring(0, 297) + '...';
  }
  
  // Set publishedAt if status changed to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  next();
});

// Text search index for search functionality
blogSchema.index({ 
  title: 'text', 
  description: 'text', 
  excerpt: 'text',
  tags: 'text' 
});

// Compound indexes for common queries
blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ categoryId: 1, status: 1 });
blogSchema.index({ authorId: 1, status: 1 });

export default mongoose.model<IBlog>('Blog', blogSchema);

