import API_CONFIG from '../config/api.js';
import { mockApiCall } from './mock-client.js';
import { prodApiCall } from './prod-client.js';

// Main API client that routes to mock or prod
export const apiClient = {
  get: (endpoint, options = {}) => {
    return API_CONFIG.MODE === 'mock' 
      ? mockApiCall('GET', endpoint, null, options)
      : prodApiCall('GET', endpoint, options);
  },
  
  post: (endpoint, data, options = {}) => {
    return API_CONFIG.MODE === 'mock'
      ? mockApiCall('POST', endpoint, data, options)
      : prodApiCall('POST', endpoint, { ...options, data });
  },
  
  put: (endpoint, data, options = {}) => {
    return API_CONFIG.MODE === 'mock'
      ? mockApiCall('PUT', endpoint, data, options)
      : prodApiCall('PUT', endpoint, { ...options, data });
  },
  
  delete: (endpoint, options = {}) => {
    return API_CONFIG.MODE === 'mock'
      ? mockApiCall('DELETE', endpoint, null, options)
      : prodApiCall('DELETE', endpoint, options);
  }
};

// Utility for building query strings
export const buildQuery = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query.append(key, value.toString());
    }
  });
  return query.toString();
};
