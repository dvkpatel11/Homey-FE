import client from './client.js';

export const notificationsAPI = {
  // Get notifications
  async getNotifications(options = {}) {
    const params = new URLSearchParams();
    
    if (options.read !== undefined) params.append('read', options.read);
    if (options.type) params.append('type', options.type);
    if (options.page) params.append('page', options.page);
    if (options.limit) params.append('limit', options.limit);
    
    const queryString = params.toString();
    const url = queryString 
      ? `/api/notifications?${queryString}`
      : '/api/notifications';
      
    const response = await client.get(url);
    return response.data;
  },

  // Mark notification as read
  async markRead(notificationId) {
    const response = await client.put(`/api/notifications/${notificationId}/read`);
    return response.data;
  },

  // Mark all notifications as read
  async markAllRead() {
    const response = await client.put('/api/notifications/read-all');
    return response.data;
  },

  // Delete notification
  async deleteNotification(notificationId) {
    const response = await client.delete(`/api/notifications/${notificationId}`);
    return response.data;
  },

  // Get unread count
  async getUnreadCount() {
    const response = await client.get('/api/notifications/unread-count');
    return response.data;
  },

  // Update notification preferences
  async updatePreferences(preferences) {
    const response = await client.put('/api/notifications/preferences', preferences);
    return response.data;
  },

  // Get notification preferences
  async getPreferences() {
    const response = await client.get('/api/notifications/preferences');
    return response.data;
  },

  // Batch operations
  async batchMarkRead(notificationIds) {
    const response = await client.post('/api/notifications/batch/read', {
      notification_ids: notificationIds,
    });
    return response.data;
  },

  async batchDelete(notificationIds) {
    const response = await client.post('/api/notifications/batch/delete', {
      notification_ids: notificationIds,
    });
    return response.data;
  },
};

export default notificationsAPI;
