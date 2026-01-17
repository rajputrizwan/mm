import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
};

/**
 * Validation rules for user registration
 */
export const registerValidation = [
  body('email').isEmail().withMessage('Invalid email format').normalizeEmail().toLowerCase(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and number'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters')
    .isLength({ max: 50 })
    .withMessage('Name must not exceed 50 characters'),
  body('role')
    .isIn(['candidate', 'hr', 'admin'])
    .withMessage("Invalid role. Must be 'candidate', 'hr', or 'admin'"),
  body('companyName')
    .optional({ values: 'null' })
    .custom((value, { req }) => {
      // Only validate if role is hr
      if (req.body.role === 'hr') {
        if (!value || !value.trim()) {
          throw new Error('Company name is required for HR registration');
        }
      }
      return true;
    }),
];

/**
 * Validation rules for user login
 */
export const loginValidation = [
  body('email').isEmail().withMessage('Invalid email format').normalizeEmail().toLowerCase(),
  body('password').notEmpty().withMessage('Password is required'),
];

/**
 * Validation rules for changing password
 */
export const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and number'),
  body('confirmPassword')
    .notEmpty()
    .withMessage('Confirm password is required')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
];

/**
 * Validation rules for updating profile
 */
export const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .trim()
    .matches(/^[0-9\-+\s()]+$/)
    .withMessage('Invalid phone number'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must not exceed 500 characters'),
];

/**
 * Validation rules for candidate profile
 */
export const updateCandidateProfileValidation = [
  body('skills').optional().isArray().withMessage('Skills must be an array'),
  body('experience')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Experience must not exceed 1000 characters'),
  body('education')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Education must not exceed 500 characters'),
  body('portfolio').optional().isURL().withMessage('Portfolio must be a valid URL'),
  body('linkedinUrl').optional().isURL().withMessage('LinkedIn URL must be valid'),
  body('githubUrl').optional().isURL().withMessage('GitHub URL must be valid'),
];

/**
 * Validation rules for HR profile
 */
export const updateHRProfileValidation = [
  body('companyName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),
  body('companyWebsite').optional().isURL().withMessage('Company website must be a valid URL'),
  body('designation')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Designation must not exceed 100 characters'),
];

/**
 * Validation rules for creating an interview
 */
export const createInterviewValidation = [
  body('candidateId').isMongoId().withMessage('Invalid candidate ID'),
  body('jobPositionId').isMongoId().withMessage('Invalid job position ID'),
  body('type').isIn(['mock', 'live']).withMessage('Invalid interview type'),
];

/**
 * Validation rules for creating a job position
 */
export const createPositionValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('department').trim().notEmpty().withMessage('Department is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('requiredSkills').isArray().withMessage('Required skills must be an array'),
];

/**
 * Validation rules for submitting interview feedback
 */
export const submitFeedbackValidation = [
  body('score').isInt({ min: 0, max: 100 }).withMessage('Score must be between 0 and 100'),
  body('feedback').trim().notEmpty().withMessage('Feedback is required'),
];
