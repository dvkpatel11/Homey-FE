// src/contexts/NotificationContext.js - PRODUCTION VERSION
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { notificationApi } from "../lib/api";
import { useAuth } from "./AuthContext";

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

  // Load notifications when user logs in
  useEffect(() => {
    if (isLoggedIn) {
      loadNotifications();
    } else {
      resetNotificationState();
    }
  }, [isLoggedIn]);

  const resetNotificationState = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const loadNotifications = async (options = {}) => {
    try {
      setIsLoading(true);
      const response = await notificationApi.getNotifications(options);
      setNotifications(response.data);
      setUnreadCount(response.meta.unread_count);
    } catch (error) {
      console.error("Failed to load notifications:", error);
      // Don't show toast for notification loading errors - not critical
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await notificationApi.markAsRead(notificationId);

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId ? { ...notification, read_at: new Date().toISOString() } : notification
        )
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      toast.error("Failed to mark notification as read");
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await notificationApi.markAllAsRead();

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          read_at: notification.read_at || new Date().toISOString(),
        }))
      );

      setUnreadCount(0);
      toast.success(`Marked ${response.data.marked_read_count} notifications as read`);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      toast.error("Failed to mark notifications as read");
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await notificationApi.deleteNotification(notificationId);

      const deletedNotification = notifications.find((n) => n.id === notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

      // Update unread count if deleted notification was unread
      if (deletedNotification && !deletedNotification.read_at) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      toast.success("Notification deleted");
    } catch (error) {
      console.error("Failed to delete notification:", error);
      toast.error("Failed to delete notification");
    }
  };

  // Add new notification (for real-time updates)
  const addNotification = (notification) => {
    setNotifications((prev) => [notification, ...prev]);

    if (!notification.read_at) {
      setUnreadCount((prev) => prev + 1);

      // Show toast for new notifications
      toast.success(notification.title, {
        description: notification.message,
        duration: 4000,
      });
    }
  };

  // Get notifications by type
  const getNotificationsByType = (type) => {
    return notifications.filter((notification) => notification.type === type);
  };

  // Get unread notifications
  const getUnreadNotifications = () => {
    return notifications.filter((notification) => !notification.read_at);
  };

  const value = {
    // State
    notifications,
    unreadCount,
    isLoading,

    // Actions
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,

    // Helpers
    getNotificationsByType,
    getUnreadNotifications,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};
