/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    // Mobile-first breakpoints (default sm:640px, md:768px, etc.)
    screens: {
      xs: "475px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      colors: {
        // Runtime theming via CSS variables
        primary: {
          DEFAULT: "var(--color-primary)",
          50: "var(--color-primary-50, #f3f0ff)",
          100: "var(--color-primary-100, #e9e2ff)",
          500: "var(--color-primary)",
          600: "var(--color-primary-600, #7c3aed)",
          700: "var(--color-primary-700, #6d28d9)",
        },
        glass: {
          DEFAULT: "var(--glass-bg)",
          border: "var(--glass-border)",
          strong: "rgba(255,255,255,0.08)",
          subtle: "rgba(255,255,255,0.03)",
        },
        surface: {
          DEFAULT: "var(--surface-primary, rgba(255,255,255,0.05))",
          secondary: "var(--surface-secondary, rgba(255,255,255,0.03))",
          accent: "var(--surface-accent, rgba(124,58,237,0.1))",
        },
      },
      spacing: {
        "safe-top": "env(safe-area-inset-top)",
        "safe-bottom": "env(safe-area-inset-bottom)",
        "safe-left": "env(safe-area-inset-left)",
        "safe-right": "env(safe-area-inset-right)",
      },
      backdropBlur: {
        xs: "2px",
        glass: "var(--glass-blur)",
        "3xl": "64px",
      },
      borderRadius: {
        glass: "1rem",
        "glass-lg": "1.25rem",
        "glass-xl": "1.5rem",
      },
      boxShadow: {
        glass: "var(--glass-shadow)",
        "glass-lg": "0 20px 40px rgba(0, 0, 0, 0.35)",
        "glass-inset":
          "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 var(--glass-inset-1), inset 0 -1px 0 var(--glass-inset-2)",
        mobile: "0 4px 16px rgba(0, 0, 0, 0.2)",
        "3xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        "glass-shimmer": "glassShimmer 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        glassShimmer: {
          "0%, 100%": { backgroundPosition: "-200% 0" },
          "50%": { backgroundPosition: "200% 0" },
        },
      },
      typography: {
        DEFAULT: {
          css: {
            "--tw-prose-body": "rgba(255, 255, 255, 0.8)",
            "--tw-prose-headings": "rgba(255, 255, 255, 0.95)",
          },
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/aspect-ratio"),
    // Custom plugin for mobile-first utilities
    function ({ addUtilities, theme }) {
      const newUtilities = {
        ".touch-manipulation": {
          "touch-action": "manipulation",
        },
        ".scrollbar-none": {
          "scrollbar-width": "none",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        },
        ".safe-area-inset": {
          "padding-top": "env(safe-area-inset-top)",
          "padding-bottom": "env(safe-area-inset-bottom)",
          "padding-left": "env(safe-area-inset-left)",
          "padding-right": "env(safe-area-inset-right)",
        },
        ".text-glass": {
          color: "rgba(255, 255, 255, 0.9)",
          "text-shadow": "0 1px 2px rgba(0, 0, 0, 0.3)",
        },
        ".text-glass-muted": {
          color: "rgba(255, 255, 255, 0.7)",
        },
      };
      addUtilities(newUtilities);
    },
  ],
};
