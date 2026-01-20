import { Router } from 'express';
import { InterviewTemplateController } from '../controllers/InterviewTemplateController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Protected routes (require authentication)
router.use(authMiddleware);

// CRUD operations
router.post('/', InterviewTemplateController.create);
router.get('/', InterviewTemplateController.getAll);
router.get('/public', InterviewTemplateController.getPublicTemplates);
router.get('/:id', InterviewTemplateController.getById);
router.put('/:id', InterviewTemplateController.update);
router.delete('/:id', InterviewTemplateController.delete);

// AI Question Generation
router.post('/generate-questions', InterviewTemplateController.generateQuestions);

export default router;
