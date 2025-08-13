import API_CONFIG from '../config/api.js';
import mockClient from './mock-client.js';
import prodClient from './prod-client.js';

// Unified API client that switches between mock and production
const apiClient = API_CONFIG.MODE === 'mock' ? mockClient : prodClient;

// Enhanced client with middleware
class EnhancedClient {
  constructor(baseClient) {
    this.client = baseClient;
    this.requestInterceptors = [];
    this.responseInterceptors = [];
  }

  // Add request interceptor
  addRequestInterceptor(interceptor) {
    this.requestInterceptors.push(interceptor);
  }

  // Add response interceptor
  addResponseInterceptor(interceptor) {
    this.responseInterceptors.push(interceptor);
  }

  // Process request through interceptors
  async processRequest(config) {
    let processedConfig = { ...config };
    for (const interceptor of this.requestInterceptors) {
      processedConfig = await interceptor(processedConfig);
    }
    return processedConfig;
  }

  // Process response through interceptors
  async processResponse(response) {
    let processedResponse = response;
    for (const interceptor of this.responseInterceptors) {
      processedResponse = await interceptor(processedResponse);
    }
    return processedResponse;
  }

  // Enhanced request method
  async request(config) {
    try {
      const processedConfig = await this.processRequest(config);
      const response = await this.client.request(processedConfig);
      return await this.processResponse(response);
    } catch (error) {
      // Global error handling
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // Convenience methods
  get(url, config = {}) {
    return this.request({ ...config, method: 'GET', url });
  }

  post(url, data, config = {}) {
    return this.request({ ...config, method: 'POST', url, data });
  }

  put(url, data, config = {}) {
    return this.request({ ...config, method: 'PUT', url, data });
  }

  delete(url, config = {}) {
    return this.request({ ...config, method: 'DELETE', url });
  }
}

// Create enhanced client instance
const client = new EnhancedClient(apiClient);

// Add default interceptors
client.addRequestInterceptor(async (config) => {
  // Add auth token if available
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
});

client.addResponseInterceptor(async (response) => {
  // Handle auth errors globally
  if (response.status === 401) {
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  }
  return response;
});

export default client;
