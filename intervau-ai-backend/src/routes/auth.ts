import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { authMiddleware } from "../middleware/auth";
import {
  registerValidation,
  loginValidation,
  validateRequest,
} from "../utils/validators";

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post(
  "/register",
  registerValidation,
  validateRequest,
  AuthController.register
);

/**
 * POST /api/auth/login
 * Login a user
 */
router.post("/login", loginValidation, validateRequest, AuthController.login);

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
router.get("/me", authMiddleware, AuthController.getCurrentUser);

/**
 * POST /api/auth/logout
 * Logout user
 */
router.post("/logout", authMiddleware, AuthController.logout);

export default router;
