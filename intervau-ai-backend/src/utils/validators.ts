import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  next();
};

/**
 * Validation rules for user registration
 */
export const registerValidation = [
  body("email").isEmail().withMessage("Invalid email format").normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters"),
  body("role").isIn(["candidate", "hr", "admin"]).withMessage("Invalid role"),
];

/**
 * Validation rules for user login
 */
export const loginValidation = [
  body("email").isEmail().withMessage("Invalid email format").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

/**
 * Validation rules for creating an interview
 */
export const createInterviewValidation = [
  body("candidateId").isMongoId().withMessage("Invalid candidate ID"),
  body("jobPositionId").isMongoId().withMessage("Invalid job position ID"),
  body("type").isIn(["mock", "live"]).withMessage("Invalid interview type"),
];

/**
 * Validation rules for creating a job position
 */
export const createPositionValidation = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("department").trim().notEmpty().withMessage("Department is required"),
  body("location").trim().notEmpty().withMessage("Location is required"),
  body("requiredSkills")
    .isArray()
    .withMessage("Required skills must be an array"),
];

/**
 * Validation rules for updating a candidate
 */
export const updateCandidateValidation = [
  body("skills").optional().isArray().withMessage("Skills must be an array"),
  body("experience").optional().trim(),
  body("education").optional().trim(),
];

/**
 * Validation rules for submitting interview feedback
 */
export const submitFeedbackValidation = [
  body("score")
    .isInt({ min: 0, max: 100 })
    .withMessage("Score must be between 0 and 100"),
  body("feedback").trim().notEmpty().withMessage("Feedback is required"),
];
