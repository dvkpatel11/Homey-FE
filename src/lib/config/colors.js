// ==========================================
// src/lib/config/colors.js
// ==========================================

export const VIOLET_PALETTE = {
  // Core violet colors
  violet: {
    50: "#f3f0ff",
    100: "#e9e2ff",
    200: "#d4c5ff",
    300: "#b79aff",
    400: "#9c6cff",
    500: "#8b5cf6", // Primary violet
    600: "#7c3aed", // Dark violet
    700: "#6d28d9", // Deeper violet
    800: "#5b21b6", // Darkest violet
    900: "#4c1d95",
  },

  // Bright variants for accents
  violetBright: {
    400: "#a78bfa",
    500: "#9f7aea",
    600: "#8b5cf6",
  },

  // Glass-specific colors with opacity
  glass: {
    violet: {
      light: "rgba(139, 92, 246, 0.1)",
      medium: "rgba(139, 92, 246, 0.15)",
      strong: "rgba(139, 92, 246, 0.25)",
      border: "rgba(139, 92, 246, 0.2)",
      glow: "rgba(139, 92, 246, 0.4)",
    },

    // Glass backgrounds
    background: {
      dark: "rgba(0, 0, 0, 0.25)",
      light: "rgba(255, 255, 255, 0.15)",
      subtle: "rgba(255, 255, 255, 0.05)",
    },

    // Glass borders
    border: {
      light: "rgba(255, 255, 255, 0.1)",
      medium: "rgba(255, 255, 255, 0.15)",
      strong: "rgba(255, 255, 255, 0.25)",
    },
  },

  // Status colors that complement violet
  status: {
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#3b82f6",
  },

  // Background colors
  background: {
    black: "#0a0a0a",
    beige: "#f5f5dc",
    darkPattern: "#0f0f0f",
    lightPattern: "#fafafa",
  },
};

// Theme-specific color mappings
export const LIGHT_THEME_COLORS = {
  primary: VIOLET_PALETTE.violet[600],
  primaryBright: VIOLET_PALETTE.violetBright[400],
  primaryDark: VIOLET_PALETTE.violet[700],

  glassBackground: VIOLET_PALETTE.glass.background.light,
  glassBorder: VIOLET_PALETTE.glass.border.medium,
  glassViolet: VIOLET_PALETTE.glass.violet.light,

  background: VIOLET_PALETTE.background.beige,
  text: "#0f172a",
  textSecondary: "#475569",
  textMuted: "#64748b",
};

export const DARK_THEME_COLORS = {
  primary: VIOLET_PALETTE.violet[500],
  primaryBright: VIOLET_PALETTE.violetBright[400],
  primaryDark: VIOLET_PALETTE.violet[700],

  glassBackground: VIOLET_PALETTE.glass.background.dark,
  glassBorder: VIOLET_PALETTE.glass.border.light,
  glassViolet: VIOLET_PALETTE.glass.violet.medium,

  background: VIOLET_PALETTE.background.black,
  text: "#f8fafc",
  textSecondary: "rgba(248, 250, 252, 0.8)",
  textMuted: "rgba(248, 250, 252, 0.6)",
};

// CSS Custom Property generators
export const generateCSSVars = (theme) => {
  return {
    "--homey-primary": theme.primary,
    "--homey-primary-bright": theme.primaryBright,
    "--homey-primary-dark": theme.primaryDark,
    "--homey-glass-bg": theme.glassBackground,
    "--homey-glass-border": theme.glassBorder,
    "--homey-glass-violet": theme.glassViolet,
    "--homey-bg": theme.background,
    "--homey-text": theme.text,
    "--homey-text-secondary": theme.textSecondary,
    "--homey-text-muted": theme.textMuted,
  };
};

// Tailwind color object
export const TAILWIND_COLORS = {
  "homey-violet": VIOLET_PALETTE.violet,
  "homey-violet-bright": VIOLET_PALETTE.violetBright,
  "homey-glass": VIOLET_PALETTE.glass.violet,
  "homey-status": VIOLET_PALETTE.status,
};
