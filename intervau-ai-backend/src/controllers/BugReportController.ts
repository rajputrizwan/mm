import { Response } from 'express';
import BugReport from '../models/BugReport';
import { AuthRequest } from '../middleware/auth';

const VALID_CATEGORIES = [
  'audio',
  'video',
  'ai_response',
  'ui_freeze',
  'connection',
  'scoring',
  'other',
] as const;

const VALID_SEVERITIES = ['low', 'medium', 'high'] as const;
const VALID_SESSION_TYPES = ['mock', 'live', 'public', 'general'] as const;

export class BugReportController {
  /**
   * Submit a new bug report (from post-interview form)
   * POST /api/bug-reports
   * Requires authentication
   */
  static async submitReport(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { sessionId, sessionType, category, description, severity } =
        req.body;

      // Must be authenticated
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      // Validate required fields
      if (!category || !description) {
        res.status(400).json({
          success: false,
          message: 'Category and description are required.',
        });
        return;
      }

      if (!VALID_CATEGORIES.includes(category)) {
        res.status(400).json({
          success: false,
          message: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}.`,
        });
        return;
      }

      if (severity && !VALID_SEVERITIES.includes(severity)) {
        res.status(400).json({
          success: false,
          message: `Invalid severity. Must be one of: ${VALID_SEVERITIES.join(', ')}.`,
        });
        return;
      }

      if (sessionType && !VALID_SESSION_TYPES.includes(sessionType)) {
        res.status(400).json({
          success: false,
          message: `Invalid session type. Must be one of: ${VALID_SESSION_TYPES.join(', ')}.`,
        });
        return;
      }

      const trimmedDesc = String(description).trim();
      if (trimmedDesc.length < 20) {
        res.status(400).json({
          success: false,
          message: 'Description must be at least 20 characters.',
        });
        return;
      }

      if (trimmedDesc.length > 2000) {
        res.status(400).json({
          success: false,
          message: 'Description must not exceed 2000 characters.',
        });
        return;
      }

      const report = new BugReport({
        userId: req.user.id,
        sessionId: sessionId?.trim() || undefined,
        sessionType: sessionType || 'mock',
        category,
        description: trimmedDesc,
        severity: severity || 'medium',
        status: 'open',
        userAgent: req.headers['user-agent'] || undefined,
      });

      await report.save();

      console.log(
        `[BugReport] New report #${report._id} from user ${req.user.id} — category: ${category}, severity: ${severity || 'medium'}`
      );

      res.status(201).json({
        success: true,
        message:
          "Thank you for your report! Our team will review it and work on a fix.",
        data: {
          id: report._id,
          status: report.status,
          createdAt: report.createdAt,
        },
      });
    } catch (error: any) {
      console.error('[BugReport] submitReport error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit your report. Please try again.',
        error:
          process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  /**
   * Get all bug reports — for the team to review
   * GET /api/bug-reports
   * Requires authentication (HR or admin role intended)
   */
  static async getAllReports(req: AuthRequest, res: Response): Promise<void> {
    try {
      const {
        status,
        category,
        severity,
        page = 1,
        limit = 20,
      } = req.query as Record<string, string>;

      const query: Record<string, unknown> = {};
      if (status) query.status = status;
      if (category) query.category = category;
      if (severity) query.severity = severity;

      const skip = (Number(page) - 1) * Number(limit);

      const [reports, total] = await Promise.all([
        BugReport.find(query)
          .populate('userId', 'name email')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit))
          .lean(),
        BugReport.countDocuments(query),
      ]);

      res.status(200).json({
        success: true,
        data: reports,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error: any) {
      console.error('[BugReport] getAllReports error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch bug reports.',
        error:
          process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  /**
   * Update the status of a bug report (team workflow)
   * PATCH /api/bug-reports/:id
   */
  static async updateStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const VALID_STATUSES = ['open', 'in_review', 'resolved', 'closed'];
      if (!VALID_STATUSES.includes(status)) {
        res.status(400).json({
          success: false,
          message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}.`,
        });
        return;
      }

      const report = await BugReport.findByIdAndUpdate(
        id,
        { status },
        { new: true, runValidators: true }
      );

      if (!report) {
        res
          .status(404)
          .json({ success: false, message: 'Bug report not found.' });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Status updated.',
        data: report,
      });
    } catch (error: any) {
      console.error('[BugReport] updateStatus error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update status.',
        error:
          process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
}
