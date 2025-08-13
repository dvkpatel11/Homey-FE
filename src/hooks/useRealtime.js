import { useEffect, useRef, useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useHousehold } from '../contexts/HouseholdContext';
import { useNotifications } from '../contexts/NotificationContext';

export const useRealtime = () => {
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();
  const { activeHouseholdId } = useHousehold();
  const { showNotificationToast } = useNotifications();
  
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const supabaseClientRef = useRef(null);
  const subscriptionsRef = useRef(new Map());

  // Initialize Supabase client
  const initializeSupabase = useCallback(async () => {
    if (process.env.REACT_APP_REALTIME_ENABLED !== 'true') {
      console.log('Real-time features disabled');
      return null;
    }

    try {
      // Dynamic import to avoid bundle size when not needed
      const { createClient } = await import('@supabase/supabase-js');
      
      const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
      const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase environment variables not configured');
      }

      const client = createClient(supabaseUrl, supabaseAnonKey, {
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      });

      supabaseClientRef.current = client;
      setIsConnected(true);
      setConnectionError(null);
      
      return client;
    } catch (error) {
      console.error('Failed to initialize Supabase client:', error);
      setConnectionError(error.message);
      setIsConnected(false);
      return null;
    }
  }, []);

  // Create subscription
  const createSubscription = useCallback((channelName, config) => {
    const client = supabaseClientRef.current;
    if (!client) return null;

    try {
      const channel = client.channel(channelName);
      
      // Add postgres changes listener
      if (config.table) {
        channel.on('postgres_changes', {
          event: config.event || '*',
          schema: config.schema || 'public',
          table: config.table,
          filter: config.filter,
        }, (payload) => {
          try {
            config.onData?.(payload);
          } catch (error) {
            console.error('Error handling realtime data:', error);
          }
        });
      }

      // Add presence listeners
      if (config.enablePresence) {
        channel.on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          config.onPresenceSync?.(state);
        });

        channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
          config.onPresenceJoin?.(key, newPresences);
        });

        channel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          config.onPresenceLeave?.(key, leftPresences);
        });
      }

      // Subscribe and track
      const subscription = channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`✅ Subscribed to ${channelName}`);
          config.onSubscribed?.();
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`❌ Subscription error for ${channelName}`);
          config.onError?.('Subscription failed');
        }
      });

      subscriptionsRef.current.set(channelName, { channel, subscription });
      return { channel, subscription };
    } catch (error) {
      console.error(`Failed to create subscription ${channelName}:`, error);
      config.onError?.(error.message);
      return null;
    }
  }, []);

  // Remove subscription
  const removeSubscription = useCallback((channelName) => {
    const subscription = subscriptionsRef.current.get(channelName);
    if (subscription) {
      subscription.channel.unsubscribe();
      subscriptionsRef.current.delete(channelName);
      console.log(`🔌 Unsubscribed from ${channelName}`);
    }
  }, []);

  // Subscribe to chat messages
  const subscribeToChatMessages = useCallback((householdId) => {
    if (!householdId) return;

    const channelName = `chat:${householdId}`;
    
    return createSubscription(channelName, {
      table: 'messages',
      filter: `household_id=eq.${householdId}`,
      onData: (payload) => {
        const { eventType, new: newMessage, old: oldMessage } = payload;
        
        switch (eventType) {
          case 'INSERT':
            // Add new message to cache
            queryClient.setQueryData(['households', householdId, 'messages'], (old) => {
              if (!old) return old;
              
              const firstPage = old.pages[0];
              return {
                ...old,
                pages: [
                  {
                    ...firstPage,
                    data: [newMessage, ...firstPage.data],
                  },
                  ...old.pages.slice(1),
                ],
              };
            });
            
            // Show notification if message is from another user
            if (newMessage.user_id !== user?.id) {
              showNotificationToast({
                type: 'new_message',
                title: `${newMessage.user_name}`,
                message: newMessage.content.substring(0, 50) + (newMessage.content.length > 50 ? '...' : ''),
              });
            }
            break;
            
          case 'UPDATE':
            // Update message in cache
            queryClient.setQueryData(['households', householdId, 'messages'], (old) => {
              if (!old) return old;
              
              return {
                ...old,
                pages: old.pages.map(page => ({
                  ...page,
                  data: page.data.map(msg => 
                    msg.id === newMessage.id ? newMessage : msg
                  ),
                })),
              };
            });
            break;
            
          case 'DELETE':
            // Remove message from cache
            queryClient.setQueryData(['households', householdId, 'messages'], (old) => {
              if (!old) return old;
              
              return {
                ...old,
                pages: old.pages.map(page => ({
                  ...page,
                  data: page.data.filter(msg => msg.id !== oldMessage.id),
                })),
              };
            });
            break;
        }
      },
      onError: (error) => {
        console.error('Chat subscription error:', error);
      },
    });
  }, [createSubscription, queryClient, user?.id, showNotificationToast]);

  // Subscribe to notifications
  const subscribeToNotifications = useCallback((userId) => {
    if (!userId) return;

    const channelName = `notifications:${userId}`;
    
    return createSubscription(channelName, {
      table: 'notifications',
      filter: `user_id=eq.${userId}`,
      onData: (payload) => {
        const { eventType, new: newNotification } = payload;
        
        if (eventType === 'INSERT') {
          // Add notification to cache
          queryClient.setQueryData(['notifications'], (old) => {
            if (!old?.data) return old;
            return {
              ...old,
              data: [newNotification, ...old.data],
            };
          });
          
          // Update unread count
          queryClient.setQueryData(['notifications', 'unread-count'], (old) => {
            if (!old?.data) return old;
            return {
              ...old,
              data: { count: old.data.count + 1 },
            };
          });
          
          // Show toast notification
          showNotificationToast(newNotification);
        }
      },
    });
  }, [createSubscription, queryClient, showNotificationToast]);

  // Subscribe to task updates
  const subscribeToTaskUpdates = useCallback((householdId) => {
    if (!householdId) return;

    const channelName = `tasks:${householdId}`;
    
    return createSubscription(channelName, {
      table: 'tasks',
      filter: `household_id=eq.${householdId}`,
      onData: (payload) => {
        // Invalidate tasks query to refresh
        queryClient.invalidateQueries({ 
          queryKey: ['households', householdId, 'tasks'] 
        });
        
        // Invalidate dashboard to update counts
        queryClient.invalidateQueries({ 
          queryKey: ['households', householdId, 'dashboard'] 
        });
      },
    });
  }, [createSubscription, queryClient]);

  // Subscribe to bill/expense updates
  const subscribeToExpenseUpdates = useCallback((householdId) => {
    if (!householdId) return;

    const channelName = `expenses:${householdId}`;
    
    return createSubscription(channelName, {
      table: 'bills',
      filter: `household_id=eq.${householdId}`,
      onData: (payload) => {
        // Invalidate related queries
        queryClient.invalidateQueries({ 
          queryKey: ['households', householdId, 'bills'] 
        });
        queryClient.invalidateQueries({ 
          queryKey: ['households', householdId, 'balances'] 
        });
        queryClient.invalidateQueries({ 
          queryKey: ['households', householdId, 'dashboard'] 
        });
      },
    });
  }, [createSubscription, queryClient]);

  // Subscribe to user presence (who's online)
  const subscribeToPresence = useCallback((householdId, userInfo) => {
    if (!householdId || !userInfo) return;

    const channelName = `presence:${householdId}`;
    
    return createSubscription(channelName, {
      enablePresence: true,
      onSubscribed: () => {
        // Track this user's presence
        const client = supabaseClientRef.current;
        if (client) {
          const channel = subscriptionsRef.current.get(channelName)?.channel;
          channel?.track({
            user_id: userInfo.id,
            user_name: userInfo.full_name,
            user_avatar: userInfo.avatar_url,
            online_at: new Date().toISOString(),
          });
        }
      },
      onPresenceSync: (state) => {
        // Update presence data in cache or context
        console.log('Presence sync:', state);
      },
      onPresenceJoin: (key, newPresences) => {
        console.log('User joined:', key, newPresences);
      },
      onPresenceLeave: (key, leftPresences) => {
        console.log('User left:', key, leftPresences);
      },
    });
  }, [createSubscription]);

  // Initialize and cleanup
  useEffect(() => {
    if (isAuthenticated) {
      initializeSupabase();
    }

    return () => {
      // Cleanup all subscriptions
      subscriptionsRef.current.forEach((_, channelName) => {
        removeSubscription(channelName);
      });
    };
  }, [isAuthenticated, initializeSupabase, removeSubscription]);

  // Auto-subscribe to relevant channels
  useEffect(() => {
    if (!isConnected || !user || !activeHouseholdId) return;

    // Subscribe to core features
    subscribeToChatMessages(activeHouseholdId);
    subscribeToNotifications(user.id);
    subscribeToTaskUpdates(activeHouseholdId);
    subscribeToExpenseUpdates(activeHouseholdId);
    subscribeToPresence(activeHouseholdId, user);

    // Cleanup when household changes
    return () => {
      removeSubscription(`chat:${activeHouseholdId}`);
      removeSubscription(`tasks:${activeHouseholdId}`);
      removeSubscription(`expenses:${activeHouseholdId}`);
      removeSubscription(`presence:${activeHouseholdId}`);
    };
  }, [isConnected, user, activeHouseholdId, subscribeToChatMessages, subscribeToNotifications, subscribeToTaskUpdates, subscribeToExpenseUpdates, subscribeToPresence, removeSubscription]);

  return {
    isConnected,
    connectionError,
    isEnabled: process.env.REACT_APP_REALTIME_ENABLED === 'true',
    
    // Manual subscription methods
    createSubscription,
    removeSubscription,
    
    // Specialized subscription methods
    subscribeToChatMessages,
    subscribeToNotifications,
    subscribeToTaskUpdates,
    subscribeToExpenseUpdates,
    subscribeToPresence,
    
    // Utilities
    getActiveSubscriptions: () => Array.from(subscriptionsRef.current.keys()),
    reconnect: initializeSupabase,
  };
};

export default useRealtime;
