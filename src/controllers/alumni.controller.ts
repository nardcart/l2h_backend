import { Request, Response } from 'express';
import Alumni from '../models/Alumni';

const formatError = (error: any): string => {
  if (error?.code === 11000) {
    const duplicateField = Object.keys(error.keyPattern || {})[0];

    if (duplicateField === 'email') {
      return 'Email already exists';
    }

    if (duplicateField === 'unique_id') {
      return 'Unique ID already exists';
    }

    if (duplicateField === 'id') {
      return 'Alumni ID already exists';
    }
  }

  return error.message || 'Unexpected error';
};

export const createAlumni = async (req: Request, res: Response): Promise<void> => {
  try {
    const createPayload = { ...req.body };
    delete createPayload.id;
    delete createPayload.status;
    delete createPayload.unique_id;

    const alumni = await Alumni.create({
      ...createPayload,
      status: false,
    });

    res.status(201).json({
      status: true,
      message: 'Alumni created successfully',
      data: alumni,
    });
  } catch (error: any) {
    res.status(400).json({
      status: false,
      message: 'Error creating alumni',
      error: formatError(error),
    });
  }
};

export const getPublicAlumni = async (req: Request, res: Response): Promise<void> => {
  try {
    const query: Record<string, any> = {
      status: true,
    };

    if (req.query.program_name) {
      query.program_name = req.query.program_name;
    }

    const alumni = await Alumni.find(query).sort({ id: 1 });

    res.status(200).json({
      status: true,
      data: alumni,
      total: alumni.length,
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: 'Error fetching public alumni',
      error: error.message,
    });
  }
};

export const getAdminAlumni = async (req: Request, res: Response): Promise<void> => {
  try {
    const query: Record<string, any> = {};

    if (req.query.status !== undefined) {
      const statusValue = String(req.query.status).toLowerCase();
      query.status = statusValue === '1' || statusValue === 'true';
    }

    if (req.query.program_name) {
      query.program_name = req.query.program_name;
    }

    const alumni = await Alumni.find(query).sort({ id: 1 });

    res.status(200).json({
      status: true,
      data: alumni,
      total: alumni.length,
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: 'Error fetching alumni',
      error: error.message,
    });
  }
};

export const getAlumniById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      res.status(400).json({
        status: false,
        message: 'Invalid alumni id',
      });
      return;
    }

    const alumni = await Alumni.findOne({ id });

    if (!alumni) {
      res.status(404).json({
        status: false,
        message: 'Alumni not found',
      });
      return;
    }

    res.status(200).json({
      status: true,
      data: alumni,
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: 'Error fetching alumni',
      error: error.message,
    });
  }
};

export const updateAlumni = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      res.status(400).json({
        status: false,
        message: 'Invalid alumni id',
      });
      return;
    }

    const updatePayload = { ...req.body };
    delete updatePayload.id;
    delete updatePayload.status;
    delete updatePayload.unique_id;

    const alumni = await Alumni.findOneAndUpdate({ id }, updatePayload, {
      new: true,
      runValidators: true,
    });

    if (!alumni) {
      res.status(404).json({
        status: false,
        message: 'Alumni not found',
      });
      return;
    }

    res.status(200).json({
      status: true,
      message: 'Alumni updated successfully',
      data: alumni,
    });
  } catch (error: any) {
    res.status(400).json({
      status: false,
      message: 'Error updating alumni',
      error: formatError(error),
    });
  }
};

export const updateAlumniStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      res.status(400).json({
        status: false,
        message: 'Invalid alumni id',
      });
      return;
    }

    if (typeof req.body.status !== 'boolean') {
      res.status(400).json({
        status: false,
        message: 'Status must be true or false',
      });
      return;
    }

    const alumni = await Alumni.findOneAndUpdate(
      { id },
      { status: req.body.status },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!alumni) {
      res.status(404).json({
        status: false,
        message: 'Alumni not found',
      });
      return;
    }

    res.status(200).json({
      status: true,
      message: `Alumni ${req.body.status ? 'approved' : 'denied'} successfully`,
      data: alumni,
    });
  } catch (error: any) {
    res.status(400).json({
      status: false,
      message: 'Error updating alumni status',
      error: formatError(error),
    });
  }
};

export const deleteAlumni = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      res.status(400).json({
        status: false,
        message: 'Invalid alumni id',
      });
      return;
    }

    const alumni = await Alumni.findOneAndDelete({ id });

    if (!alumni) {
      res.status(404).json({
        status: false,
        message: 'Alumni not found',
      });
      return;
    }

    res.status(200).json({
      status: true,
      message: 'Alumni deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: 'Error deleting alumni',
      error: error.message,
    });
  }
};
