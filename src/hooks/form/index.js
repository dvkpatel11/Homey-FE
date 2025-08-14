export { useBasicForm } from "./useBasicForm";
export { useFieldArray } from "./useFieldArray";
export { useFormAutoSave, useFormPersistence } from "./useFormPersistence";
export { createValidationSchema, useFormValidation, validationRules } from "./useFormValidation";
export { useMultiStepForm } from "./useMultiStepForm";

export const useForm = (initialValues = {}, options = {}) => {
  const {
    validationSchema,
    validateOnChange = false,
    validateOnBlur = true,
    persistKey,
    autoSave,
    ...formOptions
  } = options;

  // Use static imports
  const form = useBasicForm(initialValues, formOptions);

  // Add validation if schema provided
  let validation = null;
  if (validationSchema) {
    validation = useFormValidation(validationSchema, form, { validateOnChange, validateOnBlur });
  }

  // Add persistence if key provided
  let persistence = null;
  if (persistKey) {
    persistence = useFormPersistence(form, persistKey);
  }

  // Add auto-save if enabled
  if (autoSave?.enabled) {
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
