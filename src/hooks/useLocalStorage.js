// src/hooks/useLocalStorage.js - Mobile-Optimized Local Storage Hook
import { useCallback, useEffect, useState } from "react";

/**
 * Enhanced localStorage hook with error handling and mobile optimization
 * @param {string} key - localStorage key
 * @param {any} initialValue - default value if key doesn't exist
 * @param {Object} options - configuration options
 * @returns {[value, setValue, removeValue, error]}
 */
export function useLocalStorage(key, initialValue, options = {}) {
  const {
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    syncAcrossTabs = false,
    onError = console.error,
  } = options;

  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      if (item === null) {
        return initialValue;
      }
      return deserialize(item);
    } catch (error) {
      onError(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const [error, setError] = useState(null);

  const setValue = useCallback(
    (value) => {
      try {
        setError(null);

        // Allow value to be a function so we have the same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;

        setStoredValue(valueToStore);

        if (typeof window !== "undefined") {
          if (valueToStore === undefined) {
            window.localStorage.removeItem(key);
          } else {
            window.localStorage.setItem(key, serialize(valueToStore));
          }
        }
      } catch (error) {
        setError(error.message);
        onError(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, serialize, storedValue, onError]
  );

  const removeValue = useCallback(() => {
    try {
      setError(null);
      setStoredValue(initialValue);

      if (typeof window !== "undefined") {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      setError(error.message);
      onError(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue, onError]);

  // Listen for changes across tabs (if enabled)
  useEffect(() => {
    if (!syncAcrossTabs || typeof window === "undefined") {
      return;
    }

    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const newValue = deserialize(e.newValue);
          setStoredValue(newValue);
          setError(null);
        } catch (error) {
          setError(error.message);
          onError(`Error syncing localStorage key "${key}" across tabs:`, error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [key, deserialize, syncAcrossTabs, onError]);

  return [storedValue, setValue, removeValue, error];
}

/**
 * Specialized hook for storing objects in localStorage
 */
export function useLocalStorageObject(key, initialValue = {}) {
  return useLocalStorage(key, initialValue, {
    serialize: JSON.stringify,
    deserialize: JSON.parse,
  });
}

/**
 * Specialized hook for storing arrays in localStorage
 */
export function useLocalStorageArray(key, initialValue = []) {
  return useLocalStorage(key, initialValue, {
    serialize: JSON.stringify,
    deserialize: JSON.parse,
  });
}

/**
 * Specialized hook for storing simple strings
 */
export function useLocalStorageString(key, initialValue = "") {
  return useLocalStorage(key, initialValue, {
    serialize: (value) => value,
    deserialize: (value) => value,
  });
}

/**
 * Specialized hook for storing boolean values
 */
export function useLocalStorageBoolean(key, initialValue = false) {
  return useLocalStorage(key, initialValue, {
    serialize: (value) => value.toString(),
    deserialize: (value) => value === "true",
  });
}
