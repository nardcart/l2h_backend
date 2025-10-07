import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IEbook extends Document {
  name: string;
  slug: string;
  description?: string;
  image: string;
  brochure: string;
  category?: string;
  categoryId?: Types.ObjectId;
  tags: string[];
  fileSize?: number;
  pageCount?: number;
  author?: string;
  publishYear?: number;
  bookLanguage?: string;
  status: 0 | 1;
  position: number;
  downloadCount: number;
  viewCount: number;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ebookSchema = new Schema<IEbook>(
  {
    name: {
      type: String,
      required: true,
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
    description: {
      type: String,
      maxlength: 1000,
    },
    image: {
      type: String,
      required: true,
    },
    brochure: {
      type: String,
      required: true,
    },
    category: String,
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'EbookCategory',
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    fileSize: Number,
    pageCount: Number,
    author: String,
    publishYear: Number,
    bookLanguage: {
      type: String,
      default: 'English',
    },
    status: {
      type: Number,
      enum: [0, 1],
      default: 1,
      index: true,
    },
    position: {
      type: Number,
      default: 0,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Text search index
ebookSchema.index({ name: 'text', description: 'text', tags: 'text' });

export default mongoose.model<IEbook>('Ebook', ebookSchema);

