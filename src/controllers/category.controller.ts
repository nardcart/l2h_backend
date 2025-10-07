import { Request, Response } from 'express';
import BlogCategory from '../models/BlogCategory';

export const getAllCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status = 'active' } = req.query;
    
    const query: any = {};
    if (status) query.status = status;

    const categories = await BlogCategory.find(query)
      .sort('position name')
      .lean();

    res.status(200).json({
      status: true,
      data: categories,
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: 'Error fetching categories',
      error: error.message,
    });
  }
};

export const getCategoryBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;

    const category = await BlogCategory.findOne({ slug });

    if (!category) {
      res.status(404).json({
        status: false,
        message: 'Category not found',
      });
      return;
    }

    res.status(200).json({
      status: true,
      data: category,
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: 'Error fetching category',
      error: error.message,
    });
  }
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, status, position } = req.body;

    const category = await BlogCategory.create({
      name,
      description,
      status: status || 'active',
      position: position || 0,
    });

    res.status(201).json({
      status: true,
      message: 'Category created successfully',
      data: category,
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: 'Error creating category',
      error: error.message,
    });
  }
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const category = await BlogCategory.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      res.status(404).json({
        status: false,
        message: 'Category not found',
      });
      return;
    }

    res.status(200).json({
      status: true,
      message: 'Category updated successfully',
      data: category,
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: 'Error updating category',
      error: error.message,
    });
  }
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const category = await BlogCategory.findByIdAndDelete(id);

    if (!category) {
      res.status(404).json({
        status: false,
        message: 'Category not found',
      });
      return;
    }

    res.status(200).json({
      status: true,
      message: 'Category deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: 'Error deleting category',
      error: error.message,
    });
  }
};



