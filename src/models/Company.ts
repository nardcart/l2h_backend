import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import Counter from './Counter';

export type CompanyApprovalStatus = 'pending' | 'accepted' | 'denied';

export interface ICompany extends Document {
  id: number;
  unique_id: string;
  company_name: string;
  company_website?: string;
  established_year?: number;
  no_of_employees?: string;
  sector?: string;
  business_entity_type?: string;
  category?: string;
  organization_type?: string;
  company_logo_url?: string;
  company_logo_key?: string;
  contact_person_name: string;
  contact_person_title?: string;
  phone_number?: string;
  address_line_1: string;
  address_line_2?: string;
  landmark?: string;
  area?: string;
  zip_code: string;
  city: string;
  state: string;
  country: string;
  email: string;
  password: string;
  status: CompanyApprovalStatus;
  is_active: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const companySchema = new Schema<ICompany>(
  {
    id: {
      type: Number,
      unique: true,
      index: true,
    },
    unique_id: {
      type: String,
      unique: true,
      trim: true,
      maxlength: [80, 'Company ID cannot exceed 80 characters'],
    },
    company_name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [200, 'Company name cannot exceed 200 characters'],
      index: true,
    },
    company_website: {
      type: String,
      trim: true,
      maxlength: [500, 'Company website cannot exceed 500 characters'],
    },
    established_year: {
      type: Number,
      min: [1000, 'Established year must be 1000 or later'],
      max: [new Date().getFullYear() + 1, 'Established year is invalid'],
    },
    no_of_employees: {
      type: String,
      trim: true,
      maxlength: [80, 'No. of employees cannot exceed 80 characters'],
    },
    sector: {
      type: String,
      trim: true,
      maxlength: [150, 'Sector cannot exceed 150 characters'],
      index: true,
    },
    business_entity_type: {
      type: String,
      trim: true,
      maxlength: [150, 'Business entity type cannot exceed 150 characters'],
    },
    category: {
      type: String,
      trim: true,
      maxlength: [150, 'Category cannot exceed 150 characters'],
      index: true,
    },
    organization_type: {
      type: String,
      trim: true,
      maxlength: [80, 'Organization type cannot exceed 80 characters'],
    },
    company_logo_url: {
      type: String,
      trim: true,
      maxlength: [500, 'Company logo URL cannot exceed 500 characters'],
    },
    company_logo_key: {
      type: String,
      trim: true,
      maxlength: [255, 'Company logo key cannot exceed 255 characters'],
    },
    contact_person_name: {
      type: String,
      required: [true, 'Contact person name is required'],
      trim: true,
      maxlength: [150, 'Contact person name cannot exceed 150 characters'],
    },
    contact_person_title: {
      type: String,
      trim: true,
      maxlength: [150, 'Contact person title cannot exceed 150 characters'],
    },
    phone_number: {
      type: String,
      trim: true,
      maxlength: [30, 'Phone number cannot exceed 30 characters'],
    },
    address_line_1: {
      type: String,
      required: [true, 'Address line 1 is required'],
      trim: true,
      maxlength: [300, 'Address line 1 cannot exceed 300 characters'],
    },
    address_line_2: {
      type: String,
      trim: true,
      maxlength: [300, 'Address line 2 cannot exceed 300 characters'],
    },
    landmark: {
      type: String,
      trim: true,
      maxlength: [200, 'Landmark cannot exceed 200 characters'],
    },
    area: {
      type: String,
      trim: true,
      maxlength: [150, 'Area cannot exceed 150 characters'],
    },
    zip_code: {
      type: String,
      required: [true, 'Zip code is required'],
      trim: true,
      maxlength: [20, 'Zip code cannot exceed 20 characters'],
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      maxlength: [150, 'City cannot exceed 150 characters'],
      index: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
      maxlength: [150, 'State cannot exceed 150 characters'],
      index: true,
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
      maxlength: [150, 'Country cannot exceed 150 characters'],
      default: 'India',
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [150, 'Email cannot exceed 150 characters'],
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'denied'],
      default: 'pending',
      index: true,
    },
    is_active: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'companies',
  }
);

companySchema.index({
  company_name: 'text',
  sector: 'text',
  category: 'text',
  city: 'text',
  state: 'text',
});
companySchema.index({ status: 1, createdAt: -1 });

const formatUniqueId = (id: number): string => `L2H-CO-${String(id).padStart(4, '0')}`;

companySchema.pre('validate', async function (next) {
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
      { key: 'company' },
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

companySchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
    return;
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

companySchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (_error) {
    return false;
  }
};

companySchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.model<ICompany>('Company', companySchema);
