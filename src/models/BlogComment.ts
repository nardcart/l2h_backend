import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IBlogComment extends Document {
  name: string;
  email: string;
  mobile?: string;
  countryCode?: string;
  comment: string;
  hearAbout?: string;
  status: 'pending' | 'approved' | 'rejected';
  blogId: Types.ObjectId;
  userId?: Types.ObjectId;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const blogCommentSchema = new Schema<IBlogComment>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    mobile: {
      type: String,
      trim: true,
    },
    countryCode: {
      type: String,
      default: '+1',
    },
    comment: {
      type: String,
      required: [true, 'Comment is required'],
      minlength: [10, 'Comment must be at least 10 characters'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    hearAbout: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    blogId: {
      type: Schema.Types.ObjectId,
      ref: 'Blog',
      required: [true, 'Blog ID is required'],
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    ipAddress: String,
    userAgent: String,
  },
  {
    timestamps: true,
  }
);

// Index for fetching approved comments for a blog
blogCommentSchema.index({ blogId: 1, status: 1, createdAt: -1 });

export default mongoose.model<IBlogComment>('BlogComment', blogCommentSchema);



