// Multi-step form hook - separate import
import { useCallback, useEffect, useState } from "react";
import { useMultiStepData } from "../../hooks/useLocalStorage";
export const useMultiStepForm = (steps = [], options = {}) => {
  const { persistKey, onStepChange } = options;
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  // Use centralized multi-step storage
  const storageKey = persistKey ? `multistep_${persistKey}` : null;
  const { stepData, updateStep, clearAllSteps, getStep } = useMultiStepData(storageKey);

  // Load persisted state on mount
  useEffect(() => {
    if (!persistKey || !stepData) return;

    const savedStep = stepData.__currentStep ?? 0;
    const savedCompleted = stepData.__completedSteps ?? [];
    setCurrentStep(savedStep);
    setCompletedSteps(new Set(savedCompleted));
  }, [persistKey, stepData]);

  // Save current step and completed steps whenever they change
  useEffect(() => {
    if (!persistKey) return;

    updateStep("__currentStep", currentStep);
    updateStep("__completedSteps", Array.from(completedSteps));
  }, [currentStep, completedSteps, persistKey, updateStep]);

  const goToStep = useCallback(
    (step) => {
      if (step >= 0 && step < steps.length) {
        setCurrentStep(step);
        onStepChange?.(step, steps[step]);
      }
    },
    [steps, onStepChange]
  );

  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps((prev) => new Set([...prev, currentStep]));
      goToStep(currentStep + 1);
    }
  }, [currentStep, steps.length, goToStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      goToStep(currentStep - 1);
    }
  }, [currentStep, goToStep]);

  const completeStep = useCallback(
    (step = currentStep) => {
      setCompletedSteps((prev) => new Set([...prev, step]));
    },
    [currentStep]
  );

  const setStepFormData = useCallback(
    (step, data) => {
      updateStep(step, data);
    },
    [updateStep]
  );

  const getStepFormData = useCallback((step) => getStep(step) || {}, [getStep]);

  const getAllFormData = useCallback(() => {
    const allData = { ...stepData };
    delete allData.__currentStep;
    delete allData.__completedSteps;
    return allData;
  }, [stepData]);

  const reset = useCallback(() => {
    setCurrentStep(0);
    setCompletedSteps(new Set());
    clearAllSteps();
  }, [clearAllSteps]);

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  const isStepCompleted = useCallback((step) => completedSteps.has(step), [completedSteps]);

  const canGoToStep = useCallback(
    (step) => step <= currentStep || completedSteps.has(step - 1),
    [currentStep, completedSteps]
  );

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
