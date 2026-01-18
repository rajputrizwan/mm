import { Request, Response } from 'express';
import { Candidate } from '../models/Candidate';

export class CandidateController {
  static async create(req: Request, res: Response) {
    try {
      const candidate = new Candidate({
        ...req.body,
        userId: (req as any).user?.id,
      });

      await candidate.save();

      res.status(201).json({
        success: true,
        data: candidate,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to create candidate',
      });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const candidates = await Candidate.find().populate('userId', 'name email');
      res.status(200).json({
        success: true,
        data: candidates,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch candidates',
      });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const candidate = await Candidate.findById(id).populate('userId');

      if (!candidate) {
        return res.status(404).json({
          success: false,
          message: 'Candidate not found',
        });
      }

      res.status(200).json({
        success: true,
        data: candidate,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch candidate',
      });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const candidate = await Candidate.findByIdAndUpdate(id, req.body, {
        new: true,
      });

      res.status(200).json({
        success: true,
        data: candidate,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update candidate',
      });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await Candidate.findByIdAndDelete(id);

      res.status(200).json({
        success: true,
        message: 'Candidate deleted successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete candidate',
      });
    }
  }

  static async updateResume(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { resumeUrl } = req.body;

      const candidate = await Candidate.findByIdAndUpdate(
        id,
        {
          resume: {
            url: resumeUrl,
            uploadedAt: new Date(),
          },
        },
        { new: true }
      );

      res.status(200).json({
        success: true,
        data: candidate,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update resume',
      });
    }
  }

  static async getApplicationsForHR(req: Request, res: Response) {
    try {
      const { search, status, sortBy } = req.query;
      const { Application } = require('../models/Application');
      const { Interview } = require('../models/Interview');

      // Build query for applications
      let query: any = {};

      // Filter by status if provided
      if (status && status !== 'all') {
        query.status = status;
      }

      // Fetch applications with populated candidate and job position data
      let applicationsQuery = Application.find(query)
        .populate({
          path: 'candidateId',
          populate: {
            path: 'userId',
            select: 'name email',
          },
        })
        .populate('jobPositionId', 'title department');

      // Apply sorting
      if (sortBy === 'recent') {
        applicationsQuery = applicationsQuery.sort({ appliedAt: -1 });
      } else {
        // Default: sort by score descending
        applicationsQuery = applicationsQuery.sort({ ai_score: -1 });
      }

      const applications = await applicationsQuery.exec();

      // Filter by search term (candidate name or position title) - done after population
      let filteredApplications = applications;
      if (search) {
        const searchLower = (search as string).toLowerCase();
        filteredApplications = applications.filter((app: any) => {
          const candidateName = app.candidateId?.userId?.name || '';
          const positionTitle = app.jobPositionId?.title || '';
          return (
            candidateName.toLowerCase().includes(searchLower) ||
            positionTitle.toLowerCase().includes(searchLower)
          );
        });
      }

      // Calculate interview count for each application
      const enrichedApplications = await Promise.all(
        filteredApplications.map(async (app: any) => {
          const interviewCount = await Interview.countDocuments({
            candidateId: app.candidateId?._id,
            jobPositionId: app.jobPositionId?._id,
          });

          return {
            ...app.toObject(),
            interviewCount,
          };
        })
      );

      // Calculate summary statistics
      const stats = {
        totalCount: enrichedApplications.length,
        qualifiedCount: enrichedApplications.filter(
          (app: any) => app.status === 'Qualified'
        ).length,
        interviewingCount: enrichedApplications.filter(
          (app: any) => app.status === 'In Interview'
        ).length,
        averageScore:
          enrichedApplications.length > 0
            ? Math.round(
              enrichedApplications.reduce((sum: number, app: any) => sum + app.ai_score, 0) /
              enrichedApplications.length
            )
            : 0,
      };

      res.status(200).json({
        success: true,
        data: {
          applications: enrichedApplications,
          stats,
        },
      });
    } catch (error) {
      console.error('Error fetching applications for HR:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch applications',
      });
    }
  }
}
