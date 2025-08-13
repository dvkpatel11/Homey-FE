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
