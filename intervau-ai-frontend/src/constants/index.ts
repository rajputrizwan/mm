/**
 * Application Constants
 */

// Interview Types
export const INTERVIEW_TYPES = {
  MOCK: "mock",
  LIVE: "live",
} as const;

// Interview Status
export const INTERVIEW_STATUS = {
  SCHEDULED: "scheduled",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

// Interview Difficulty Levels
export const DIFFICULTY_LEVELS = {
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard",
} as const;

// Candidate Status
export const CANDIDATE_STATUS = {
  ACTIVE: "active",
  REJECTED: "rejected",
  ACCEPTED: "accepted",
  PENDING: "pending",
} as const;

// User Roles
export const USER_ROLES = {
  CANDIDATE: "candidate",
  HR: "hr",
  ADMIN: "admin",
} as const;

// Feedback Categories
export const FEEDBACK_CATEGORIES = {
  COMMUNICATION: "communication",
  TECHNICAL: "technical",
  PROBLEM_SOLVING: "problem_solving",
  BEHAVIORAL: "behavioral",
  CULTURAL_FIT: "cultural_fit",
} as const;

// Assessment Metrics
export const ASSESSMENT_METRICS = {
  ACCURACY: "accuracy",
  CONFIDENCE: "confidence",
  CLARITY: "clarity",
  COMPLETENESS: "completeness",
  RELEVANCE: "relevance",
} as const;

// Performance Levels
export const PERFORMANCE_LEVELS = {
  EXCELLENT: "excellent",
  GOOD: "good",
  AVERAGE: "average",
  POOR: "poor",
} as const;

// API Error Messages
export const API_ERRORS = {
  UNAUTHORIZED: "You are not authorized to perform this action",
  FORBIDDEN: "Access denied",
  NOT_FOUND: "Resource not found",
  SERVER_ERROR: "An error occurred on the server",
  NETWORK_ERROR: "Network connection failed",
  TIMEOUT: "Request timeout",
  VALIDATION_ERROR: "Validation failed",
} as const;

// Form Validation Messages
export const VALIDATION_MESSAGES = {
  REQUIRED: "This field is required",
  INVALID_EMAIL: "Please enter a valid email address",
  PASSWORD_TOO_SHORT: "Password must be at least 8 characters long",
  PASSWORD_WEAK: "Password must contain uppercase, lowercase, and numbers",
  PASSWORDS_DONT_MATCH: "Passwords do not match",
  INVALID_PHONE: "Please enter a valid phone number",
  INVALID_URL: "Please enter a valid URL",
} as const;

// Page Routes
export const ROUTES_PATH = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  LANDING: "/",
  ABOUT: "/about",
  PRICING: "/pricing",
  FAQ: "/faq",
  CONTACT: "/contact",
  NOT_FOUND: "/404",

  // Candidate Routes
  CANDIDATE_DASHBOARD: "/candidate/dashboard",
  CANDIDATE_RESUME: "/candidate/resume",
  CANDIDATE_MOCK_INTERVIEWS: "/candidate/mock-interviews",
  CANDIDATE_MOCK_SESSION: "/candidate/mock-interviews/session/:id",
  CANDIDATE_INTERVIEW_HISTORY: "/candidate/interview-history",
  CANDIDATE_INTERVIEW_REPORT: "/candidate/interview-report/:id",
  CANDIDATE_PROFILE: "/candidate/profile-settings",

  // HR Routes
  HR_DASHBOARD: "/hr/dashboard",
  HR_JOB_POSITIONS: "/hr/job-positions",
  HR_CANDIDATES: "/hr/candidates",
  HR_CANDIDATE_REVIEW: "/hr/candidate-review/:id",
  HR_PROFILE: "/hr/profile-settings",

  // Shared Routes
  LIVE_INTERVIEW: "/live-interview/:id",
  INTERVIEW_SUMMARY: "/interview-summary/:id",
} as const;

// Question Types
export const QUESTION_TYPES = {
  TECHNICAL: "technical",
  BEHAVIORAL: "behavioral",
  SITUATIONAL: "situational",
  CODING: "coding",
} as const;

// Timing Constants (in milliseconds)
export const TIMINGS = {
  DEBOUNCE_DELAY: 300,
  THROTTLE_DELAY: 1000,
  TOAST_DURATION: 3000,
  ANIMATION_DURATION: 300,
  API_TIMEOUT: 30000,
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "auth_token",
  USER_DATA: "user_data",
  PREFERENCES: "user_preferences",
  DRAFT_ANSWERS: "draft_answers",
  INTERVIEW_SESSION: "interview_session",
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  SMALL_PAGE_SIZE: 5,
  LARGE_PAGE_SIZE: 20,
} as const;

// Score Ranges
export const SCORE_RANGES = {
  EXCELLENT: { min: 85, max: 100 },
  GOOD: { min: 70, max: 84 },
  AVERAGE: { min: 60, max: 69 },
  POOR: { min: 0, max: 59 },
} as const;

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE_MB: 10,
  ALLOWED_FORMATS: ["pdf", "doc", "docx"],
  MAX_SIZE_BYTES: 10 * 1024 * 1024,
} as const;

// Default Values
export const DEFAULT_VALUES = {
  ITEMS_PER_PAGE: 10,
  INTERVIEW_DURATION_MINUTES: 30,
  QUESTION_PREP_TIME_SECONDS: 30,
  ANSWER_TIME_SECONDS: 120,
  DEFAULT_AVATAR: "https://via.placeholder.com/150",
} as const;

// Feature Flags (for enabling/disabling features)
export const FEATURES = {
  MOCK_INTERVIEWS: true,
  LIVE_INTERVIEWS: true,
  VIDEO_RECORDING: true,
  AI_ANALYSIS: true,
  FEEDBACK: true,
  RESUME_ANALYSIS: true,
} as const;

// Color Scheme
export const COLORS = {
  PRIMARY: "#3B82F6",
  SECONDARY: "#10B981",
  DANGER: "#EF4444",
  WARNING: "#F59E0B",
  INFO: "#0EA5E9",
  SUCCESS: "#10B981",
  BACKGROUND: "#F9FAFB",
  TEXT_PRIMARY: "#1F2937",
  TEXT_SECONDARY: "#6B7280",
  BORDER: "#E5E7EB",
} as const;
