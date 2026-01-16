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
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    role: "candidate" | "hr",
    companyName?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // Initialize user from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
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

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Call the API login endpoint
      const response = await api.login(email, password);

      if (response.success && response.data?.accessToken) {
        // Store the access token
        setAuthToken(response.data.accessToken);

        // Fetch the current user details
        const userResponse = await api.getCurrentUser();
        if (userResponse.success && userResponse.data) {
          setUser(userResponse.data);
        } else {
          throw new Error("Failed to fetch user details after login");
        }
      } else {
        throw new Error(response.error || "Login failed");
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
    companyName?: string
  ) => {
    setLoading(true);
    try {
      // Try API first
      const response = await api.register(name, email, password, role, companyName);

      if (response.success && response.data?.accessToken) {
        setAuthToken(response.data.accessToken);
        // Fetch user info
        const userResponse = await api.getCurrentUser();
        if (userResponse.success) {
          setUser(userResponse.data);
        }
      } else {
        // Show error message
        throw new Error(response.error || "Registration failed");
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
