import { Router } from 'express';
import { InterviewTemplateController } from '../controllers/InterviewTemplateController';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth';

const router = Router();

// Public routes (no authentication required)
router.get('/public', InterviewTemplateController.getPublicTemplates);
router.post(
  '/generate-questions',
  optionalAuthMiddleware,
  InterviewTemplateController.generateQuestions
);

// Protected routes (require authentication)
router.use(authMiddleware);

// CRUD operations
router.post('/', InterviewTemplateController.create);
router.get('/', InterviewTemplateController.getAll);
router.get('/:id', InterviewTemplateController.getById);
router.put('/:id', InterviewTemplateController.update);
router.delete('/:id', InterviewTemplateController.delete);

export default router;
