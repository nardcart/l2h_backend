import mongoose, { Schema, Document } from 'mongoose';

export interface INewsletter extends Document {
  email: string;
  name?: string;
  isActive: boolean;
  subscribedAt: Date;
  unsubscribedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const newsletterSchema = new Schema<INewsletter>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    name: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
    unsubscribedAt: Date,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<INewsletter>('Newsletter', newsletterSchema);



