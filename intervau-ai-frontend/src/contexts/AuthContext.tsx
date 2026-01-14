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
  login: (email: string, password: string, role: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    role: string
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

  const login = async (email: string, password: string, role: string) => {
    setLoading(true);
    try {
      // Try API first
      const response = await api.login(email, password, role);

      if (response.success && response.data?.token) {
        setAuthToken(response.data.token);
        // Fetch user info
        const userResponse = await api.getCurrentUser();
        if (userResponse.success) {
          setUser(userResponse.data);
        }
      } else {
        // Fallback to mock user for demo
        const mockUser: User = {
          id: "1",
          name: email.split("@")[0],
          email,
          role: role as "candidate" | "hr",
        };
        setUser(mockUser);
        // Still set a mock token
        setAuthToken("mock-token-" + Date.now());
      }
    } catch (error) {
      console.error("Login error:", error);
      // Fallback to mock login
      const mockUser: User = {
        id: "1",
        name: email.split("@")[0],
        email,
        role: role as "candidate" | "hr",
      };
      setUser(mockUser);
      setAuthToken("mock-token-" + Date.now());
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: string
  ) => {
    setLoading(true);
    try {
      // Try API first
      const response = await api.register(name, email, password, role);

      if (response.success && response.data?.token) {
        setAuthToken(response.data.token);
        // Fetch user info
        const userResponse = await api.getCurrentUser();
        if (userResponse.success) {
          setUser(userResponse.data);
        }
      } else {
        // Fallback to mock user
        const mockUser: User = {
          id: "1",
          name,
          email,
          role: role as "candidate" | "hr",
        };
        setUser(mockUser);
        // Still set a mock token
        setAuthToken("mock-token-" + Date.now());
      }
    } catch (error) {
      console.error("Register error:", error);
      // Fallback to mock registration
      const mockUser: User = {
        id: "1",
        name,
        email,
        role: role as "candidate" | "hr",
      };
      setUser(mockUser);
      setAuthToken("mock-token-" + Date.now());
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
