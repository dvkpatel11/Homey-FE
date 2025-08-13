// Enhanced API client with better type safety and caching
import { AuthStorage } from "../../hooks/useLocalStorage"; // adjust path
import API_CONFIG from "../config/api.js";
import mockClient from "./mock-client.js";
import prodClient from "./prod-client.js";

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
    // 5 minutes default
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
  constructor(baseClient) {
    this.client = baseClient;
    this.cache = new ApiCache();
    this.requestInterceptors = [];
    this.responseInterceptors = [];
    this.middleware = [];
  }

  // Middleware system for advanced features
  use(middleware) {
    this.middleware.push(middleware);
  }

  // Add methods for managing interceptors
  addRequestInterceptor(interceptor) {
    this.requestInterceptors.push(interceptor);
  }

  addResponseInterceptor(interceptor) {
    this.responseInterceptors.push(interceptor);
  }

  // Enhanced request processing
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

  // Enhanced response processing with caching
  async processResponse(response, config) {
    let processedResponse = response;

    // Validate response structure
    ApiResponse.validate(processedResponse);

    // Apply response interceptors
    for (const interceptor of this.responseInterceptors) {
      processedResponse = await interceptor(processedResponse);
    }

    // Cache GET requests in production
    if (config.method === "GET" && API_CONFIG.MODE === "prod") {
      const cacheKey = `${config.method}:${config.url}`;
      this.cache.set(cacheKey, processedResponse.data);
    }

    return processedResponse;
  }

  // Smart caching for GET requests
  async request(config) {
    try {
      const processedConfig = await this.processRequest(config);

      // Check cache for GET requests
      if (processedConfig.method === "GET" && API_CONFIG.MODE === "prod") {
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

      // Enhanced error handling with context
      const enhancedError = {
        ...error,
        config: config,
        timestamp: new Date().toISOString(),
        retryable: this.isRetryableError(error),
      };

      throw enhancedError;
    }
  }

  // Determine if error is retryable
  isRetryableError(error) {
    return error.code === "NETWORK_ERROR" || error.status >= 500 || error.code === "TIMEOUT";
  }

  // Convenience methods with better error context
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

  // Utility methods
  clearCache() {
    this.cache.clear();
  }

  getCacheStats() {
    return {
      size: this.cache.cache.size,
      mode: API_CONFIG.MODE,
    };
  }
}

// Create enhanced client instance
const baseClient = API_CONFIG.MODE === "mock" ? mockClient : prodClient;
const client = new EnhancedApiClient(baseClient);

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
