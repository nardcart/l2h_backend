import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IEbookUser extends Document {
  name: string;
  email: string;
  mobile?: string;
  countryCode: string;
  stateId?: number;
  cityId?: number;
  ebookName: string;
  ebookId: Types.ObjectId;
  productId?: number;
  type: number; // 1=user download, 2=admin send
  typeDescription?: string; // 'user-direct-download', 'admin-single-send', 'admin-bulk-send'
  hearAbout?: string;
  ipAddress?: string;
  userAgent?: string;
  downloadedAt: Date;
  emailSent: boolean;
  sentBy?: 'user' | 'admin';
  sentByUserId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ebookUserSchema = new Schema<IEbookUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    mobile: {
      type: String,
      trim: true,
    },
    countryCode: {
      type: String,
      default: '+91',
    },
    stateId: Number,
    cityId: Number,
    ebookName: {
      type: String,
      required: true,
    },
    ebookId: {
      type: Schema.Types.ObjectId,
      ref: 'Ebook',
      required: true,
      index: true,
    },
    productId: Number,
    type: {
      type: Number,
      default: 1,
      index: true,
    },
    typeDescription: String,
    hearAbout: String,
    ipAddress: String,
    userAgent: String,
    downloadedAt: {
      type: Date,
      default: Date.now,
    },
    emailSent: {
      type: Boolean,
      default: false,
    },
    sentBy: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    sentByUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for analytics
ebookUserSchema.index({ ebookId: 1, createdAt: -1 });
ebookUserSchema.index({ email: 1, ebookId: 1 });
ebookUserSchema.index({ type: 1, createdAt: -1 });

export default mongoose.model<IEbookUser>('EbookUser', ebookUserSchema);


