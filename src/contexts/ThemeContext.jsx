import { createContext, useContext, useEffect, useReducer } from "react";
import { useThemeSettings } from "../hooks/useLocalStorage";

const ThemeContext = createContext();

// Theme reducer
const themeReducer = (state, action) => {
  switch (action.type) {
    case "SET_THEME":
      return {
        ...state,
        theme: action.payload,
      };
    case "SET_SYSTEM_THEME":
      return {
        ...state,
        systemTheme: action.payload,
      };
    case "TOGGLE_THEME":
      return {
        ...state,
        theme: state.theme === "light" ? "dark" : "light",
      };
    case "SET_HIGH_CONTRAST":
      return {
        ...state,
        highContrast: action.payload,
      };
    case "SET_REDUCED_MOTION":
      return {
        ...state,
        reducedMotion: action.payload,
      };
    default:
      return state;
  }
};

const initialState = {
  theme: "system", // 'light', 'dark', 'system'
  systemTheme: "light",
  highContrast: false,
  reducedMotion: false,
};

export const ThemeProvider = ({ children }) => {
  const [state, dispatch] = useReducer(themeReducer, initialState);
  const {
    theme: persistedTheme,
    setTheme: setPersistedTheme,
    highContrast,
    setHighContrast,
    reducedMotion,
    setReducedMotion,
  } = useThemeSettings();
  // Detect system theme
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e) => {
      dispatch({ type: "SET_SYSTEM_THEME", payload: e.matches ? "dark" : "light" });
    };

    // Set initial system theme
    dispatch({ type: "SET_SYSTEM_THEME", payload: mediaQuery.matches ? "dark" : "light" });

    // Listen for changes
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Detect system motion preferences
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handleChange = (e) => {
      if (!reducedMotion) {
        // Only auto-set if user hasn't manually set preference
        dispatch({ type: "SET_REDUCED_MOTION", payload: e.matches });
      }
    };

    // Set initial preference
    if (!reducedMotion) {
      dispatch({ type: "SET_REDUCED_MOTION", payload: mediaQuery.matches });
    }

    // Listen for changes
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [reducedMotion]);

  // Sync with localStorage
  useEffect(() => {
    dispatch({ type: "SET_THEME", payload: persistedTheme });
  }, [persistedTheme]);

  useEffect(() => {
    dispatch({ type: "SET_HIGH_CONTRAST", payload: highContrast });
  }, [highContrast]);

  useEffect(() => {
    dispatch({ type: "SET_REDUCED_MOTION", payload: reducedMotion });
  }, [reducedMotion]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    const effectiveTheme = state.theme === "system" ? state.systemTheme : state.theme;

    // Remove existing theme classes
    root.classList.remove("light", "dark", "high-contrast", "reduced-motion");

    // Add current theme class
    root.classList.add(effectiveTheme);

    // Add accessibility classes
    if (state.highContrast) {
      root.classList.add("high-contrast");
    }

    if (state.reducedMotion) {
      root.classList.add("reduced-motion");
    }

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", effectiveTheme === "dark" ? "#0f172a" : "#ffffff");
    }
  }, [state.theme, state.systemTheme, state.highContrast, state.reducedMotion]);

  // Theme methods
  const setTheme = (theme) => {
    setPersistedTheme(theme);
  };

  const toggleTheme = () => {
    const newTheme = state.theme === "light" ? "dark" : "light";
    setTheme(newTheme);
  };

  const setHighContrastMode = (enabled) => {
    setHighContrast(enabled);
  };

  const setReducedMotionMode = (enabled) => {
    setReducedMotion(enabled);
  };

  // Get effective theme (resolves 'system' to actual theme)
  const getEffectiveTheme = () => {
    return state.theme === "system" ? state.systemTheme : state.theme;
  };

  const isDark = getEffectiveTheme() === "dark";
  const isLight = getEffectiveTheme() === "light";

  const value = {
    ...state,
    setTheme,
    toggleTheme,
    setHighContrastMode,
    setReducedMotionMode,
    getEffectiveTheme,
    isDark,
    isLight,
    effectiveTheme: getEffectiveTheme(),
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export default ThemeContext;
