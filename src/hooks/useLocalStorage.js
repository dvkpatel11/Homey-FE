import { useCallback, useEffect, useState } from "react";

// ============ CORE STORAGE UTILITIES (Non-React) ============
class LocalStorageManager {
  static set(key, value) {
    try {
      if (value === null || value === undefined) {
        window.localStorage.removeItem(key);
      } else {
        // FIXED: Always use JSON.stringify for consistency
        const serializedValue = JSON.stringify(value);
        window.localStorage.setItem(key, serializedValue);
      }

      // Dispatch custom event for React hooks
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

  static get(key, defaultValue = null) {
    try {
      const item = window.localStorage.getItem(key);
      if (item === null) return defaultValue;

      // FIXED: Always try to parse as JSON, fall back to string
      try {
        return JSON.parse(item);
      } catch {
        // If parsing fails, return the raw string (handles legacy data)
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

// Export utilities for non-React usage
export const getStoredValue = LocalStorageManager.get;
export const setStoredValue = LocalStorageManager.set;
export const removeStoredValue = LocalStorageManager.remove;
export const hasStoredValue = LocalStorageManager.has;
export const clearStorage = LocalStorageManager.clear;

// ============ MAIN REACT HOOK ============
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    return LocalStorageManager.get(key, initialValue);
  });

  const setValue = useCallback(
    (value) => {
      try {
        setStoredValue((prevValue) => {
          const valueToStore = value instanceof Function ? value(prevValue) : value;
          LocalStorageManager.set(key, valueToStore);
          return valueToStore;
        });
      } catch (error) {
        console.error(`Error in setValue for key "${key}":`, error);
      }
    },
    [key]
  );

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key) {
        const newValue = e.newValue !== null ? JSON.parse(e.newValue) : initialValue;
        setStoredValue(newValue);
      }
    };

    const handleCustomStorageChange = (e) => {
      if (e.detail.key === key || e.detail.key === "*") {
        const newValue = e.detail.key === "*" ? initialValue : e.detail.value;
        setStoredValue(newValue);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("localStorageChange", handleCustomStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("localStorageChange", handleCustomStorageChange);
    };
  }, [key, initialValue]);

  const removeValue = useCallback(() => setValue(null), [setValue]);
  const hasValue = useCallback(() => LocalStorageManager.has(key), [key]);

  return [storedValue, setValue, removeValue, hasValue];
};

// ============ DOMAIN-SPECIFIC STORAGE UTILITIES ============
export const AuthStorage = {
  getToken: () => LocalStorageManager.get("authToken"),
  setToken: (token) => LocalStorageManager.set("authToken", token),
  removeToken: () => LocalStorageManager.remove("authToken"),
  hasToken: () => LocalStorageManager.has("authToken"),
};

export const HouseholdStorage = {
  getActiveId: () => LocalStorageManager.get("activeHouseholdId"),
  setActiveId: (id) => LocalStorageManager.set("activeHouseholdId", id),
  removeActiveId: () => LocalStorageManager.remove("activeHouseholdId"),
  hasActiveId: () => LocalStorageManager.has("activeHouseholdId"),
};

// ============ SPECIALIZED HOOKS ============
export const useActiveHouseholdId = () => {
  return useLocalStorage("activeHouseholdId", null);
};

export const useAuthToken = () => {
  return useLocalStorage("authToken", null);
};

// Theme hooks
export const usePersistedTheme = () => useLocalStorage("theme", "system");
export const useHighContrast = () => useLocalStorage("highContrast", false);
export const useReducedMotion = () => useLocalStorage("reducedMotion", false);

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

// User preferences
export const useUserPreferences = () => {
  return useLocalStorage("userPreferences", {
    theme: "system",
    notifications: true,
    language: "en",
  });
};

export const useRecentSearches = () => {
  const [searches, setSearches] = useLocalStorage("recentSearches", []);

  const addSearch = useCallback(
    (search) => {
      setSearches((prev) => {
        const filtered = prev.filter((s) => s.toLowerCase() !== search.toLowerCase());
        return [search, ...filtered].slice(0, 10);
      });
    },
    [setSearches]
  );

  const clearSearches = useCallback(() => setSearches([]), [setSearches]);

  return [searches, addSearch, clearSearches];
};

// Form persistence
export const useFormPersistence = (formKey) => {
  return useLocalStorage(`form_${formKey}`, null);
};

// Multi-step form data
export const useMultiStepData = (stepKey) => {
  const [stepData, setStepData] = useLocalStorage(`multistep_${stepKey}`, {});

  const updateStep = useCallback(
    (stepIndex, data) => {
      setStepData((prev) => ({ ...prev, [stepIndex]: data }));
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

  const clearAllSteps = useCallback(() => setStepData({}), [setStepData]);

  return {
    stepData,
    updateStep,
    clearStep,
    clearAllSteps,
    getStep: (stepIndex) => stepData[stepIndex] || null,
  };
};

// Cache with TTL
export const useLocalCache = (key, ttl = 5 * 60 * 1000) => {
  const [cacheData, setCacheData] = useLocalStorage(`cache_${key}`, null);

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

  const clearCache = useCallback(() => setCacheData(null), [setCacheData]);
  const isValid = cacheData && Date.now() - cacheData.timestamp < cacheData.ttl;

  return { data: isValid ? cacheData.data : null, setCache, getCache, clearCache, isValid };
};

export default useLocalStorage;
