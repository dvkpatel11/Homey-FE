import { useCallback, useEffect, useState } from "react";

// ============ CORE STORAGE UTILITIES (Non-React) ============
// These can be used anywhere - API files, utilities, etc.

class LocalStorageManager {
  static set(key, value) {
    try {
      if (value === null || value === undefined) {
        window.localStorage.removeItem(key);
      } else {
        // FIXED: Don't JSON.stringify simple strings and numbers
        let valueToStore;

        if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
          // Store primitive values as-is (no JSON encoding)
          valueToStore = String(value);
        } else {
          // Only JSON.stringify complex objects/arrays
          valueToStore = JSON.stringify(value);
        }

        window.localStorage.setItem(key, valueToStore);
      }

      // Dispatch custom event for React hooks to listen
      window.dispatchEvent(
        new CustomEvent("localStorageChange", {
          detail: { key, value, source: "utility" },
        })
      );

      return true;
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
      return false;
    }
  }

  // Also update the get method to handle this:
  static get(key, defaultValue = null) {
    try {
      const item = window.localStorage.getItem(key);
      if (!item) return defaultValue;

      // FIXED: Better detection of JSON vs plain strings
      if (item.startsWith("{") || item.startsWith("[") || item.startsWith('"')) {
        // Looks like JSON, try to parse
        try {
          return JSON.parse(item);
        } catch (jsonError) {
          console.warn(`Failed to parse JSON for key "${key}":`, item);
          return item; // Return as plain string if JSON parsing fails
        }
      } else {
        // Plain string/number/boolean, return as-is
        return item;
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  }
  static remove(key) {
    return this.set(key, null);
  }

  static has(key) {
    return window.localStorage.getItem(key) !== null;
  }

  static clear() {
    try {
      window.localStorage.clear();
      window.dispatchEvent(
        new CustomEvent("localStorageChange", {
          detail: { key: "*", value: null, source: "utility" },
        })
      );
      return true;
    } catch (error) {
      console.error("Error clearing localStorage:", error);
      return false;
    }
  }
}

// Export individual utility functions for easier importing
export const getStoredValue = LocalStorageManager.get;
export const setStoredValue = LocalStorageManager.set;
export const removeStoredValue = LocalStorageManager.remove;
export const hasStoredValue = LocalStorageManager.has;
export const clearStorage = LocalStorageManager.clear;

// ============ REACT HOOK IMPLEMENTATION ============

export const useLocalStorage = (key, initialValue) => {
  // State to store our value
  const [storedValue, setStoredValue] = useState(() => {
    return LocalStorageManager.get(key, initialValue);
  });

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue = useCallback(
    (value) => {
      try {
        setStoredValue((prevValue) => {
          const valueToStore = value instanceof Function ? value(prevValue) : value;

          // Use the utility function for consistency
          LocalStorageManager.set(key, valueToStore);

          return valueToStore;
        });
      } catch (error) {
        console.error(`Error in setValue for key "${key}":`, error);
      }
    },
    [key]
  );

  // Listen for changes from other tabs and non-React code
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key) {
        const newValue = e.newValue !== null ? JSON.parse(e.newValue) : initialValue;
        setStoredValue(newValue);
      }
    };

    const handleCustomStorageChange = (e) => {
      if (e.detail.key === key && e.detail.source === "utility") {
        setStoredValue(e.detail.value !== null ? e.detail.value : initialValue);
      } else if (e.detail.key === "*") {
        // Handle clear all
        setStoredValue(initialValue);
      }
    };

    // Listen to storage events (changes from other tabs)
    window.addEventListener("storage", handleStorageChange);

    // Listen to custom events (changes from utility functions)
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
    return LocalStorageManager.has(key);
  }, [key]);

  return [storedValue, setValue, removeValue, hasValue];
};

// ============ SPECIALIZED STORAGE UTILITIES ============

// Auth utilities (for use in API files)
export const AuthStorage = {
  getToken: () => LocalStorageManager.get("authToken"),
  setToken: (token) => LocalStorageManager.set("authToken", token),
  removeToken: () => LocalStorageManager.remove("authToken"),
  hasToken: () => LocalStorageManager.has("authToken"),
};

// Household utilities (for use in API files)
export const HouseholdStorage = {
  getActiveId: () => LocalStorageManager.get("activeHouseholdId"),
  setActiveId: (id) => LocalStorageManager.set("activeHouseholdId", id),
  removeActiveId: () => LocalStorageManager.remove("activeHouseholdId"),
  removeId: (id) => LocalStorageManager.remove(id),
  hasActiveId: () => LocalStorageManager.has("activeHouseholdId"),
};

// ============ AUTHENTICATION HOOKS ============
export const useAuthToken = () => {
  return useLocalStorage("authToken", null);
};

// ============ HOUSEHOLD HOOKS ============
export const useActiveHouseholdId = () => {
  const [rawId, setRawId, removeValue, hasValue] = useLocalStorage("activeHouseholdId", null);

  const cleanId =
    rawId && typeof rawId === "string" && rawId.startsWith('"') && rawId.endsWith('"')
      ? rawId.slice(1, -1) // Remove quotes
      : rawId;

  const setCleanId = (id) => {
    // Store without quotes
    const cleanValue = id && typeof id === "string" && id.startsWith('"') && id.endsWith('"') ? id.slice(1, -1) : id;
    setRawId(cleanValue);
  };

  return [cleanId, setCleanId, removeValue, hasValue];
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
    [] // Removed setSearches dependency
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

// For form persistence
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
