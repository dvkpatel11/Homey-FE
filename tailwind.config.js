/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // reference CSS vars from theme.js / :root for easy runtime theming
        primary: "var(--color-primary)",
        glass: {
          DEFAULT: "rgba(255,255,255,0.06)",
        },
      },
      backdropBlur: {
        "3xl": "64px",
      },
      boxShadow: {
        "3xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography"), require("@tailwindcss/aspect-ratio")],
};
