import { useCallback, useEffect, useState } from "react";

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
  const setValue = useCallback(
    (value) => {
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
        window.dispatchEvent(
          new CustomEvent("localStorageChange", {
            detail: { key, value: valueToStore },
          })
        );
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

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
    window.addEventListener("storage", handleStorageChange);

    // Listen to custom events (changes from same tab)
    window.addEventListener("localStorageChange", handleCustomStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("localStorageChange", handleCustomStorageChange);
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

// ============ AUTHENTICATION HOOKS ============
export const useAuthToken = () => {
  return useLocalStorage("authToken", null);
};

// ============ HOUSEHOLD HOOKS ============
export const useActiveHouseholdId = () => {
  return useLocalStorage("activeHouseholdId", null);
};

// ============ THEME HOOKS ============
export const usePersistedTheme = () => {
  return useLocalStorage("theme", "system");
};

export const useHighContrast = () => {
  return useLocalStorage("highContrast", false);
};

export const useReducedMotion = () => {
  return useLocalStorage("reducedMotion", false);
};

// Compound theme hook for all theme-related settings
export const useThemeSettings = () => {
  const [theme, setTheme] = usePersistedTheme();
  const [highContrast, setHighContrast] = useHighContrast();
  const [reducedMotion, setReducedMotion] = useReducedMotion();

  return {
    theme,
    setTheme,
    highContrast,
    setHighContrast,
    reducedMotion,
    setReducedMotion,
  };
};

// ============ USER PREFERENCES HOOKS ============
export const useUserPreferences = () => {
  return useLocalStorage("userPreferences", {
    theme: "system",
    notifications: true,
    language: "en",
  });
};

// ============ SEARCH HOOKS ============
export const useRecentSearches = () => {
  const [searches, setSearches] = useLocalStorage("recentSearches", []);

  const addSearch = useCallback(
    (search) => {
      setSearches((prev) => {
        const filtered = prev.filter((s) => s.toLowerCase() !== search.toLowerCase());
        return [search, ...filtered].slice(0, 10); // Keep last 10 searches
      });
    },
    [setSearches]
  );

  const clearSearches = useCallback(() => {
    setSearches([]);
  }, [setSearches]);

  return [searches, addSearch, clearSearches];
};

// ============ FORM PERSISTENCE HOOKS ============
export const useDraftData = (key) => {
  const storageKey = `draft_${key}`;
  const [draft, setDraft] = useLocalStorage(storageKey, null);

  const saveDraft = useCallback(
    (data) => {
      setDraft({
        data,
        timestamp: new Date().toISOString(),
      });
    },
    [setDraft]
  );

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

// For form persistence (based on your localStorage usage patterns)
export const useFormPersistence = (formKey) => {
  const storageKey = `form_${formKey}`;
  return useLocalStorage(storageKey, null);
};

// For multi-step form data
export const useMultiStepData = (stepKey) => {
  const storageKey = `multistep_${stepKey}`;
  const [stepData, setStepData] = useLocalStorage(storageKey, {});

  const updateStep = useCallback(
    (stepIndex, data) => {
      setStepData((prev) => ({
        ...prev,
        [stepIndex]: data,
      }));
    },
    [setStepData]
  );

  const clearStep = useCallback(
    (stepIndex) => {
      setStepData((prev) => {
        const { [stepIndex]: removed, ...rest } = prev;
        return rest;
      });
    },
    [setStepData]
  );

  const clearAllSteps = useCallback(() => {
    setStepData({});
  }, [setStepData]);

  return {
    stepData,
    updateStep,
    clearStep,
    clearAllSteps,
    getStep: (stepIndex) => stepData[stepIndex] || null,
  };
};

// ============ CACHE MANAGEMENT HOOKS ============
export const useLocalCache = (key, ttl = 5 * 60 * 1000) => {
  // Default 5 minutes TTL
  const storageKey = `cache_${key}`;
  const [cacheData, setCacheData] = useLocalStorage(storageKey, null);

  const setCache = useCallback(
    (data) => {
      setCacheData({
        data,
        timestamp: Date.now(),
        ttl,
      });
    },
    [setCacheData, ttl]
  );

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

  const isValid = cacheData && Date.now() - cacheData.timestamp < cacheData.ttl;

  return {
    data: isValid ? cacheData.data : null,
    setCache,
    getCache,
    clearCache,
    isValid,
  };
};

// ============ UTILITY HOOKS ============
// For any storage key (useful for dynamic keys)
export const useStorageKey = (keyGenerator, initialValue) => {
  const [key, setKey] = useState(() => (typeof keyGenerator === "function" ? keyGenerator() : keyGenerator));

  const [value, setValue, removeValue, hasValue] = useLocalStorage(key, initialValue);

  const updateKey = useCallback((newKeyOrGenerator) => {
    const newKey = typeof newKeyOrGenerator === "function" ? newKeyOrGenerator() : newKeyOrGenerator;
    setKey(newKey);
  }, []);

  return [value, setValue, removeValue, hasValue, updateKey];
};

export default useLocalStorage;
