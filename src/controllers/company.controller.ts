import { Request, Response } from 'express';
import Company, { CompanyApprovalStatus } from '../models/Company';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';

const writableFields = [
  'company_name',
  'company_website',
  'established_year',
  'no_of_employees',
  'sector',
  'business_entity_type',
  'category',
  'organization_type',
  'company_logo_url',
  'company_logo_key',
  'contact_person_name',
  'contact_person_title',
  'phone_number',
  'address_line_1',
  'address_line_2',
  'landmark',
  'area',
  'zip_code',
  'city',
  'state',
  'country',
  'email',
] as const;

const requiredRegistrationFields = [
  'company_name',
  'contact_person_name',
  'address_line_1',
  'zip_code',
  'city',
  'state',
  'email',
  'password',
] as const;

const fieldAliases: Record<string, string[]> = {
  company_name: ['companyName'],
  company_website: ['companyWebsite', 'website'],
  established_year: ['establishedYear'],
  no_of_employees: ['noOfEmployees', 'numberOfEmployees', 'employees'],
  business_entity_type: ['businessEntityType', 'typeOfBusinessEntity'],
  organization_type: ['organizationType'],
  company_logo_url: ['companyLogoUrl', 'companyLogo', 'logoUrl'],
  company_logo_key: ['companyLogoKey', 'logoKey'],
  contact_person_name: ['contactPersonName', 'fullNameOfContactPerson', 'full_name_of_contact_person'],
  contact_person_title: ['contactPersonTitle', 'positionTitle', 'position_title'],
  phone_number: ['phoneNumber'],
  address_line_1: ['addressLine1'],
  address_line_2: ['addressLine2'],
  zip_code: ['zipCode', 'zipcode'],
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
      return 'Company with this email already exists';
    }

    if (duplicateField === 'unique_id') {
      return 'Company ID already exists';
    }

    if (duplicateField === 'id') {
      return 'Company numeric ID already exists';
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

const normalizeCompanyPayload = (
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

  if (!payload.country && options.includePassword) {
    payload.country = 'India';
  }

  if (payload.established_year === '') {
    delete payload.established_year;
  } else if (payload.established_year !== undefined) {
    payload.established_year = Number(payload.established_year);
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

const getCompanyTokenPayload = (company: any) => ({
  userId: company._id.toString(),
  email: company.email,
  role: 'company',
});

const parseStatus = (status: unknown): CompanyApprovalStatus | null => {
  if (typeof status !== 'string') {
    return null;
  }

  const normalizedStatus = status.toLowerCase();
  if (['pending', 'accepted', 'denied'].includes(normalizedStatus)) {
    return normalizedStatus as CompanyApprovalStatus;
  }

  if (['accept', 'approve', 'approved'].includes(normalizedStatus)) {
    return 'accepted';
  }

  if (['deny', 'reject', 'rejected'].includes(normalizedStatus)) {
    return 'denied';
  }

  return null;
};

export const registerCompany = async (req: Request, res: Response): Promise<void> => {
  try {
    const passwordError = validatePasswordConfirmation(req.body);
    if (passwordError) {
      res.status(400).json({
        status: false,
        message: passwordError,
      });
      return;
    }

    const createPayload = normalizeCompanyPayload(req.body, { includePassword: true });
    const missingFields = requiredRegistrationFields.filter((field) => !isProvided(createPayload[field]));

    if (missingFields.length > 0) {
      res.status(400).json({
        status: false,
        message: 'Missing required company fields',
        fields: missingFields,
      });
      return;
    }

    const company = await Company.create({
      ...createPayload,
      status: 'pending',
      is_active: true,
    });

    const accessToken = generateAccessToken(getCompanyTokenPayload(company));
    const refreshToken = generateRefreshToken(getCompanyTokenPayload(company));

    res.status(201).json({
      status: true,
      message: 'Company registered successfully. Waiting for admin approval.',
      data: {
        company,
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

export const loginCompany = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        status: false,
        message: 'Email and password are required',
      });
      return;
    }

    const company = await Company.findOne({ email: String(email).toLowerCase().trim() }).select(
      '+password'
    );

    if (!company) {
      res.status(401).json({
        status: false,
        message: 'Invalid email or password',
      });
      return;
    }

    if (!company.is_active) {
      res.status(403).json({
        status: false,
        message: 'Company account is disabled',
      });
      return;
    }

    const isPasswordValid = await company.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({
        status: false,
        message: 'Invalid email or password',
      });
      return;
    }

    const companyJson = company.toJSON();
    const accessToken = generateAccessToken(getCompanyTokenPayload(company));
    const refreshToken = generateRefreshToken(getCompanyTokenPayload(company));

    res.status(200).json({
      status: true,
      message: 'Company login successful',
      data: {
        company: companyJson,
        accessToken,
        refreshToken,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: 'Error logging in company',
      error: error.message,
    });
  }
};

export const getPublicCompanies = async (req: Request, res: Response): Promise<void> => {
  try {
    const query: Record<string, any> = {
      status: 'accepted',
      is_active: true,
    };

    if (req.query.sector) {
      query.sector = req.query.sector;
    }

    if (req.query.category) {
      query.category = req.query.category;
    }

    if (req.query.city) {
      query.city = req.query.city;
    }

    if (req.query.search) {
      query.$text = { $search: String(req.query.search) };
    }

    const companies = await Company.find(query).sort({ id: 1 }).select('-__v');

    res.status(200).json({
      status: true,
      data: companies,
      total: companies.length,
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: 'Error fetching public companies',
      error: error.message,
    });
  }
};

export const getPublicCompanyById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      res.status(400).json({
        status: false,
        message: 'Invalid company id',
      });
      return;
    }

    const company = await Company.findOne({
      id,
      status: 'accepted',
      is_active: true,
    }).select('-__v');

    if (!company) {
      res.status(404).json({
        status: false,
        message: 'Company not found',
      });
      return;
    }

    res.status(200).json({
      status: true,
      data: company,
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: 'Error fetching company',
      error: error.message,
    });
  }
};

export const getCompanyProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const companyId = (req as any).user?.userId;

    const company = await Company.findById(companyId).select('-__v');
    if (!company) {
      res.status(404).json({
        status: false,
        message: 'Company not found',
      });
      return;
    }

    res.status(200).json({
      status: true,
      data: company,
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: 'Error fetching company profile',
      error: error.message,
    });
  }
};

export const updateCompanyProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const companyId = (req as any).user?.userId;
    const updatePayload = normalizeCompanyPayload(req.body);

    delete updatePayload.email;

    const company = await Company.findByIdAndUpdate(companyId, updatePayload, {
      new: true,
      runValidators: true,
    }).select('-__v');

    if (!company) {
      res.status(404).json({
        status: false,
        message: 'Company not found',
      });
      return;
    }

    res.status(200).json({
      status: true,
      message: 'Company profile updated successfully',
      data: company,
    });
  } catch (error: any) {
    res.status(400).json({
      status: false,
      message: 'Error updating company profile',
      error: formatError(error),
    });
  }
};

export const getAdminCompanies = async (req: Request, res: Response): Promise<void> => {
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

    if (req.query.sector) {
      query.sector = req.query.sector;
    }

    if (req.query.category) {
      query.category = req.query.category;
    }

    if (req.query.city) {
      query.city = req.query.city;
    }

    if (req.query.search) {
      query.$text = { $search: String(req.query.search) };
    }

    const companies = await Company.find(query).sort({ id: 1 }).select('-__v');

    res.status(200).json({
      status: true,
      data: companies,
      total: companies.length,
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: 'Error fetching companies',
      error: error.message,
    });
  }
};

export const getAdminCompanyById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      res.status(400).json({
        status: false,
        message: 'Invalid company id',
      });
      return;
    }

    const company = await Company.findOne({ id }).select('-__v');
    if (!company) {
      res.status(404).json({
        status: false,
        message: 'Company not found',
      });
      return;
    }

    res.status(200).json({
      status: true,
      data: company,
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: 'Error fetching company',
      error: error.message,
    });
  }
};

export const updateAdminCompany = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      res.status(400).json({
        status: false,
        message: 'Invalid company id',
      });
      return;
    }

    const updatePayload = normalizeCompanyPayload(req.body);

    const company = await Company.findOneAndUpdate({ id }, updatePayload, {
      new: true,
      runValidators: true,
    }).select('-__v');

    if (!company) {
      res.status(404).json({
        status: false,
        message: 'Company not found',
      });
      return;
    }

    res.status(200).json({
      status: true,
      message: 'Company updated successfully',
      data: company,
    });
  } catch (error: any) {
    res.status(400).json({
      status: false,
      message: 'Error updating company',
      error: formatError(error),
    });
  }
};

export const updateCompanyStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      res.status(400).json({
        status: false,
        message: 'Invalid company id',
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

    const company = await Company.findOneAndUpdate(
      { id },
      { status: nextStatus },
      {
        new: true,
        runValidators: true,
      }
    ).select('-__v');

    if (!company) {
      res.status(404).json({
        status: false,
        message: 'Company not found',
      });
      return;
    }

    res.status(200).json({
      status: true,
      message: `Company ${nextStatus} successfully`,
      data: company,
    });
  } catch (error: any) {
    res.status(400).json({
      status: false,
      message: 'Error updating company status',
      error: formatError(error),
    });
  }
};

export const deleteCompany = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      res.status(400).json({
        status: false,
        message: 'Invalid company id',
      });
      return;
    }

    const company = await Company.findOneAndDelete({ id });

    if (!company) {
      res.status(404).json({
        status: false,
        message: 'Company not found',
      });
      return;
    }

    res.status(200).json({
      status: true,
      message: 'Company deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: 'Error deleting company',
      error: error.message,
    });
  }
};
