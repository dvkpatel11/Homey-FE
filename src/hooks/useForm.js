import { useState, useCallback, useRef, useEffect } from 'react';
import { useDebouncedValidation } from './useDebounce';

// Core form hook
export const useForm = (initialValues = {}, options = {}) => {
  const {
    validationSchema,
    validateOnChange = false,
    validateOnBlur = true,
    validateOnSubmit = true,
    resetOnSubmit = false,
    persistKey, // Local storage key for form persistence
    onSubmit,
  } = options;

  const [values, setValues] = useState(() => {
    if (persistKey) {
      const saved = localStorage.getItem(`form_${persistKey}`);
      return saved ? { ...initialValues, ...JSON.parse(saved) } : initialValues;
    }
    return initialValues;
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);
  const [isDirty, setIsDirty] = useState(false);

  const initialValuesRef = useRef(initialValues);

  // Debounced validation
  const { validate: debouncedValidate, isValidating } = useDebouncedValidation(
    validationSchema,
    300
  );

  // Persist form data
  useEffect(() => {
    if (persistKey && isDirty) {
      localStorage.setItem(`form_${persistKey}`, JSON.stringify(values));
    }
  }, [values, persistKey, isDirty]);

  // Check if form is dirty
  useEffect(() => {
    const hasChanged = Object.keys(values).some(
      key => values[key] !== initialValuesRef.current[key]
    );
    setIsDirty(hasChanged);
  }, [values]);

  // Set field value
  const setValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    if (validateOnChange && validationSchema) {
      debouncedValidate({ ...values, [name]: value });
    }
    
    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [values, validateOnChange, validationSchema, debouncedValidate, errors]);

  // Set multiple values
  const setValues = useCallback((newValues) => {
    setValues(prev => ({ ...prev, ...newValues }));
    
    if (validateOnChange && validationSchema) {
      debouncedValidate({ ...values, ...newValues });
    }
  }, [values, validateOnChange, validationSchema, debouncedValidate]);

  // Handle input change
  const handleChange = useCallback((event) => {
    const { name, value, type, checked } = event.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    setValue(name, fieldValue);
  }, [setValue]);

  // Handle input blur
  const handleBlur = useCallback((event) => {
    const { name } = event.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    if (validateOnBlur && validationSchema) {
      debouncedValidate(values);
    }
  }, [values, validateOnBlur, validationSchema, debouncedValidate]);

  // Set field error
  const setFieldError = useCallback((name, error) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  }, []);

  // Clear field error
  const clearFieldError = useCallback((name) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  }, []);

  // Validate form
  const validate = useCallback(async () => {
    if (!validationSchema) return {};
    
    try {
      const validationErrors = await validationSchema(values);
      setErrors(validationErrors || {});
      return validationErrors || {};
    } catch (error) {
      console.error('Validation error:', error);
      return { _global: 'Validation failed' };
    }
  }, [values, validationSchema]);

  // Handle form submission
  const handleSubmit = useCallback(async (event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    setSubmitCount(prev => prev + 1);
    setIsSubmitting(true);

    try {
      // Validate if enabled
      let validationErrors = {};
      if (validateOnSubmit && validationSchema) {
        validationErrors = await validate();
        if (Object.keys(validationErrors).length > 0) {
          setIsSubmitting(false);
          return { success: false, errors: validationErrors };
        }
      }

      // Submit form
      let result = { success: true, data: values };
      if (onSubmit) {
        result = await onSubmit(values);
      }

      // Reset form if requested
      if (resetOnSubmit && result.success) {
        reset();
      }

      // Clear persistence
      if (persistKey && result.success) {
        localStorage.removeItem(`form_${persistKey}`);
      }

      return result;
    } catch (error) {
      console.error('Form submission error:', error);
      return { success: false, error: error.message };
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validateOnSubmit, validationSchema, validate, onSubmit, resetOnSubmit, persistKey]);

  // Reset form
  const reset = useCallback((newValues = initialValues) => {
    setValues(newValues);
    setErrors({});
    setTouched({});
    setSubmitCount(0);
    setIsDirty(false);
    
    if (persistKey) {
      localStorage.removeItem(`form_${persistKey}`);
    }
  }, [initialValues, persistKey]);

  // Get field props for easy binding
  const getFieldProps = useCallback((name) => ({
    name,
    value: values[name] || '',
    onChange: handleChange,
    onBlur: handleBlur,
  }), [values, handleChange, handleBlur]);

  // Get field state
  const getFieldState = useCallback((name) => ({
    value: values[name],
    error: errors[name],
    touched: touched[name],
    hasError: Boolean(errors[name]),
    isTouched: Boolean(touched[name]),
  }), [values, errors, touched]);

  // Check if form is valid
  const isValid = Object.keys(errors).length === 0;
  const hasErrors = Object.keys(errors).length > 0;

  return {
    // Form state
    values,
    errors,
    touched,
    isSubmitting,
    isValidating,
    submitCount,
    isDirty,
    isValid,
    hasErrors,

    // Actions
    setValue,
    setValues: setValues,
    setFieldError,
    clearFieldError,
    handleChange,
    handleBlur,
    handleSubmit,
    validate,
    reset,

    // Utilities
    getFieldProps,
    getFieldState,
  };
};

// Field array hook for dynamic form fields
export const useFieldArray = (name, form) => {
  const fieldValue = form.values[name] || [];

  const append = useCallback((value) => {
    const newArray = [...fieldValue, value];
    form.setValue(name, newArray);
  }, [fieldValue, form, name]);

  const prepend = useCallback((value) => {
    const newArray = [value, ...fieldValue];
    form.setValue(name, newArray);
  }, [fieldValue, form, name]);

  const remove = useCallback((index) => {
    const newArray = fieldValue.filter((_, i) => i !== index);
    form.setValue(name, newArray);
  }, [fieldValue, form, name]);

  const insert = useCallback((index, value) => {
    const newArray = [...fieldValue];
    newArray.splice(index, 0, value);
    form.setValue(name, newArray);
  }, [fieldValue, form, name]);

  const move = useCallback((from, to) => {
    const newArray = [...fieldValue];
    const item = newArray.splice(from, 1)[0];
    newArray.splice(to, 0, item);
    form.setValue(name, newArray);
  }, [fieldValue, form, name]);

  const swap = useCallback((indexA, indexB) => {
    const newArray = [...fieldValue];
    [newArray[indexA], newArray[indexB]] = [newArray[indexB], newArray[indexA]];
    form.setValue(name, newArray);
  }, [fieldValue, form, name]);

  const replace = useCallback((index, value) => {
    const newArray = [...fieldValue];
    newArray[index] = value;
    form.setValue(name, newArray);
  }, [fieldValue, form, name]);

  return {
    fields: fieldValue,
    append,
    prepend,
    remove,
    insert,
    move,
    swap,
    replace,
  };
};

// Multi-step form hook
export const useMultiStepForm = (steps = [], options = {}) => {
  const { persistKey, onStepChange } = options;
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  // Load from localStorage if persist key is provided
  useEffect(() => {
    if (persistKey) {
      const saved = localStorage.getItem(`multistep_${persistKey}`);
      if (saved) {
        const { step, completed } = JSON.parse(saved);
        setCurrentStep(step);
        setCompletedSteps(new Set(completed));
      }
    }
  }, [persistKey]);

  // Save to localStorage
  useEffect(() => {
    if (persistKey) {
      localStorage.setItem(`multistep_${persistKey}`, JSON.stringify({
        step: currentStep,
        completed: Array.from(completedSteps),
      }));
    }
  }, [currentStep, completedSteps, persistKey]);

  const goToStep = useCallback((step) => {
    if (step >= 0 && step < steps.length) {
      setCurrentStep(step);
      onStepChange?.(step, steps[step]);
    }
  }, [steps, onStepChange]);

  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      goToStep(currentStep + 1);
    }
  }, [currentStep, steps.length, goToStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      goToStep(currentStep - 1);
    }
  }, [currentStep, goToStep]);

  const reset = useCallback(() => {
    setCurrentStep(0);
    setCompletedSteps(new Set());
    if (persistKey) {
      localStorage.removeItem(`multistep_${persistKey}`);
    }
  }, [persistKey]);

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const isStepCompleted = (step) => completedSteps.has(step);
  const canGoToStep = (step) => step <= currentStep || completedSteps.has(step - 1);

  return {
    currentStep,
    currentStepData: steps[currentStep],
    completedSteps: Array.from(completedSteps),
    isFirstStep,
    isLastStep,
    goToStep,
    nextStep,
    prevStep,
    reset,
    isStepCompleted,
    canGoToStep,
    progress: ((currentStep + 1) / steps.length) * 100,
  };
};

// Validation helpers
export const createValidationSchema = (rules) => {
  return async (values) => {
    const errors = {};

    for (const [field, fieldRules] of Object.entries(rules)) {
      const value = values[field];

      for (const rule of fieldRules) {
        try {
          const isValid = await rule.validate(value, values);
          if (!isValid) {
            errors[field] = rule.message;
            break; // Stop at first error for this field
          }
        } catch (error) {
          errors[field] = error.message;
          break;
        }
      }
    }

    return errors;
  };
};

// Common validation rules
export const validationRules = {
  required: (message = 'This field is required') => ({
    validate: (value) => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'string') return value.trim().length > 0;
      return value != null && value !== '';
    },
    message,
  }),

  email: (message = 'Please enter a valid email address') => ({
    validate: (value) => {
      if (!value) return true; // Allow empty (combine with required if needed)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    },
    message,
  }),

  minLength: (min, message) => ({
    validate: (value) => {
      if (!value) return true;
      return value.length >= min;
    },
    message: message || `Must be at least ${min} characters`,
  }),

  maxLength: (max, message) => ({
    validate: (value) => {
      if (!value) return true;
      return value.length <= max;
    },
    message: message || `Must be no more than ${max} characters`,
  }),

  pattern: (regex, message = 'Invalid format') => ({
    validate: (value) => {
      if (!value) return true;
      return regex.test(value);
    },
    message,
  }),

  min: (min, message) => ({
    validate: (value) => {
      if (value === '' || value == null) return true;
      return Number(value) >= min;
    },
    message: message || `Must be at least ${min}`,
  }),

  max: (max, message) => ({
    validate: (value) => {
      if (value === '' || value == null) return true;
      return Number(value) <= max;
    },
    message: message || `Must be no more than ${max}`,
  }),

  matches: (otherField, message = 'Fields must match') => ({
    validate: (value, allValues) => {
      return value === allValues[otherField];
    },
    message,
  }),
};

export default useForm;
