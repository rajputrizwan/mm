import { useCallback, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import * as apiService from "@/services/api";

/**
 * Custom hook for authentication operations
 */
export const useAuthOperations = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiService.login(email, password);
        auth.login(response.user);
        navigate("/candidate/dashboard");
        return response;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Login failed";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [auth, navigate]
  );

  const register = useCallback(
    async (
      email: string,
      password: string,
      name: string,
      role: "candidate" | "hr"
    ) => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiService.register(email, password, name, role);
        auth.login(response.user);
        navigate(
          role === "candidate" ? "/candidate/dashboard" : "/hr/dashboard"
        );
        return response;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Registration failed";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [auth, navigate]
  );

  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await apiService.logout();
      auth.logout();
      navigate("/login");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Logout failed";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [auth, navigate]);

  const resetPassword = useCallback(async (email: string) => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return {
        success: true,
        message: "Password reset link sent to your email",
      };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Password reset failed";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(
    async (name: string, email: string, phone?: string) => {
      setLoading(true);
      setError(null);

      try {
        // Simulate API call
        const updatedUser = {
          ...auth.user,
          name,
          email,
          phone,
        };
        auth.login(updatedUser);
        return { success: true, user: updatedUser };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Profile update failed";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [auth]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    login,
    register,
    logout,
    resetPassword,
    updateProfile,
    error,
    loading,
    clearError,
    isAuthenticated: auth.isAuthenticated,
    user: auth.user,
    role: auth.user?.role,
  };
};
