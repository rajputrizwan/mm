import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { User } from "../types";
import api, {
  getAuthToken,
  setAuthToken,
  removeAuthToken,
} from "../services/api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string,
    rememberMe?: boolean,
  ) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    role: "candidate" | "hr",
    companyName?: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize user from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      const token = getAuthToken();
      if (token) {
        try {
          const response = await api.getCurrentUser();
          if (response.success && response.data) {
            setUser(response.data);
          } else {
            // Token is invalid, clear it
            removeAuthToken();
          }
        } catch (error) {
          console.error("Failed to fetch current user:", error);
          removeAuthToken();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Listen for unauthorized events
  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      removeAuthToken();
    };

    window.addEventListener("unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("unauthorized", handleUnauthorized);
    };
  }, []);

  const login = async (
    email: string,
    password: string,
    rememberMe: boolean = false,
  ) => {
    setLoading(true);
    try {
      // Call the API login endpoint
      const response = await api.login(email, password, rememberMe);

      if (response.success && response.data?.accessToken) {
        // Store token in localStorage (persists) or sessionStorage (session only)
        setAuthToken(response.data.accessToken, rememberMe);

        // Fetch the current user details
        const userResponse = await api.getCurrentUser();
        if (userResponse.success && userResponse.data) {
          setUser(userResponse.data);
        } else {
          throw new Error("Failed to fetch user details after login");
        }
      } else {
        throw new Error(response.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      // Clear any stored tokens
      removeAuthToken();
      // Re-throw error to be handled by the component
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: "candidate" | "hr",
    companyName?: string,
  ) => {
    setLoading(true);
    try {
      const response = await api.register(
        name,
        email,
        password,
        role,
        companyName,
      );

      if (response.success) {
        if (response.data?.accessToken) {
          // Legacy / direct-login path (kept for backward compatibility)
          setAuthToken(response.data.accessToken);
          const userResponse = await api.getCurrentUser();
          if (userResponse.success) {
            setUser(userResponse.data);
          }
        }
        // If no accessToken → email verification required.
        // Register.tsx handles the "check your inbox" UI — nothing to do here.
      } else {
        if (response.statusCode === 409) {
          throw new Error(
            "An account with this email already exists. Please sign in instead.",
          );
        }
        throw new Error(response.error || response.message || "Registration failed");
      }
    } catch (error) {
      console.error("Register error:", error);
      throw error; // Re-throw to handle in component
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      // Try API logout
      await api.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      removeAuthToken();
      // Clear any user-specific cached data so it never leaks to the next account
      localStorage.removeItem("resumeAnalysis");
      // Clear remember-me email only if user didn't opt to remember
      const rememberMe = localStorage.getItem("rememberMe") === "true";
      if (!rememberMe) {
        localStorage.removeItem("rememberedEmail");
      }
      // Signal AppContext to clear its notification list
      window.dispatchEvent(new CustomEvent("userLogout"));
      setUser(null);
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await api.getCurrentUser();
      if (response.success && response.data) {
        setUser(response.data);
      } else {
        removeAuthToken();
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
