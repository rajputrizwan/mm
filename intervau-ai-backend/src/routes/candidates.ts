import { Router } from 'express';
import { CandidateController } from '../controllers/CandidateController';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import {
  updateCandidateProfileValidation,
  updateResumeValidation,
  resumeRoleContextValidation,
  validateRequest,
} from '../utils/validators';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * POST /api/candidates
 * Create a new candidate
 */
router.post('/', CandidateController.create);

/**
 * GET /api/candidates
 * Get all candidates
 */
router.get('/', CandidateController.getAll);

/**
 * GET /api/candidates/applications
 * Get all applications for HR with filtering (HR only)
 */
router.get('/applications', roleMiddleware('hr'), CandidateController.getApplicationsForHR);

/**
 * POST /api/candidates/analyze-resume
 * Analyze uploaded resume (Candidate only)
 * MUST come before /:id route to avoid conflicts
 */
const { upload } = require('../middleware/upload');
router.post(
  '/analyze-resume',
  roleMiddleware('candidate'),
  upload.single('resume'),
  resumeRoleContextValidation,
  validateRequest,
  CandidateController.analyzeResume
);

/**
 * GET /api/candidates/resume-analysis
 * Get the authenticated user's saved resume analysis (Candidate only)
 * MUST come before /:id route to avoid conflicts
 */
router.get('/resume-analysis', roleMiddleware('candidate'), CandidateController.getResumeAnalysis);

/**
 * POST /api/candidates/resume-analysis/regenerate
 * Recompute recommendations and questions from saved analysis (Candidate only)
 * MUST come before /:id route to avoid conflicts
 */
router.post(
  '/resume-analysis/regenerate',
  roleMiddleware('candidate'),
  resumeRoleContextValidation,
  validateRequest,
  CandidateController.regenerateResumeAnalysis
);

/**
 * DELETE /api/candidates/resume-analysis
 * Delete the authenticated user's saved resume analysis (Candidate only)
 * MUST come before /:id route to avoid conflicts
 */
router.delete(
  '/resume-analysis',
  roleMiddleware('candidate'),
  CandidateController.deleteResumeAnalysis
);

/**
 * GET /api/candidates/dashboard/stats
 * Get dashboard statistics (Candidate only)
 * MUST come before /:id route to avoid conflicts
 */
router.get('/dashboard/stats', CandidateController.getDashboardStats);

/**
 * GET /api/candidates/dashboard/recent-interviews
 * Get recent interviews (Candidate only)
 * MUST come before /:id route to avoid conflicts
 */
router.get('/dashboard/recent-interviews', CandidateController.getRecentInterviews);

/**
 * GET /api/candidates/dashboard/skills
 * Get top skills (Candidate only)
 * MUST come before /:id route to avoid conflicts
 */
router.get('/dashboard/skills', CandidateController.getTopSkills);

/**
 * GET /api/candidates/:id
 * Get candidate by ID
 */
router.get('/:id', CandidateController.getById);

/**
 * PUT /api/candidates/:id
 * Update candidate
 */
router.put('/:id', updateCandidateProfileValidation, validateRequest, CandidateController.update);

/**
 * DELETE /api/candidates/:id
 * Delete candidate
 */
router.delete('/:id', CandidateController.delete);

/**
 * PUT /api/candidates/:id/resume
 * Update candidate resume
 */
router.put(
  '/:id/resume',
  roleMiddleware('candidate'),
  updateResumeValidation,
  validateRequest,
  CandidateController.updateResume
);

export default router;
