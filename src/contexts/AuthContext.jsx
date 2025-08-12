// src/contexts/AuthContext.js - Enhanced Mobile-First Version
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // Enhanced mock user with more realistic data
  const [currentUser] = useState({
    id: "user-1",
    email: "john@homey.app",
    full_name: "John Doe",
    first_name: "John",
    last_name: "Doe",
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    phone: "+1 (555) 123-4567",
    preferences: {
      notifications: true,
      darkMode: false,
      language: "en",
      timezone: "America/New_York",
    },
    created_at: "2024-01-01T00:00:00Z",
    updated_at: new Date().toISOString(),
  });

  const [isLoggedIn] = useState(true); // Mock always logged in
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Simulate realistic loading time for mobile
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Simulate welcome back message
      if (isLoggedIn) {
        toast.success(`Welcome back, ${currentUser.first_name}!`);
      }
    }, 800); // Reduced from 1000ms for better perceived performance

    return () => clearTimeout(timer);
  }, [isLoggedIn, currentUser.first_name]);

  // Memoized functions to prevent unnecessary re-renders
  const login = useCallback(
    async (email, password) => {
      try {
        setIsLoading(true);
        setAuthError(null);

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock validation
        if (!email || !password) {
          throw new Error("Email and password are required");
        }

        if (!email.includes("@")) {
          throw new Error("Please enter a valid email address");
        }

        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters");
        }

        // Simulate success
        toast.success("Welcome to Homey!");
        return { success: true, user: currentUser };
      } catch (error) {
        setAuthError(error.message);
        toast.error(error.message);
        return { success: false, error: error.message };
      } finally {
        setIsLoading(false);
      }
    },
    [currentUser]
  );

  const register = useCallback(
    async (userData) => {
      try {
        setIsLoading(true);
        setAuthError(null);

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1200));

        // Mock validation
        const required = ["email", "password", "full_name"];
        for (const field of required) {
          if (!userData[field]) {
            throw new Error(`${field.replace("_", " ")} is required`);
          }
        }

        if (!userData.email.includes("@")) {
          throw new Error("Please enter a valid email address");
        }

        if (userData.password.length < 6) {
          throw new Error("Password must be at least 6 characters");
        }

        toast.success("Account created successfully!");
        return { success: true, user: { ...currentUser, ...userData } };
      } catch (error) {
        setAuthError(error.message);
        toast.error(error.message);
        return { success: false, error: error.message };
      } finally {
        setIsLoading(false);
      }
    },
    [currentUser]
  );

  const updateProfile = useCallback(
    async (profileData) => {
      try {
        setIsLoading(true);
        setAuthError(null);

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Mock validation
        if (profileData.email && !profileData.email.includes("@")) {
          throw new Error("Please enter a valid email address");
        }

        toast.success("Profile updated successfully!");
        return { success: true, user: { ...currentUser, ...profileData } };
      } catch (error) {
        setAuthError(error.message);
        toast.error(error.message);
        return { success: false, error: error.message };
      } finally {
        setIsLoading(false);
      }
    },
    [currentUser]
  );

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      setIsLoading(true);
      setAuthError(null);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (!currentPassword || !newPassword) {
        throw new Error("Both current and new passwords are required");
      }

      if (newPassword.length < 6) {
        throw new Error("New password must be at least 6 characters");
      }

      toast.success("Password changed successfully!");
      return { success: true };
    } catch (error) {
      setAuthError(error.message);
      toast.error(error.message);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    // Mock logout - in real app would clear tokens, etc.
    toast.success("See you later! 👋");
    console.log("Mock logout - would clear auth state in real app");
  }, []);

  const clearError = useCallback(() => {
    setAuthError(null);
  }, []);

  // Memoized value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      // State
      currentUser,
      isLoggedIn,
      isLoading,
      authError,

      // Computed values
      isAuthenticated: isLoggedIn && !isLoading,
      userInitials: currentUser
        ? `${currentUser.first_name?.[0] || ""}${currentUser.last_name?.[0] || ""}`.toUpperCase()
        : "",

      // Actions
      login,
      register,
      logout,
      updateProfile,
      changePassword,
      clearError,
    }),
    [currentUser, isLoggedIn, isLoading, authError, login, register, logout, updateProfile, changePassword, clearError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
