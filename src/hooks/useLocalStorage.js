import { useState, useEffect, useCallback } from 'react';

// Custom hook for localStorage with cross-tab synchronization
export const useLocalStorage = (key, initialValue) => {
  // State to store our value
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue = useCallback((value) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to local storage
      if (valueToStore === null || valueToStore === undefined) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
      
      // Dispatch custom event for cross-tab sync
      window.dispatchEvent(new CustomEvent('localStorageChange', {
        detail: { key, value: valueToStore }
      }));
      
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Listen for changes in other tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const newValue = JSON.parse(e.newValue);
          setStoredValue(newValue);
        } catch (error) {
          console.error(`Error parsing localStorage change for key "${key}":`, error);
        }
      } else if (e.key === key && e.newValue === null) {
        setStoredValue(initialValue);
      }
    };

    const handleCustomStorageChange = (e) => {
      if (e.detail.key === key) {
        setStoredValue(e.detail.value);
      }
    };

    // Listen to storage events (changes from other tabs)
    window.addEventListener('storage', handleStorageChange);
    
    // Listen to custom events (changes from same tab)
    window.addEventListener('localStorageChange', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageChange', handleCustomStorageChange);
    };
  }, [key, initialValue]);

  // Clear the value
  const removeValue = useCallback(() => {
    setValue(null);
  }, [setValue]);

  // Check if key exists
  const hasValue = useCallback(() => {
    return window.localStorage.getItem(key) !== null;
  }, [key]);

  return [storedValue, setValue, removeValue, hasValue];
};

// Specialized hooks for common use cases
export const useAuthToken = () => {
  return useLocalStorage('authToken', null);
};

export const useActiveHouseholdId = () => {
  return useLocalStorage('activeHouseholdId', null);
};

export const useUserPreferences = () => {
  return useLocalStorage('userPreferences', {
    theme: 'system',
    notifications: true,
    language: 'en',
  });
};

export const useRecentSearches = () => {
  const [searches, setSearches] = useLocalStorage('recentSearches', []);
  
  const addSearch = useCallback((search) => {
    setSearches(prev => {
      const filtered = prev.filter(s => s.toLowerCase() !== search.toLowerCase());
      return [search, ...filtered].slice(0, 10); // Keep last 10 searches
    });
  }, [setSearches]);
  
  const clearSearches = useCallback(() => {
    setSearches([]);
  }, [setSearches]);
  
  return [searches, addSearch, clearSearches];
};

export const useDraftData = (key) => {
  const storageKey = `draft_${key}`;
  const [draft, setDraft] = useLocalStorage(storageKey, null);
  
  const saveDraft = useCallback((data) => {
    setDraft({
      data,
      timestamp: new Date().toISOString(),
    });
  }, [setDraft]);
  
  const clearDraft = useCallback(() => {
    setDraft(null);
  }, [setDraft]);
  
  const hasDraft = draft !== null;
  const draftAge = draft ? Date.now() - new Date(draft.timestamp).getTime() : 0;
  const isDraftExpired = draftAge > 24 * 60 * 60 * 1000; // 24 hours
  
  return {
    draft: isDraftExpired ? null : draft?.data,
    saveDraft,
    clearDraft,
    hasDraft: hasDraft && !isDraftExpired,
    draftAge,
  };
};

// Cache management utilities
export const useLocalCache = (key, ttl = 5 * 60 * 1000) => { // Default 5 minutes TTL
  const storageKey = `cache_${key}`;
  const [cacheData, setCacheData] = useLocalStorage(storageKey, null);
  
  const setCache = useCallback((data) => {
    setCacheData({
      data,
      timestamp: Date.now(),
      ttl,
    });
  }, [setCacheData, ttl]);
  
  const getCache = useCallback(() => {
    if (!cacheData) return null;
    
    const age = Date.now() - cacheData.timestamp;
    if (age > cacheData.ttl) {
      setCacheData(null);
      return null;
    }
    
    return cacheData.data;
  }, [cacheData, setCacheData]);
  
  const clearCache = useCallback(() => {
    setCacheData(null);
  }, [setCacheData]);
  
  const isValid = cacheData && (Date.now() - cacheData.timestamp) < cacheData.ttl;
  
  return {
    data: isValid ? cacheData.data : null,
    setCache,
    getCache,
    clearCache,
    isValid,
  };
};

export default useLocalStorage;
