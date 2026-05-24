import { Request, Response } from 'express';
import Candidate, { CandidateApprovalStatus } from '../models/Candidate';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';

const writableFields = [
  'full_name',
  'mobile_number',
  'email',
  'city',
  'state',
  'linkedin_url',
  'portfolio_url',
  'photograph_url',
  'photograph_key',
  'college_name',
  'highest_qualification',
  'current_course',
  'preferred_job_role',
  'preferred_work_mode',
  'preferred_job_location',
  'expected_salary',
  'available_joining_date',
  'additional_skills',
  'resume_url',
  'resume_key',
  'experience_level',
  'previous_company_name',
  'company_position',
  'description',
  'work_experiences',
  'internship_experience',
  'total_work_experience',
  'key_responsibilities',
  'career_goals',
  'video_introduction_url',
  'video_introduction_key',
  'terms_accepted',
] as const;

const requiredRegistrationFields = [
  'full_name',
  'mobile_number',
  'email',
  'city',
  'state',
  'college_name',
  'highest_qualification',
  'preferred_job_role',
  'preferred_work_mode',
  'preferred_job_location',
  'expected_salary',
  'available_joining_date',
  'experience_level',
  'terms_accepted',
  'password',
] as const;

const fieldAliases: Record<string, string[]> = {
  full_name: ['fullName', 'name'],
  mobile_number: ['mobileNumber', 'mobile', 'phone', 'phone_number', 'phoneNumber'],
  email: ['emailAddress', 'email_address'],
  linkedin_url: ['linkedinUrl', 'linkedin', 'linkedinProfile', 'linkedin_profile'],
  portfolio_url: ['portfolioUrl', 'portfolio', 'website'],
  photograph_url: ['photographUrl', 'photoUrl', 'photo_url'],
  photograph_key: ['photographKey', 'photoKey', 'photo_key'],
  college_name: ['collegeName', 'college', 'university', 'university_name', 'universityName'],
  highest_qualification: ['highestQualification', 'qualification'],
  current_course: ['currentCourse', 'course'],
  preferred_job_role: ['preferredJobRole', 'jobRole', 'job_role'],
  preferred_work_mode: ['preferredWorkMode', 'workMode', 'work_mode'],
  preferred_job_location: ['preferredJobLocation', 'jobLocation', 'job_location'],
  expected_salary: ['expectedSalary', 'salary'],
  available_joining_date: ['availableJoiningDate', 'joiningDate', 'joining_date'],
  additional_skills: ['additionalSkills', 'skills'],
  resume_url: ['resumeUrl', 'resume'],
  resume_key: ['resumeKey'],
  experience_level: ['experienceLevel', 'experience'],
  previous_company_name: ['previousCompanyName', 'previousCompany', 'previous_company'],
  company_position: ['companyPosition', 'position'],
  description: ['description', 'about', 'bio'],
  internship_experience: ['internshipExperience', 'internship'],
  total_work_experience: ['totalWorkExperience', 'workExperience', 'work_experience'],
  key_responsibilities: ['keyResponsibilities', 'responsibilities'],
  career_goals: ['careerGoals', 'goals'],
  video_introduction_url: ['videoIntroductionUrl', 'videoUrl', 'video_url'],
  video_introduction_key: ['videoIntroductionKey', 'videoKey', 'video_key'],
  terms_accepted: ['termsAccepted', 'terms'],
};

const passwordConfirmationFields = [
  'confirmPassword',
  'password_confirmation',
  'passwordConfirmation',
  'retypePassword',
  'retype_password',
];

const formatError = (error: any): string => {
  if (error?.code === 11000) {
    const duplicateField = Object.keys(error.keyPattern || {})[0];

    if (duplicateField === 'email') {
      return 'Candidate with this email already exists';
    }

    if (duplicateField === 'unique_id') {
      return 'Candidate ID already exists';
    }

    if (duplicateField === 'id') {
      return 'Candidate numeric ID already exists';
    }
  }

  if (error?.name === 'ValidationError' && error.errors) {
    return Object.values(error.errors)
      .map((validationError: any) => validationError.message)
      .join(', ');
  }

  return error.message || 'Unexpected error';
};

const isProvided = (value: unknown): boolean =>
  value !== undefined && value !== null && String(value).trim() !== '';

const getBodyValue = (body: Record<string, any>, field: string): unknown => {
  if (body[field] !== undefined) {
    return body[field];
  }

  const aliases = fieldAliases[field] || [];
  for (const alias of aliases) {
    if (body[alias] !== undefined) {
      return body[alias];
    }
  }

  return undefined;
};

const normalizeCandidatePayload = (
  body: Record<string, any>,
  options: { includePassword?: boolean } = {}
): Record<string, any> => {
  const payload: Record<string, any> = {};

  writableFields.forEach((field) => {
    const value = getBodyValue(body, field);
    if (value !== undefined) {
      payload[field] = typeof value === 'string' ? value.trim() : value;
    }
  });

  if (options.includePassword && body.password !== undefined) {
    payload.password = body.password;
  }

  if (payload.expected_salary !== undefined && payload.expected_salary !== '') {
    payload.expected_salary = Number(payload.expected_salary);
  }

  if (payload.total_work_experience !== undefined && payload.total_work_experience !== '') {
    payload.total_work_experience = Number(payload.total_work_experience);
  }

  return payload;
};

const validatePasswordConfirmation = (body: Record<string, any>): string | null => {
  const confirmationKey = passwordConfirmationFields.find((field) => body[field] !== undefined);

  if (confirmationKey && body.password !== body[confirmationKey]) {
    return 'Password and retype password do not match';
  }

  return null;
};

const getCandidateTokenPayload = (candidate: any) => ({
  userId: candidate._id.toString(),
  email: candidate.email,
  role: 'candidate',
});

const parseStatus = (status: unknown): CandidateApprovalStatus | null => {
  if (typeof status !== 'string') {
    return null;
  }

  const normalizedStatus = status.toLowerCase();
  if (['pending', 'accepted', 'denied'].includes(normalizedStatus)) {
    return normalizedStatus as CandidateApprovalStatus;
  }

  if (['accept', 'approve', 'approved'].includes(normalizedStatus)) {
    return 'accepted';
  }

  if (['deny', 'reject', 'rejected'].includes(normalizedStatus)) {
    return 'denied';
  }

  return null;
};

export const registerCandidate = async (req: Request, res: Response): Promise<void> => {
  try {
    const passwordError = validatePasswordConfirmation(req.body);
    if (passwordError) {
      res.status(400).json({
        status: false,
        message: passwordError,
      });
      return;
    }

    const createPayload = normalizeCandidatePayload(req.body, { includePassword: true });
    const missingFields = requiredRegistrationFields.filter((field) => !isProvided(createPayload[field]));

    if (missingFields.length > 0) {
      res.status(400).json({
        status: false,
        message: 'Missing required candidate fields',
        fields: missingFields,
      });
      return;
    }

    if (!createPayload.terms_accepted) {
      res.status(400).json({
        status: false,
        message: 'You must agree to share your profile with hiring partners',
      });
      return;
    }

    const candidate = await Candidate.create({
      ...createPayload,
      status: 'pending',
      is_active: true,
    });

    const accessToken = generateAccessToken(getCandidateTokenPayload(candidate));
    const refreshToken = generateRefreshToken(getCandidateTokenPayload(candidate));

    res.status(201).json({
      status: true,
      message: 'Candidate registered successfully. Waiting for admin approval.',
      data: {
        candidate,
        accessToken,
        refreshToken,
      },
    });
  } catch (error: any) {
    const message = formatError(error);
    res.status(400).json({
      status: false,
      message,
      error: message,
    });
  }
};

export const loginCandidate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        status: false,
        message: 'Email and password are required',
      });
      return;
    }

    const candidate = await Candidate.findOne({ email: String(email).toLowerCase().trim() }).select(
      '+password'
    );

    if (!candidate) {
      res.status(401).json({
        status: false,
        message: 'Invalid email or password',
      });
      return;
    }

    if (!candidate.is_active) {
      res.status(403).json({
        status: false,
        message: 'Candidate account is disabled',
      });
      return;
    }

    const isPasswordValid = await candidate.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({
        status: false,
        message: 'Invalid email or password',
      });
      return;
    }

    const candidateJson = candidate.toJSON();
    const accessToken = generateAccessToken(getCandidateTokenPayload(candidate));
    const refreshToken = generateRefreshToken(getCandidateTokenPayload(candidate));

    res.status(200).json({
      status: true,
      message: 'Candidate login successful',
      data: {
        candidate: candidateJson,
        accessToken,
        refreshToken,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: 'Error logging in candidate',
      error: error.message,
    });
  }
};

export const getPublicCandidates = async (req: Request, res: Response): Promise<void> => {
  try {
    const query: Record<string, any> = {
      status: 'accepted',
      is_active: true,
    };

    if (req.query.experience_level) {
      query.experience_level = req.query.experience_level;
    }

    if (req.query.preferred_work_mode) {
      query.preferred_work_mode = req.query.preferred_work_mode;
    }

    if (req.query.preferred_job_role) {
      query.preferred_job_role = req.query.preferred_job_role;
    }

    if (req.query.city) {
      query.city = req.query.city;
    }

    if (req.query.search) {
      query.$text = { $search: String(req.query.search) };
    }

    const candidates = await Candidate.find(query).sort({ id: 1 }).select('-__v');

    res.status(200).json({
      status: true,
      data: candidates,
      total: candidates.length,
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: 'Error fetching public candidates',
      error: error.message,
    });
  }
};

export const getPublicCandidateById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      res.status(400).json({
        status: false,
        message: 'Invalid candidate id',
      });
      return;
    }

    const candidate = await Candidate.findOne({
      id,
      status: 'accepted',
      is_active: true,
    }).select('-__v');

    if (!candidate) {
      res.status(404).json({
        status: false,
        message: 'Candidate not found',
      });
      return;
    }

    res.status(200).json({
      status: true,
      data: candidate,
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: 'Error fetching candidate',
      error: error.message,
    });
  }
};

export const getCandidateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const candidateId = (req as any).user?.userId;

    const candidate = await Candidate.findById(candidateId).select('-__v');
    if (!candidate) {
      res.status(404).json({
        status: false,
        message: 'Candidate not found',
      });
      return;
    }

    res.status(200).json({
      status: true,
      data: candidate,
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: 'Error fetching candidate profile',
      error: error.message,
    });
  }
};

export const updateCandidateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const candidateId = (req as any).user?.userId;
    const updatePayload = normalizeCandidatePayload(req.body);

    delete updatePayload.email;

    const candidate = await Candidate.findByIdAndUpdate(candidateId, updatePayload, {
      new: true,
      runValidators: true,
    }).select('-__v');

    if (!candidate) {
      res.status(404).json({
        status: false,
        message: 'Candidate not found',
      });
      return;
    }

    res.status(200).json({
      status: true,
      message: 'Candidate profile updated successfully',
      data: candidate,
    });
  } catch (error: any) {
    res.status(400).json({
      status: false,
      message: 'Error updating candidate profile',
      error: formatError(error),
    });
  }
};

export const getAdminCandidates = async (req: Request, res: Response): Promise<void> => {
  try {
    const query: Record<string, any> = {};

    if (req.query.status !== undefined) {
      const parsedStatus = parseStatus(req.query.status);
      if (!parsedStatus) {
        res.status(400).json({
          status: false,
          message: 'Status must be pending, accepted, or denied',
        });
        return;
      }
      query.status = parsedStatus;
    }

    if (req.query.experience_level) {
      query.experience_level = req.query.experience_level;
    }

    if (req.query.preferred_work_mode) {
      query.preferred_work_mode = req.query.preferred_work_mode;
    }

    if (req.query.preferred_job_role) {
      query.preferred_job_role = req.query.preferred_job_role;
    }

    if (req.query.city) {
      query.city = req.query.city;
    }

    if (req.query.search) {
      query.$text = { $search: String(req.query.search) };
    }

    const candidates = await Candidate.find(query).sort({ id: 1 }).select('-__v');

    res.status(200).json({
      status: true,
      data: candidates,
      total: candidates.length,
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: 'Error fetching candidates',
      error: error.message,
    });
  }
};

export const getAdminCandidateById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      res.status(400).json({
        status: false,
        message: 'Invalid candidate id',
      });
      return;
    }

    const candidate = await Candidate.findOne({ id }).select('-__v');
    if (!candidate) {
      res.status(404).json({
        status: false,
        message: 'Candidate not found',
      });
      return;
    }

    res.status(200).json({
      status: true,
      data: candidate,
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: 'Error fetching candidate',
      error: error.message,
    });
  }
};

export const updateAdminCandidate = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      res.status(400).json({
        status: false,
        message: 'Invalid candidate id',
      });
      return;
    }

    const updatePayload = normalizeCandidatePayload(req.body);

    const candidate = await Candidate.findOneAndUpdate({ id }, updatePayload, {
      new: true,
      runValidators: true,
    }).select('-__v');

    if (!candidate) {
      res.status(404).json({
        status: false,
        message: 'Candidate not found',
      });
      return;
    }

    res.status(200).json({
      status: true,
      message: 'Candidate updated successfully',
      data: candidate,
    });
  } catch (error: any) {
    res.status(400).json({
      status: false,
      message: 'Error updating candidate',
      error: formatError(error),
    });
  }
};

export const updateCandidateStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      res.status(400).json({
        status: false,
        message: 'Invalid candidate id',
      });
      return;
    }

    const nextStatus = parseStatus(req.body.status);
    if (!nextStatus) {
      res.status(400).json({
        status: false,
        message: 'Status must be pending, accepted, or denied',
      });
      return;
    }

    const candidate = await Candidate.findOneAndUpdate(
      { id },
      { status: nextStatus },
      {
        new: true,
        runValidators: true,
      }
    ).select('-__v');

    if (!candidate) {
      res.status(404).json({
        status: false,
        message: 'Candidate not found',
      });
      return;
    }

    res.status(200).json({
      status: true,
      message: `Candidate ${nextStatus} successfully`,
      data: candidate,
    });
  } catch (error: any) {
    res.status(400).json({
      status: false,
      message: 'Error updating candidate status',
      error: formatError(error),
    });
  }
};

export const deleteCandidate = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      res.status(400).json({
        status: false,
        message: 'Invalid candidate id',
      });
      return;
    }

    const candidate = await Candidate.findOneAndDelete({ id });

    if (!candidate) {
      res.status(404).json({
        status: false,
        message: 'Candidate not found',
      });
      return;
    }

    res.status(200).json({
      status: true,
      message: 'Candidate deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: 'Error deleting candidate',
      error: error.message,
    });
  }
};
