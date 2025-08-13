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
