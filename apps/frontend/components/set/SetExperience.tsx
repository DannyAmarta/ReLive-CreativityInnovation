"use client";

import { AnimatePresence } from "framer-motion";
import {
  startTransition,
  useActionState,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { GenerateWorkoutRecommendation } from "@/lib/set/actions/generate-workout-recommendation";
import { LogWorkoutSet } from "@/lib/set/actions/log-workout-set";
import { CalculateSetEstimate } from "@/lib/set/actions/calculate-set-estimate";
import {
  createInitialSetExperienceForm,
  createSetCalculatorRawValues,
  createSetEstimateRawValues,
  createSetRecommendationRawValues,
  findSelectedSetExercise,
  hasMeaningfulSetInput,
  resetFieldsForCategoryChange,
  resolveSetCategory,
  type SetExperienceFormValues,
  type SetExperienceNotice,
} from "@/lib/set/experience";
import {
  createCalculatorFormData,
  createCalculatorRequestKeyFromStateData,
  createRecommendationFormData,
  createRecommendationRequestKeyFromStateData,
  parseOptionalNumber,
} from "@/lib/set/forms";
import {
  calculateBrzyckiPreview,
  calculateTrainingMaxPreview,
} from "@/lib/set/preview";
import { SetCalculatorSchema } from "@/lib/zodSchemas/setCalculatorSchema";
import { SetRecommendationSchema } from "@/lib/zodSchemas/setRecommendationSchema";
import type {
  RecommendationPhaseGoal,
  SetExerciseDefinition,
} from "@/types/set";
import { SetControlPanel } from "./SetControlPanel";
import { SetHero } from "./SetHero";
import { SetResultPanel } from "./SetResultPanel";
import { FloatingNotice, SetPearlBackground } from "./SetUi";

type SetExperienceProps = {
  initialExercises: SetExerciseDefinition[];
};

export function SetExperience({ initialExercises }: SetExperienceProps) {
  const exercises = initialExercises.length > 0 ? initialExercises : [];
  const defaultExercise = exercises[0];
  const [estimateState, estimateAction, isPending] = useActionState(
    CalculateSetEstimate,
    undefined,
  );
  const [logState, logAction, isLogging] = useActionState(LogWorkoutSet, undefined);
  const [recommendationState, recommendationAction, isGeneratingRecommendation] =
    useActionState(GenerateWorkoutRecommendation, undefined);
  const [notice, setNotice] = useState<SetExperienceNotice | null>(null);
  const [form, setForm] = useState<SetExperienceFormValues>(() =>
    createInitialSetExperienceForm(defaultExercise),
  );
  const lastEstimateRequestKeyRef = useRef<string | null>(null);
  const lastNoticeKeyRef = useRef<string | null>(null);
  const noticeTimeoutRef = useRef<number | null>(null);

  const selectedExercise = findSelectedSetExercise(
    exercises,
    form.selectedExerciseId,
    defaultExercise,
  );
  const activeExerciseId = selectedExercise?.id ?? defaultExercise?.id ?? "";
  const category = resolveSetCategory(selectedExercise);
  const isCardio = category === "METABOLIC_CARDIO";
  const formWithActiveExercise = {
    ...form,
    selectedExerciseId: activeExerciseId,
  };

  const {
    selectedExerciseId,
    weightKg,
    reps,
    rir,
    durationMinutes,
    distanceMeters,
    rpe,
    notes,
    phaseGoal,
    days,
    trainingDaysPerWeek,
    targetSets,
    targetReps,
  } = formWithActiveExercise;

  const estimateRawData = createSetEstimateRawValues(formWithActiveExercise, category);
  const calculatorRawData = createSetCalculatorRawValues(
    formWithActiveExercise,
    category,
  );
  const recommendationRawData = createSetRecommendationRawValues(
    formWithActiveExercise,
  );

  const estimateValidation = SetCalculatorSchema.safeParse(estimateRawData);
  const calculatorValidation = SetCalculatorSchema.safeParse(calculatorRawData);
  const recommendationValidation =
    SetRecommendationSchema.safeParse(recommendationRawData);

  const estimateRequestKey = estimateValidation.success
    ? JSON.stringify(estimateValidation.data)
    : null;
  const recommendationRequestKey = recommendationValidation.success
    ? JSON.stringify(recommendationValidation.data)
    : null;

  const estimateStateRequestKey =
    createCalculatorRequestKeyFromStateData(estimateState);
  const logStateRequestKey = createCalculatorRequestKeyFromStateData(logState);
  const recommendationStateRequestKey = createRecommendationRequestKeyFromStateData(
    recommendationState,
  );

  const estimateMatchesCurrentRequest = Boolean(
    estimateRequestKey &&
      estimateStateRequestKey &&
      estimateRequestKey === estimateStateRequestKey,
  );
  const logMatchesCurrentRequest = Boolean(
    calculatorValidation.success &&
      logStateRequestKey &&
      JSON.stringify(calculatorValidation.data) === logStateRequestKey,
  );
  const recommendationMatchesCurrentRequest = Boolean(
    recommendationRequestKey &&
      recommendationStateRequestKey &&
      recommendationRequestKey === recommendationStateRequestKey,
  );

  const result =
    estimateState?.status === "success" && estimateMatchesCurrentRequest
      ? estimateState.result
      : null;
  const savedPayload =
    logState?.status === "success" && logMatchesCurrentRequest
      ? logState.result
      : null;
  const recommendation =
    recommendationState?.status === "success" && recommendationMatchesCurrentRequest
      ? recommendationState.result
      : null;
  const error =
    estimateState?.status === "error" && estimateMatchesCurrentRequest
      ? estimateState.message
      : undefined;
  const recommendationError =
    recommendationState?.status === "error" &&
    recommendationMatchesCurrentRequest
      ? recommendationState.message
      : undefined;

  const previewOneRepMaxKg = isCardio
    ? null
    : calculateBrzyckiPreview(
        parseOptionalNumber(weightKg),
        parseOptionalNumber(reps),
        parseOptionalNumber(rir),
      );
  const previewTrainingMaxKg = calculateTrainingMaxPreview(
    previewOneRepMaxKg,
  );

  const calculatorErrors =
    calculatorValidation.success
      ? undefined
      : calculatorValidation.error.flatten().fieldErrors;
  const recommendationErrors =
    recommendationValidation.success
      ? undefined
      : recommendationValidation.error.flatten().fieldErrors;

  const pushNotice = useEffectEvent(
    (kind: "success" | "error" | "info", message: string, scope: string) => {
      const nextKey = `${scope}:${kind}:${message}`;

      if (lastNoticeKeyRef.current === nextKey) {
        return;
      }

      lastNoticeKeyRef.current = nextKey;
      setNotice({ kind, message });

      if (noticeTimeoutRef.current) {
        window.clearTimeout(noticeTimeoutRef.current);
      }

      noticeTimeoutRef.current = window.setTimeout(() => {
        setNotice(null);
      }, 3200);
    },
  );

  useEffect(() => {
    if (!estimateRequestKey || !estimateValidation.success) {
      return;
    }

    const timeout = window.setTimeout(() => {
      if (lastEstimateRequestKeyRef.current === estimateRequestKey) {
        return;
      }

      const nextValidation = SetCalculatorSchema.safeParse(
        createSetEstimateRawValues(
          {
            ...form,
            selectedExerciseId: activeExerciseId,
          },
          category,
        ),
      );

      if (!nextValidation.success) {
        return;
      }

      lastEstimateRequestKeyRef.current = estimateRequestKey;
      const formData = createCalculatorFormData(nextValidation.data);
      startTransition(() => estimateAction(formData));
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [
    category,
    estimateAction,
    estimateRequestKey,
    estimateValidation.success,
    form,
    activeExerciseId,
  ]);

  useEffect(() => {
    if (logState?.message && logMatchesCurrentRequest && logState.status) {
      pushNotice(logState.status, logState.message, "log");
    }
  }, [logMatchesCurrentRequest, logState]);

  useEffect(() => {
    if (
      recommendationState?.message &&
      recommendationMatchesCurrentRequest &&
      recommendationState.status
    ) {
      pushNotice(
        recommendationState.status,
        recommendationState.message,
        "recommendation",
      );
    }
  }, [recommendationMatchesCurrentRequest, recommendationState]);

  useEffect(() => {
    return () => {
      if (noticeTimeoutRef.current) {
        window.clearTimeout(noticeTimeoutRef.current);
      }
    };
  }, []);

  function updateField<K extends keyof SetExperienceFormValues>(
    field: K,
    value: SetExperienceFormValues[K],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateSelectedExercise(nextExerciseId: string) {
    setForm((current) => {
      const currentExercise = findSelectedSetExercise(
        exercises,
        current.selectedExerciseId,
        defaultExercise,
      );
      const nextExercise = findSelectedSetExercise(
        exercises,
        nextExerciseId,
        defaultExercise,
      );
      const nextForm = {
        ...current,
        selectedExerciseId: nextExerciseId,
      };

      return resolveSetCategory(currentExercise) === resolveSetCategory(nextExercise)
        ? nextForm
        : resetFieldsForCategoryChange(
            nextForm,
            resolveSetCategory(nextExercise),
          );
    });
  }

  function refreshEstimate() {
    const validatedFields = SetCalculatorSchema.safeParse(
      createSetEstimateRawValues(formWithActiveExercise, category),
    );

    if (!validatedFields.success) {
      return;
    }

    lastEstimateRequestKeyRef.current = JSON.stringify(validatedFields.data);
    const formData = createCalculatorFormData(validatedFields.data);
    startTransition(() => estimateAction(formData));
  }

  function saveCurrentSet() {
    const validatedFields = SetCalculatorSchema.safeParse(
      createSetCalculatorRawValues(formWithActiveExercise, category),
    );

    if (!validatedFields.success) {
      return;
    }

    const formData = createCalculatorFormData(validatedFields.data);
    startTransition(() => logAction(formData));
  }

  function buildRoutine() {
    const validatedFields = SetRecommendationSchema.safeParse(
      createSetRecommendationRawValues(formWithActiveExercise),
    );

    if (!validatedFields.success) {
      return;
    }

    const formData = createRecommendationFormData(validatedFields.data);
    startTransition(() => recommendationAction(formData));
  }

  return (
    <div className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(253,230,138,0.4),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(125,211,252,0.22),_transparent_30%),linear-gradient(180deg,_#fffdf7_0%,_#fffaf0_46%,_#ffffff_100%)] text-stone-950">
      <SetPearlBackground />

      <div className="relative mx-auto flex min-h-screen w-full max-w-4xl flex-col px-4 py-8 sm:px-6 lg:px-8">
        <AnimatePresence>
          {notice ? (
            <FloatingNotice
              kind={notice.kind}
              message={notice.message}
              onClose={() => setNotice(null)}
            />
          ) : null}
        </AnimatePresence>

        <Card className="border-white/80 bg-white/88">
          <CardContent className="space-y-8 p-6 sm:p-8">
            <SetHero />

            <SetControlPanel
              exercises={exercises}
              selectedExerciseId={selectedExerciseId}
              selectedExerciseDescription={selectedExercise?.description}
              category={category}
              isCardio={isCardio}
              weightKg={weightKg}
              reps={reps}
              rir={rir}
              durationMinutes={durationMinutes}
              distanceMeters={distanceMeters}
              rpe={rpe}
              notes={notes}
              phaseGoal={phaseGoal}
              days={days}
              trainingDaysPerWeek={trainingDaysPerWeek}
              targetSets={targetSets}
              targetReps={targetReps}
              previewOneRepMaxKg={previewOneRepMaxKg}
              previewTrainingMaxKg={previewTrainingMaxKg}
              calculatorErrors={calculatorErrors}
              recommendationErrors={recommendationErrors}
              canRefreshEstimate={estimateValidation.success}
              canSaveSet={calculatorValidation.success}
              canBuildRoutine={recommendationValidation.success}
              isPending={isPending}
              isLogging={isLogging}
              isGeneratingRecommendation={isGeneratingRecommendation}
              onExerciseChange={updateSelectedExercise}
              onWeightKgChange={(value) => updateField("weightKg", value)}
              onRepsChange={(value) => updateField("reps", value)}
              onRirChange={(value) => updateField("rir", value)}
              onDurationMinutesChange={(value) =>
                updateField("durationMinutes", value)
              }
              onDistanceMetersChange={(value) =>
                updateField("distanceMeters", value)
              }
              onRpeChange={(value) => updateField("rpe", value)}
              onNotesChange={(value) => updateField("notes", value)}
              onPhaseGoalChange={(value) =>
                updateField("phaseGoal", value as RecommendationPhaseGoal)
              }
              onDaysChange={(value) => updateField("days", value)}
              onTrainingDaysPerWeekChange={(value) =>
                updateField("trainingDaysPerWeek", value)
              }
              onTargetSetsChange={(value) => updateField("targetSets", value)}
              onTargetRepsChange={(value) => updateField("targetReps", value)}
              onRefreshEstimate={refreshEstimate}
              onSaveSet={saveCurrentSet}
              onBuildRoutine={buildRoutine}
            />

            <SetResultPanel
              isPending={isPending}
              result={result}
              savedPayload={savedPayload}
              recommendation={recommendation}
              recommendationError={recommendationError}
              error={error}
              isCardio={isCardio}
              isGeneratingRecommendation={isGeneratingRecommendation}
              hasMeaningfulInput={hasMeaningfulSetInput(formWithActiveExercise)}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
