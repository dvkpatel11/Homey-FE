// Core form hook - minimal functionality
import { useCallback, useEffect, useRef, useState } from "react";

export const useBasicForm = (initialValues = {}, options = {}) => {
  const { onSubmit, resetOnSubmit = false } = options;

  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const initialValuesRef = useRef(initialValues);

  // Check if form is dirty
  useEffect(() => {
    const hasChanged = Object.keys(values).some((key) => values[key] !== initialValuesRef.current[key]);
    setIsDirty(hasChanged);
  }, [values]);

  // Set field value
  const setValue = useCallback(
    (name, value) => {
      setValues((prev) => ({ ...prev, [name]: value }));

      // Clear field error when user starts typing
      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    },
    [errors]
  );

  // Set multiple values - renamed to avoid conflict
  const updateValues = useCallback((newValues) => {
    setValues((prev) => ({ ...prev, ...newValues }));
  }, []);

  // Handle input change
  const handleChange = useCallback(
    (event) => {
      const { name, value, type, checked } = event.target;
      const fieldValue = type === "checkbox" ? checked : value;
      setValue(name, fieldValue);
    },
    [setValue]
  );

  // Handle input blur
  const handleBlur = useCallback((event) => {
    const { name } = event.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  // Set field error
  const setFieldError = useCallback((name, error) => {
    setErrors((prev) => ({ ...prev, [name]: error }));
  }, []);

  // Clear field error
  const clearFieldError = useCallback((name) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(
    async (event) => {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }

      setIsSubmitting(true);

      try {
        let result = { success: true, data: values };
        if (onSubmit) {
          result = await onSubmit(values);
        }

        if (resetOnSubmit && result.success) {
          reset();
        }

        return result;
      } catch (error) {
        console.error("Form submission error:", error);
        return { success: false, error: error.message };
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, onSubmit, resetOnSubmit]
  );

  // Reset form
  const reset = useCallback(
    (newValues = initialValues) => {
      setValues(newValues);
      setErrors({});
      setTouched({});
      setIsDirty(false);
    },
    [initialValues]
  );

  // Get field props for easy binding
  const getFieldProps = useCallback(
    (name) => ({
      name,
      value: values[name] || "",
      onChange: handleChange,
      onBlur: handleBlur,
    }),
    [values, handleChange, handleBlur]
  );

  // Get field state
  const getFieldState = useCallback(
    (name) => ({
      value: values[name],
      error: errors[name],
      touched: touched[name],
      hasError: Boolean(errors[name]),
      isTouched: Boolean(touched[name]),
    }),
    [values, errors, touched]
  );

  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isDirty,
    isValid,
    setValue,
    updateValues, // renamed from setValues
    setFieldError,
    clearFieldError,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    getFieldProps,
    getFieldState,
  };
};
