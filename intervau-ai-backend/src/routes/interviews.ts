import { Router } from 'express';
import { InterviewController } from '../controllers/InterviewController';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import {
  createInterviewValidation,
  submitFeedbackValidation,
  validateRequest,
} from '../utils/validators';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * POST /api/interviews
 * Create a new interview (HR only)
 */
router.post(
  '/',
  roleMiddleware('hr'),
  createInterviewValidation,
  validateRequest,
  InterviewController.create
);

/**
 * GET /api/interviews
 * Get all interviews
 */
router.get('/', InterviewController.getAll);

/**
 * GET /api/interviews/:id
 * Get interview by ID
 */
router.get('/:id', InterviewController.getById);

/**
 * PUT /api/interviews/:id
 * Update interview (HR only)
 */
router.put('/:id', roleMiddleware('hr'), InterviewController.update);

/**
 * DELETE /api/interviews/:id
 * Delete interview (HR only)
 */
router.delete('/:id', roleMiddleware('hr'), InterviewController.delete);

/**
 * POST /api/interviews/:id/start
 * Start interview (HR only)
 */
router.post('/:id/start', roleMiddleware('hr'), InterviewController.startInterview);

/**
 * POST /api/interviews/:id/feedback
 * Submit feedback for interview (HR only)
 */
router.post(
  '/:id/feedback',
  roleMiddleware('hr'),
  submitFeedbackValidation,
  validateRequest,
  InterviewController.submitFeedback
);

export default router;
