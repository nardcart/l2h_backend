import mongoose, { Schema, Document } from 'mongoose';

export interface IOTP extends Document {
  email: string;
  otp: string;
  purpose: 'comment' | 'newsletter' | 'password-reset';
  expiresAt: Date;
  isUsed: boolean;
  attempts: number;
  createdAt: Date;
}

const otpSchema = new Schema<IOTP>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    otp: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      enum: ['comment', 'newsletter', 'password-reset'],
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    attempts: {
      type: Number,
      default: 0,
      max: 3,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-delete expired OTPs (MongoDB TTL index)
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IOTP>('OTP', otpSchema);



