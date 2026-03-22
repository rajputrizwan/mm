import { Request, Response } from 'express';
import { Candidate } from '../models/Candidate';
import { ResumeAnalysis } from '../models/ResumeAnalysis';

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
        qualifiedCount: enrichedApplications.filter((app: any) => app.status === 'Qualified')
          .length,
        interviewingCount: enrichedApplications.filter((app: any) => app.status === 'In Interview')
          .length,
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
    let filePath: string | null = null;

    try {
      const file = (req as any).file;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded. Please select a PDF, DOC, or DOCX file.',
        });
      }

      filePath = file.path;
      const targetJobPosition = String((req.body?.targetJobPosition || '') as string).trim();
      const targetJobDescription = String((req.body?.targetJobDescription || '') as string).trim();
      const roleContext = {
        targetJobPosition: targetJobPosition || undefined,
        targetJobDescription: targetJobDescription || undefined,
      };

      console.log('[Resume Analysis] Starting analysis for file:', file.originalname);
      console.log('[Resume Analysis] File size:', file.size, 'bytes');
      console.log('[Resume Analysis] MIME type:', file.mimetype);
      if (targetJobPosition || targetJobDescription) {
        console.log('[Resume Analysis] Role context received:', {
          targetJobPosition,
          hasDescription: Boolean(targetJobDescription),
        });
      }

      const fs = require('fs');

      // Step 1: Extract text from file
      let text: string;
      try {
        const { extractTextFromFile } = require('../utils/resumeParser');
        console.log('[Resume Analysis] Extracting text from file...');
        text = await extractTextFromFile(file.path, file.mimetype);
        console.log('[Resume Analysis] Text extraction successful. Length:', text.length);
      } catch (extractError: any) {
        console.error('[Resume Analysis] Text extraction failed:', extractError);
        console.error('[Resume Analysis] Error details:', extractError.message);

        // Clean up file
        if (filePath && fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }

        return res.status(500).json({
          success: false,
          message:
            'Failed to extract text from resume. The file may be corrupted or in an unsupported format.',
          error: process.env.NODE_ENV === 'development' ? extractError.message : undefined,
        });
      }

      // Validate extracted text
      if (!text || text.trim().length < 100) {
        console.warn('[Resume Analysis] Insufficient text extracted. Length:', text?.length || 0);

        // Clean up file
        if (filePath && fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }

        return res.status(400).json({
          success: false,
          message:
            'Could not extract sufficient text from resume. Please ensure the file contains readable text and is not a scanned image.',
        });
      }

      // Step 2: Extract skills
      let extractedSkills: any[];
      try {
        const { extractSkills } = require('../utils/skillExtractor');
        console.log('[Resume Analysis] Extracting skills...');
        extractedSkills = extractSkills(text, roleContext);
        console.log('[Resume Analysis] Skills extracted:', extractedSkills.length);
      } catch (skillError: any) {
        console.error('[Resume Analysis] Skill extraction failed:', skillError);

        // Clean up file
        if (filePath && fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }

        return res.status(500).json({
          success: false,
          message: 'Failed to analyze skills in resume.',
          error: process.env.NODE_ENV === 'development' ? skillError.message : undefined,
        });
      }

      // Step 3: Identify skill gaps
      let skillGaps: any[];
      try {
        const { identifySkillGaps } = require('../utils/skillExtractor');
        console.log('[Resume Analysis] Identifying skill gaps...');
        skillGaps = identifySkillGaps(extractedSkills, roleContext);
        console.log('[Resume Analysis] Skill gaps identified:', skillGaps.length);
      } catch (gapError: any) {
        console.error('[Resume Analysis] Skill gap analysis failed:', gapError);
        // Non-critical, use empty array
        skillGaps = [];
      }

      // Step 4: Generate interview questions
      let suggestedQuestions: any[];
      try {
        const { generateInterviewQuestions } = require('../utils/skillExtractor');
        console.log('[Resume Analysis] Generating interview questions...');
        suggestedQuestions = generateInterviewQuestions(extractedSkills, roleContext);
        console.log('[Resume Analysis] Questions generated:', suggestedQuestions.length);
      } catch (questionError: any) {
        console.error('[Resume Analysis] Question generation failed:', questionError);
        // Non-critical, use empty array
        suggestedQuestions = [];
      }

      // Step 5: Calculate match score
      let matchScore: number;
      try {
        const { calculateMatchScore } = require('../utils/skillExtractor');
        console.log('[Resume Analysis] Calculating match score...');
        matchScore = calculateMatchScore(extractedSkills, roleContext);
        console.log('[Resume Analysis] Match score:', matchScore);
      } catch (scoreError: any) {
        console.error('[Resume Analysis] Match score calculation failed:', scoreError);
        // Non-critical, use default
        matchScore = 0;
      }

      // Step 6: Persist full analysis to DB + update candidate profile
      try {
        const userId = (req as any).user?.id;
        if (userId) {
          console.log('[Resume Analysis] Persisting analysis to DB for user:', userId);

          // Upsert the full analysis result (replaces previous analysis)
          await ResumeAnalysis.findOneAndUpdate(
            { userId },
            {
              $set: {
                userId,
                fileName: file.originalname,
                targetJobPosition: roleContext.targetJobPosition,
                targetJobDescription: roleContext.targetJobDescription,
                matchScore,
                extractedSkills,
                skillGaps,
                suggestedQuestions,
                analyzedAt: new Date(),
              },
            },
            { upsert: true, new: true }
          );

          // Also update the Candidate profile skills
          await Candidate.findOneAndUpdate(
            { userId },
            {
              $set: {
                skills: extractedSkills.map(s => s.name),
                'resume.uploadedAt': new Date(),
              },
            },
            { upsert: true }
          );

          console.log('[Resume Analysis] Analysis persisted to DB successfully');
        }
      } catch (updateError: any) {
        // Non-critical, just log the error
        console.error('[Resume Analysis] Failed to persist analysis:', updateError);
      }

      // Clean up uploaded file (temporary storage)
      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('[Resume Analysis] Temporary file cleaned up');
      }

      // Return analysis results
      console.log('[Resume Analysis] Analysis completed successfully');
      res.status(200).json({
        success: true,
        data: {
          extractedSkills,
          skillGaps,
          suggestedQuestions,
          matchScore,
          analyzedAt: new Date().toISOString(),
          fileName: file.originalname,
          targetJobPosition: roleContext.targetJobPosition,
          targetJobDescription: roleContext.targetJobDescription,
        },
      });
    } catch (error) {
      console.error('[Resume Analysis] Unexpected error:', error);
      console.error('[Resume Analysis] Error stack:', (error as Error).stack);
      console.error('[Resume Analysis] Error message:', (error as Error).message);

      // Clean up file if it exists
      if (filePath) {
        const fs = require('fs');
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log('[Resume Analysis] Cleaned up file after error');
          }
        } catch (cleanupError) {
          console.error('[Resume Analysis] Failed to cleanup file:', cleanupError);
        }
      }

      res.status(500).json({
        success: false,
        message: 'An unexpected error occurred while analyzing your resume. Please try again.',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
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

      // Prefer persisted resume analysis so dashboard scores match Resume tab.
      const analysis = await ResumeAnalysis.findOne({ userId }).select(
        'extractedSkills analyzedAt'
      );

      if (analysis?.extractedSkills?.length) {
        const skillsWithLevels = analysis.extractedSkills
          .filter(skill => skill && typeof skill.name === 'string' && skill.name.trim().length > 0)
          .map(skill => ({
            name: skill.name,
            level: typeof skill.level === 'number' ? skill.level : 45,
            category: skill.category || 'Technical',
          }))
          .sort((a, b) => b.level - a.level || a.name.localeCompare(b.name))
          .slice(0, 5);

        return res.status(200).json({
          success: true,
          data: {
            skills: skillsWithLevels,
          },
        });
      }

      // Fallback for users who have profile skills but no saved resume analysis yet.
      const candidate = await Candidate.findOne({ userId }).select('skills');

      if (!candidate || !candidate.skills || candidate.skills.length === 0) {
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

      const skillsWithLevels = candidate.skills.slice(0, 5).map((skillName: string) => ({
        name: skillName,
        level: 45,
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
  /**
   * GET /api/candidates/resume-analysis
   * Returns the authenticated user's saved resume analysis from DB.
   */
  static async getResumeAnalysis(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      const analysis = await ResumeAnalysis.findOne({ userId });

      if (!analysis) {
        return res.status(404).json({
          success: false,
          message: 'No resume analysis found for this user.',
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          extractedSkills: analysis.extractedSkills,
          skillGaps: analysis.skillGaps,
          suggestedQuestions: analysis.suggestedQuestions,
          matchScore: analysis.matchScore,
          analyzedAt: analysis.analyzedAt.toISOString(),
          fileName: analysis.fileName,
          targetJobPosition: analysis.targetJobPosition,
          targetJobDescription: analysis.targetJobDescription,
        },
      });
    } catch (error) {
      console.error('Error fetching resume analysis:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch resume analysis.',
      });
    }
  }

  /**
   * POST /api/candidates/resume-analysis/regenerate
   * Regenerate skill gaps/questions/match score from saved extracted skills.
   */
  static async regenerateResumeAnalysis(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      const analysis = await ResumeAnalysis.findOne({ userId });
      if (!analysis) {
        return res.status(404).json({
          success: false,
          message: 'No resume analysis found for this user.',
        });
      }

      const targetJobPosition = String(
        (req.body?.targetJobPosition ?? analysis.targetJobPosition ?? '') as string
      ).trim();
      const targetJobDescription = String(
        (req.body?.targetJobDescription ?? analysis.targetJobDescription ?? '') as string
      ).trim();

      const roleContext = {
        targetJobPosition: targetJobPosition || undefined,
        targetJobDescription: targetJobDescription || undefined,
      };

      const extractedSkills = analysis.extractedSkills || [];

      const {
        identifySkillGaps,
        generateInterviewQuestions,
        calculateMatchScore,
      } = require('../utils/skillExtractor');

      const skillGaps = identifySkillGaps(extractedSkills, roleContext) || [];
      const suggestedQuestions = generateInterviewQuestions(extractedSkills, roleContext) || [];
      const matchScore = calculateMatchScore(extractedSkills, roleContext) || 0;

      analysis.skillGaps = skillGaps;
      analysis.suggestedQuestions = suggestedQuestions;
      analysis.matchScore = matchScore;
      analysis.targetJobPosition = roleContext.targetJobPosition;
      analysis.targetJobDescription = roleContext.targetJobDescription;
      analysis.analyzedAt = new Date();

      await analysis.save();

      return res.status(200).json({
        success: true,
        data: {
          extractedSkills: analysis.extractedSkills,
          skillGaps: analysis.skillGaps,
          suggestedQuestions: analysis.suggestedQuestions,
          matchScore: analysis.matchScore,
          analyzedAt: analysis.analyzedAt.toISOString(),
          fileName: analysis.fileName,
          targetJobPosition: analysis.targetJobPosition,
          targetJobDescription: analysis.targetJobDescription,
        },
      });
    } catch (error) {
      console.error('Error regenerating resume analysis:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to regenerate resume analysis.',
      });
    }
  }

  /**
   * DELETE /api/candidates/resume-analysis
   * Deletes the authenticated user's saved resume analysis from DB.
   */
  static async deleteResumeAnalysis(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      await ResumeAnalysis.findOneAndDelete({ userId });

      // Also clear skills from Candidate profile
      await Candidate.findOneAndUpdate(
        { userId },
        { $set: { skills: [], 'resume.uploadedAt': null } }
      );

      return res.status(200).json({
        success: true,
        message: 'Resume analysis deleted successfully.',
      });
    } catch (error) {
      console.error('Error deleting resume analysis:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete resume analysis.',
      });
    }
  }
}
