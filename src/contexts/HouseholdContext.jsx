import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { householdsAPI } from '../lib/api';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from './AuthContext';

const HouseholdContext = createContext();

// Household state reducer
const householdReducer = (state, action) => {
  switch (action.type) {
    case 'SET_HOUSEHOLDS':
      return {
        ...state,
        households: action.payload,
      };
    case 'SET_ACTIVE_HOUSEHOLD':
      return {
        ...state,
        activeHousehold: action.payload,
        activeHouseholdId: action.payload?.id || null,
      };
    case 'SET_MEMBERS':
      return {
        ...state,
        members: action.payload,
      };
    case 'SET_DASHBOARD_DATA':
      return {
        ...state,
        dashboardData: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

const initialState = {
  households: [],
  activeHousehold: null,
  activeHouseholdId: null,
  members: [],
  dashboardData: null,
  isLoading: false,
  error: null,
};

export const HouseholdProvider = ({ children }) => {
  const [state, dispatch] = useReducer(householdReducer, initialState);
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const [activeHouseholdId, setActiveHouseholdId] = useLocalStorage('activeHouseholdId', null);

  // Query user's households
  const {
    data: householdsData,
    isLoading: householdsLoading,
    error: householdsError,
    refetch: refetchHouseholds,
  } = useQuery({
    queryKey: ['households'],
    queryFn: householdsAPI.getHouseholds,
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Query active household details
  const {
    data: activeHouseholdData,
    isLoading: activeHouseholdLoading,
    error: activeHouseholdError,
  } = useQuery({
    queryKey: ['households', activeHouseholdId],
    queryFn: () => householdsAPI.getHousehold(activeHouseholdId),
    enabled: !!activeHouseholdId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Query household members
  const {
    data: membersData,
    isLoading: membersLoading,
    error: membersError,
  } = useQuery({
    queryKey: ['households', activeHouseholdId, 'members'],
    queryFn: () => householdsAPI.getMembers(activeHouseholdId),
    enabled: !!activeHouseholdId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Query dashboard data
  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    error: dashboardError,
    refetch: refetchDashboard,
  } = useQuery({
    queryKey: ['households', activeHouseholdId, 'dashboard'],
    queryFn: () => householdsAPI.getDashboard(activeHouseholdId),
    enabled: !!activeHouseholdId,
    staleTime: 1 * 60 * 1000, // 1 minute (dashboard data changes frequently)
    refetchInterval: 2 * 60 * 1000, // Auto-refresh every 2 minutes
  });

  // Create household mutation
  const createHouseholdMutation = useMutation({
    mutationFn: householdsAPI.createHousehold,
    onSuccess: (data) => {
      queryClient.setQueryData(['households'], (old) => [...(old?.data || []), data.data]);
      switchHousehold(data.data.id);
    },
    onError: (error) => {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    },
  });

  // Update household mutation
  const updateHouseholdMutation = useMutation({
    mutationFn: ({ householdId, data }) => householdsAPI.updateHousehold(householdId, data),
    onSuccess: (data) => {
      queryClient.setQueryData(['households', data.data.id], data);
      queryClient.invalidateQueries({ queryKey: ['households'] });
    },
  });

  // Delete household mutation
  const deleteHouseholdMutation = useMutation({
    mutationFn: householdsAPI.deleteHousehold,
    onSuccess: (_, householdId) => {
      queryClient.invalidateQueries({ queryKey: ['households'] });
      if (activeHouseholdId === householdId) {
        switchHousehold(null);
      }
    },
  });

  // Leave household mutation
  const leaveHouseholdMutation = useMutation({
    mutationFn: householdsAPI.leaveHousehold,
    onSuccess: (_, householdId) => {
      queryClient.invalidateQueries({ queryKey: ['households'] });
      if (activeHouseholdId === householdId) {
        switchHousehold(null);
      }
    },
  });

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: ({ householdId, userId }) => householdsAPI.removeMember(householdId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['households', activeHouseholdId, 'members'] });
    },
  });

  // Generate invite mutation
  const generateInviteMutation = useMutation({
    mutationFn: householdsAPI.createInvite,
  });

  // Update state when data changes
  useEffect(() => {
    if (householdsData?.data) {
      dispatch({ type: 'SET_HOUSEHOLDS', payload: householdsData.data });
      
      // Auto-select first household if none is active
      if (!activeHouseholdId && householdsData.data.length > 0) {
        switchHousehold(householdsData.data[0].id);
      }
    }
  }, [householdsData, activeHouseholdId]);

  useEffect(() => {
    if (activeHouseholdData?.data) {
      dispatch({ type: 'SET_ACTIVE_HOUSEHOLD', payload: activeHouseholdData.data });
    }
  }, [activeHouseholdData]);

  useEffect(() => {
    if (membersData?.data) {
      dispatch({ type: 'SET_MEMBERS', payload: membersData.data });
    }
  }, [membersData]);

  useEffect(() => {
    if (dashboardData?.data) {
      dispatch({ type: 'SET_DASHBOARD_DATA', payload: dashboardData.data });
    }
  }, [dashboardData]);

  // Handle loading and errors
  useEffect(() => {
    const isLoading = householdsLoading || activeHouseholdLoading || membersLoading || dashboardLoading;
    dispatch({ type: 'SET_LOADING', payload: isLoading });

    const error = householdsError || activeHouseholdError || membersError || dashboardError;
    if (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, [householdsLoading, activeHouseholdLoading, membersLoading, dashboardLoading,
      householdsError, activeHouseholdError, membersError, dashboardError]);

  // Household methods
  const switchHousehold = (householdId) => {
    if (householdId === activeHouseholdId) return;
    
    setActiveHouseholdId(householdId);
    householdsAPI.switchHousehold(householdId);
    
    // Clear related queries when switching
    if (householdId) {
      queryClient.removeQueries({ 
        queryKey: ['households', activeHouseholdId],
        exact: false 
      });
    }
  };

  const createHousehold = async (data) => {
    return createHouseholdMutation.mutateAsync(data);
  };

  const updateHousehold = async (data) => {
    if (!activeHouseholdId) throw new Error('No active household');
    return updateHouseholdMutation.mutateAsync({ householdId: activeHouseholdId, data });
  };

  const deleteHousehold = async (householdId = activeHouseholdId) => {
    if (!householdId) throw new Error('No household specified');
    return deleteHouseholdMutation.mutateAsync(householdId);
  };

  const leaveHousehold = async (householdId = activeHouseholdId) => {
    if (!householdId) throw new Error('No household specified');
    return leaveHouseholdMutation.mutateAsync(householdId);
  };

  const removeMember = async (userId) => {
    if (!activeHouseholdId) throw new Error('No active household');
    return removeMemberMutation.mutateAsync({ householdId: activeHouseholdId, userId });
  };

  const generateInvite = async () => {
    if (!activeHouseholdId) throw new Error('No active household');
    return generateInviteMutation.mutateAsync(activeHouseholdId);
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Listen for household changes across tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'activeHouseholdId' && e.newValue !== activeHouseholdId) {
        setActiveHouseholdId(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [activeHouseholdId]);

  const value = {
    ...state,
    switchHousehold,
    createHousehold,
    updateHousehold,
    deleteHousehold,
    leaveHousehold,
    removeMember,
    generateInvite,
    refetchHouseholds,
    refetchDashboard,
    clearError,
    // Loading states for mutations
    isCreatingHousehold: createHouseholdMutation.isPending,
    isUpdatingHousehold: updateHouseholdMutation.isPending,
    isDeletingHousehold: deleteHouseholdMutation.isPending,
    isLeavingHousehold: leaveHouseholdMutation.isPending,
    isRemovingMember: removeMemberMutation.isPending,
    isGeneratingInvite: generateInviteMutation.isPending,
    // Computed properties
    isAdmin: state.activeHousehold?.role === 'admin',
    canManageMembers: state.activeHousehold?.role === 'admin',
    memberCount: state.members.length,
  };

  return (
    <HouseholdContext.Provider value={value}>
      {children}
    </HouseholdContext.Provider>
  );
};

export const useHousehold = () => {
  const context = useContext(HouseholdContext);
  if (!context) {
    throw new Error('useHousehold must be used within a HouseholdProvider');
  }
  return context;
};

export default HouseholdContext;
