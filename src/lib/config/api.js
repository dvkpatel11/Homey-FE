const API_CONFIG = {
  // Production configuration
  BASE_URL: import.meta.env.VITE_API_BASE_URL || "https://your-api.com/api/v1",
  TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
  RETRIES: parseInt(import.meta.env.VITE_API_RETRIES) || 3,

  // Environment detection
  ENVIRONMENT: import.meta.env.MODE || "development",

  // Feature flags
  ENABLE_CACHING: import.meta.env.VITE_ENABLE_API_CACHING !== "false",
  ENABLE_RETRY: import.meta.env.VITE_ENABLE_API_RETRY !== "false",

  // Development settings
  ENABLE_LOGGING: import.meta.env.MODE === "development",

  log: (...args) => {
    if (API_CONFIG.ENABLE_LOGGING) {
      console.log("[API]", ...args);
    }
  },
};

export default API_CONFIG;
