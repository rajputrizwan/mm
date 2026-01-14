/**
 * API Service
 * Centralized API client for all HTTP requests
 * Handles authentication, error handling, and request/response interceptors
 */

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

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
  config: RequestConfig = {}
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

      return {
        success: false,
        error: data.error || data.message || "An error occurred",
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
  login: (email: string, password: string, role: "candidate" | "hr") =>
    request<{ token: string; user: any }>("/auth/login", {
      method: "POST",
      body: { email, password, role },
    }),

  register: (
    name: string,
    email: string,
    password: string,
    role: "candidate" | "hr"
  ) =>
    request<{ token: string; user: any }>("/auth/register", {
      method: "POST",
      body: { name, email, password, role },
    }),

  logout: () => request("/auth/logout", { method: "POST" }),

  getCurrentUser: () => request<any>("/auth/me", { method: "GET" }),

  refreshToken: () =>
    request<{ token: string }>("/auth/refresh", { method: "POST" }),

  // Candidates
  getCandidates: (filters?: Record<string, any>) =>
    request<any[]>("/candidates", { params: filters }),

  getCandidate: (id: string) => request<any>(`/candidates/${id}`),

  updateCandidate: (id: string, data: any) =>
    request(`/candidates/${id}`, { method: "PUT", body: data }),

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
  getPositions: (filters?: Record<string, any>) =>
    request<any[]>("/positions", { params: filters }),

  getPosition: (id: string) => request<any>(`/positions/${id}`),

  createPosition: (data: any) =>
    request("/positions", { method: "POST", body: data }),

  updatePosition: (id: string, data: any) =>
    request(`/positions/${id}`, { method: "PUT", body: data }),

  deletePosition: (id: string) =>
    request(`/positions/${id}`, { method: "DELETE" }),

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

  getResumeAnalysis: (resumeId: string) =>
    request<any>(`/resume/${resumeId}/analysis`),

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
