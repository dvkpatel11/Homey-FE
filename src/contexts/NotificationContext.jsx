// src/contexts/NotificationContext.js - Enhanced Mobile-First Version
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { notifications as mockNotifications } from "../mock-data/notifications";

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { isLoggedIn } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Notification preferences
  const [preferences, setPreferences] = useState(() => {
    try {
      const saved = localStorage.getItem("notificationPreferences");
      return saved
        ? JSON.parse(saved)
        : {
            showToasts: true,
            soundEnabled: false,
            taskReminders: true,
            expenseAlerts: true,
            householdUpdates: true,
            weeklyDigest: true,
          };
    } catch {
      return {
        showToasts: true,
        soundEnabled: false,
        taskReminders: true,
        expenseAlerts: true,
        householdUpdates: true,
        weeklyDigest: true,
      };
    }
  });

  // Load notifications when user logs in
  useEffect(() => {
    if (isLoggedIn) {
      loadNotifications();
      // Simulate real-time notifications every 30 seconds in mock mode
      const interval = setInterval(() => {
        simulateNewNotification();
      }, 30000);

      return () => clearInterval(interval);
    } else {
      resetNotificationState();
    }
  }, [isLoggedIn]);

  // Save preferences to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("notificationPreferences", JSON.stringify(preferences));
    } catch (error) {
      console.error("Failed to save notification preferences:", error);
    }
  }, [preferences]);

  const resetNotificationState = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
    setError(null);
  }, []);

  const loadNotifications = useCallback(async (options = {}) => {
    try {
      setIsLoading(true);
      setError(null);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 400));

      // Use mock data with some enhancements
      const enhancedNotifications = mockNotifications.map((notification) => ({
        ...notification,
        isNew: !notification.read_at && new Date(notification.created_at) > new Date(Date.now() - 5 * 60000), // 5 min
      }));

      setNotifications(enhancedNotifications);

      // Calculate unread count
      const unread = enhancedNotifications.filter((n) => !n.read_at).length;
      setUnreadCount(unread);
    } catch (error) {
      setError("Failed to load notifications");
      console.error("Failed to load notifications:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId) => {
    try {
      // Optimistic update
      const now = new Date().toISOString();
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId ? { ...notification, read_at: now, isNew: false } : notification
        )
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 200));
    } catch (error) {
      // Revert optimistic update on error
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId ? { ...notification, read_at: null } : notification
        )
      );
      setUnreadCount((prev) => prev + 1);

      console.error("Failed to mark notification as read:", error);
      toast.error("Failed to mark notification as read");
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const unreadNotifications = notifications.filter((n) => !n.read_at);
      if (unreadNotifications.length === 0) {
        toast.success("All notifications are already read");
        return;
      }

      // Optimistic update
      const now = new Date().toISOString();
      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          read_at: notification.read_at || now,
          isNew: false,
        }))
      );

      const previousUnreadCount = unreadCount;
      setUnreadCount(0);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      toast.success(`Marked ${previousUnreadCount} notifications as read`);
    } catch (error) {
      // Revert on error
      loadNotifications();
      console.error("Failed to mark all notifications as read:", error);
      toast.error("Failed to mark notifications as read");
    }
  }, [notifications, unreadCount, loadNotifications]);

  const deleteNotification = useCallback(
    async (notificationId) => {
      try {
        const deletedNotification = notifications.find((n) => n.id === notificationId);

        // Optimistic update
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

        // Update unread count if deleted notification was unread
        if (deletedNotification && !deletedNotification.read_at) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 300));

        toast.success("Notification deleted");
      } catch (error) {
        // Revert on error
        loadNotifications();
        console.error("Failed to delete notification:", error);
        toast.error("Failed to delete notification");
      }
    },
    [notifications, loadNotifications]
  );

  const clearAllNotifications = useCallback(async () => {
    try {
      const notificationCount = notifications.length;

      if (notificationCount === 0) {
        toast.success("No notifications to clear");
        return;
      }

      // Optimistic update
      setNotifications([]);
      setUnreadCount(0);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 600));

      toast.success(`Cleared ${notificationCount} notifications`);
    } catch (error) {
      // Revert on error
      loadNotifications();
      console.error("Failed to clear notifications:", error);
      toast.error("Failed to clear notifications");
    }
  }, [notifications, loadNotifications]);

  // Simulate new notification for demo purposes
  const simulateNewNotification = useCallback(() => {
    if (!preferences.showToasts) return;

    const mockNotificationTypes = [
      {
        type: "task_reminder",
        title: "Task Reminder",
        message: "Don't forget to take out the trash!",
        icon: "🗑️",
      },
      {
        type: "expense_alert",
        title: "Expense Alert",
        message: "Monthly budget is 80% used",
        icon: "💰",
      },
      {
        type: "household_update",
        title: "Household Update",
        message: "Sarah completed 3 tasks today",
        icon: "✅",
      },
    ];

    const randomNotification = mockNotificationTypes[Math.floor(Math.random() * mockNotificationTypes.length)];

    const newNotification = {
      id: `notification-${Date.now()}`,
      type: randomNotification.type,
      title: randomNotification.title,
      message: randomNotification.message,
      created_at: new Date().toISOString(),
      read_at: null,
      isNew: true,
      priority: "normal",
    };

    setNotifications((prev) => [newNotification, ...prev]);
    setUnreadCount((prev) => prev + 1);

    // Show toast if enabled
    if (preferences.showToasts) {
      toast.success(`${randomNotification.icon} ${randomNotification.title}`, {
        description: randomNotification.message,
        duration: 4000,
      });
    }
  }, [preferences.showToasts]);

  const updatePreferences = useCallback((newPreferences) => {
    setPreferences((prev) => ({ ...prev, ...newPreferences }));
  }, []);

  // Computed values - memoized for performance
  const computedValues = useMemo(() => {
    const unreadNotifications = notifications.filter((n) => !n.read_at);
    const newNotifications = notifications.filter((n) => n.isNew);

    return {
      unreadNotifications,
      newNotifications,
      hasUnread: unreadCount > 0,
      hasNew: newNotifications.length > 0,
      notificationsByType: notifications.reduce((acc, notification) => {
        acc[notification.type] = acc[notification.type] || [];
        acc[notification.type].push(notification);
        return acc;
      }, {}),
      recentNotifications: notifications.slice(0, 5),
      todayNotifications: notifications.filter(
        (n) => new Date(n.created_at).toDateString() === new Date().toDateString()
      ),
    };
  }, [notifications, unreadCount]);

  // Helper functions
  const getNotificationsByType = useCallback(
    (type) => {
      return notifications.filter((notification) => notification.type === type);
    },
    [notifications]
  );

  // Memoized context value
  const value = useMemo(
    () => ({
      // State
      notifications,
      unreadCount,
      isLoading,
      error,
      preferences,

      // Computed values
      ...computedValues,

      // Actions
      loadNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      clearAllNotifications,
      updatePreferences,
      getNotificationsByType,
      clearError: () => setError(null),
    }),
    [
      notifications,
      unreadCount,
      isLoading,
      error,
      preferences,
      computedValues,
      loadNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      clearAllNotifications,
      updatePreferences,
      getNotificationsByType,
    ]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};
