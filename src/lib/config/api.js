// api.js
const mode = import.meta.env.VITE_API_MODE || "mock";

const API_CONFIG = {
  MODE: ["mock", "prod"].includes(mode) ? mode : "mock",

  PROD: {
    BASE_URL: import.meta.env.VITE_API_BASE_URL || "https://your-api.com/api",
    TIMEOUT: 10000,
    RETRIES: 3,
  },

  MOCK: {
    DELAY: Number(import.meta.env.VITE_API_MOCK_DELAY) || 800,
    ERROR_RATE: Number(import.meta.env.VITE_API_MOCK_ERROR_RATE) || 0.05,
    ENABLE_LOGGING: true,
  },

  log: (...args) => {
    if (mode === "mock" && API_CONFIG.MOCK.ENABLE_LOGGING) {
      console.log("[Mock API]", ...args);
    }
  },
};

export default API_CONFIG;
