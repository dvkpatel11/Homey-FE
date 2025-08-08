import API_CONFIG from 'lib/config/api.js';
import { handleAuthMock } from "./mock-handlers/auth-mock.js";
import { handleChatMock } from "./mock-handlers/chat-mock.js";
import { handleExpenseMock } from "./mock-handlers/expense-mock.js";
import { handleHouseholdMock } from "./mock-handlers/household-mock.js";
import { handleNotificationMock } from "./mock-handlers/notification-mock.js";
import { handleTaskMock } from "./mock-handlers/task-mock.js";

// Simulate API delay and random errors
const simulateNetworkDelay = () => {
  const delay = API_CONFIG.MOCK.DELAY + Math.random() * 500;
  return new Promise((resolve) => setTimeout(resolve, delay));
};

const simulateRandomError = () => {
  if (Math.random() < API_CONFIG.MOCK.ERROR_RATE) {
    throw new Error("Mock network error");
  }
};

// Mock API router
export const mockApiCall = async (method, endpoint, data, options) => {
  if (API_CONFIG.MOCK.ENABLE_LOGGING) {
    console.log(`🔸 Mock API: ${method} ${endpoint}`, data);
  }

  await simulateNetworkDelay();
  simulateRandomError();

  // Route to specific mock handlers
  const response = await routeMockRequest(method, endpoint, data, options);

  if (API_CONFIG.MOCK.ENABLE_LOGGING) {
    console.log(`🔹 Mock Response:`, response);
  }

  return response;
};

// Mock request router
const routeMockRequest = async (method, endpoint, data, options) => {
  // Profile/Auth endpoints
  if (endpoint.includes("/profile") || endpoint.includes("/invite")) {
    return handleAuthMock(method, endpoint, data, options);
  }

  // Household endpoints
  if (endpoint.includes("/households")) {
    return handleHouseholdMock(method, endpoint, data, options);
  }

  // Task endpoints
  if (endpoint.includes("/tasks")) {
    return handleTaskMock(method, endpoint, data, options);
  }

  // Bill/Expense endpoints
  if (endpoint.includes("/bills")) {
    return handleExpenseMock(method, endpoint, data, options);
  }

  // Chat endpoints
  if (endpoint.includes("/messages") || endpoint.includes("/polls")) {
    return handleChatMock(method, endpoint, data, options);
  }

  // Notification endpoints
  if (endpoint.includes("/notifications")) {
    return handleNotificationMock(method, endpoint, data, options);
  }

  // Default fallback
  throw new Error(`Mock endpoint not implemented: ${endpoint}`);
};
