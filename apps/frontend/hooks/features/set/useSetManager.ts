import { useState, useRef, useEffect, startTransition, useActionState } from "react";
import { 
  CalculateSetEstimate 
} from "@/lib/set/actions/calculate-set-estimate";
import { LogWorkoutSet } from "@/lib/set/actions/log-workout-set";
import { 
  GenerateWorkoutRecommendation 
} from "@/lib/set/actions/generate-workout-recommendation";
import {
  createInitialSetExperienceForm,
  createSetCalculatorRawValues,
  createSetEstimateRawValues,
  createSetRecommendationRawValues,
  findSelectedSetExercise,
  resolveSetCategory,
  resetFieldsForCategoryChange,
  type SetExperienceFormValues,
  type SetExperienceNotice,
} from "@/lib/set/experience";
import {
  createCalculatorFormData,
  createCalculatorRequestKeyFromStateData,
  createRecommendationFormData,
  createRecommendationRequestKeyFromStateData,
} from "@/lib/set/forms";
import { SetCalculatorSchema } from "@/lib/zodSchemas/setCalculatorSchema";
import { SetRecommendationSchema } from "@/lib/zodSchemas/setRecommendationSchema";
import type { SetExerciseDefinition } from "@/types/set";

// apps/frontend/hooks/features/set/useSetManager.ts

export function useSetManager(initialExercises: SetExerciseDefinition[]) {
  const exercises = initialExercises.length > 0 ? initialExercises : [];
  const defaultExercise = exercises[0];

  // --- Server Actions ---
  const [estimateState, estimateAction, isPending] = useActionState(CalculateSetEstimate, undefined);
  const [logState, logAction, isLogging] = useActionState(LogWorkoutSet, undefined);
  const [recommendationState, recommendationAction, isGeneratingRecommendation] = useActionState(GenerateWorkoutRecommendation, undefined);

  // --- Form & UI State ---
  const [form, setForm] = useState<SetExperienceFormValues>(() => createInitialSetExperienceForm(defaultExercise));
  const [notice, setNotice] = useState<SetExperienceNotice | null>(null);
  const lastEstimateRequestKeyRef = useRef<string | null>(null);

  // --- Derived Calculations & Validations ---
  const selectedExercise = findSelectedSetExercise(exercises, form.selectedExerciseId, defaultExercise);
  const category = resolveSetCategory(selectedExercise);
  const isCardio = category === "METABOLIC_CARDIO";

  const estimateRawData = createSetEstimateRawValues(form, category);
  const calculatorRawData = createSetCalculatorRawValues(form, category);
  const recommendationRawData = createSetRecommendationRawValues(form);

  const estimateValidation = SetCalculatorSchema.safeParse(estimateRawData);
  const calculatorValidation = SetCalculatorSchema.safeParse(calculatorRawData);
  const recommendationValidation = SetRecommendationSchema.safeParse(recommendationRawData);

  const estimateRequestKey = estimateValidation.success ? JSON.stringify(estimateValidation.data) : null;

  // --- Automated Estimation Logic ---
  useEffect(() => {
    if (!estimateRequestKey || !estimateValidation.success) return;
    const timeout = window.setTimeout(() => {
      if (lastEstimateRequestKeyRef.current === estimateRequestKey) return;
      lastEstimateRequestKeyRef.current = estimateRequestKey;
      const formData = createCalculatorFormData(estimateValidation.data);
      startTransition(() => estimateAction(formData));
    }, 400);
    return () => window.clearTimeout(timeout);
  }, [estimateRequestKey, estimateValidation, estimateAction]);

  // --- Handlers ---
  const updateField = <K extends keyof SetExperienceFormValues>(field: K, value: SetExperienceFormValues[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleExerciseChange = (nextId: string) => {
    const nextExercise = findSelectedSetExercise(exercises, nextId, defaultExercise);
    setForm((current) => {
      const nextForm = { ...current, selectedExerciseId: nextId };
      return resolveSetCategory(selectedExercise) === resolveSetCategory(nextExercise)
        ? nextForm
        : resetFieldsForCategoryChange(nextForm, resolveSetCategory(nextExercise));
    });
  };

  // --- Explicit Actions ---
  const refreshEstimate = () => {
    if (estimateValidation.success) {
      lastEstimateRequestKeyRef.current = JSON.stringify(estimateValidation.data);
      const formData = createCalculatorFormData(estimateValidation.data);
      startTransition(() => estimateAction(formData));
    }
  };

  const saveCurrentSet = () => {
    if (calculatorValidation.success) {
      const formData = createCalculatorFormData(calculatorValidation.data);
      startTransition(() => logAction(formData));
    }
  };

  const buildRoutine = () => {
    if (recommendationValidation.success) {
      const formData = createRecommendationFormData(recommendationValidation.data);
      startTransition(() => recommendationAction(formData));
    }
  };

  return {
    form,
    exercises,
    selectedExercise,
    category,
    isCardio,
    notice,
    setNotice,
    states: { estimateState, logState, recommendationState },
    status: { isPending, isLogging, isGeneratingRecommendation },
    validation: {
      estimateValidation,
      calculatorValidation,
      recommendationValidation,
    },
    actions: { 
      updateField, 
      handleExerciseChange,
      refreshEstimate,
      saveCurrentSet,
      buildRoutine
    }
  };
}