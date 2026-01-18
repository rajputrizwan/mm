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

  static async analyzeResume(req: Request, res: Response) {
    try {
      const file = (req as any).file;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded',
        });
      }

      const fs = require('fs');
      const { extractTextFromFile } = require('../utils/resumeParser');
      const {
        extractSkills,
        identifySkillGaps,
        generateInterviewQuestions,
        calculateMatchScore,
      } = require('../utils/skillExtractor');

      // Extract text from uploaded file
      const text = await extractTextFromFile(file.path, file.mimetype);

      if (!text || text.trim().length < 100) {
        // Clean up file
        fs.unlinkSync(file.path);
        return res.status(400).json({
          success: false,
          message: 'Could not extract sufficient text from resume',
        });
      }

      // Extract skills using pattern matching
      const extractedSkills = extractSkills(text);

      // Identify skill gaps
      const skillGaps = identifySkillGaps(extractedSkills);

      // Generate personalized interview questions
      const suggestedQuestions = generateInterviewQuestions(extractedSkills);

      // Calculate match score
      const matchScore = calculateMatchScore(extractedSkills);

      // Update candidate profile with extracted skills
      const userId = (req as any).user?.id;
      if (userId) {
        await Candidate.findOneAndUpdate(
          { userId },
          {
            $set: {
              skills: extractedSkills.map((s) => s.name),
              'resume.uploadedAt': new Date(),
            },
          },
          { upsert: true }
        );
      }

      // Clean up uploaded file (temporary storage)
      fs.unlinkSync(file.path);

      // Return analysis results
      res.status(200).json({
        success: true,
        data: {
          extractedSkills,
          skillGaps,
          suggestedQuestions,
          matchScore,
          analyzedAt: new Date().toISOString(),
          fileName: file.originalname,
        },
      });
    } catch (error) {
      console.error('Error analyzing resume:', error);

      // Clean up file if it exists
      if ((req as any).file) {
        const fs = require('fs');
        try {
          fs.unlinkSync((req as any).file.path);
        } catch (e) {
          // File already deleted or doesn't exist
        }
      }

      res.status(500).json({
        success: false,
        message: 'Failed to analyze resume',
      });
    }
  }

  // Dashboard endpoints
  static async getDashboardStats(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { Interview } = require('../models/Interview');

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

      // Get all completed interviews
      const allInterviews = await Interview.find({
        candidateId: userId,
        status: 'completed',
      });

      // Get this week's interviews
      const weekInterviews = await Interview.find({
        candidateId: userId,
        status: 'completed',
        createdAt: { $gte: sevenDaysAgo },
      });

      // Get last 30 days interviews for current period avg
      const currentPeriodInterviews = await Interview.find({
        candidateId: userId,
        status: 'completed',
        createdAt: { $gte: thirtyDaysAgo },
      });

      // Get previous 30 days (31-60 days ago) for comparison
      const previousPeriodInterviews = await Interview.find({
        candidateId: userId,
        status: 'completed',
        createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
      });

      // Calculate average scores
      const calculateAvg = (interviews: any[]) => {
        if (interviews.length === 0) return 0;
        const sum = interviews.reduce((acc, i) => acc + (i.score || 0), 0);
        return Math.round(sum / interviews.length);
      };

      const avgScore = calculateAvg(allInterviews);
      const currentPeriodAvg = calculateAvg(currentPeriodInterviews);
      const previousPeriodAvg = calculateAvg(previousPeriodInterviews);

      // Calculate improvement rate
      const improvementRate =
        previousPeriodAvg > 0
          ? Math.round(((currentPeriodAvg - previousPeriodAvg) / previousPeriodAvg) * 100)
          : 0;

      // Calculate hours practiced (sum of durations in hours)
      const totalMinutes = allInterviews.reduce((acc, i) => acc + (i.duration || 0), 0);
      const weekMinutes = weekInterviews.reduce((acc, i) => acc + (i.duration || 0), 0);
      const hoursPracticed = totalMinutes / 60;
      const weekHoursPracticed = weekMinutes / 60;

      res.status(200).json({
        success: true,
        data: {
          totalInterviews: allInterviews.length,
          weekInterviews: weekInterviews.length,
          avgScore,
          lastPeriodAvgScore: previousPeriodAvg,
          hoursPracticed: parseFloat(hoursPracticed.toFixed(1)),
          weekHoursPracticed: parseFloat(weekHoursPracticed.toFixed(1)),
          improvementRate,
        },
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard stats',
      });
    }
  }

  static async getRecentInterviews(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { Interview } = require('../models/Interview');

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      const interviews = await Interview.find({
        candidateId: userId,
        status: 'completed',
      })
        .sort({ createdAt: -1 })
        .limit(3)
        .populate('jobPositionId', 'title');

      res.status(200).json({
        success: true,
        data: {
          interviews,
        },
      });
    } catch (error) {
      console.error('Error fetching recent interviews:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch recent interviews',
      });
    }
  }

  static async getTopSkills(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      // Get candidate profile
      const candidate = await Candidate.findOne({ userId }).select('skills');

      if (!candidate || !candidate.skills || candidate.skills.length === 0) {
        // Return default skills if none found
        return res.status(200).json({
          success: true,
          data: {
            skills: [
              { name: 'Communication', level: 70, category: 'Soft Skills' },
              { name: 'Problem Solving', level: 65, category: 'Soft Skills' },
              { name: 'Leadership', level: 60, category: 'Soft Skills' },
            ],
          },
        });
      }

      // Get resume analysis from localStorage or recent analysis
      // For now, we'll create basic skill objects from the skills array
      const skillsWithLevels = candidate.skills.slice(0, 5).map((skillName: string, index: number) => ({
        name: skillName,
        level: 85 - index * 5, // Decreasing levels for demo
        category: 'Technical',
      }));

      res.status(200).json({
        success: true,
        data: {
          skills: skillsWithLevels,
        },
      });
    } catch (error) {
      console.error('Error fetching top skills:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch top skills',
      });
    }
  }
}
