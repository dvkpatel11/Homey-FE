// Export all API modules
export { default as authAPI } from './auth.js';
export { default as householdsAPI } from './households.js';
export { default as tasksAPI } from './tasks.js';
export { default as expensesAPI } from './expenses.js';
export { default as chatAPI } from './chat.js';
export { default as notificationsAPI } from './notifications.js';

// Export unified client
export { default as apiClient } from './client.js';

// Convenience exports
export const API = {
  auth: () => import('./auth.js').then(m => m.default),
  households: () => import('./households.js').then(m => m.default),
  tasks: () => import('./tasks.js').then(m => m.default),
  expenses: () => import('./expenses.js').then(m => m.default),
  chat: () => import('./chat.js').then(m => m.default),
  notifications: () => import('./notifications.js').then(m => m.default),
};
