import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksAPI } from '../lib/api';
import { useHousehold } from '../contexts/HouseholdContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';

export const useTasks = (filters = {}) => {
  const { activeHouseholdId } = useHousehold();
  const { showNotificationToast } = useNotifications();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get tasks for active household
  const {
    data: tasksData,
    isLoading: tasksLoading,
    error: tasksError,
    refetch: refetchTasks,
  } = useQuery({
    queryKey: ['households', activeHouseholdId, 'tasks', filters],
    queryFn: () => tasksAPI.getTasks(activeHouseholdId, filters),
    enabled: !!activeHouseholdId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  // Get task swaps for active household
  const {
    data: swapsData,
    isLoading: swapsLoading,
    error: swapsError,
    refetch: refetchSwaps,
  } = useQuery({
    queryKey: ['households', activeHouseholdId, 'task-swaps'],
    queryFn: () => tasksAPI.getSwaps(activeHouseholdId),
    enabled: !!activeHouseholdId,
    staleTime: 30 * 1000, // 30 seconds
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: (data) => tasksAPI.createTask(activeHouseholdId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['households', activeHouseholdId, 'tasks'] });
      queryClient.invalidateQueries({ queryKey: ['households', activeHouseholdId, 'dashboard'] });
      
      showNotificationToast({
        type: 'task_created',
        title: 'Task Created',
        message: `${data.data.title} has been added`,
      });
    },
    onError: (error) => {
      showNotificationToast({
        type: 'error',
        title: 'Failed to create task',
        message: error.message,
      });
    },
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, data }) => tasksAPI.updateTask(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['households', activeHouseholdId, 'tasks'] });
      queryClient.invalidateQueries({ queryKey: ['households', activeHouseholdId, 'dashboard'] });
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: tasksAPI.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['households', activeHouseholdId, 'tasks'] });
      queryClient.invalidateQueries({ queryKey: ['households', activeHouseholdId, 'dashboard'] });
    },
  });

  // Complete task mutation
  const completeTaskMutation = useMutation({
    mutationFn: tasksAPI.completeTask,
    onMutate: async (taskId) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['households', activeHouseholdId, 'tasks'] });
      
      const previousTasks = queryClient.getQueryData(['households', activeHouseholdId, 'tasks']);
      
      queryClient.setQueryData(['households', activeHouseholdId, 'tasks'], (old) => {
        if (!old?.data) return old;
        
        return {
          ...old,
          data: old.data.map(task => 
            task.id === taskId 
              ? { 
                  ...task, 
                  status: 'completed',
                  assignments: task.assignments.map(assignment => ({
                    ...assignment,
                    completed_at: new Date().toISOString(),
                  }))
                }
              : task
          ),
        };
      });
      
      return { previousTasks };
    },
    onError: (err, taskId, context) => {
      // Revert optimistic update on error
      if (context?.previousTasks) {
        queryClient.setQueryData(['households', activeHouseholdId, 'tasks'], context.previousTasks);
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['households', activeHouseholdId, 'tasks'] });
      queryClient.invalidateQueries({ queryKey: ['households', activeHouseholdId, 'dashboard'] });
      
      showNotificationToast({
        type: 'task_completed',
        title: 'Task Completed',
        message: 'Great job! 🎉',
      });
    },
  });

  // Uncomplete task mutation
  const uncompleteTaskMutation = useMutation({
    mutationFn: tasksAPI.uncompleteTask,
    onMutate: async (taskId) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['households', activeHouseholdId, 'tasks'] });
      
      const previousTasks = queryClient.getQueryData(['households', activeHouseholdId, 'tasks']);
      
      queryClient.setQueryData(['households', activeHouseholdId, 'tasks'], (old) => {
        if (!old?.data) return old;
        
        return {
          ...old,
          data: old.data.map(task => 
            task.id === taskId 
              ? { 
                  ...task, 
                  status: 'pending',
                  assignments: task.assignments.map(assignment => ({
                    ...assignment,
                    completed_at: null,
                  }))
                }
              : task
          ),
        };
      });
      
      return { previousTasks };
    },
    onError: (err, taskId, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['households', activeHouseholdId, 'tasks'], context.previousTasks);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['households', activeHouseholdId, 'tasks'] });
      queryClient.invalidateQueries({ queryKey: ['households', activeHouseholdId, 'dashboard'] });
    },
  });

  // Assign task mutation
  const assignTaskMutation = useMutation({
    mutationFn: ({ taskId, userIds }) => tasksAPI.assignTask(taskId, userIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['households', activeHouseholdId, 'tasks'] });
    },
  });

  // Batch complete tasks mutation
  const batchCompleteTasksMutation = useMutation({
    mutationFn: tasksAPI.batchCompleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['households', activeHouseholdId, 'tasks'] });
      queryClient.invalidateQueries({ queryKey: ['households', activeHouseholdId, 'dashboard'] });
      
      showNotificationToast({
        type: 'tasks_completed',
        title: 'Tasks Completed',
        message: 'Multiple tasks marked as complete! 🎉',
      });
    },
  });

  // Task swap mutations
  const requestSwapMutation = useMutation({
    mutationFn: ({ taskId, data }) => tasksAPI.requestSwap(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['households', activeHouseholdId, 'task-swaps'] });
      
      showNotificationToast({
        type: 'swap_requested',
        title: 'Swap Requested',
        message: 'Your task swap request has been sent',
      });
    },
  });

  const acceptSwapMutation = useMutation({
    mutationFn: tasksAPI.acceptSwap,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['households', activeHouseholdId, 'tasks'] });
      queryClient.invalidateQueries({ queryKey: ['households', activeHouseholdId, 'task-swaps'] });
      
      showNotificationToast({
        type: 'swap_accepted',
        title: 'Swap Accepted',
        message: 'Task has been reassigned',
      });
    },
  });

  const declineSwapMutation = useMutation({
    mutationFn: tasksAPI.declineSwap,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['households', activeHouseholdId, 'task-swaps'] });
    },
  });

  // Helper functions
  const getTaskById = (taskId) => {
    return tasksData?.data?.find(task => task.id === taskId);
  };

  const getMyTasks = () => {
    if (!user?.id || !tasksData?.data) return [];
    
    return tasksData.data.filter(task => 
      task.assignments?.some(assignment => assignment.assigned_to === user.id)
    );
  };

  const getPendingTasks = () => {
    return tasksData?.data?.filter(task => task.status === 'pending') || [];
  };

  const getCompletedTasks = () => {
    return tasksData?.data?.filter(task => task.status === 'completed') || [];
  };

  const getOverdueTasks = () => {
    return tasksData?.data?.filter(task => task.status === 'overdue') || [];
  };

  const getTasksDueToday = () => {
    const today = new Date().toISOString().split('T')[0];
    return tasksData?.data?.filter(task => 
      task.due_date && task.due_date.startsWith(today) && task.status === 'pending'
    ) || [];
  };

  const getRecurringTasks = () => {
    return tasksData?.data?.filter(task => task.is_recurring) || [];
  };

  const getPendingSwapsForMe = () => {
    if (!user?.id || !swapsData?.data) return [];
    
    return swapsData.data.filter(swap => 
      swap.to_user.id === user.id && swap.status === 'pending'
    );
  };

  const getMySwapRequests = () => {
    if (!user?.id || !swapsData?.data) return [];
    
    return swapsData.data.filter(swap => swap.from_user.id === user.id);
  };

  return {
    // Data
    tasks: tasksData?.data || [],
    swaps: swapsData?.data || [],
    
    // Loading states
    isLoading: tasksLoading || swapsLoading,
    tasksLoading,
    swapsLoading,
    
    // Error states
    error: tasksError || swapsError,
    tasksError,
    swapsError,
    
    // Mutation loading states
    isCreatingTask: createTaskMutation.isPending,
    isUpdatingTask: updateTaskMutation.isPending,
    isDeletingTask: deleteTaskMutation.isPending,
    isCompletingTask: completeTaskMutation.isPending,
    isUncompletingTask: uncompleteTaskMutation.isPending,
    isAssigningTask: assignTaskMutation.isPending,
    isBatchCompleting: batchCompleteTasksMutation.isPending,
    isRequestingSwap: requestSwapMutation.isPending,
    isAcceptingSwap: acceptSwapMutation.isPending,
    isDecliningSwap: declineSwapMutation.isPending,
    
    // Actions
    createTask: createTaskMutation.mutateAsync,
    updateTask: (taskId, data) => updateTaskMutation.mutateAsync({ taskId, data }),
    deleteTask: deleteTaskMutation.mutateAsync,
    completeTask: completeTaskMutation.mutateAsync,
    uncompleteTask: uncompleteTaskMutation.mutateAsync,
    assignTask: (taskId, userIds) => assignTaskMutation.mutateAsync({ taskId, userIds }),
    batchCompleteTasks: batchCompleteTasksMutation.mutateAsync,
    requestSwap: (taskId, data) => requestSwapMutation.mutateAsync({ taskId, data }),
    acceptSwap: acceptSwapMutation.mutateAsync,
    declineSwap: declineSwapMutation.mutateAsync,
    
    // Utilities
    refetchTasks,
    refetchSwaps,
    getTaskById,
    getMyTasks,
    getPendingTasks,
    getCompletedTasks,
    getOverdueTasks,
    getTasksDueToday,
    getRecurringTasks,
    getPendingSwapsForMe,
    getMySwapRequests,
    
    // Computed properties
    myTaskCount: getMyTasks().length,
    pendingTaskCount: getPendingTasks().length,
    overdueTaskCount: getOverdueTasks().length,
    todayTaskCount: getTasksDueToday().length,
    pendingSwapCount: getPendingSwapsForMe().length,
  };
};

export default useTasks;
