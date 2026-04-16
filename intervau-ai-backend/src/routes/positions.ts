import { Router } from 'express';
import { PositionController } from '../controllers/PositionController';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import { createPositionValidation, validateRequest } from '../utils/validators';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * POST /api/positions
 * Create a new job position (HR only)
 */
router.post(
  '/',
  roleMiddleware('hr'),
  createPositionValidation,
  validateRequest,
  PositionController.create
);

/**
 * GET /api/positions
 * Get all job positions
 */
router.get('/', PositionController.getAll);

/**
 * GET /api/positions/:id
 * Get job position by ID
 */
router.get('/:id', PositionController.getById);

/**
 * PUT /api/positions/:id
 * Update job position (HR only)
 */
router.put('/:id', roleMiddleware('hr'), PositionController.update);

/**
 * DELETE /api/positions/:id
 * Delete job position (HR only)
 */
router.delete('/:id', roleMiddleware('hr'), PositionController.delete);

/**
 * POST /api/positions/:id/applicant
 * Add an applicant to job position
 */
router.post('/:id/applicant', PositionController.addApplicant);

/**
 * PATCH /api/positions/:id/status
 * Toggle job position status (Active/Paused)
 */
router.patch('/:id/status', roleMiddleware('hr'), PositionController.toggleStatus);

export default router;
