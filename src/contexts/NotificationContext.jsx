import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useEffect, useReducer, useRef } from "react";
import toast from "react-hot-toast";
import { useAuthToken } from "../hooks/useLocalStorage";
import { notificationsAPI } from "../lib/api";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext();

// Enhanced notification reducer with better optimistic update handling
const notificationReducer = (state, action) => {
  switch (action.type) {
    case "SET_NOTIFICATIONS":
      return {
        ...state,
        notifications: action.payload,
      };
    case "ADD_NOTIFICATION":
      // Avoid duplicates
      const exists = state.notifications.some((n) => n.id === action.payload.id);
      if (exists) return state;

      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + (action.payload.read_at ? 0 : 1),
      };
    case "UPDATE_NOTIFICATION":
      return {
        ...state,
        notifications: state.notifications.map((n) => (n.id === action.payload.id ? { ...n, ...action.payload } : n)),
      };
    case "REMOVE_NOTIFICATION":
      const notification = state.notifications.find((n) => n.id === action.payload);
      const wasUnread = notification && !notification.read_at;

      return {
        ...state,
        notifications: state.notifications.filter((n) => n.id !== action.payload),
        unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
      };
    case "SET_UNREAD_COUNT":
      return {
        ...state,
        unreadCount: action.payload,
      };
    case "MARK_READ_OPTIMISTIC":
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.payload ? { ...n, read_at: new Date().toISOString(), optimistic: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    case "MARK_READ_SUCCESS":
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.payload.id ? { ...n, ...action.payload, optimistic: false } : n
        ),
      };
    case "MARK_READ_ERROR":
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.payload ? { ...n, read_at: null, optimistic: false } : n
        ),
        unreadCount: state.unreadCount + 1,
      };
    case "MARK_ALL_READ_OPTIMISTIC":
      return {
        ...state,
        notifications: state.notifications.map((n) => ({
          ...n,
          read_at: n.read_at || new Date().toISOString(),
          optimistic: !n.read_at,
        })),
        unreadCount: 0,
      };
    case "MARK_ALL_READ_ERROR":
      // Revert optimistic updates
      return {
        ...state,
        notifications: state.notifications.map((n) => (n.optimistic ? { ...n, read_at: null, optimistic: false } : n)),
        unreadCount: state.notifications.filter((n) => n.optimistic).length,
      };
    case "SET_PREFERENCES":
      return {
        ...state,
        preferences: action.payload,
      };
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
      };
    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

const initialState = {
  notifications: [],
  unreadCount: 0,
  preferences: {
    toast_enabled: true,
    browser_notifications: false,
    email_notifications: true,
    task_notifications: true,
    bill_notifications: true,
    chat_notifications: true,
  },
  error: null,
};

export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuth();
  const wsRef = useRef();
  const reconnectTimeoutRef = useRef();
  const reconnectAttempts = useRef(0);

  // Query notifications with better error handling
  const {
    data: notificationsData,
    isLoading: notificationsLoading,
    error: notificationsError,
    refetch: refetchNotifications,
  } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationsAPI.getNotifications({ limit: 50 }),
    enabled: isAuthenticated,
    staleTime: 30 * 1000,
    refetchInterval: (data, query) => {
      // Only poll if real-time connection is not established
      return wsRef.current?.readyState === WebSocket.OPEN ? false : 60 * 1000;
    },
    onError: (error) => {
      dispatch({ type: "SET_ERROR", payload: error.message });
    },
  });

  // Query unread count
  const { data: unreadCountData, refetch: refetchUnreadCount } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: notificationsAPI.getUnreadCount,
    enabled: isAuthenticated,
    staleTime: 15 * 1000,
    refetchInterval: (data, query) => {
      return wsRef.current?.readyState === WebSocket.OPEN ? false : 30 * 1000;
    },
  });

  // Query notification preferences
  const { data: preferencesData } = useQuery({
    queryKey: ["notifications", "preferences"],
    queryFn: notificationsAPI.getPreferences,
    enabled: isAuthenticated,
    staleTime: 10 * 60 * 1000,
  });

  // Enhanced mutations with better optimistic updates
  const markReadMutation = useMutation({
    mutationFn: notificationsAPI.markRead,
    onMutate: async (notificationId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["notifications"] });

      // Optimistic update
      dispatch({ type: "MARK_READ_OPTIMISTIC", payload: notificationId });

      return { notificationId };
    },
    onSuccess: (data, notificationId) => {
      dispatch({ type: "MARK_READ_SUCCESS", payload: { id: notificationId, ...data.data } });
    },
    onError: (error, notificationId, context) => {
      dispatch({ type: "MARK_READ_ERROR", payload: notificationId });
      console.error("Failed to mark notification as read:", error);
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: notificationsAPI.markAllRead,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      dispatch({ type: "MARK_ALL_READ_OPTIMISTIC" });
    },
    onSuccess: (data) => {
      // Remove optimistic flag from all notifications
      dispatch({
        type: "SET_NOTIFICATIONS",
        payload: state.notifications.map((n) => ({
          ...n,
          read_at: n.read_at || new Date().toISOString(),
          optimistic: false,
        })),
      });
    },
    onError: () => {
      dispatch({ type: "MARK_ALL_READ_ERROR" });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: notificationsAPI.deleteNotification,
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });

      // Store previous state for rollback
      const previousNotifications = state.notifications;
      dispatch({ type: "REMOVE_NOTIFICATION", payload: notificationId });

      return { previousNotifications };
    },
    onError: (error, notificationId, context) => {
      // Rollback on error
      dispatch({ type: "SET_NOTIFICATIONS", payload: context.previousNotifications });
    },
  });

  const batchMarkReadMutation = useMutation({
    mutationFn: notificationsAPI.batchMarkRead,
    onSuccess: () => {
      refetchNotifications();
      refetchUnreadCount();
    },
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: notificationsAPI.updatePreferences,
    onSuccess: (data) => {
      dispatch({ type: "SET_PREFERENCES", payload: data.data });
    },
  });

  // Real-time WebSocket connection
  const connectWebSocket = useCallback(() => {
    if (!isAuthenticated || !user) return;

    const wsUrl = import.meta.env.VITE_WS_URL || "ws://localhost:8080/ws";
    const token = useAuthToken();
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    try {
      wsRef.current = new WebSocket(`${wsUrl}?token=${token}&user_id=${user.id}`);

      wsRef.current.onopen = () => {
        console.log("🔗 WebSocket connected");
        reconnectAttempts.current = 0;

        // Clear polling intervals since we have real-time connection
        queryClient.invalidateQueries({ queryKey: ["notifications"] });

        // Send ping to maintain connection
        const pingInterval = setInterval(() => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: "ping" }));
          }
        }, 30000);

        wsRef.current.pingInterval = pingInterval;
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          switch (message.type) {
            case "notification":
              const notification = message.data;
              dispatch({ type: "ADD_NOTIFICATION", payload: notification });
              showNotificationToast(notification);

              // Update unread count
              queryClient.setQueryData(["notifications", "unread-count"], (old) => ({
                ...old,
                data: { count: (old?.data?.count || 0) + 1 },
              }));
              break;

            case "notification_read":
              dispatch({ type: "UPDATE_NOTIFICATION", payload: message.data });
              break;

            case "notification_deleted":
              dispatch({ type: "REMOVE_NOTIFICATION", payload: message.data.id });
              break;

            case "pong":
              // Keep-alive response
              break;

            default:
              console.warn("Unknown WebSocket message type:", message.type);
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log("🔌 WebSocket disconnected:", event.code, event.reason);

        // Clear ping interval
        if (wsRef.current?.pingInterval) {
          clearInterval(wsRef.current.pingInterval);
        }

        // Attempt to reconnect with exponential backoff
        if (isAuthenticated && reconnectAttempts.current < 5) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);

          // Clear any existing timeout
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }

          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connectWebSocket();
          }, delay);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
    }
  }, [isAuthenticated, user, queryClient]);

  // Set up WebSocket connection
  useEffect(() => {
    if (import.meta.env.VITE_REALTIME_ENABLED === "true") {
      connectWebSocket();
    }

    return () => {
      if (wsRef.current) {
        if (wsRef.current.pingInterval) {
          clearInterval(wsRef.current.pingInterval);
        }
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connectWebSocket]);

  // Update state when data changes
  useEffect(() => {
    if (notificationsData?.data) {
      dispatch({ type: "SET_NOTIFICATIONS", payload: notificationsData.data });
    }
  }, [notificationsData]);

  useEffect(() => {
    if (unreadCountData?.data?.count !== undefined) {
      dispatch({ type: "SET_UNREAD_COUNT", payload: unreadCountData.data.count });
    }
  }, [unreadCountData]);

  useEffect(() => {
    if (preferencesData?.data) {
      dispatch({ type: "SET_PREFERENCES", payload: preferencesData.data });
    }
  }, [preferencesData]);

  // Enhanced toast notification with better timing
  const showNotificationToast = useCallback(
    (notification) => {
      if (!state.preferences?.toast_enabled) return;

      const toastConfig = {
        duration: 4000,
        position: "top-right",
      };

      const toastMessage = notification.title || notification.message;

      switch (notification.type) {
        case "task_assigned":
        case "task_completed":
          toast(toastMessage, { ...toastConfig, icon: "📋" });
          break;
        case "bill_due":
        case "payment_received":
          toast(toastMessage, { ...toastConfig, icon: "💰" });
          break;
        case "swap_request":
        case "swap_accepted":
          toast(toastMessage, { ...toastConfig, icon: "🔄" });
          break;
        case "member_joined":
          toast(toastMessage, { ...toastConfig, icon: "👋" });
          break;
        default:
          toast(toastMessage, toastConfig);
      }

      // Browser notification if permission granted
      if (
        state.preferences?.browser_notifications &&
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        new Notification(notification.title, {
          body: notification.message,
          icon: "/notification-icon.png",
          tag: notification.id, // Prevent duplicates
        });
      }
    },
    [state.preferences]
  );

  // Notification methods
  const markAsRead = async (notificationId) => {
    return markReadMutation.mutateAsync(notificationId);
  };

  const markAllAsRead = async () => {
    return markAllReadMutation.mutateAsync();
  };

  const deleteNotification = async (notificationId) => {
    return deleteNotificationMutation.mutateAsync(notificationId);
  };

  const batchMarkAsRead = async (notificationIds) => {
    return batchMarkReadMutation.mutateAsync(notificationIds);
  };

  const updatePreferences = async (preferences) => {
    return updatePreferencesMutation.mutateAsync(preferences);
  };

  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  // Browser notification permission
  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      const granted = permission === "granted";

      // Update preferences if permission was granted
      if (granted && !state.preferences?.browser_notifications) {
        await updatePreferences({
          ...state.preferences,
          browser_notifications: true,
        });
      }

      return granted;
    }
    return false;
  };

  const value = {
    ...state,
    isLoading: notificationsLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    batchMarkAsRead,
    updatePreferences,
    refetchNotifications,
    refetchUnreadCount,
    requestNotificationPermission,
    showNotificationToast,
    clearError,
    // Loading states
    isMarkingRead: markReadMutation.isPending,
    isMarkingAllRead: markAllReadMutation.isPending,
    isDeletingNotification: deleteNotificationMutation.isPending,
    isBatchMarking: batchMarkReadMutation.isPending,
    isUpdatingPreferences: updatePreferencesMutation.isPending,
    // Connection status
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
    // Computed properties
    hasUnread: state.unreadCount > 0,
    recentNotifications: state.notifications.slice(0, 5),
    urgentNotifications: state.notifications.filter((n) => ["bill_due", "task_overdue"].includes(n.type) && !n.read_at),
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};

export default NotificationContext;
