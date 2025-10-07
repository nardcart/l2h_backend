import mongoose, { Schema, Document } from 'mongoose';
import slugify from 'slugify';

export interface IBlogCategory extends Document {
  name: string;
  slug: string;
  description?: string;
  status: 'active' | 'inactive';
  position: number;
  postCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const blogCategorySchema = new Schema<IBlogCategory>(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      unique: true,
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
      maxlength: [300, 'Description cannot exceed 300 characters'],
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      index: true,
    },
    position: {
      type: Number,
      default: 0,
    },
    postCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate slug from name before saving
blogCategorySchema.pre('save', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g,
    });
  }
  next();
});

export default mongoose.model<IBlogCategory>('BlogCategory', blogCategorySchema);

