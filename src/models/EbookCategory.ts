import mongoose, { Document, Schema } from 'mongoose';

export interface IEbookCategory extends Document {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  status: 0 | 1;
  position: number;
  ebookCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ebookCategorySchema = new Schema<IEbookCategory>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: String,
    image: String,
    status: {
      type: Number,
      enum: [0, 1],
      default: 1,
    },
    position: {
      type: Number,
      default: 0,
    },
    ebookCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IEbookCategory>('EbookCategory', ebookCategorySchema);


