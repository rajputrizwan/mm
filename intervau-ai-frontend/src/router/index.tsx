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

  if (roles && user && !roles.includes(user.role)) {
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
  MOCK_INTERVIEW: "/candidate/mock-interviews",
  MOCK_INTERVIEW_SESSION: "/candidate/mock-interviews/session/:sessionId",
  INTERVIEW_HISTORY: "/candidate/interview-history",
  INTERVIEW_REPORT: "/candidate/interview-report/:reportId",
  CANDIDATE_PROFILE_SETTINGS: "/candidate/profile-settings",

  // HR Routes
  HR_DASHBOARD: "/hr/dashboard",
  JOB_POSITIONS: "/hr/job-positions",
  HR_CANDIDATES: "/hr/candidates",
  CANDIDATE_REVIEW: "/hr/candidate-review/:candidateId",
  HR_PROFILE_SETTINGS: "/hr/profile-settings",

  // Shared Routes
  LIVE_INTERVIEW: "/live-interview/:sessionId",
  INTERVIEW_SUMMARY: "/interview-summary/:summaryId",

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
  mockInterviewSession: (sessionId: string) =>
    `/candidate/mock-interviews/session/${sessionId}`,
  liveInterview: (sessionId: string) => `/live-interview/${sessionId}`,
  interviewSummary: (summaryId: string) => `/interview-summary/${summaryId}`,
  candidateReview: (candidateId: string) =>
    `/hr/candidate-review/${candidateId}`,
};
