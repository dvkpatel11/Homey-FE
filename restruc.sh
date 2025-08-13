#!/bin/bash

# Script to create modular form hooks structure
# Run this from your project root directory

echo "🚀 Creating modular form hooks structure..."

# Create the form hooks directory
mkdir -p src/hooks/form

# Delete existing useForm.js if it exists
if [ -f "src/hooks/useForm.js" ]; then
    echo "🗑️  Removing old useForm.js..."
    rm src/hooks/useForm.js
fi

echo "📁 Creating form hook files..."

# Create useBasicForm.js
cat > src/hooks/form/useBasicForm.js << 'EOF'
// Core form hook - minimal functionality
import { useState, useCallback, useRef, useEffect } from 'react';

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
    const hasChanged = Object.keys(values).some(
      key => values[key] !== initialValuesRef.current[key]
    );
    setIsDirty(hasChanged);
  }, [values]);

  // Set field value
  const setValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  // Set multiple values
  const setValues = useCallback((newValues) => {
    setValues(prev => ({ ...prev, ...newValues }));
  }, []);

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
  }, []);

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

  // Handle form submission
  const handleSubmit = useCallback(async (event) => {
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
      console.error('Form submission error:', error);
      return { success: false, error: error.message };
    } finally {
      setIsSubmitting(false);
    }
  }, [values, onSubmit, resetOnSubmit]);

  // Reset form
  const reset = useCallback((newValues = initialValues) => {
    setValues(newValues);
    setErrors({});
    setTouched({});
    setIsDirty(false);
  }, [initialValues]);

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

  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isDirty,
    isValid,
    setValue,
    setValues,
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
EOF

# Create useFormValidation.js
cat > src/hooks/form/useFormValidation.js << 'EOF'
// Form validation hook - separate import
import { useCallback } from 'react';
import { useDebouncedValidation } from '../useDebounce';

export const useFormValidation = (validationSchema, form, options = {}) => {
  const { validateOnChange = false, validateOnBlur = true } = options;
  
  const { validate: debouncedValidate, isValidating } = useDebouncedValidation(
    validationSchema,
    300
  );

  // Enhanced setValue with validation
  const setValueWithValidation = useCallback((name, value) => {
    form.setValue(name, value);
    
    if (validateOnChange && validationSchema) {
      debouncedValidate({ ...form.values, [name]: value });
    }
  }, [form, validateOnChange, validationSchema, debouncedValidate]);

  // Enhanced handleBlur with validation
  const handleBlurWithValidation = useCallback((event) => {
    form.handleBlur(event);
    
    if (validateOnBlur && validationSchema) {
      debouncedValidate(form.values);
    }
  }, [form, validateOnBlur, validationSchema, debouncedValidate]);

  // Validate entire form
  const validate = useCallback(async () => {
    if (!validationSchema) return {};
    
    try {
      const validationErrors = await validationSchema(form.values);
      form.setErrors?.(validationErrors || {});
      return validationErrors || {};
    } catch (error) {
      console.error('Validation error:', error);
      return { _global: 'Validation failed' };
    }
  }, [form.values, validationSchema, form]);

  return {
    isValidating,
    validate,
    setValueWithValidation,
    handleBlurWithValidation,
  };
};

// Validation schema builder
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
            break;
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
      if (!value) return true;
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
EOF

# Create useFieldArray.js
cat > src/hooks/form/useFieldArray.js << 'EOF'
// Field array hook for dynamic form fields - separate import
import { useCallback } from 'react';

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

  const clear = useCallback(() => {
    form.setValue(name, []);
  }, [form, name]);

  return {
    fields: fieldValue,
    append,
    prepend,
    remove,
    insert,
    move,
    swap,
    replace,
    clear,
    length: fieldValue.length,
  };
};
EOF

# Create useMultiStepForm.js
cat > src/hooks/form/useMultiStepForm.js << 'EOF'
// Multi-step form hook - separate import
import { useState, useCallback, useEffect } from 'react';

export const useMultiStepForm = (steps = [], options = {}) => {
  const { persistKey, onStepChange } = options;
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [stepData, setStepData] = useState({});

  // Load from localStorage if persist key is provided
  useEffect(() => {
    if (persistKey) {
      const saved = localStorage.getItem(`multistep_${persistKey}`);
      if (saved) {
        const { step, completed, data } = JSON.parse(saved);
        setCurrentStep(step);
        setCompletedSteps(new Set(completed));
        setStepData(data || {});
      }
    }
  }, [persistKey]);

  // Save to localStorage
  useEffect(() => {
    if (persistKey) {
      localStorage.setItem(`multistep_${persistKey}`, JSON.stringify({
        step: currentStep,
        completed: Array.from(completedSteps),
        data: stepData,
      }));
    }
  }, [currentStep, completedSteps, stepData, persistKey]);

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

  const completeStep = useCallback((step = currentStep) => {
    setCompletedSteps(prev => new Set([...prev, step]));
  }, [currentStep]);

  const setStepFormData = useCallback((step, data) => {
    setStepData(prev => ({ ...prev, [step]: data }));
  }, []);

  const getStepFormData = useCallback((step) => {
    return stepData[step] || {};
  }, [stepData]);

  const getAllFormData = useCallback(() => {
    return stepData;
  }, [stepData]);

  const reset = useCallback(() => {
    setCurrentStep(0);
    setCompletedSteps(new Set());
    setStepData({});
    if (persistKey) {
      localStorage.removeItem(`multistep_${persistKey}`);
    }
  }, [persistKey]);

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const isStepCompleted = useCallback((step) => completedSteps.has(step), [completedSteps]);
  const canGoToStep = useCallback((step) => step <= currentStep || completedSteps.has(step - 1), [currentStep, completedSteps]);

  return {
    // Current state
    currentStep,
    currentStepData: steps[currentStep],
    completedSteps: Array.from(completedSteps),
    
    // Navigation
    isFirstStep,
    isLastStep,
    goToStep,
    nextStep,
    prevStep,
    reset,
    
    // Step management
    completeStep,
    isStepCompleted,
    canGoToStep,
    
    // Data management
    setStepFormData,
    getStepFormData,
    getAllFormData,
    
    // Progress
    progress: ((currentStep + 1) / steps.length) * 100,
    completionRate: (completedSteps.size / steps.length) * 100,
  };
};
EOF

# Create useFormPersistence.js
cat > src/hooks/form/useFormPersistence.js << 'EOF'
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
EOF

# Create index.js barrel exports
cat > src/hooks/form/index.js << 'EOF'
// Barrel exports for tree-shaking
export { useBasicForm } from './useBasicForm';
export { useFormValidation, createValidationSchema, validationRules } from './useFormValidation';
export { useFieldArray } from './useFieldArray';
export { useMultiStepForm } from './useMultiStepForm';
export { useFormPersistence, useFormAutoSave } from './useFormPersistence';

// Convenience composable hook for common use cases
export const useForm = (initialValues = {}, options = {}) => {
  const {
    validationSchema,
    validateOnChange = false,
    validateOnBlur = true,
    persistKey,
    autoSave,
    ...formOptions
  } = options;

  // Import hooks dynamically to avoid loading unused code
  const { useBasicForm } = require('./useBasicForm');
  const form = useBasicForm(initialValues, formOptions);

  // Add validation if schema provided
  let validation = null;
  if (validationSchema) {
    const { useFormValidation } = require('./useFormValidation');
    validation = useFormValidation(validationSchema, form, { validateOnChange, validateOnBlur });
  }

  // Add persistence if key provided
  let persistence = null;
  if (persistKey) {
    const { useFormPersistence } = require('./useFormPersistence');
    persistence = useFormPersistence(form, persistKey);
  }

  // Add auto-save if enabled
  if (autoSave?.enabled) {
    const { useFormAutoSave } = require('./useFormPersistence');
    useFormAutoSave(form, autoSave.saveFunction, autoSave.options);
  }

  return {
    ...form,
    // Enhanced methods with validation
    setValue: validation?.setValueWithValidation || form.setValue,
    handleBlur: validation?.handleBlurWithValidation || form.handleBlur,
    validate: validation?.validate,
    isValidating: validation?.isValidating || false,
    // Persistence methods
    clearPersistedData: persistence?.clearPersistedData,
    hasPersistedData: persistence?.hasPersistedData,
  };
};
EOF

echo "✅ Form hooks created successfully!"
echo ""
echo "📋 Created files:"
echo "  - src/hooks/form/useBasicForm.js           (~2KB)"
echo "  - src/hooks/form/useFormValidation.js      (~3KB)"
echo "  - src/hooks/form/useFieldArray.js          (~1KB)"
echo "  - src/hooks/form/useMultiStepForm.js       (~2KB)"
echo "  - src/hooks/form/useFormPersistence.js     (~1KB)"
echo "  - src/hooks/form/index.js                  (barrel exports)"
echo ""
echo "🚀 Usage examples:"
echo "  // Basic form (2KB)"
echo "  import { useBasicForm } from '@/hooks/form/useBasicForm';"
echo ""
echo "  // Form with validation (5KB)"
echo "  import { useForm, validationRules } from '@/hooks/form';"
echo ""
echo "  // Dynamic fields (3KB)"
echo "  import { useBasicForm, useFieldArray } from '@/hooks/form';"
echo ""
echo "🎯 Bundle optimization complete!"
EOF

chmod +x create_form_hooks.sh