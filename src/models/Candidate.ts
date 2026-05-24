import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import Counter from './Counter';

export type CandidateApprovalStatus = 'pending' | 'accepted' | 'denied';

export type WorkMode = 'remote' | 'onsite' | 'hybrid';

export type ExperienceLevel = 'fresher' | 'experienced';

export type Qualification =
  | 'high_school'
  | 'diploma'
  | 'bachelors'
  | 'masters'
  | 'phd'
  | 'other';

export interface IWorkExperience {
  company_name: string;
  position: string;
  description?: string;
  duration?: string;
  is_current: boolean;
}

export interface ICandidate extends Document {
  id: number;
  unique_id: string;
  full_name: string;
  mobile_number: string;
  email: string;
  city: string;
  state: string;
  linkedin_url?: string;
  portfolio_url?: string;
  photograph_url?: string;
  photograph_key?: string;
  college_name: string;
  highest_qualification: Qualification;
  current_course?: string;
  preferred_job_role: string;
  preferred_work_mode: WorkMode;
  preferred_job_location: string;
  expected_salary: number;
  available_joining_date: string;
  additional_skills?: string;
  resume_url?: string;
  resume_key?: string;
  experience_level: ExperienceLevel;
  previous_company_name?: string;
  company_position?: string;
  description?: string;
  internship_experience?: string;
  work_experiences: IWorkExperience[];
  total_work_experience?: number;
  key_responsibilities?: string;
  career_goals?: string;
  video_introduction_url?: string;
  video_introduction_key?: string;
  terms_accepted: boolean;
  password: string;
  status: CandidateApprovalStatus;
  is_active: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const candidateSchema = new Schema<ICandidate>(
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
      maxlength: [80, 'Candidate ID cannot exceed 80 characters'],
    },
    full_name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [150, 'Full name cannot exceed 150 characters'],
      index: true,
    },
    mobile_number: {
      type: String,
      required: [true, 'Mobile number is required'],
      trim: true,
      maxlength: [15, 'Mobile number cannot exceed 15 characters'],
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
    linkedin_url: {
      type: String,
      trim: true,
      maxlength: [500, 'LinkedIn URL cannot exceed 500 characters'],
    },
    portfolio_url: {
      type: String,
      trim: true,
      maxlength: [500, 'Portfolio URL cannot exceed 500 characters'],
    },
    photograph_url: {
      type: String,
      trim: true,
      maxlength: [500, 'Photograph URL cannot exceed 500 characters'],
    },
    photograph_key: {
      type: String,
      trim: true,
      maxlength: [255, 'Photograph key cannot exceed 255 characters'],
    },
    college_name: {
      type: String,
      required: [true, 'College name is required'],
      trim: true,
      maxlength: [300, 'College name cannot exceed 300 characters'],
    },
    highest_qualification: {
      type: String,
      required: [true, 'Highest qualification is required'],
      enum: ['high_school', 'diploma', 'bachelors', 'masters', 'phd', 'other'],
    },
    current_course: {
      type: String,
      trim: true,
      maxlength: [200, 'Current course cannot exceed 200 characters'],
    },
    preferred_job_role: {
      type: String,
      required: [true, 'Preferred job role is required'],
      trim: true,
      maxlength: [200, 'Preferred job role cannot exceed 200 characters'],
      index: true,
    },
    preferred_work_mode: {
      type: String,
      required: [true, 'Preferred work mode is required'],
      enum: ['remote', 'onsite', 'hybrid'],
    },
    preferred_job_location: {
      type: String,
      required: [true, 'Preferred job location is required'],
      trim: true,
      maxlength: [200, 'Preferred job location cannot exceed 200 characters'],
    },
    expected_salary: {
      type: Number,
      required: [true, 'Expected salary is required'],
      min: 0,
    },
    available_joining_date: {
      type: String,
      required: [true, 'Available joining date is required'],
      trim: true,
    },
    additional_skills: {
      type: String,
      trim: true,
      maxlength: [1000, 'Additional skills cannot exceed 1000 characters'],
    },
    resume_url: {
      type: String,
      trim: true,
      maxlength: [500, 'Resume URL cannot exceed 500 characters'],
    },
    resume_key: {
      type: String,
      trim: true,
      maxlength: [255, 'Resume key cannot exceed 255 characters'],
    },
    experience_level: {
      type: String,
      required: [true, 'Experience level is required'],
      enum: ['fresher', 'experienced'],
    },
    previous_company_name: {
      type: String,
      trim: true,
      maxlength: [200, 'Previous company name cannot exceed 200 characters'],
    },
    company_position: {
      type: String,
      trim: true,
      maxlength: [200, 'Company position cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [3000, 'Description cannot exceed 3000 characters'],
    },
    internship_experience: {
      type: String,
      trim: true,
      maxlength: [500, 'Internship experience cannot exceed 500 characters'],
    },
    work_experiences: [
      {
        company_name: {
          type: String,
          required: true,
          trim: true,
          maxlength: [200, 'Company name cannot exceed 200 characters'],
        },
        position: {
          type: String,
          required: true,
          trim: true,
          maxlength: [200, 'Position cannot exceed 200 characters'],
        },
        description: {
          type: String,
          trim: true,
          maxlength: [3000, 'Description cannot exceed 3000 characters'],
        },
        duration: {
          type: String,
          trim: true,
          maxlength: [100, 'Duration cannot exceed 100 characters'],
        },
        is_current: {
          type: Boolean,
          default: false,
        },
      },
    ],
    total_work_experience: {
      type: Number,
      min: 0,
    },
    key_responsibilities: {
      type: String,
      trim: true,
      maxlength: [2000, 'Key responsibilities cannot exceed 2000 characters'],
    },
    career_goals: {
      type: String,
      trim: true,
      maxlength: [1000, 'Career goals cannot exceed 1000 characters'],
    },
    video_introduction_url: {
      type: String,
      trim: true,
      maxlength: [500, 'Video introduction URL cannot exceed 500 characters'],
    },
    video_introduction_key: {
      type: String,
      trim: true,
      maxlength: [255, 'Video introduction key cannot exceed 255 characters'],
    },
    terms_accepted: {
      type: Boolean,
      required: [true, 'Terms must be accepted'],
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
    collection: 'candidates',
  }
);

candidateSchema.index({
  full_name: 'text',
  college_name: 'text',
  preferred_job_role: 'text',
  city: 'text',
  state: 'text',
});
candidateSchema.index({ status: 1, createdAt: -1 });

const formatUniqueId = (id: number): string => `L2H-CA-${String(id).padStart(4, '0')}`;

candidateSchema.pre('validate', async function (next) {
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
      { key: 'candidate' },
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

candidateSchema.pre('save', async function (next) {
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

candidateSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (_error) {
    return false;
  }
};

candidateSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.model<ICandidate>('Candidate', candidateSchema);
