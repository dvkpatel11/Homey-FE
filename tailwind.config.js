/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      backdropBlur: {
        '3xl': '64px',
      },
      boxShadow: {
        '3xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      }
    },
  },
  plugins: [],
}