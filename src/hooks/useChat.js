import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { chatAPI } from '../lib/api';
import { useHousehold } from '../contexts/HouseholdContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { useCallback, useRef, useEffect } from 'react';

export const useChat = (options = {}) => {
  const { activeHouseholdId } = useHousehold();
  const { showNotificationToast } = useNotifications();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const {
    limit = 50,
    enableInfiniteScroll = true,
    autoMarkAsRead = true,
  } = options;

  // Infinite query for chat messages with pagination
  const {
    data: messagesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: messagesLoading,
    error: messagesError,
    refetch: refetchMessages,
  } = useInfiniteQuery({
    queryKey: ['households', activeHouseholdId, 'messages'],
    queryFn: ({ pageParam = 1 }) => 
      chatAPI.getMessages(activeHouseholdId, { page: pageParam, limit }),
    enabled: !!activeHouseholdId,
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.meta?.pagination?.hasMore) {
        return lastPage.meta.pagination.page + 1;
      }
      return undefined;
    },
    staleTime: 30 * 1000, // 30 seconds
  });

  // Create message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (data) => chatAPI.createMessage(activeHouseholdId, data),
    onMutate: async (newMessage) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['households', activeHouseholdId, 'messages'] });

      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData(['households', activeHouseholdId, 'messages']);

      // Optimistically update to the new value
      const optimisticMessage = {
        id: `temp_${Date.now()}`,
        content: newMessage.content,
        message_type: newMessage.message_type || 'text',
        user_id: user.id,
        user_name: user.full_name,
        user_avatar: user.avatar_url,
        created_at: new Date().toISOString(),
        poll: newMessage.poll || null,
        ...newMessage,
      };

      queryClient.setQueryData(['households', activeHouseholdId, 'messages'], (old) => {
        if (!old) return old;
        
        const firstPage = old.pages[0];
        return {
          ...old,
          pages: [
            {
              ...firstPage,
              data: [optimisticMessage, ...firstPage.data],
            },
            ...old.pages.slice(1),
          ],
        };
      });

      return { previousMessages, optimisticMessage };
    },
    onError: (err, newMessage, context) => {
      // Revert the optimistic update
      if (context?.previousMessages) {
        queryClient.setQueryData(['households', activeHouseholdId, 'messages'], context.previousMessages);
      }
      showNotificationToast({
        type: 'error',
        title: 'Failed to send message',
        message: err.message,
      });
    },
    onSuccess: (data, variables, context) => {
      // Replace optimistic message with real one
      queryClient.setQueryData(['households', activeHouseholdId, 'messages'], (old) => {
        if (!old) return old;
        
        const firstPage = old.pages[0];
        return {
          ...old,
          pages: [
            {
              ...firstPage,
              data: firstPage.data.map(msg => 
                msg.id === context.optimisticMessage.id ? data.data : msg
              ),
            },
            ...old.pages.slice(1),
          ],
        };
      });
    },
  });

  // Edit message mutation
  const editMessageMutation = useMutation({
    mutationFn: ({ messageId, data }) => chatAPI.updateMessage(messageId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['households', activeHouseholdId, 'messages'] });
    },
  });

  // Delete message mutation
  const deleteMessageMutation = useMutation({
    mutationFn: chatAPI.deleteMessage,
    onMutate: async (messageId) => {
      await queryClient.cancelQueries({ queryKey: ['households', activeHouseholdId, 'messages'] });
      
      const previousMessages = queryClient.getQueryData(['households', activeHouseholdId, 'messages']);
      
      // Optimistically remove message
      queryClient.setQueryData(['households', activeHouseholdId, 'messages'], (old) => {
        if (!old) return old;
        
        return {
          ...old,
          pages: old.pages.map(page => ({
            ...page,
            data: page.data.filter(msg => msg.id !== messageId),
          })),
        };
      });
      
      return { previousMessages };
    },
    onError: (err, messageId, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(['households', activeHouseholdId, 'messages'], context.previousMessages);
      }
    },
  });

  // Vote on poll mutation
  const votePollMutation = useMutation({
    mutationFn: ({ pollId, selectedOptions }) => chatAPI.votePoll(pollId, selectedOptions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['households', activeHouseholdId, 'messages'] });
    },
  });

  // Upload file mutation
  const uploadFileMutation = useMutation({
    mutationFn: ({ file, messageData }) => chatAPI.uploadFile(activeHouseholdId, file, messageData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['households', activeHouseholdId, 'messages'] });
    },
  });

  // Search messages
  const searchMessagesMutation = useMutation({
    mutationFn: ({ query, options }) => chatAPI.searchMessages(activeHouseholdId, query, options),
  });

  // React to message mutation
  const reactToMessageMutation = useMutation({
    mutationFn: ({ messageId, reaction }) => chatAPI.reactToMessage(messageId, reaction),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['households', activeHouseholdId, 'messages'] });
    },
  });

  // Get all messages as flat array
  const messages = messagesData?.pages?.flatMap(page => page.data) || [];

  // Helper functions
  const sendMessage = useCallback(async (content, options = {}) => {
    return sendMessageMutation.mutateAsync({
      content,
      message_type: 'text',
      ...options,
    });
  }, [sendMessageMutation]);

  const sendPoll = useCallback(async (question, pollOptions, settings = {}) => {
    return sendMessageMutation.mutateAsync({
      content: question,
      message_type: 'poll',
      poll: {
        question,
        options: pollOptions,
        multiple_choice: settings.multiple_choice || false,
        expires_at: settings.expires_at || null,
      },
    });
  }, [sendMessageMutation]);

  const replyToMessage = useCallback(async (parentMessageId, content) => {
    return sendMessageMutation.mutateAsync({
      content,
      replied_to: parentMessageId,
    });
  }, [sendMessageMutation]);

  const editMessage = useCallback(async (messageId, newContent) => {
    return editMessageMutation.mutateAsync({
      messageId,
      data: { content: newContent },
    });
  }, [editMessageMutation]);

  const deleteMessage = useCallback(async (messageId) => {
    return deleteMessageMutation.mutateAsync(messageId);
  }, [deleteMessageMutation]);

  const votePoll = useCallback(async (pollId, selectedOptions) => {
    return votePollMutation.mutateAsync({ pollId, selectedOptions });
  }, [votePollMutation]);

  const uploadFile = useCallback(async (file, messageData = {}) => {
    return uploadFileMutation.mutateAsync({ file, messageData });
  }, [uploadFileMutation]);

  const searchMessages = useCallback(async (query, options = {}) => {
    return searchMessagesMutation.mutateAsync({ query, options });
  }, [searchMessagesMutation]);

  const reactToMessage = useCallback(async (messageId, reaction) => {
    return reactToMessageMutation.mutateAsync({ messageId, reaction });
  }, [reactToMessageMutation]);

  const removeReaction = useCallback(async (messageId, reaction) => {
    return chatAPI.removeReaction(messageId, reaction);
  }, []);

  // Load more messages
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Get message by ID
  const getMessageById = useCallback((messageId) => {
    return messages.find(msg => msg.id === messageId);
  }, [messages]);

  // Get replies to a message
  const getReplies = useCallback((messageId) => {
    return messages.filter(msg => msg.replied_to === messageId);
  }, [messages]);

  // Get recent messages (last hour)
  const getRecentMessages = useCallback(() => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return messages.filter(msg => new Date(msg.created_at) > oneHourAgo);
  }, [messages]);

  return {
    // Data
    messages,
    messagePages: messagesData?.pages || [],
    
    // Loading states
    isLoading: messagesLoading,
    isSending: sendMessageMutation.isPending,
    isEditing: editMessageMutation.isPending,
    isDeleting: deleteMessageMutation.isPending,
    isVoting: votePollMutation.isPending,
    isUploading: uploadFileMutation.isPending,
    isSearching: searchMessagesMutation.isPending,
    isReacting: reactToMessageMutation.isPending,
    isFetchingNextPage,
    
    // Error states
    error: messagesError,
    sendError: sendMessageMutation.error,
    
    // Pagination
    hasNextPage,
    loadMore,
    
    // Actions
    sendMessage,
    sendPoll,
    replyToMessage,
    editMessage,
    deleteMessage,
    votePoll,
    uploadFile,
    searchMessages,
    reactToMessage,
    removeReaction,
    refetchMessages,
    
    // Utilities
    getMessageById,
    getReplies,
    getRecentMessages,
    
    // Search results
    searchResults: searchMessagesMutation.data?.data || [],
    
    // Computed properties
    messageCount: messages.length,
    hasMessages: messages.length > 0,
    unreadCount: messages.filter(msg => !msg.read_at && msg.user_id !== user?.id).length,
  };
};

export default useChat;
