import { useState, useEffect, useCallback, useRef } from 'react';

// Core debounce hook
export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Debounced callback hook
export const useDebouncedCallback = (callback, delay = 300, deps = []) => {
  const timeoutRef = useRef(null);
  const callbackRef = useRef(callback);

  // Update callback ref when deps change
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback, ...deps]);

  const debouncedCallback = useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  }, [delay]);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const flush = useCallback((...args) => {
    cancel();
    callbackRef.current(...args);
  }, [cancel]);

  useEffect(() => {
    return cancel;
  }, [cancel]);

  return { debouncedCallback, cancel, flush };
};

// Search hook with debouncing
export const useDebouncedSearch = (searchFn, delay = 300) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  
  const debouncedQuery = useDebounce(query, delay);

  const { debouncedCallback: debouncedSearch } = useDebouncedCallback(
    async (searchQuery) => {
      if (!searchQuery.trim()) {
        setResults([]);
        setIsSearching(false);
        setError(null);
        return;
      }

      setIsSearching(true);
      setError(null);

      try {
        const searchResults = await searchFn(searchQuery);
        setResults(searchResults);
      } catch (err) {
        setError(err.message);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    delay,
    [searchFn]
  );

  useEffect(() => {
    debouncedSearch(debouncedQuery);
  }, [debouncedQuery, debouncedSearch]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setError(null);
  }, []);

  return {
    query,
    setQuery,
    results,
    isSearching,
    error,
    clearSearch,
    hasResults: results.length > 0,
    hasQuery: query.trim().length > 0,
  };
};

// Input debouncing hook
export const useDebouncedInput = (initialValue = '', delay = 300) => {
  const [inputValue, setInputValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);
  const [isDebouncing, setIsDebouncing] = useState(false);

  useEffect(() => {
    if (inputValue === debouncedValue) {
      setIsDebouncing(false);
      return;
    }

    setIsDebouncing(true);
    const handler = setTimeout(() => {
      setDebouncedValue(inputValue);
      setIsDebouncing(false);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [inputValue, debouncedValue, delay]);

  const setValue = useCallback((value) => {
    setInputValue(value);
  }, []);

  const reset = useCallback(() => {
    setInputValue(initialValue);
    setDebouncedValue(initialValue);
    setIsDebouncing(false);
  }, [initialValue]);

  return {
    value: inputValue,
    debouncedValue,
    setValue,
    reset,
    isDebouncing,
  };
};

// API request debouncing hook
export const useDebouncedApi = (apiFn, delay = 500) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const requestRef = useRef(null);
  const abortControllerRef = useRef(null);

  const { debouncedCallback } = useDebouncedCallback(
    async (...args) => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      setIsLoading(true);
      setError(null);

      try {
        const result = await apiFn(...args, {
          signal: abortControllerRef.current.signal,
        });
        setData(result);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        setIsLoading(false);
      }
    },
    delay,
    [apiFn]
  );

  const execute = useCallback((...args) => {
    debouncedCallback(...args);
  }, [debouncedCallback]);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsLoading(false);
  }, []);

  const reset = useCallback(() => {
    cancel();
    setData(null);
    setError(null);
  }, [cancel]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    isLoading,
    error,
    execute,
    cancel,
    reset,
  };
};

// Form validation debouncing
export const useDebouncedValidation = (validationFn, delay = 300) => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const { debouncedCallback: debouncedValidate } = useDebouncedCallback(
    async (formData) => {
      setIsValidating(true);
      
      try {
        const errors = await validationFn(formData);
        setValidationErrors(errors || {});
      } catch (error) {
        console.error('Validation error:', error);
        setValidationErrors({ _global: 'Validation failed' });
      } finally {
        setIsValidating(false);
      }
    },
    delay,
    [validationFn]
  );

  const validate = useCallback((formData) => {
    debouncedValidate(formData);
  }, [debouncedValidate]);

  const clearErrors = useCallback(() => {
    setValidationErrors({});
  }, []);

  return {
    validate,
    isValidating,
    validationErrors,
    clearErrors,
    hasErrors: Object.keys(validationErrors).length > 0,
  };
};

export default useDebounce;
