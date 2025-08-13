import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authAPI } from '../lib/api';
import { useLocalStorage } from '../hooks/useLocalStorage';

const AuthContext = createContext();

// Auth state reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
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
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    default:
      return state;
  }
};

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const queryClient = useQueryClient();
  const [authToken, setAuthToken] = useLocalStorage('authToken', null);

  // Query user profile
  const {
    data: profileData,
    isLoading: profileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ['auth', 'profile'],
    queryFn: authAPI.getProfile,
    enabled: !!authToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error?.status === 401) return false;
      return failureCount < 2;
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: authAPI.updateProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'profile'], data);
      dispatch({ type: 'SET_USER', payload: data.data });
    },
    onError: (error) => {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    },
  });

  // Upload avatar mutation
  const uploadAvatarMutation = useMutation({
    mutationFn: authAPI.uploadAvatar,
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'profile'], data);
      dispatch({ type: 'SET_USER', payload: data.data });
    },
  });

  // Join household mutation
  const joinHouseholdMutation = useMutation({
    mutationFn: authAPI.joinHousehold,
    onSuccess: () => {
      // Invalidate households query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['households'] });
    },
  });

  // Validate invite mutation
  const validateInviteMutation = useMutation({
    mutationFn: authAPI.validateInvite,
  });

  // Initialize auth state
  useEffect(() => {
    if (!authToken) {
      dispatch({ type: 'LOGOUT' });
      return;
    }

    if (profileData?.data) {
      dispatch({ type: 'SET_USER', payload: profileData.data });
    } else if (profileError) {
      if (profileError.status === 401) {
        logout();
      } else {
        dispatch({ type: 'SET_ERROR', payload: profileError.message });
      }
    }

    dispatch({ type: 'SET_LOADING', payload: profileLoading });
  }, [authToken, profileData, profileError, profileLoading]);

  // Auth methods
  const login = async (token, user) => {
    setAuthToken(token);
    dispatch({ type: 'SET_USER', payload: user });
    
    // Pre-fetch user households
    queryClient.prefetchQuery({
      queryKey: ['households'],
      staleTime: 2 * 60 * 1000,
    });
  };

  const logout = async () => {
    try {
      if (authToken) {
        await authAPI.logout();
      }
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      setAuthToken(null);
      dispatch({ type: 'LOGOUT' });
      queryClient.clear();
      
      // Redirect to login
      window.location.href = '/login';
    }
  };

  const updateProfile = async (data) => {
    return updateProfileMutation.mutateAsync(data);
  };

  const uploadAvatar = async (file) => {
    return uploadAvatarMutation.mutateAsync(file);
  };

  const validateInvite = async (inviteCode) => {
    return validateInviteMutation.mutateAsync(inviteCode);
  };

  const joinHousehold = async (inviteCode) => {
    return joinHouseholdMutation.mutateAsync(inviteCode);
  };

  // Auto-refresh token before expiry
  useEffect(() => {
    if (!authToken) return;

    const refreshToken = async () => {
      try {
        const response = await authAPI.refreshToken();
        setAuthToken(response.data.token);
      } catch (error) {
        console.error('Token refresh failed:', error);
        logout();
      }
    };

    // Refresh token every 50 minutes (assuming 1 hour expiry)
    const interval = setInterval(refreshToken, 50 * 60 * 1000);
    return () => clearInterval(interval);
  }, [authToken]);

  const value = {
    ...state,
    login,
    logout,
    updateProfile,
    uploadAvatar,
    validateInvite,
    joinHousehold,
    refetchProfile,
    // Loading states for mutations
    isUpdatingProfile: updateProfileMutation.isPending,
    isUploadingAvatar: uploadAvatarMutation.isPending,
    isValidatingInvite: validateInviteMutation.isPending,
    isJoiningHousehold: joinHouseholdMutation.isPending,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
