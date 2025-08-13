const { TAILWIND_COLORS } = require("./src/lib/config/colors.js");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
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
        // Import our violet palette
        ...TAILWIND_COLORS,

        // Runtime theming via CSS variables
        primary: {
          DEFAULT: "var(--homey-primary)",
          bright: "var(--homey-primary-bright)",
          dark: "var(--homey-primary-dark)",
        },

        // Glass system
        glass: {
          DEFAULT: "var(--homey-glass-bg)",
          border: "var(--homey-glass-border)",
          violet: "var(--homey-glass-violet)",
          subtle: "rgba(255,255,255,0.05)",
          strong: "rgba(255,255,255,0.15)",
        },

        // Text system
        text: {
          DEFAULT: "var(--homey-text)",
          secondary: "var(--homey-text-secondary)",
          muted: "var(--homey-text-muted)",
        },

        // Surface layers
        surface: {
          1: "rgba(255,255,255,0.05)",
          2: "rgba(255,255,255,0.08)",
          3: "rgba(255,255,255,0.12)",
          violet: "var(--homey-glass-violet)",
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
        glass: "16px",
        "glass-heavy": "24px",
        "3xl": "64px",
      },

      borderRadius: {
        glass: "1rem",
        "glass-lg": "1.25rem",
        "glass-xl": "1.5rem",
        "glass-2xl": "2rem",
      },

      boxShadow: {
        // Glass shadows
        glass: "0 8px 32px rgba(0, 0, 0, 0.12), 0 0 0 1px var(--homey-glass-border)",
        "glass-lg": "0 20px 40px rgba(0, 0, 0, 0.2), 0 0 0 1px var(--homey-glass-border)",
        "glass-violet": "0 8px 32px rgba(139, 92, 246, 0.15), 0 0 0 1px var(--homey-glass-violet)",
        "glass-hover": "0 20px 40px rgba(0, 0, 0, 0.25), 0 0 60px rgba(139, 92, 246, 0.2)",

        // Inset shadows
        "glass-inset": "inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(255, 255, 255, 0.05)",
        "glass-inset-lg": "inset 0 2px 0 rgba(255, 255, 255, 0.15), inset 0 -2px 0 rgba(255, 255, 255, 0.08)",

        // Mobile optimized
        mobile: "0 4px 16px rgba(0, 0, 0, 0.15)",
        "3xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      },

      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        "glass-shimmer": "glassShimmer 2s ease-in-out infinite",
        "violet-glow": "violetGlow 3s ease-in-out infinite alternate",
        float: "float 6s ease-in-out infinite",
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
        violetGlow: {
          "0%": { boxShadow: "0 0 20px rgba(139, 92, 246, 0.4)" },
          "100%": { boxShadow: "0 0 40px rgba(139, 92, 246, 0.8)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },

      typography: {
        DEFAULT: {
          css: {
            "--tw-prose-body": "var(--homey-text-secondary)",
            "--tw-prose-headings": "var(--homey-text)",
          },
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/aspect-ratio"),

    // Enhanced glassmorphism utilities
    function ({ addUtilities, theme }) {
      const newUtilities = {
        // Mobile optimizations
        ".touch-manipulation": {
          "touch-action": "manipulation",
        },
        ".scrollbar-none": {
          "scrollbar-width": "none",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        },

        // Safe area support
        ".safe-area-inset": {
          "padding-top": "env(safe-area-inset-top)",
          "padding-bottom": "env(safe-area-inset-bottom)",
          "padding-left": "env(safe-area-inset-left)",
          "padding-right": "env(safe-area-inset-right)",
        },

        // Glass utilities
        ".glass-card": {
          background: "var(--homey-glass-bg)",
          "backdrop-filter": "blur(16px)",
          "-webkit-backdrop-filter": "blur(16px)",
          border: "1px solid var(--homey-glass-border)",
          "box-shadow": theme("boxShadow.glass"),
          "border-radius": theme("borderRadius.glass"),
          transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: "translateZ(0)",
        },

        ".glass-card-hover": {
          "&:hover": {
            transform: "scale(1.02) translateY(-4px) translateZ(0)",
            "box-shadow": theme("boxShadow.glass-hover"),
            "border-color": "var(--homey-glass-violet)",
            filter: "drop-shadow(0 0 20px rgba(255,255,255,0.1))",
          },
        },

        ".glass-button": {
          background: "var(--homey-glass-violet)",
          "backdrop-filter": "blur(12px)",
          "-webkit-backdrop-filter": "blur(12px)",
          border: "1px solid rgba(139, 92, 246, 0.3)",
          transition: "all 0.3s ease",
          "&:hover": {
            background: "rgba(139, 92, 246, 0.25)",
            "border-color": "rgba(139, 92, 246, 0.5)",
            transform: "translateY(-2px) scale(1.05)",
            "box-shadow": "0 10px 25px rgba(139, 92, 246, 0.3)",
          },
        },

        ".glass-input": {
          background: "rgba(0, 0, 0, 0.1)",
          "backdrop-filter": "blur(12px)",
          "-webkit-backdrop-filter": "blur(12px)",
          border: "1px solid var(--homey-glass-border)",
          transition: "all 0.3s ease",
          "&:focus": {
            outline: "none",
            "border-color": "var(--homey-primary)",
            "box-shadow": "0 0 0 3px rgba(139, 92, 246, 0.1), 0 8px 25px rgba(139, 92, 246, 0.2)",
          },
        },

        // Text utilities
        ".text-glass": {
          color: "var(--homey-text)",
          "text-shadow": "0 1px 2px rgba(0, 0, 0, 0.3)",
        },

        ".text-glass-secondary": {
          color: "var(--homey-text-secondary)",
          "text-shadow": "0 1px 2px rgba(0, 0, 0, 0.2)",
        },

        ".text-glass-muted": {
          color: "var(--homey-text-muted)",
        },

        // Checkered background pattern
        ".checkered-violet": {
          "background-image": `
            linear-gradient(45deg, rgba(139, 92, 246, 0.05) 25%, transparent 25%),
            linear-gradient(-45deg, rgba(139, 92, 246, 0.05) 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, rgba(139, 92, 246, 0.05) 75%),
            linear-gradient(-45deg, transparent 75%, rgba(139, 92, 246, 0.05) 75%)
          `,
          "background-size": "20px 20px",
          "background-position": "0 0, 0 10px, 10px -10px, -10px 0px",
        },
      };
      addUtilities(newUtilities);
    },
  ],
};
