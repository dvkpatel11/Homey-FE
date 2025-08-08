import * as mockData from 'mock-data/index.js';

export const handleNotificationMock = async (method, endpoint, data, options) => {
  // GET /api/notifications - Get user notifications
  if (method === "GET" && endpoint === "/api/notifications") {
    return {
      data: mockData.notifications,
      message: "Notifications retrieved successfully",
      meta: {
        unread_count: mockData.notifications.filter((n) => !n.read_at).length,
        pagination: {
          page: 1,
          limit: 20,
          total: mockData.notifications.length,
          hasMore: false,
        },
      },
    };
  }

  // PUT /api/notifications/:id/read - Mark notification as read
  if (method === "PUT" && endpoint.match(/^\/api\/notifications\/[^\/]+\/read$/)) {
    const id = endpoint.split("/")[3];
    return {
      data: {
        id: id,
        read_at: new Date().toISOString(),
      },
      message: "Notification marked as read",
    };
  }

  // PUT /api/notifications/read-all - Mark all notifications as read
  if (method === "PUT" && endpoint === "/api/notifications/read-all") {
    return {
      data: {
        marked_read_count: mockData.notifications.filter((n) => !n.read_at).length,
      },
      message: "All notifications marked as read",
    };
  }

  throw new Error(`Notification mock not implemented: ${method} ${endpoint}`);
};
