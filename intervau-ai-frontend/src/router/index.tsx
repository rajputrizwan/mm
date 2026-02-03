import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { UserRole } from "../types";

export interface RouteConfig {
  path: string;
  component: ReactNode;
  roles?: UserRole[];
  requiresAuth?: boolean;
}

// Protected Route Component for React Router v6
export function ProtectedRoute({
  children,
  roles,
  requiresAuth = true,
}: {
  children: ReactNode;
  roles?: UserRole[];
  requiresAuth?: boolean;
}) {
  const { user } = useAuth();

  if (requiresAuth && !user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && user && !roles.includes(user.role as UserRole)) {
    return (
      <Navigate
        to={
          user.role === "candidate" ? "/candidate/dashboard" : "/hr/dashboard"
        }
        replace
      />
    );
  }

  return <>{children}</>;
}

// Route Constants
export const ROUTES = {
  // Public Routes
  LANDING: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",

  // Candidate Routes
  CANDIDATE_DASHBOARD: "/candidate/dashboard",
  RESUME: "/candidate/resume",
  MOCK_INTERVIEW: "/candidate/interviews",
  MOCK_INTERVIEW_SETUP: "/candidate/interviews/mock-interviews/create-mock",
  MOCK_INTERVIEW_READY:
    "/candidate/interviews/mock-interviews/ready/:sessionId",
  MOCK_INTERVIEW_SESSION:
    "/candidate/interviews/mock-interviews/session/:sessionId",
  INTERVIEW_HISTORY: "/candidate/interview-history",
  INTERVIEW_REPORT: "/candidate/interview-report/:reportId",
  CANDIDATE_PROFILE_SETTINGS: "/candidate/profile-settings",

  // HR Routes
  HR_DASHBOARD: "/hr/dashboard",
  JOB_POSITIONS: "/hr/job-positions",
  HR_CANDIDATES: "/hr/candidates",
  CANDIDATE_REVIEW: "/hr/candidate-review/:candidateId",
  HR_INTERVIEW_HISTORY: "/hr/interview-history",
  HR_PROFILE_SETTINGS: "/hr/profile-settings",
  HR_CREATE_INTERVIEW: "/hr/create-interview",

  // Device Management Routes
  CANDIDATE_DEVICES: "/candidate/devices",
  HR_DEVICES: "/hr/devices",

  // Shared Routes
  LIVE_INTERVIEW: "/live-interview/:sessionId",
  INTERVIEW_SUMMARY: "/interview-summary/:summaryId",

  // Public Interview Routes (Candidate access via shareable link)
  PUBLIC_INTERVIEW: "/interview/:uuid",
  PUBLIC_INTERVIEW_SESSION: "/interview/:uuid/session",
  PUBLIC_INTERVIEW_SUMMARY: "/interview/:uuid/summary",

  // Marketing Routes
  PRICING: "/pricing",
  ABOUT: "/about",
  FAQ: "/faq",
  CONTACT: "/contact",

  // Error Routes
  NOT_FOUND: "/404",
} as const;

export function getDefaultRoute(role: UserRole | null): string {
  if (!role) return ROUTES.LANDING;
  return role === "candidate"
    ? ROUTES.CANDIDATE_DASHBOARD
    : ROUTES.HR_DASHBOARD;
}

// Helper functions for route navigation
export const routeHelpers = {
  candidateReport: (reportId: string) =>
    `/candidate/interview-report/${reportId}`,
  mockInterviewReady: (sessionId: string) =>
    `/candidate/interviews/mock-interviews/ready/${sessionId}`,
  mockInterviewSession: (sessionId: string) =>
    `/candidate/interviews/mock-interviews/session/${sessionId}`,
  liveInterview: (sessionId: string) => `/live-interview/${sessionId}`,
  interviewSummary: (summaryId: string) => `/interview-summary/${summaryId}`,
  candidateReview: (candidateId: string) =>
    `/hr/candidate-review/${candidateId}`,
};
