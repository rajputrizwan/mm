import { Router } from 'express';
import { DashboardController } from '../controllers/DashboardController';
import { authMiddleware, roleMiddleware } from '../middleware/auth';

const router = Router();

// All routes require authentication and HR role
router.use(authMiddleware);
router.use(roleMiddleware('hr'));

/**
 * GET /api/dashboard/hr/metrics
 * Get KPI metrics with week-over-week comparisons
 */
router.get('/hr/metrics', DashboardController.getHRMetrics);

/**
 * GET /api/dashboard/hr/recent-applications
 * Get the most recent applications
 */
router.get('/hr/recent-applications', DashboardController.getRecentApplications);

/**
 * GET /api/dashboard/hr/weekly-interviews
 * Get interviews scheduled for current week
 */
router.get('/hr/weekly-interviews', DashboardController.getWeeklyInterviews);

/**
 * GET /api/dashboard/hr/department-analytics
 * Get analytics grouped by department
 */
router.get('/hr/department-analytics', DashboardController.getDepartmentAnalytics);

export default router;
