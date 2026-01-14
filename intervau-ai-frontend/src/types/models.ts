/**
 * Application Type Definitions
 */

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: "candidate" | "hr" | "admin";
  avatar?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Interview Types
export interface Interview {
  id: string;
  candidateId: string;
  hrId: string;
  jobPositionId: string;
  type: "mock" | "live";
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  scheduledAt: string;
  startedAt?: string;
  endedAt?: string;
  duration?: number;
  feedback?: string;
  score?: number;
  questions: Question[];
  answers: Answer[];
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: string;
  interviewId: string;
  text: string;
  type: "technical" | "behavioral" | "situational" | "coding";
  difficulty: "easy" | "medium" | "hard";
  category?: string;
  expectedAnswer?: string;
  order: number;
  createdAt: string;
}

export interface Answer {
  id: string;
  questionId: string;
  interviewId: string;
  candidateId: string;
  text: string;
  audioUrl?: string;
  videoUrl?: string;
  duration: number;
  score?: number;
  feedback?: string;
  submittedAt: string;
  createdAt: string;
}

export interface InterviewSession {
  id: string;
  interviewId: string;
  currentQuestionIndex: number;
  startTime: number;
  answers: SessionAnswer[];
  isActive: boolean;
  isPaused: boolean;
  pausedAt?: number;
}

export interface SessionAnswer {
  questionId: string;
  text: string;
  audioUrl?: string;
  videoUrl?: string;
  duration: number;
  recordedAt: string;
}

// Candidate Types
export interface Candidate {
  id: string;
  userId: string;
  resume?: {
    url: string;
    uploadedAt: string;
  };
  skills: string[];
  experience: string;
  education: string;
  bio?: string;
  interviewCount: number;
  averageScore?: number;
  status: "active" | "rejected" | "accepted" | "pending";
  createdAt: string;
  updatedAt: string;
}

// HR Types
export interface JobPosition {
  id: string;
  hrId: string;
  title: string;
  description: string;
  department: string;
  requiredSkills: string[];
  experience: string;
  salary?: string;
  location: string;
  applicants: Candidate[];
  interviews: Interview[];
  status: "open" | "closed" | "filled";
  createdAt: string;
  updatedAt: string;
}

// Interview Report Types
export interface InterviewReport {
  id: string;
  interviewId: string;
  candidateId: string;
  overallScore: number;
  metrics: Metric[];
  feedback: Feedback[];
  strengths: string[];
  improvements: string[];
  recommendation: "hire" | "reject" | "maybe" | "pending";
  generatedAt: string;
}

export interface Metric {
  name: string;
  score: number;
  weight: number;
  category: string;
}

export interface Feedback {
  id: string;
  questionId: string;
  category:
    | "communication"
    | "technical"
    | "problem_solving"
    | "behavioral"
    | "cultural_fit";
  comment: string;
  rating: number;
  aiGenerated: boolean;
}

// Form Types
export interface LoginFormValues {
  email: string;
  password: string;
}

export interface RegisterFormValues {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  role: "candidate" | "hr";
  agreeToTerms: boolean;
}

export interface ForgotPasswordFormValues {
  email: string;
}

export interface ResetPasswordFormValues {
  password: string;
  confirmPassword: string;
}

export interface ProfileFormValues {
  name: string;
  email: string;
  phone?: string;
  bio?: string;
}

// API Request/Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Notification Types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Dashboard Types
export interface DashboardStats {
  totalInterviews: number;
  completedInterviews: number;
  averageScore: number;
  upcomingInterviews: number;
}

export interface ActivityLog {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

// Performance Analytics Types
export interface PerformanceAnalytics {
  overallScore: number;
  scoreHistory: ScoreData[];
  strengthAreas: string[];
  improvementAreas: string[];
  categoryScores: CategoryScore[];
}

export interface ScoreData {
  date: string;
  score: number;
  interviewId: string;
}

export interface CategoryScore {
  category: string;
  score: number;
  maxScore: number;
}

// Utility Types
export type SelectOption<T = any> = {
  label: string;
  value: T;
  icon?: React.ReactNode;
  disabled?: boolean;
};

export type TableColumn<T> = {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: T[keyof T], item: T) => React.ReactNode;
  width?: string;
};

export type Status = "idle" | "loading" | "success" | "error";

export interface RequestState {
  status: Status;
  error?: Error | null;
}

// Search/Filter Types
export interface SearchFilter {
  query?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  [key: string]: any;
}

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

// Theme Types
export interface ThemeColors {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  background: string;
  surface: string;
  text: {
    primary: string;
    secondary: string;
  };
  border: string;
}

// Video Conference Types
export interface VideoSession {
  id: string;
  interviewId: string;
  participantCount: number;
  startTime: number;
  mediaStream?: MediaStream;
  isRecording: boolean;
}

// Export all types as a namespace for convenient importing
export namespace Types {
  export type UserType = User;
  export type InterviewType = Interview;
  export type CandidateType = Candidate;
  export type JobPositionType = JobPosition;
}
