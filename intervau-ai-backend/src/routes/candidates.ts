import { Router } from 'express';
import { CandidateController } from '../controllers/CandidateController';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import { updateCandidateProfileValidation, validateRequest } from '../utils/validators';

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
router.put('/:id/resume', CandidateController.updateResume);

export default router;
