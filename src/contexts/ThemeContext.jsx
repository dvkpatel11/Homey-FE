// src/contexts/ThemeContext.js - Enhanced Mobile-First Theme Management
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Enhanced theme state with more options
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme) {
        return savedTheme === "dark";
      }
      // Auto-detect based on system preference
      return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    } catch {
      return false;
    }
  });

  const [accentColor, setAccentColor] = useState(() => {
    try {
      return localStorage.getItem("accentColor") || "purple";
    } catch {
      return "purple";
    }
  });

  const [fontSize, setFontSize] = useState(() => {
    try {
      return localStorage.getItem("fontSize") || "medium";
    } catch {
      return "medium";
    }
  });

  const [reducedMotion, setReducedMotion] = useState(() => {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  const [highContrast, setHighContrast] = useState(() => {
    return window.matchMedia && window.matchMedia("(prefers-contrast: high)").matches;
  });

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const highContrastQuery = window.matchMedia("(prefers-contrast: high)");

    const handleDarkModeChange = (e) => {
      // Only auto-switch if user hasn't manually set a preference
      const hasManualPreference = localStorage.getItem("theme");
      if (!hasManualPreference) {
        setIsDarkMode(e.matches);
      }
    };

    const handleReducedMotionChange = (e) => setReducedMotion(e.matches);
    const handleHighContrastChange = (e) => setHighContrast(e.matches);

    darkModeQuery.addEventListener("change", handleDarkModeChange);
    reducedMotionQuery.addEventListener("change", handleReducedMotionChange);
    highContrastQuery.addEventListener("change", handleHighContrastChange);

    return () => {
      darkModeQuery.removeEventListener("change", handleDarkModeChange);
      reducedMotionQuery.removeEventListener("change", handleReducedMotionChange);
      highContrastQuery.removeEventListener("change", handleHighContrastChange);
    };
  }, []);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;

    // Dark mode class
    root.classList.toggle("dark", isDarkMode);

    // High contrast mode
    root.classList.toggle("high-contrast", highContrast);

    // Reduced motion
    root.classList.toggle("reduce-motion", reducedMotion);

    // Font size
    root.classList.remove("text-sm", "text-base", "text-lg");
    switch (fontSize) {
      case "small":
        root.classList.add("text-sm");
        break;
      case "large":
        root.classList.add("text-lg");
        break;
      default:
        root.classList.add("text-base");
    }

    // Accent color CSS variables
    const accentColors = {
      purple: { primary: "#7c3aed", light: "#8b5cf6", dark: "#6d28d9" },
      blue: { primary: "#3b82f6", light: "#60a5fa", dark: "#2563eb" },
      green: { primary: "#10b981", light: "#34d399", dark: "#059669" },
      red: { primary: "#ef4444", light: "#f87171", dark: "#dc2626" },
      orange: { primary: "#f59e0b", light: "#fbbf24", dark: "#d97706" },
      pink: { primary: "#ec4899", light: "#f472b6", dark: "#db2777" },
    };

    const colors = accentColors[accentColor] || accentColors.purple;
    root.style.setProperty("--color-primary", colors.primary);
    root.style.setProperty("--color-primary-light", colors.light);
    root.style.setProperty("--color-primary-dark", colors.dark);

    // Persist preferences
    try {
      localStorage.setItem("theme", isDarkMode ? "dark" : "light");
      localStorage.setItem("accentColor", accentColor);
      localStorage.setItem("fontSize", fontSize);
    } catch (error) {
      console.error("Failed to save theme preferences:", error);
    }
  }, [isDarkMode, accentColor, fontSize, highContrast, reducedMotion]);

  // Memoized theme actions
  const toggleTheme = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  const changeAccentColor = useCallback((color) => {
    setAccentColor(color);
  }, []);

  const changeFontSize = useCallback((size) => {
    setFontSize(size);
  }, []);

  const resetToSystemPreferences = useCallback(() => {
    const systemDarkMode = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDarkMode(systemDarkMode);
    setAccentColor("purple");
    setFontSize("medium");

    // Clear manual preferences
    try {
      localStorage.removeItem("theme");
      localStorage.removeItem("accentColor");
      localStorage.removeItem("fontSize");
    } catch (error) {
      console.error("Failed to reset theme preferences:", error);
    }
  }, []);

  // Memoized theme classes and styles
  const themeClasses = useMemo(() => {
    const baseClasses = {
      // Background gradients
      bgClasses: isDarkMode
        ? "bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950"
        : "bg-gradient-to-br from-slate-100 via-gray-50 to-slate-100",

      // Glass components
      primaryGlass: "glass glass-hoverable glass-strong",
      cardGlass: "glass glass-inset",
      inputGlass: "glass",

      // Text classes
      textPrimary: "text-glass",
      textSecondary: "text-glass-secondary",
      textMuted: "text-glass-muted",

      // Button variants
      buttonPrimary: `glass glass-hoverable glass-lift bg-gradient-to-r from-primary to-primary-light border-primary/30`,
      buttonSecondary: "glass glass-hoverable glass-lift border-white/20",
      buttonDanger: "glass glass-hoverable glass-lift bg-gradient-to-r from-red-500 to-red-600 border-red-400/30",

      // Status colors
      success: "bg-gradient-to-r from-green-500 to-green-600",
      warning: "bg-gradient-to-r from-yellow-500 to-yellow-600",
      error: "bg-gradient-to-r from-red-500 to-red-600",
      info: "bg-gradient-to-r from-blue-500 to-blue-600",
    };

    // High contrast modifications
    if (highContrast) {
      return {
        ...baseClasses,
        bgClasses: isDarkMode ? "bg-black" : "bg-white",
        primaryGlass: "border-2 border-white bg-black/50",
        cardGlass: "border border-white bg-black/30",
        inputGlass: "border border-white bg-black/20",
      };
    }

    return baseClasses;
  }, [isDarkMode, highContrast]);

  // Color palette for the current theme
  const colorPalette = useMemo(
    () => ({
      primary: accentColor,
      available: ["purple", "blue", "green", "red", "orange", "pink"],
      isDark: isDarkMode,
      accessibility: {
        highContrast,
        reducedMotion,
        fontSize,
      },
    }),
    [accentColor, isDarkMode, highContrast, reducedMotion, fontSize]
  );

  // Memoized context value
  const value = useMemo(
    () => ({
      // Current state
      isDarkMode,
      accentColor,
      fontSize,
      reducedMotion,
      highContrast,

      // Theme classes and styling
      themeClasses,
      colorPalette,

      // Actions
      toggleTheme,
      changeAccentColor,
      changeFontSize,
      resetToSystemPreferences,

      // Utilities
      isSystemDarkMode: window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches,
      supportsColorScheme: window.matchMedia !== undefined,
    }),
    [
      isDarkMode,
      accentColor,
      fontSize,
      reducedMotion,
      highContrast,
      themeClasses,
      colorPalette,
      toggleTheme,
      changeAccentColor,
      changeFontSize,
      resetToSystemPreferences,
    ]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
