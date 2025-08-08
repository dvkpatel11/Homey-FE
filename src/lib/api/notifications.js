import { apiClient, buildQuery } from './client.js';

export const notificationApi = {
  // GET /api/notifications - Get user notifications
  getNotifications: (params = {}) => {
    const query = buildQuery(params);
    return apiClient.get(`/api/notifications${query ? `?${query}` : ''}`);
  },
  
  // PUT /api/notifications/:id/read - Mark notification as read
  markAsRead: (id) => {
    return apiClient.put(`/api/notifications/${id}/read`);
  },
  
  // PUT /api/notifications/read-all - Mark all notifications as read
  markAllAsRead: () => {
    return apiClient.put('/api/notifications/read-all');
  },
  
  // DELETE /api/notifications/:id - Delete notification
  deleteNotification: (id) => {
    return apiClient.delete(`/api/notifications/${id}`);
  }
};
