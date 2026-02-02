import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { DeviceSessionController } from '../controllers/DeviceSessionController';
import { authMiddleware } from '../middleware/auth';
import { registerValidation, loginValidation, validateRequest } from '../utils/validators';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user with role-based profile creation
 * Body: { email, password, name, role: 'candidate'|'hr'|'admin', companyName? }
 */
router.post('/register', registerValidation, validateRequest, AuthController.register);

/**
 * POST /api/auth/login
 * Login user and return tokens
 * Body: { email, password }
 */
router.post('/login', loginValidation, validateRequest, AuthController.login);

/**
 * POST /api/auth/refresh-token
 * Refresh access token using refresh token
 * Body: { refreshToken? } or cookie
 */
router.post('/refresh-token', AuthController.refreshToken);

/**
 * GET /api/auth/me
 * Get current authenticated user with role-specific profile
 */
router.get('/me', authMiddleware, AuthController.getCurrentUser);

/**
 * PUT /api/auth/profile
 * Update user profile
 * Body: { name?, bio?, phone?, avatar? }
 */
router.put('/profile', authMiddleware, AuthController.updateProfile);

/**
 * POST /api/auth/change-password
 * Change user password
 * Body: { currentPassword, newPassword, confirmPassword }
 */
router.post('/change-password', authMiddleware, AuthController.changePassword);

/**
 * DELETE /api/auth/account
 * Delete user account
 * Body: { password }
 */
router.delete('/account', authMiddleware, AuthController.deleteAccount);

/**
 * PUT /api/auth/language
 * Update user language preference
 * Body: { language: 'en' | 'es' | 'fr' | 'de' | 'pt' }
 */
router.put('/language', authMiddleware, AuthController.updateLanguage);

/**
 * POST /api/auth/logout
 * Logout user and invalidate refresh token
 * Body: { refreshToken? } or cookie
 */
router.post('/logout', authMiddleware, AuthController.logout);

/**
 * POST /api/auth/forgot-password
 * Request password reset email
 * Body: { email }
 */
router.post('/forgot-password', AuthController.forgotPassword);

/**
 * POST /api/auth/reset-password
 * Reset password using token
 * Body: { token, newPassword, confirmPassword }
 */
router.post('/reset-password', AuthController.resetPassword);

/**
 * Device/Session Management Routes
 */

/**
 * GET /api/auth/sessions
 * Get all active Remember Me sessions for current user
 */
router.get('/sessions', authMiddleware, DeviceSessionController.getActiveSessions);

/**
 * GET /api/auth/sessions/:sessionId
 * Get details of a specific session
 */
router.get('/sessions/:sessionId', authMiddleware, DeviceSessionController.getSessionDetails);

/**
 * POST /api/auth/sessions/:sessionId/revoke
 * Revoke a specific Remember Me session
 */
router.post('/sessions/:sessionId/revoke', authMiddleware, DeviceSessionController.revokeSession);

/**
 * POST /api/auth/sessions/revoke-all-others
 * Revoke all other sessions except current one
 * Body: { currentSessionId }
 */
router.post(
  '/sessions/revoke-all-others',
  authMiddleware,
  DeviceSessionController.revokeAllOtherSessions
);

/**
 * PUT /api/auth/sessions/:sessionId/activity
 * Update last activity timestamp for a session
 */
router.put(
  '/sessions/:sessionId/activity',
  authMiddleware,
  DeviceSessionController.updateSessionActivity
);

export default router;
