/**
 * API Service
 * Centralized API client for all HTTP requests
 * Handles authentication, error handling, and request/response interceptors
 */

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface RequestConfig {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, any>;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  statusCode?: number;
}

/** Mock interview session as returned by API (single session or history item). */
export interface MockInterviewSessionDetail {
  sessionId: string;
  position: string;
  jobDescription?: string;
  duration: number;
  questionCount: number;
  difficulty: string;
  status: string;
  systemCheckPassed?: boolean;
  currentQuestionIndex?: number;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  questions: Array<{
    id: number;
    category: string;
    difficulty: string;
    text: string;
    duration: number;
    answer?: string;
    aiAnalysis?: {
      score: number;
      feedback: string;
      strengths: string[];
      improvements: string[];
    };
  }>;
  transcript?: Array<{
    speaker: "ai" | "candidate";
    text: string;
    timestamp: string;
    questionIndex?: number;
  }>;
  metrics?: {
    overallScore: number;
    confidence: number;
    clarity: number;
    technicalAccuracy: number;
    communicationSkills: number;
    fillerWords: number;
    averageResponseTime: number;
    totalWordsSpoken?: number;
    speakingPaceWPM?: number;
    overallRating?: string;
    recommendation?: string;
    aiAnalysisPercentage?: number;
    resumeMatchPercentage?: number;
  };
  summary?: {
    text?: string;
    strengths?: string[];
    areasForImprovement?: string[];
    recommendations?: string[];
    keyInsights?: string[];
  };
}

// Get auth token from localStorage
function getAuthToken(): string | null {
  return localStorage.getItem("authToken");
}

// Set auth token in localStorage
function setAuthToken(token: string): void {
  localStorage.setItem("authToken", token);
}

// Remove auth token from localStorage
function removeAuthToken(): void {
  localStorage.removeItem("authToken");
}

// Build URL with query parameters
function buildUrl(endpoint: string, params?: Record<string, any>): string {
  const url = new URL(`${API_BASE_URL}${endpoint}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  return url.toString();
}

// Main API request function
async function request<T = any>(
  endpoint: string,
  config: RequestConfig = {},
): Promise<ApiResponse<T>> {
  const { method = "GET", headers = {}, body, params } = config;

  const url = buildUrl(endpoint, params);
  const token = getAuthToken();

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (token) {
    requestHeaders["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle 401 - Unauthorized
      if (response.status === 401) {
        removeAuthToken();
        // Optionally dispatch logout event or redirect to login
        window.dispatchEvent(new CustomEvent("unauthorized"));
      }

      const errorMessage = data.error || data.message || "An error occurred";
      return {
        success: false,
        error: errorMessage,
        message: errorMessage, // Include both for compatibility
        statusCode: response.status,
      };
    }

    return {
      success: true,
      data: data.data || data,
      statusCode: response.status,
    };
  } catch (error) {
    console.error("API Request Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error occurred",
    };
  }
}

// API Methods
export const api = {
  // Authentication
  login: (email: string, password: string, rememberMe: boolean = false) =>
    request<{ accessToken: string; user: any }>("/auth/login", {
      method: "POST",
      body: { email, password, rememberMe },
    }),

  register: (
    name: string,
    email: string,
    password: string,
    role: "candidate" | "hr",
    companyName?: string,
  ) =>
    request<{ accessToken: string; user: any }>("/auth/register", {
      method: "POST",
      body: { name, email, password, role, companyName },
    }),

  logout: () => request("/auth/logout", { method: "POST" }),

  getCurrentUser: () => request<any>("/auth/me", { method: "GET" }),

  refreshToken: () =>
    request<{ token: string }>("/auth/refresh", { method: "POST" }),

  forgotPassword: (email: string) =>
    request("/auth/forgot-password", {
      method: "POST",
      body: { email },
    }),

  // Resume Analysis persistence
  getResumeAnalysis: () =>
    request<{
      extractedSkills: Array<{
        name: string;
        category: string;
        level?: number;
      }>;
      skillGaps: Array<{
        skill: string;
        importance: string;
        recommendation: string;
      }>;
      suggestedQuestions: Array<{
        question: string;
        category: string;
        difficulty: string;
      }>;
      matchScore: number;
      analyzedAt: string;
      fileName: string;
      targetJobPosition?: string;
      targetJobDescription?: string;
    }>("/candidates/resume-analysis", { method: "GET" }),

  deleteResumeAnalysis: () =>
    request("/candidates/resume-analysis", { method: "DELETE" }),

  resetPassword: (
    token: string,
    newPassword: string,
    confirmPassword: string,
  ) =>
    request("/auth/reset-password", {
      method: "POST",
      body: { token, newPassword, confirmPassword },
    }),

  // Device/Session Management (Remember Me)
  getActiveSessions: () => request<any>("/auth/sessions", { method: "GET" }),

  getSessionDetails: (sessionId: string) =>
    request<any>(`/auth/sessions/${sessionId}`, { method: "GET" }),

  revokeSession: (sessionId: string) =>
    request(`/auth/sessions/${sessionId}/revoke`, { method: "POST" }),

  signOutAllOthers: (currentSessionId?: string) =>
    request("/auth/sessions/revoke-all-others", {
      method: "POST",
      body: { currentSessionId },
    }),

  updateSessionActivity: (sessionId: string) =>
    request(`/auth/sessions/${sessionId}/activity`, { method: "PUT" }),

  // Candidates
  getCandidates: (filters?: Record<string, any>) =>
    request<any[]>("/candidates", { params: filters }),

  getCandidate: (id: string) => request<any>(`/candidates/${id}`),

  // Get candidate applications for HR with filtering
  getCandidateApplications: (filters?: {
    search?: string;
    status?: string;
    sortBy?: string;
  }) => request("/candidates/applications", { params: filters }),

  // Analyze resume with file upload
  analyzeResume: async (
    file: File,
    roleContext?: { targetJobPosition?: string; targetJobDescription?: string },
  ) => {
    try {
      const formData = new FormData();
      formData.append("resume", file);
      if (roleContext?.targetJobPosition?.trim()) {
        formData.append(
          "targetJobPosition",
          roleContext.targetJobPosition.trim(),
        );
      }
      if (roleContext?.targetJobDescription?.trim()) {
        formData.append(
          "targetJobDescription",
          roleContext.targetJobDescription.trim(),
        );
      }

      const token = getAuthToken();

      if (!token) {
        throw new Error("401: Authentication required. Please log in.");
      }

      const response = await fetch(
        `${API_BASE_URL}/candidates/analyze-resume`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      const data = await response.json();

      // Handle specific HTTP status codes
      if (!response.ok) {
        // 401 Unauthorized - Session expired
        if (response.status === 401) {
          removeAuthToken();
          window.dispatchEvent(new CustomEvent("unauthorized"));
          throw new Error(
            "401: Your session has expired. Please log in again.",
          );
        }

        // 500 Server Error - Resume parsing failed
        if (response.status === 500) {
          const errorMessage = data.message || data.error || "Server error";
          throw new Error(
            `500: Server error: Unable to parse resume. ${errorMessage}`,
          );
        }

        // 413 Payload Too Large
        if (response.status === 413) {
          throw new Error(
            "File size is too large. Please upload a file smaller than 10MB.",
          );
        }

        // 415 Unsupported Media Type
        if (response.status === 415) {
          throw new Error(
            "Unsupported file format. Please upload a PDF, DOC, or DOCX file.",
          );
        }

        // Generic error
        const errorMessage =
          data.message || data.error || "Failed to analyze resume";
        throw new Error(`${response.status}: ${errorMessage}`);
      }

      return data;
    } catch (error: any) {
      // Network errors or other exceptions
      if (!error.message?.includes(":")) {
        // If error doesn't already have a status code, wrap it
        throw new Error(
          `Network error: ${error.message || "Unable to connect to server"}`,
        );
      }
      // Re-throw errors that already have formatting
      throw error;
    }
  },

  regenerateResumeAnalysis: (roleContext?: {
    targetJobPosition?: string;
    targetJobDescription?: string;
  }) =>
    request<{
      extractedSkills: Array<{
        name: string;
        category: string;
        level?: number;
      }>;
      skillGaps: Array<{
        skill: string;
        importance: string;
        recommendation: string;
      }>;
      suggestedQuestions: Array<{
        question: string;
        category: string;
        difficulty: string;
      }>;
      matchScore: number;
      analyzedAt: string;
      fileName: string;
      targetJobPosition?: string;
      targetJobDescription?: string;
    }>("/candidates/resume-analysis/regenerate", {
      method: "POST",
      body: {
        targetJobPosition: roleContext?.targetJobPosition,
        targetJobDescription: roleContext?.targetJobDescription,
      },
    }),

  updateCandidate: (id: string, data: any) =>
    request(`/candidates/${id}`, { method: "PUT", body: data }),

  // Dashboard APIs
  getDashboardStats: () => request("/candidates/dashboard/stats"),
  getRecentInterviews: () => request("/candidates/dashboard/recent-interviews"),
  getTopSkills: () => request("/candidates/dashboard/skills"),

  // Interviews
  getInterviews: (filters?: Record<string, any>) =>
    request<any[]>("/interviews", { params: filters }),

  getInterview: (id: string) => request<any>(`/interviews/${id}`),

  createInterview: (data: any) =>
    request("/interviews", { method: "POST", body: data }),

  updateInterview: (id: string, data: any) =>
    request(`/interviews/${id}`, { method: "PUT", body: data }),

  submitInterviewFeedback: (id: string, feedback: any) =>
    request(`/interviews/${id}/feedback`, { method: "POST", body: feedback }),

  // Job Positions
  getPositions: (filters?: { search?: string; department?: string }) =>
    request<any[]>("/positions", { params: filters }),

  getPosition: (id: string) => request<any>(`/positions/${id}`),

  createPosition: (data: any) =>
    request("/positions", { method: "POST", body: data }),

  updatePosition: (id: string, data: any) =>
    request(`/positions/${id}`, { method: "PUT", body: data }),

  deletePosition: (id: string) =>
    request(`/positions/${id}`, { method: "DELETE" }),

  togglePositionStatus: (id: string) =>
    request(`/positions/${id}/status`, { method: "PATCH" }),

  // Resume
  uploadResume: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const token = getAuthToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return fetch(`${API_BASE_URL}/resume/upload`, {
      method: "POST",
      headers,
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => ({
        success: true,
        data,
      }))
      .catch((error) => ({
        success: false,
        error: error.message,
      }));
  },

  // Profile Management
  updateProfile: (data: any) =>
    request<any>("/auth/profile", { method: "PUT", body: data }),

  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => request("/auth/change-password", { method: "POST", body: data }),

  deleteAccount: (password: string) =>
    request("/auth/account", { method: "DELETE", body: { password } }),

  // HR Dashboard
  getHRDashboardMetrics: () =>
    request<any>("/dashboard/hr/metrics", { method: "GET" }),

  getRecentApplications: () =>
    request<any[]>("/dashboard/hr/recent-applications", { method: "GET" }),

  getWeeklyInterviews: () =>
    request<any[]>("/dashboard/hr/weekly-interviews", { method: "GET" }),

  getDepartmentAnalytics: () =>
    request<any[]>("/dashboard/hr/department-analytics", { method: "GET" }),

  // Search
  globalSearch: (query: string) =>
    request<{ results: any[]; total: number; query: string }>("/search", {
      params: { q: query },
    }),

  // Interview Templates (HR-created interviews)
  createInterviewTemplate: (data: {
    jobPosition: string;
    jobDescription: string;
    interviewType: "mock" | "live";
    interviewModes: string[];
    duration: number;
    availability: { type: "anytime" | "scheduled"; scheduledDate?: string };
    visibility: "public" | "private";
    aiSettings: {
      difficultyLevel: "junior" | "mid" | "senior";
      autoScore: boolean;
      enableAiFeedback: boolean;
    };
    questions?: Array<{ text: string; type: string; expectedAnswer?: string }>;
  }) => request("/interview-templates", { method: "POST", body: data }),

  getInterviewTemplates: (filters?: {
    status?: string;
    interviewType?: string;
  }) => request<any[]>("/interview-templates", { params: filters }),

  getInterviewTemplate: (id: string) =>
    request<any>(`/interview-templates/${id}`),

  updateInterviewTemplate: (id: string, data: any) =>
    request(`/interview-templates/${id}`, { method: "PUT", body: data }),

  deleteInterviewTemplate: (id: string) =>
    request(`/interview-templates/${id}`, { method: "DELETE" }),

  generateInterviewQuestions: (data: {
    jobPosition: string;
    jobDescription: string;
    interviewModes: string[];
    difficultyLevel: "junior" | "mid" | "senior";
    questionCount?: number;
    duration?: string;
  }) =>
    request<Array<{ text: string; type: string; expectedAnswer?: string }>>(
      "/interview-templates/generate-questions",
      { method: "POST", body: data },
    ),

  getPublicInterviewTemplates: (interviewType?: "mock" | "live") =>
    request<any[]>("/interview-templates/public", {
      params: { interviewType },
    }),

  // Interview Session (Candidate side)
  getPublicInterview: (shareableLink: string) =>
    request<{
      id: string;
      jobPosition: string;
      jobDescription: string;
      interviewType: "mock" | "live";
      duration: number;
      questionCount: number;
      aiSettings: {
        difficultyLevel: string;
        autoScore: boolean;
        enableAiFeedback: boolean;
      };
    }>(`/interview-session/public/${shareableLink}`),

  startInterviewSession: (data: {
    shareableLink: string;
    candidateName: string;
    candidateEmail: string;
  }) =>
    request<{
      sessionId: string;
      jobPosition: string;
      duration: number;
      totalQuestions: number;
      currentQuestion: { index: number; text: string; type: string };
      aiSettings: any;
    }>("/interview-session/start", { method: "POST", body: data }),

  submitInterviewResponse: (data: { sessionId: string; response: string }) =>
    request<{
      aiResponse: string;
      isFollowUp: boolean;
      currentQuestionIndex: number;
      totalQuestions: number;
      nextQuestion: { index: number; text: string; type: string } | null;
      isComplete: boolean;
    }>("/interview-session/respond", { method: "POST", body: data }),

  endInterviewSession: (sessionId: string) =>
    request<{
      candidateName: string;
      jobTitle: string;
      questionsAnswered: number;
      totalQuestions: number;
      duration: string;
      transcript: Array<{ speaker: string; text: string; timestamp: string }>;
      summary: string;
    }>("/interview-session/end", { method: "POST", body: { sessionId } }),

  getInterviewSessionStatus: (sessionId: string) =>
    request<{
      status: "active" | "completed" | "abandoned";
      currentQuestionIndex: number;
      totalQuestions: number;
      startedAt: string;
    }>(`/interview-session/${sessionId}/status`),

  // Mock Interview Session APIs
  createMockInterviewSession: (data: {
    sessionId: string;
    position: string;
    jobDescription: string;
    duration: number;
    questionCount: number;
    difficulty: string;
    questions: Array<{
      id: number;
      category: string;
      difficulty: string;
      text: string;
      duration: number;
    }>;
  }) =>
    request<{
      sessionId: string;
      position: string;
      jobDescription: string;
      duration: number;
      questionCount: number;
      difficulty: string;
      status: string;
      questions: any[];
      createdAt: string;
    }>("/interviews/mock-interviews/sessions", {
      method: "POST",
      body: data,
    }),

  getMockInterviewSession: (sessionId: string) =>
    request<MockInterviewSessionDetail>(`/interviews/mock-interviews/sessions/${sessionId}`),

  /** v2: Completed mock interview history (full session documents). Uses GET /sessions?status=completed&full=true. */
  getMockInterviewHistoryV2: (params?: { limit?: number; page?: number }) =>
    request<{
      sessions: MockInterviewSessionDetail[];
      pagination: { total: number; page: number; limit: number; totalPages: number };
    }>("/interviews/mock-interviews/sessions", {
      params: { status: "completed", full: "true", limit: params?.limit ?? 20, page: params?.page ?? 1 },
    }),

  updateMockInterviewSystemCheck: (sessionId: string, passed: boolean) =>
    request<{
      sessionId: string;
      systemCheckPassed: boolean;
    }>(`/interviews/mock-interviews/sessions/${sessionId}/system-check`, {
      method: "PUT",
      body: { passed },
    }),

  startMockInterviewSession: (sessionId: string) =>
    request<{
      sessionId: string;
      status: string;
      startedAt: string;
      currentQuestionIndex: number;
      firstQuestion: any;
    }>(`/interviews/mock-interviews/sessions/${sessionId}/start`, {
      method: "PUT",
    }),

  getMockInterviewHistory: (params?: {
    status?: string;
    limit?: number;
    page?: number;
  }) =>
    request<{
      sessions: any[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }>("/interviews/mock-interviews/sessions", { params }),

  // Submit a response to a question and get AI feedback with analytics
  submitMockInterviewResponse: (
    sessionId: string,
    data: {
      questionIndex: number;
      response: string;
      responseTime?: number;
    },
  ) =>
    request<{
      aiResponse: string;
      shouldMoveToNext: boolean;
      isFollowUp: boolean;
      aiAnalysis: {
        score: number;
        feedback: string;
        strengths: string[];
        improvements: string[];
        metrics: {
          confidence: number;
          clarity: number;
          pace: number;
          technicalAccuracy: number;
          fillerWords: number;
          wordCount: number;
          responseTime: number;
        };
      };
      tips: Array<{ type: "success" | "warning" | "info"; message: string }>;
      currentQuestionIndex: number;
      nextQuestion: any | null;
    }>(`/interviews/mock-interviews/sessions/${sessionId}/respond`, {
      method: "POST",
      body: data,
    }),

  // Complete the mock interview session and get final metrics.
  // Optional payload for VAPI/voice flow: transcript, qaPairs, durationSeconds — stored in DB with pattern metrics.
  completeMockInterviewSession: (
    sessionId: string,
    payload?: {
      transcript?: Array<{
        speaker: "ai" | "candidate";
        text: string;
        timestamp: string;
      }>;
      qaPairs?: Array<{ question: string; answer: string }>;
      durationSeconds?: number;
      speakingPatterns?: {
        fillerWords: number;
        avgResponseTimeSeconds: number;
        totalWords: number;
        avgWordsPerMinute: number;
      };
    },
  ) =>
    request<{
      sessionId: string;
      status: string;
      completedAt: string;
      metrics: {
        overallScore: number;
        confidence: number;
        clarity: number;
        technicalAccuracy: number;
        communicationSkills: number;
        fillerWords: number;
        averageResponseTime: number;
        totalWordsSpoken?: number;
        speakingPaceWPM?: number;
        overallRating?: string;
        recommendation?: string;
        aiAnalysisPercentage?: number;
        resumeMatchPercentage?: number;
      };
      summary: string;
      summaryStructured?: {
        strengths?: string[];
        areasForImprovement?: string[];
        recommendations?: string[];
        keyInsights?: string[];
      };
      questionsAnswered: number;
      totalQuestions: number;
    }>(`/interviews/mock-interviews/sessions/${sessionId}/complete`, {
      method: "PUT",
      body: payload ?? {},
    }),

  apiLogout: () => request("/auth/logout", { method: "POST" }),
};

// Export token management functions
export { getAuthToken, setAuthToken, removeAuthToken };

// Set up unauthorized event listener
if (typeof window !== "undefined") {
  window.addEventListener("unauthorized", () => {
    // This can be handled by the app to redirect to login
    console.warn("User session expired. Please log in again.");
  });
}

export default api;
