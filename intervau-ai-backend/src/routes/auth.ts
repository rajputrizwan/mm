import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
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

export default router;
