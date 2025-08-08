// // src/contexts/AuthContext.js - PRODUCTION VERSION
// import { createContext, useContext, useEffect, useState } from "react";
// import toast from "react-hot-toast";
// import { authApi } from 'lib/api';

// const AuthContext = createContext();

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// };

// export const AuthProvider = ({ children }) => {
//   const [currentUser, setCurrentUser] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isLoggedIn, setIsLoggedIn] = useState(false);

//   // Check for existing session on mount
//   useEffect(() => {
//     checkAuthStatus();
//   }, []);

//   const checkAuthStatus = async () => {
//     try {
//       const token = localStorage.getItem("auth_token");
//       if (token) {
//         const response = await authApi.getProfile();
//         setCurrentUser(response.data);
//         setIsLoggedIn(true);
//       }
//     } catch (error) {
//       console.error("Auth check failed:", error);
//       localStorage.removeItem("auth_token");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const login = async (email, password) => {
//     try {
//       setIsLoading(true);
//       const response = await authApi.login({ email, password });

//       // Store token and user data
//       localStorage.setItem("auth_token", response.data.token);
//       setCurrentUser(response.data.user);
//       setIsLoggedIn(true);

//       toast.success("Welcome back!");
//       return { success: true };
//     } catch (error) {
//       console.error("Login failed:", error);
//       toast.error(error.message || "Login failed");
//       return { success: false, error: error.message };
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const register = async (userData) => {
//     try {
//       setIsLoading(true);
//       const response = await authApi.register(userData);

//       localStorage.setItem("auth_token", response.data.token);
//       setCurrentUser(response.data.user);
//       setIsLoggedIn(true);

//       toast.success("Account created successfully!");
//       return { success: true };
//     } catch (error) {
//       console.error("Registration failed:", error);
//       toast.error(error.message || "Registration failed");
//       return { success: false, error: error.message };
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const updateProfile = async (profileData) => {
//     try {
//       setIsLoading(true);
//       const response = await authApi.updateProfile(profileData);
//       setCurrentUser(response.data);
//       toast.success("Profile updated successfully!");
//       return { success: true };
//     } catch (error) {
//       console.error("Profile update failed:", error);
//       toast.error(error.message || "Update failed");
//       return { success: false, error: error.message };
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const logout = () => {
//     localStorage.removeItem("auth_token");
//     setCurrentUser(null);
//     setIsLoggedIn(false);
//     toast.success("Logged out successfully");
//   };

//   const value = {
//     currentUser,
//     isLoggedIn,
//     isLoading,
//     login,
//     register,
//     logout,
//     updateProfile,
//     checkAuthStatus,
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };
// src/contexts/AuthContext.js - SIMPLE MOCK VERSION
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // Simple mock user - always logged in for development
  const [currentUser] = useState({
    id: "user-1",
    email: "john@example.com",
    full_name: "John Doe",
    avatar_url: null,
    phone: null,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  });

  const [isLoggedIn] = useState(true); // Always logged in for now
  const [isLoading, setIsLoading] = useState(true);

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Mock functions for later implementation
  const login = async (email, password) => {
    return { success: true };
  };

  const register = async (userData) => {
    return { success: true };
  };

  const updateProfile = async (profileData) => {
    return { success: true };
  };

  const logout = () => {
    // No-op for now
    console.log("Mock logout - would logout in real app");
  };

  const value = {
    currentUser,
    isLoggedIn,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
