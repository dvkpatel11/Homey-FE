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
