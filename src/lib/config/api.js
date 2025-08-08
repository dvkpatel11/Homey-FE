// API Configuration - Mock/Prod Toggle
const API_CONFIG = {
  // Toggle between 'mock' and 'prod'
  MODE: process.env.REACT_APP_API_MODE || "mock",

  // Production API settings
  PROD: {
    BASE_URL: process.env.REACT_APP_API_BASE_URL || "https://your-api.com/api",
    TIMEOUT: 10000,
    RETRIES: 3,
  },

  // Mock API settings
  MOCK: {
    DELAY: 800, // Simulate network delay
    ERROR_RATE: 0.05, // 5% random errors for testing
    ENABLE_LOGGING: true,
  },
};

export default API_CONFIG;
