// Form persistence hook - separate import
import { useCallback, useEffect } from "react";
import { useFormPersistence as useLocalStorageForm } from "../../hooks/useLocalStorage"; // Adjust path

/**
 * Migrated form persistence hook using centralized localStorage hook
 */
export const useFormPersistence = (form, persistKey) => {
  // Use centralized localStorage hook
  const storageKey = persistKey ? `form_${persistKey}` : null;
  const [persistedData, setPersistedData, removePersistedData, hasPersistedData] = useLocalStorageForm(
    storageKey,
    null
  );

  // Load persisted data on mount
  useEffect(() => {
    if (!persistKey || !persistedData) return;

    try {
      // Merge persisted values with current form values
      const mergedValues = { ...form.values, ...persistedData };
      form.setValues?.(mergedValues);
    } catch (error) {
      console.error("Failed to load persisted form data:", error);
    }
  }, [persistKey, persistedData]);

  // Save data when form values change
  useEffect(() => {
    if (!persistKey || !form.isDirty) return;

    try {
      setPersistedData(form.values);
    } catch (error) {
      console.error("Failed to persist form data:", error);
    }
  }, [form.values, form.isDirty, persistKey, setPersistedData]);

  // Clear persisted data
  const clearPersistedData = useCallback(() => {
    removePersistedData();
  }, [removePersistedData]);

  // Check if persisted data exists
  const hasData = useCallback(() => hasPersistedData(), [hasPersistedData]);

  return {
    clearPersistedData,
    hasPersistedData: hasData,
  };
};

// Auto-save hook for forms
export const useFormAutoSave = (form, saveFunction, options = {}) => {
  const {
    delay = 2000, // 2 seconds
    enabled = true,
    onSaveSuccess,
    onSaveError,
  } = options;

  useEffect(() => {
    if (!enabled || !form.isDirty) return;

    const timeoutId = setTimeout(async () => {
      try {
        await saveFunction(form.values);
        onSaveSuccess?.(form.values);
      } catch (error) {
        console.error("Auto-save failed:", error);
        onSaveError?.(error, form.values);
      }
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [form.values, form.isDirty, delay, enabled, saveFunction, onSaveSuccess, onSaveError]);
};
