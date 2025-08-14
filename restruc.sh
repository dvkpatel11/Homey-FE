// src/lib/config/api.js - UPDATED with mock support

const API_CONFIG = {
  // Production configuration
  BASE_URL: import.meta.env.VITE_API_BASE_URL || "https://your-api.com/api/v1",
  TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
  RETRIES: parseInt(import.meta.env.VITE_API_RETRIES) || 3,

  // Environment detection
  ENVIRONMENT: import.meta.env.MODE || "development",
  
  // ✨ NEW: Mock mode configuration
  USE_MOCK_API: import.meta.env.VITE_USE_MOCK_API === "true" || 
                import.meta.env.MODE === "development" && 
                !import.meta.env.VITE_API_BASE_URL,

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

// src/lib/api/client.js - UPDATED to support mock mode

import { AuthStorage } from "../../hooks/useLocalStorage";
import API_CONFIG from "../config/api.js";
import prodClient from "./prod-client.js";
import mockClient from "./mock/mock-client.js"; // ✨ NEW

// Type definitions (consider moving to TypeScript)
const ApiResponse = {
  validate: (response) => {
    if (!response.data) throw new Error("Invalid API response structure");
    return response;
  },
};

// Cache implementation for production
class ApiCache {
  constructor(ttl = 300000) {
    this.cache = new Map();
    this.ttl = ttl;
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    return item.data;
  }

  set(key, data) {
    this.cache.set(key, {
      data,
      expires: Date.now() + this.ttl,
    });
  }

  clear() {
    this.cache.clear();
  }
}

// Enhanced client with middleware and caching
class EnhancedApiClient {
  constructor(baseClient, isMock = false) {
    this.client = baseClient;
    this.isMock = isMock;
    this.cache = new ApiCache();
    this.requestInterceptors = [];
    this.responseInterceptors = [];
    this.middleware = [];
    
    // ✨ Log the mode
    if (API_CONFIG.ENABLE_LOGGING) {
      console.log(`🚀 API Client initialized in ${isMock ? 'MOCK' : 'PRODUCTION'} mode`);
    }
  }

  // Middleware system for advanced features
  use(middleware) {
    this.middleware.push(middleware);
  }

  addRequestInterceptor(interceptor) {
    this.requestInterceptors.push(interceptor);
  }

  addResponseInterceptor(interceptor) {
    this.responseInterceptors.push(interceptor);
  }

  async processRequest(config) {
    let processedConfig = { ...config };

    // Apply middleware
    for (const middleware of this.middleware) {
      processedConfig = await middleware.request(processedConfig);
    }

    // Apply interceptors
    for (const interceptor of this.requestInterceptors) {
      processedConfig = await interceptor(processedConfig);
    }

    return processedConfig;
  }

  async processResponse(response, config) {
    let processedResponse = response;

    // Validate response structure
    ApiResponse.validate(processedResponse);

    // Apply response interceptors
    for (const interceptor of this.responseInterceptors) {
      processedResponse = await interceptor(processedResponse);
    }

    // Cache GET requests in production (not in mock mode)
    if (config.method === "GET" && !this.isMock && API_CONFIG.ENABLE_CACHING) {
      const cacheKey = `${config.method}:${config.url}`;
      this.cache.set(cacheKey, processedResponse.data);
    }

    return processedResponse;
  }

  async request(config) {
    try {
      const processedConfig = await this.processRequest(config);

      // Check cache for GET requests (only in production)
      if (processedConfig.method === "GET" && !this.isMock && API_CONFIG.ENABLE_CACHING) {
        const cacheKey = `${processedConfig.method}:${processedConfig.url}`;
        const cached = this.cache.get(cacheKey);
        if (cached) {
          return { data: cached, status: 200, cached: true };
        }
      }

      const response = await this.client.request(processedConfig);
      return await this.processResponse(response, processedConfig);
    } catch (error) {
      console.error("API Request Error:", error);

      const enhancedError = {
        ...error,
        config: config,
        timestamp: new Date().toISOString(),
        retryable: this.isRetryableError(error),
        mode: this.isMock ? 'mock' : 'production'
      };

      throw enhancedError;
    }
  }

  isRetryableError(error) {
    return error.code === "NETWORK_ERROR" || error.status >= 500 || error.code === "TIMEOUT";
  }

  // Convenience methods
  get(url, config = {}) {
    return this.request({ ...config, method: "GET", url });
  }

  post(url, data, config = {}) {
    return this.request({ ...config, method: "POST", url, data });
  }

  put(url, data, config = {}) {
    return this.request({ ...config, method: "PUT", url, data });
  }

  delete(url, config = {}) {
    return this.request({ ...config, method: "DELETE", url });
  }

  clearCache() {
    this.cache.clear();
  }

  getCacheStats() {
    return {
      size: this.cache.cache.size,
      mode: this.isMock ? 'mock' : 'production',
    };
  }
}

// ✨ NEW: Choose client based on configuration
const baseClient = API_CONFIG.USE_MOCK_API ? mockClient : prodClient;
const client = new EnhancedApiClient(baseClient, API_CONFIG.USE_MOCK_API);

// Add authentication middleware
client.use({
  request: async (config) => {
    const token = AuthStorage.getToken();
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    return config;
  },
});

// Add global error handling
client.addResponseInterceptor(async (response) => {
  if (response.status === 401) {
    AuthStorage.removeToken();
    window.location.href = "/login";
  }
  return response;
});

export default client;

// src/lib/api/index.js - UPDATED with environment switching

import API_CONFIG from "../config/api.js";

// ✨ NEW: Import both production and mock APIs
import { default as prodAuthAPI } from './auth.js';
import { default as prodHouseholdsAPI } from './households.js';
import { default as prodTasksAPI } from './tasks.js';
import { default as prodExpensesAPI } from './expenses.js';
import { default as prodChatAPI } from './chat.js';
import { default as prodNotificationsAPI } from './notifications.js';

import { 
  mockAuthAPI,
  mockHouseholdsAPI, 
  mockTasksAPI,
  mockExpensesAPI,
  mockChatAPI,
  mockNotificationsAPI 
} from './mock/mock-api-modules.js';

// ✨ NEW: Environment-based API selection
export const authAPI = API_CONFIG.USE_MOCK_API ? mockAuthAPI : prodAuthAPI;
export const householdsAPI = API_CONFIG.USE_MOCK_API ? mockHouseholdsAPI : prodHouseholdsAPI;
export const tasksAPI = API_CONFIG.USE_MOCK_API ? mockTasksAPI : prodTasksAPI;
export const expensesAPI = API_CONFIG.USE_MOCK_API ? mockExpensesAPI : prodExpensesAPI;
export const chatAPI = API_CONFIG.USE_MOCK_API ? mockChatAPI : prodChatAPI;
export const notificationsAPI = API_CONFIG.USE_MOCK_API ? mockNotificationsAPI : prodNotificationsAPI;

// Export unified client
export { default as apiClient } from './client.js';

// ✨ Enhanced convenience exports with environment info
export const API = {
  auth: () => Promise.resolve(authAPI),
  households: () => Promise.resolve(householdsAPI),
  tasks: () => Promise.resolve(tasksAPI),
  expenses: () => Promise.resolve(expensesAPI),
  chat: () => Promise.resolve(chatAPI),
  notifications: () => Promise.resolve(notificationsAPI),
  
  // ✨ NEW: Environment utilities
  isMockMode: () => API_CONFIG.USE_MOCK_API,
  getMode: () => API_CONFIG.USE_MOCK_API ? 'mock' : 'production',
  resetMockData: () => {
    if (API_CONFIG.USE_MOCK_API) {
      const { mockDataStore } = require('./mock/data-generators.js');
      mockDataStore.reset();
      console.log('🔄 Mock data reset');
    }
  }
};

// ✨ NEW: Development helpers
if (API_CONFIG.ENABLE_LOGGING) {
  console.log(`📊 API Environment: ${API.getMode()}`);
  
  // Expose to window for debugging
  window.API_DEBUG = {
    ...API,
    config: API_CONFIG,
    resetMockData: API.resetMockData
  };
}

// .env.example - Add these environment variables

# API Configuration
VITE_API_BASE_URL=https://your-production-api.com/api/v1
VITE_API_TIMEOUT=10000
VITE_API_RETRIES=3

# Mock API Control
# Set to "true" to use mock API instead of production
# Defaults to true in development when no BASE_URL is set
VITE_USE_MOCK_API=true

# Caching
VITE_ENABLE_API_CACHING=true
VITE_ENABLE_API_RETRY=true

# Real-time features
VITE_REALTIME_ENABLED=true
VITE_WS_URL=ws://localhost:8080/ws

# Development environment file (.env.development)
VITE_USE_MOCK_API=true
VITE_ENABLE_API_CACHING=false
VITE_REALTIME_ENABLED=false

# Production environment file (.env.production)
VITE_USE_MOCK_API=false
VITE_API_BASE_URL=https://your-production-api.com/api/v1
VITE_ENABLE_API_CACHING=true
VITE_REALTIME_ENABLED=true