import mongoose, { Document, Schema } from 'mongoose';
import Counter from './Counter';

export interface IAlumni extends Document {
  id: number;
  full_name: string;
  email: string;
  mobile?: string;
  unique_id: string;
  program_name: string;
  profession?: string;
  skills?: string;
  profile_image_url?: string;
  certificate_url?: string;
  storage_folder?: string;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const alumniSchema = new Schema<IAlumni>(
  {
    id: {
      type: Number,
      unique: true,
      index: true,
    },
    full_name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [150, 'Full name cannot exceed 150 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [150, 'Email cannot exceed 150 characters'],
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    mobile: {
      type: String,
      trim: true,
      maxlength: [20, 'Mobile cannot exceed 20 characters'],
    },
    unique_id: {
      type: String,
      unique: true,
      trim: true,
      maxlength: [80, 'Unique ID cannot exceed 80 characters'],
    },
    program_name: {
      type: String,
      required: [true, 'Program name is required'],
      trim: true,
      maxlength: [200, 'Program name cannot exceed 200 characters'],
    },
    profession: {
      type: String,
      trim: true,
      maxlength: [150, 'Profession cannot exceed 150 characters'],
    },
    skills: {
      type: String,
      trim: true,
    },
    profile_image_url: {
      type: String,
      trim: true,
      maxlength: [500, 'Profile image URL cannot exceed 500 characters'],
    },
    certificate_url: {
      type: String,
      trim: true,
      maxlength: [500, 'Certificate URL cannot exceed 500 characters'],
    },
    storage_folder: {
      type: String,
      trim: true,
      maxlength: [255, 'Storage folder cannot exceed 255 characters'],
    },
    status: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'alumni',
  }
);

alumniSchema.index({ full_name: 1 });
alumniSchema.index({ program_name: 1 });

const formatUniqueId = (id: number): string => `L2H-AL-${String(id).padStart(4, '0')}`;

alumniSchema.pre('validate', async function (next) {
  if (!this.isNew) {
    next();
    return;
  }

  if (this.id && this.unique_id) {
    next();
    return;
  }

  try {
    const counter = await Counter.findOneAndUpdate(
      { key: 'alumni' },
      { $inc: { seq: 1 } },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    this.id = counter.seq;
    this.unique_id = formatUniqueId(counter.seq);
    next();
  } catch (error: any) {
    next(error);
  }
});

export default mongoose.model<IAlumni>('Alumni', alumniSchema);
