import { Request, Response } from 'express';
import { JobPosition } from '../models/JobPosition';
import { Application } from '../models/Application';

export class PositionController {
  static async create(req: Request, res: Response) {
    try {
      const position = new JobPosition({
        ...req.body,
        hrId: (req as any).user?.id,
        posted_at: new Date(),
        status: 'active',
      });

      await position.save();

      // Add applicant counts
      const positionWithCounts = position.toObject();
      positionWithCounts.total_applicants = 0;
      positionWithCounts.qualified_count = 0;

      res.status(201).json({
        success: true,
        data: positionWithCounts,
      });
    } catch (error) {
      console.error('Error creating position:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create position',
      });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const { search, department } = req.query;

      // Build query
      let query: any = {};

      // Search by title
      if (search) {
        query.title = { $regex: search, $options: 'i' };
      }

      // Filter by department
      if (department && department !== 'all') {
        query.department = department;
      }

      const positions = await JobPosition.find(query)
        .populate('hrId', 'name email')
        .sort({ posted_at: -1, createdAt: -1 });

      // Get applicant counts for each position
      const positionsWithCounts = await Promise.all(
        positions.map(async (position) => {
          const positionObj = position.toObject();

          // Count total applications
          const totalApplicants = await Application.countDocuments({
            jobPositionId: position._id,
          });

          // Count qualified applications
          const qualifiedCount = await Application.countDocuments({
            jobPositionId: position._id,
            status: 'Qualified',
          });

          // Ensure posted_at exists (fallback to createdAt for old records)
          const posted_at = positionObj.posted_at || positionObj.createdAt;

          // Ensure salary_range exists (use salary if available)
          const salary_range = positionObj.salary_range || positionObj.salary;

          // Normalize status to active/paused (map old values)
          let status = positionObj.status;
          if (status === 'open') {
            status = 'active';
          } else if (status === 'closed' || status === 'filled') {
            status = 'paused';
          }

          return {
            ...positionObj,
            posted_at,
            salary_range,
            status,
            total_applicants: totalApplicants,
            qualified_count: qualifiedCount,
          };
        })
      );

      res.status(200).json({
        success: true,
        data: positionsWithCounts,
      });
    } catch (error) {
      console.error('Error fetching positions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch positions',
      });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const position = await JobPosition.findById(id)
        .populate('hrId')
        .populate('applicants')
        .populate('interviews');

      if (!position) {
        return res.status(404).json({
          success: false,
          message: 'Position not found',
        });
      }

      // Get applicant counts
      const positionObj = position.toObject();
      const totalApplicants = await Application.countDocuments({
        jobPositionId: position._id,
      });
      const qualifiedCount = await Application.countDocuments({
        jobPositionId: position._id,
        status: 'Qualified',
      });

      // Ensure posted_at exists (fallback to createdAt for old records)
      const posted_at = positionObj.posted_at || positionObj.createdAt;

      // Ensure salary_range exists (use salary if available)
      const salary_range = positionObj.salary_range || positionObj.salary;

      // Normalize status to active/paused
      let status = positionObj.status;
      if (status === 'open') {
        status = 'active';
      } else if (status === 'closed' || status === 'filled') {
        status = 'paused';
      }

      res.status(200).json({
        success: true,
        data: {
          ...positionObj,
          posted_at,
          salary_range,
          status,
          total_applicants: totalApplicants,
          qualified_count: qualifiedCount,
        },
      });
    } catch (error) {
      console.error('Error fetching position:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch position',
      });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const position = await JobPosition.findByIdAndUpdate(id, req.body, {
        new: true,
      });

      if (!position) {
        return res.status(404).json({
          success: false,
          message: 'Position not found',
        });
      }

      // Get applicant counts
      const positionObj = position.toObject();
      const totalApplicants = await Application.countDocuments({
        jobPositionId: position._id,
      });
      const qualifiedCount = await Application.countDocuments({
        jobPositionId: position._id,
        status: 'Qualified',
      });

      res.status(200).json({
        success: true,
        data: {
          ...positionObj,
          total_applicants: totalApplicants,
          qualified_count: qualifiedCount,
        },
      });
    } catch (error) {
      console.error('Error updating position:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update position',
      });
    }
  }

  static async toggleStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const position = await JobPosition.findById(id);

      if (!position) {
        return res.status(404).json({
          success: false,
          message: 'Position not found',
        });
      }

      // Normalize current status first
      let currentStatus = position.status;
      if (currentStatus === 'open') {
        currentStatus = 'active';
      } else if (currentStatus === 'closed' || currentStatus === 'filled') {
        currentStatus = 'paused';
      }

      // Toggle between active and paused
      position.status = currentStatus === 'active' ? 'paused' : 'active';
      await position.save();

      // Get applicant counts
      const positionObj = position.toObject();
      const totalApplicants = await Application.countDocuments({
        jobPositionId: position._id,
      });
      const qualifiedCount = await Application.countDocuments({
        jobPositionId: position._id,
        status: 'Qualified',
      });

      // Ensure fields are properly mapped
      const posted_at = positionObj.posted_at || positionObj.createdAt;
      const salary_range = positionObj.salary_range || positionObj.salary;

      res.status(200).json({
        success: true,
        data: {
          ...positionObj,
          posted_at,
          salary_range,
          status: position.status,
          total_applicants: totalApplicants,
          qualified_count: qualifiedCount,
        },
      });
    } catch (error) {
      console.error('Error toggling status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to toggle position status',
      });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await JobPosition.findByIdAndDelete(id);

      res.status(200).json({
        success: true,
        message: 'Position deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting position:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete position',
      });
    }
  }

  static async addApplicant(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { candidateId } = req.body;

      const position = await JobPosition.findByIdAndUpdate(
        id,
        {
          $addToSet: { applicants: candidateId },
        },
        { new: true }
      );

      if (!position) {
        return res.status(404).json({
          success: false,
          message: 'Position not found',
        });
      }

      res.status(200).json({
        success: true,
        data: position,
      });
    } catch (error) {
      console.error('Error adding applicant:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add applicant',
      });
    }
  }
}
