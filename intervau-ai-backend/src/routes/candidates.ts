import { Router } from "express";
import { CandidateController } from "../controllers/CandidateController";
import { authMiddleware } from "../middleware/auth";
import {
  updateCandidateValidation,
  validateRequest,
} from "../utils/validators";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * POST /api/candidates
 * Create a new candidate
 */
router.post("/", CandidateController.create);

/**
 * GET /api/candidates
 * Get all candidates
 */
router.get("/", CandidateController.getAll);

/**
 * GET /api/candidates/:id
 * Get candidate by ID
 */
router.get("/:id", CandidateController.getById);

/**
 * PUT /api/candidates/:id
 * Update candidate
 */
router.put(
  "/:id",
  updateCandidateValidation,
  validateRequest,
  CandidateController.update
);

/**
 * DELETE /api/candidates/:id
 * Delete candidate
 */
router.delete("/:id", CandidateController.delete);

/**
 * PUT /api/candidates/:id/resume
 * Update candidate resume
 */
router.put("/:id/resume", CandidateController.updateResume);

export default router;
