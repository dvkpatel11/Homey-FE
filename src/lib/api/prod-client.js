import axios from 'axios';
import API_CONFIG from '../config/api.js';

// Create axios instance for production
const prodClient = axios.create({
  baseURL: API_CONFIG.PROD.BASE_URL,
  timeout: API_CONFIG.PROD.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
prodClient.interceptors.request.use(
  (config) => {
    // Add timestamp for cache busting
    config.params = {
      ...config.params,
      _t: Date.now(),
    };
    
    // Log requests in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🌐 ${config.method?.toUpperCase()} ${config.url}`, config.data);
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor with retry logic
prodClient.interceptors.response.use(
  (response) => {
    // Log responses in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }
    return response;
  },
  async (error) => {
    const config = error.config;
    
    // Retry logic for network errors
    if (!config._retry && error.code === 'NETWORK_ERROR') {
      config._retry = true;
      config._retryCount = (config._retryCount || 0) + 1;
      
      if (config._retryCount <= API_CONFIG.PROD.RETRIES) {
        // Exponential backoff
        const delay = Math.pow(2, config._retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return prodClient(config);
      }
    }
    
    // Enhanced error handling
    if (error.response) {
      // Server responded with error status
      const apiError = {
        code: error.response.data?.error?.code || 'API_ERROR',
        message: error.response.data?.error?.message || 'An error occurred',
        status: error.response.status,
        details: error.response.data?.error?.details,
      };
      throw apiError;
    } else if (error.request) {
      // Network error
      throw {
        code: 'NETWORK_ERROR',
        message: 'Unable to connect to the server',
        details: error.message,
      };
    } else {
      // Other error
      throw {
        code: 'UNKNOWN_ERROR',
        message: error.message || 'An unknown error occurred',
      };
    }
  }
);

export default prodClient;
