// Form persistence hook - separate import
import { useEffect, useCallback } from 'react';

export const useFormPersistence = (form, persistKey) => {
  // Load persisted data on mount
  useEffect(() => {
    if (!persistKey) return;
    
    try {
      const saved = localStorage.getItem(`form_${persistKey}`);
      if (saved) {
        const parsedData = JSON.parse(saved);
        // Merge with current values to preserve any defaults
        const mergedValues = { ...form.values, ...parsedData };
        form.setValues?.(mergedValues);
      }
    } catch (error) {
      console.error('Failed to load persisted form data:', error);
    }
  }, [persistKey]); // Don't include form in deps to avoid re-running

  // Save data when form values change
  useEffect(() => {
    if (!persistKey || !form.isDirty) return;
    
    try {
      localStorage.setItem(`form_${persistKey}`, JSON.stringify(form.values));
    } catch (error) {
      console.error('Failed to persist form data:', error);
    }
  }, [form.values, form.isDirty, persistKey]);

  // Clear persisted data
  const clearPersistedData = useCallback(() => {
    if (persistKey) {
      localStorage.removeItem(`form_${persistKey}`);
    }
  }, [persistKey]);

  // Check if persisted data exists
  const hasPersistedData = useCallback(() => {
    if (!persistKey) return false;
    return localStorage.getItem(`form_${persistKey}`) !== null;
  }, [persistKey]);

  return {
    clearPersistedData,
    hasPersistedData,
  };
};

// Auto-save hook for forms
export const useFormAutoSave = (form, saveFunction, options = {}) => {
  const { 
    delay = 2000, // 2 seconds
    enabled = true,
    onSaveSuccess,
    onSaveError 
  } = options;

  useEffect(() => {
    if (!enabled || !form.isDirty) return;

    const timeoutId = setTimeout(async () => {
      try {
        await saveFunction(form.values);
        onSaveSuccess?.(form.values);
      } catch (error) {
        console.error('Auto-save failed:', error);
        onSaveError?.(error, form.values);
      }
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [form.values, form.isDirty, delay, enabled, saveFunction, onSaveSuccess, onSaveError]);
};
