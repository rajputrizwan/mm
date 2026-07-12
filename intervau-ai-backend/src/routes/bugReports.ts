import { Router } from 'express';
import { BugReportController } from '../controllers/BugReportController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Submit a new bug report — any authenticated user (candidate or HR)
router.post('/', authMiddleware, BugReportController.submitReport);

// Get all bug reports — authenticated (HR / team review)
router.get('/', authMiddleware, BugReportController.getAllReports);

// Update status of a specific report (team workflow)
router.patch('/:id', authMiddleware, BugReportController.updateStatus);

export default router;
