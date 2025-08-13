import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsAPI } from '../lib/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const NotificationContext = createContext();

// Notification state reducer
const notificationReducer = (state, action) => {
  switch (action.type) {
    case 'SET_NOTIFICATIONS':
      return {
        ...state,
        notifications: action.payload,
      };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      };
    case 'UPDATE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload.id ? { ...n, ...action.payload } : n
        ),
      };
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
      };
    case 'SET_UNREAD_COUNT':
      return {
        ...state,
        unreadCount: action.payload,
      };
    case 'MARK_READ':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload ? { ...n, read_at: new Date().toISOString() } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    case 'MARK_ALL_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => ({ ...n, read_at: new Date().toISOString() })),
        unreadCount: 0,
      };
    case 'SET_PREFERENCES':
      return {
        ...state,
        preferences: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    default:
      return state;
  }
};

const initialState = {
  notifications: [],
  unreadCount: 0,
  preferences: null,
  error: null,
};

export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuth();

  // Query notifications
  const {
    data: notificationsData,
    isLoading: notificationsLoading,
    error: notificationsError,
    refetch: refetchNotifications,
  } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsAPI.getNotifications({ limit: 50 }),
    enabled: isAuthenticated,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });

  // Query unread count
  const {
    data: unreadCountData,
    refetch: refetchUnreadCount,
  } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: notificationsAPI.getUnreadCount,
    enabled: isAuthenticated,
    staleTime: 15 * 1000, // 15 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });

  // Query notification preferences
  const {
    data: preferencesData,
  } = useQuery({
    queryKey: ['notifications', 'preferences'],
    queryFn: notificationsAPI.getPreferences,
    enabled: isAuthenticated,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Mark as read mutation
  const markReadMutation = useMutation({
    mutationFn: notificationsAPI.markRead,
    onMutate: async (notificationId) => {
      // Optimistic update
      dispatch({ type: 'MARK_READ', payload: notificationId });
    },
    onError: (error, notificationId) => {
      // Revert on error
      refetchNotifications();
      console.error('Failed to mark notification as read:', error);
    },
  });

  // Mark all as read mutation
  const markAllReadMutation = useMutation({
    mutationFn: notificationsAPI.markAllRead,
    onMutate: async () => {
      // Optimistic update
      dispatch({ type: 'MARK_ALL_READ' });
    },
    onError: () => {
      // Revert on error
      refetchNotifications();
    },
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: notificationsAPI.deleteNotification,
    onMutate: async (notificationId) => {
      // Optimistic update
      dispatch({ type: 'REMOVE_NOTIFICATION', payload: notificationId });
    },
    onError: () => {
      // Revert on error
      refetchNotifications();
    },
  });

  // Batch mark as read mutation
  const batchMarkReadMutation = useMutation({
    mutationFn: notificationsAPI.batchMarkRead,
    onSuccess: () => {
      refetchNotifications();
      refetchUnreadCount();
    },
  });

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: notificationsAPI.updatePreferences,
    onSuccess: (data) => {
      dispatch({ type: 'SET_PREFERENCES', payload: data.data });
    },
  });

  // Update state when data changes
  useEffect(() => {
    if (notificationsData?.data) {
      dispatch({ type: 'SET_NOTIFICATIONS', payload: notificationsData.data });
    }
  }, [notificationsData]);

  useEffect(() => {
    if (unreadCountData?.data?.count !== undefined) {
      dispatch({ type: 'SET_UNREAD_COUNT', payload: unreadCountData.data.count });
    }
  }, [unreadCountData]);

  useEffect(() => {
    if (preferencesData?.data) {
      dispatch({ type: 'SET_PREFERENCES', payload: preferencesData.data });
    }
  }, [preferencesData]);

  // Handle errors
  useEffect(() => {
    if (notificationsError) {
      dispatch({ type: 'SET_ERROR', payload: notificationsError.message });
    }
  }, [notificationsError]);

  // Real-time notification handling
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // Set up Supabase real-time subscription for notifications
    let subscription;
    
    const setupRealtimeSubscription = async () => {
      try {
        // This would be the actual Supabase client setup
        // const { createClient } = await import('@supabase/supabase-js');
        // const supabase = createClient(process.env.REACT_APP_SUPABASE_URL, process.env.REACT_APP_SUPABASE_ANON_KEY);
        
        // subscription = supabase
        //   .channel(`notifications:${user.id}`)
        //   .on('postgres_changes', {
        //     event: 'INSERT',
        //     schema: 'public',
        //     table: 'notifications',
        //     filter: `user_id=eq.${user.id}`
        //   }, (payload) => {
        //     const newNotification = payload.new;
        //     dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification });
        //     showNotificationToast(newNotification);
        //   })
        //   .on('postgres_changes', {
        //     event: 'UPDATE',
        //     schema: 'public',
        //     table: 'notifications',
        //     filter: `user_id=eq.${user.id}`
        //   }, (payload) => {
        //     dispatch({ type: 'UPDATE_NOTIFICATION', payload: payload.new });
        //   })
        //   .subscribe();
      } catch (error) {
        console.error('Failed to set up real-time subscription:', error);
      }
    };

    if (process.env.REACT_APP_REALTIME_ENABLED === 'true') {
      setupRealtimeSubscription();
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [isAuthenticated, user]);

  // Show toast notification
  const showNotificationToast = (notification) => {
    if (!state.preferences?.toast_enabled) return;

    const toastConfig = {
      duration: 4000,
      position: 'top-right',
    };

    switch (notification.type) {
      case 'task_assigned':
        toast('📋 New task assigned!', { ...toastConfig, icon: '📋' });
        break;
      case 'bill_due':
        toast('💰 Bill payment due!', { ...toastConfig, icon: '💰' });
        break;
      case 'swap_request':
        toast('🔄 Task swap request!', { ...toastConfig, icon: '🔄' });
        break;
      case 'payment_received':
        toast('✅ Payment received!', { ...toastConfig, icon: '✅' });
        break;
      default:
        toast(notification.title, toastConfig);
    }
  };

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

  // Browser notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
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
    // Loading states
    isMarkingRead: markReadMutation.isPending,
    isMarkingAllRead: markAllReadMutation.isPending,
    isDeletingNotification: deleteNotificationMutation.isPending,
    isBatchMarking: batchMarkReadMutation.isPending,
    isUpdatingPreferences: updatePreferencesMutation.isPending,
    // Computed properties
    hasUnread: state.unreadCount > 0,
    recentNotifications: state.notifications.slice(0, 5),
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;
