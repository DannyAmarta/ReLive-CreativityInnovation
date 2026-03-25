"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  BrainCircuit,
  Dumbbell,
  Flame,
  HeartPulse,
  LoaderCircle,
  Sparkles,
  WandSparkles,
  Waves,
} from "lucide-react";
import {
  startTransition,
  useActionState,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Card, CardContent } from "@/components/ui/card";
import { GenerateWorkoutRecommendation } from "@/lib/generateWorkoutRecommendation";
import { LogWorkoutSet } from "@/lib/logWorkoutSet";
import {
  calculateBrzyckiPreview,
  calculateTrainingMaxPreview,
} from "@/lib/setCalculations";
import { CalculateSetEstimate } from "@/lib/setCalculator";
import type { SetRecommendationFormState } from "@/lib/types/formState";
import { SetCalculatorSchema } from "@/lib/zodSchemas/setCalculatorSchema";
import { SetRecommendationSchema } from "@/lib/zodSchemas/setRecommendationSchema";
import type {
  GeneratedWorkoutPlan,
  LoggedWorkoutSetPayload,
  RecommendationPhaseGoal,
  SetCalculationResult,
  SetExerciseDefinition,
} from "@/types/set";

type SetCalculatorPageClientProps = {
  initialExercises: SetExerciseDefinition[];
};

type NoticeState = {
  kind: "success" | "error";
  message: string;
};

export function SetCalculatorPageClient({
  initialExercises,
}: SetCalculatorPageClientProps) {
  const exercises = initialExercises.length > 0 ? initialExercises : [];
  const defaultExercise = exercises[0];
  const [state, action, isPending] = useActionState(CalculateSetEstimate, undefined);
  const [logState, logAction, isLogging] = useActionState(LogWorkoutSet, undefined);
  const [recommendationState, recommendationAction, isGeneratingRecommendation] =
    useActionState(GenerateWorkoutRecommendation, undefined);
  const [notice, setNotice] = useState<NoticeState | null>(null);
  const [selectedExerciseId, setSelectedExerciseId] = useState(
    defaultExercise?.id ?? "",
  );
  const [weightKg, setWeightKg] = useState("");
  const [reps, setReps] = useState("");
  const [rir, setRir] = useState("0");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [distanceMeters, setDistanceMeters] = useState("");
  const [rpe, setRpe] = useState("");
  const [notes, setNotes] = useState("");
  const [phaseGoal, setPhaseGoal] =
    useState<RecommendationPhaseGoal>("HYPERTROPHY");
  const [days, setDays] = useState("14");
  const [trainingDaysPerWeek, setTrainingDaysPerWeek] = useState("3");
  const [targetSets, setTargetSets] = useState("");
  const [targetReps, setTargetReps] = useState("");
  const lastEstimateRequestKeyRef = useRef<string | null>(null);
  const lastNoticeKeyRef = useRef<string | null>(null);
  const noticeTimeoutRef = useRef<number | null>(null);
  const previousCategoryRef = useRef<string | null>(null);

  const selectedExercise = useMemo(
    () =>
      exercises.find((exercise) => exercise.id === selectedExerciseId) ??
      defaultExercise,
    [defaultExercise, exercises, selectedExerciseId],
  );
  const category = selectedExercise?.category ?? "LOWER_BODY_COMPOUND";
  const isCardio = category === "METABOLIC_CARDIO";

  useEffect(() => {
    if (!selectedExercise && defaultExercise) {
      setSelectedExerciseId(defaultExercise.id);
    }
  }, [defaultExercise, selectedExercise]);

  useEffect(() => {
    const previousCategory = previousCategoryRef.current;

    if (!previousCategory) {
      previousCategoryRef.current = category;
      return;
    }

    if (previousCategory === category) {
      return;
    }

    if (category === "METABOLIC_CARDIO") {
      setWeightKg("");
      setReps("");
      setRir("0");
    } else {
      setDurationMinutes("");
      setDistanceMeters("");
      setRpe("");
    }

    previousCategoryRef.current = category;
  }, [category]);

  const calculatorRawValues = useMemo(
    () => ({
      exerciseId: selectedExerciseId,
      category,
      weightKg: asOptionalInput(weightKg),
      reps: asOptionalInput(reps),
      rir: asOptionalInput(rir),
      durationMinutes: asOptionalInput(durationMinutes),
      distanceMeters: asOptionalInput(distanceMeters),
      rpe: asOptionalInput(rpe),
      notes,
    }),
    [
      category,
      distanceMeters,
      durationMinutes,
      notes,
      reps,
      rir,
      rpe,
      selectedExerciseId,
      weightKg,
    ],
  );

  const calculatorValidation = useMemo(
    () => SetCalculatorSchema.safeParse(calculatorRawValues),
    [calculatorRawValues],
  );

  const recommendationRawValues = useMemo(
    () => ({
      exerciseId: selectedExerciseId,
      phaseGoal,
      days: asOptionalInput(days),
      trainingDaysPerWeek: asOptionalInput(trainingDaysPerWeek),
      targetSets: asOptionalInput(targetSets),
      targetReps: asOptionalInput(targetReps),
      notes,
    }),
    [
      days,
      notes,
      phaseGoal,
      selectedExerciseId,
      targetReps,
      targetSets,
      trainingDaysPerWeek,
    ],
  );

  const recommendationValidation = useMemo(
    () => SetRecommendationSchema.safeParse(recommendationRawValues),
    [recommendationRawValues],
  );

  const calculatorRequestKey = calculatorValidation.success
    ? JSON.stringify(calculatorValidation.data)
    : null;
  const recommendationRequestKey = recommendationValidation.success
    ? JSON.stringify(recommendationValidation.data)
    : null;

  const stateRequestKey = createCalculatorRequestKeyFromStateData(state);
  const logStateRequestKey = createCalculatorRequestKeyFromStateData(logState);
  const recommendationStateRequestKey = createRecommendationRequestKeyFromStateData(
    recommendationState,
  );

  const stateMatchesCurrentRequest = Boolean(
    calculatorRequestKey &&
      stateRequestKey &&
      calculatorRequestKey === stateRequestKey,
  );
  const logStateMatchesCurrentRequest = Boolean(
    calculatorRequestKey &&
      logStateRequestKey &&
      calculatorRequestKey === logStateRequestKey,
  );
  const recommendationMatchesCurrentRequest = Boolean(
    recommendationRequestKey &&
      recommendationStateRequestKey &&
      recommendationRequestKey === recommendationStateRequestKey,
  );

  const result =
    state?.status === "success" && stateMatchesCurrentRequest ? state.result : null;
  const savedPayload =
    logState?.status === "success" && logStateMatchesCurrentRequest
      ? logState.result
      : null;
  const recommendation =
    recommendationState?.status === "success" && recommendationMatchesCurrentRequest
      ? recommendationState.result
      : null;

  const previewOneRepMaxKg = useMemo(() => {
    if (isCardio) {
      return null;
    }

    return calculateBrzyckiPreview(
      parseOptionalNumber(weightKg),
      parseOptionalNumber(reps),
      parseOptionalNumber(rir),
    );
  }, [isCardio, reps, rir, weightKg]);

  const previewTrainingMaxKg = useMemo(
    () => calculateTrainingMaxPreview(previewOneRepMaxKg),
    [previewOneRepMaxKg],
  );

  const hasMeaningfulInput = Boolean(
    weightKg ||
      reps ||
      durationMinutes ||
      distanceMeters ||
      rpe ||
      notes.trim(),
  );

  const calculatorErrors =
    calculatorValidation.success
      ? undefined
      : calculatorValidation.error.flatten().fieldErrors;
  const recommendationErrors =
    recommendationValidation.success
      ? undefined
      : recommendationValidation.error.flatten().fieldErrors;

  useEffect(() => {
    if (!calculatorRequestKey || !calculatorValidation.success) {
      return;
    }

    const timeout = window.setTimeout(() => {
      if (lastEstimateRequestKeyRef.current === calculatorRequestKey) {
        return;
      }

      lastEstimateRequestKeyRef.current = calculatorRequestKey;
      const formData = createCalculatorFormData(calculatorValidation.data);
      startTransition(() => action(formData));
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [action, calculatorRequestKey, calculatorValidation]);

  useEffect(() => {
    if (logState?.message && logStateMatchesCurrentRequest && logState.status) {
      pushNotice(logState.status, logState.message, "log");
    }
  }, [logState, logStateMatchesCurrentRequest]);

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

  const pushNotice = useEffectEvent(
    (kind: "success" | "error", message: string, scope: string) => {
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

  function refreshEstimate() {
    if (!calculatorValidation.success) {
      return;
    }

    lastEstimateRequestKeyRef.current = calculatorRequestKey;
    const formData = createCalculatorFormData(calculatorValidation.data);
    startTransition(() => action(formData));
  }

  function saveCurrentSet() {
    if (!calculatorValidation.success) {
      return;
    }

    const formData = createCalculatorFormData(calculatorValidation.data);
    startTransition(() => logAction(formData));
  }

  function buildRoutine() {
    if (!recommendationValidation.success) {
      return;
    }

    const formData = createRecommendationFormData(recommendationValidation.data);
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
            <div className="space-y-4 text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">
                <Sparkles className="h-3.5 w-3.5" />
                Set Lab
              </div>
              <div className="space-y-3">
                <h1 className="text-4xl font-semibold tracking-tight text-stone-950 sm:text-5xl">
                  Log a set, preview your strength, and build the next routine.
                </h1>
                <p className="mx-auto max-w-2xl text-sm leading-7 text-stone-600 sm:text-base">
                  Choose a movement, record what you just did, and turn it into a
                  safer next session in one flow.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <FieldBlock
                  label="Exercise"
                  error={calculatorErrors?.exerciseId?.[0]}
                >
                  <select
                    value={selectedExerciseId}
                    onChange={(event) => setSelectedExerciseId(event.target.value)}
                    className={inputClassName(Boolean(calculatorErrors?.exerciseId?.[0]))}
                  >
                    {exercises.map((exercise) => (
                      <option key={exercise.id} value={exercise.id}>
                        {exercise.name}
                      </option>
                    ))}
                  </select>
                </FieldBlock>

                <FieldBlock label="Category">
                  <div className="rounded-[1.2rem] border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-medium text-stone-700">
                    {formatCategory(category)}
                  </div>
                </FieldBlock>
              </div>

              {selectedExercise?.description ? (
                <div className="rounded-[1.5rem] border border-stone-200/80 bg-stone-50/80 px-4 py-3 text-sm leading-7 text-stone-600">
                  {selectedExercise.description}
                </div>
              ) : null}

              {isCardio ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <FieldBlock
                    label="Duration (minutes)"
                    error={calculatorErrors?.durationMinutes?.[0]}
                  >
                    <input
                      type="number"
                      inputMode="decimal"
                      min="0.25"
                      step="0.25"
                      value={durationMinutes}
                      onChange={(event) => setDurationMinutes(event.target.value)}
                      className={inputClassName(
                        Boolean(calculatorErrors?.durationMinutes?.[0]),
                      )}
                      placeholder="20"
                    />
                  </FieldBlock>

                  <FieldBlock label="RPE" error={calculatorErrors?.rpe?.[0]}>
                    <input
                      type="number"
                      inputMode="decimal"
                      min="1"
                      max="10"
                      step="0.5"
                      value={rpe}
                      onChange={(event) => setRpe(event.target.value)}
                      className={inputClassName(Boolean(calculatorErrors?.rpe?.[0]))}
                      placeholder="7"
                    />
                  </FieldBlock>

                  <FieldBlock
                    label="Distance (meters)"
                    error={calculatorErrors?.distanceMeters?.[0]}
                  >
                    <input
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="10"
                      value={distanceMeters}
                      onChange={(event) => setDistanceMeters(event.target.value)}
                      className={inputClassName(
                        Boolean(calculatorErrors?.distanceMeters?.[0]),
                      )}
                      placeholder="4000"
                    />
                  </FieldBlock>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-3">
                  <FieldBlock
                    label="Weight (kg)"
                    error={calculatorErrors?.weightKg?.[0]}
                  >
                    <input
                      type="number"
                      inputMode="decimal"
                      min="0.5"
                      step="0.5"
                      value={weightKg}
                      onChange={(event) => setWeightKg(event.target.value)}
                      className={inputClassName(Boolean(calculatorErrors?.weightKg?.[0]))}
                      placeholder="100"
                    />
                  </FieldBlock>

                  <FieldBlock label="Reps" error={calculatorErrors?.reps?.[0]}>
                    <input
                      type="number"
                      inputMode="numeric"
                      min="1"
                      max="15"
                      step="1"
                      value={reps}
                      onChange={(event) => setReps(event.target.value)}
                      className={inputClassName(Boolean(calculatorErrors?.reps?.[0]))}
                      placeholder="5"
                    />
                  </FieldBlock>

                  <FieldBlock label="RIR" error={calculatorErrors?.rir?.[0]}>
                    <input
                      type="number"
                      inputMode="numeric"
                      min="0"
                      max="6"
                      step="1"
                      value={rir}
                      onChange={(event) => setRir(event.target.value)}
                      className={inputClassName(Boolean(calculatorErrors?.rir?.[0]))}
                      placeholder="0"
                    />
                  </FieldBlock>
                </div>
              )}

              <FieldBlock label="Notes" error={calculatorErrors?.notes?.[0]}>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  className={`${inputClassName(Boolean(calculatorErrors?.notes?.[0]))} min-h-28 resize-none`}
                  placeholder="Add anything important from the set."
                />
              </FieldBlock>

              {!isCardio ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <PreviewCard
                    label="Live 1RM preview"
                    value={previewOneRepMaxKg === null ? "Waiting" : `${previewOneRepMaxKg.toFixed(1)} kg`}
                  />
                  <PreviewCard
                    label="Live training max"
                    value={
                      previewTrainingMaxKg === null
                        ? "Waiting"
                        : `${previewTrainingMaxKg.toFixed(1)} kg`
                    }
                  />
                </div>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <FieldBlock
                  label="Goal"
                  error={recommendationErrors?.phaseGoal?.[0]}
                >
                  <select
                    value={phaseGoal}
                    onChange={(event) =>
                      setPhaseGoal(event.target.value as RecommendationPhaseGoal)
                    }
                    className={inputClassName(
                      Boolean(recommendationErrors?.phaseGoal?.[0]),
                    )}
                  >
                    <option value="BASELINE_TESTING">Baseline</option>
                    <option value="HYPERTROPHY">Hypertrophy</option>
                    <option value="STRENGTH">Strength</option>
                    <option value="POWER">Power</option>
                    <option value="RECOVERY">Recovery</option>
                  </select>
                </FieldBlock>

                <FieldBlock label="Days" error={recommendationErrors?.days?.[0]}>
                  <input
                    type="number"
                    inputMode="numeric"
                    min="7"
                    max="28"
                    step="1"
                    value={days}
                    onChange={(event) => setDays(event.target.value)}
                    className={inputClassName(Boolean(recommendationErrors?.days?.[0]))}
                  />
                </FieldBlock>

                <FieldBlock
                  label="Training days / week"
                  error={recommendationErrors?.trainingDaysPerWeek?.[0]}
                >
                  <input
                    type="number"
                    inputMode="numeric"
                    min="1"
                    max="6"
                    step="1"
                    value={trainingDaysPerWeek}
                    onChange={(event) => setTrainingDaysPerWeek(event.target.value)}
                    className={inputClassName(
                      Boolean(recommendationErrors?.trainingDaysPerWeek?.[0]),
                    )}
                  />
                </FieldBlock>

                <FieldBlock
                  label="Target sets"
                  error={recommendationErrors?.targetSets?.[0]}
                >
                  <input
                    type="number"
                    inputMode="numeric"
                    min="1"
                    max="6"
                    step="1"
                    value={targetSets}
                    onChange={(event) => setTargetSets(event.target.value)}
                    className={inputClassName(
                      Boolean(recommendationErrors?.targetSets?.[0]),
                    )}
                    placeholder="Optional"
                  />
                </FieldBlock>

                <FieldBlock
                  label="Target reps"
                  error={recommendationErrors?.targetReps?.[0]}
                >
                  <input
                    type="number"
                    inputMode="numeric"
                    min="1"
                    max="15"
                    step="1"
                    value={targetReps}
                    onChange={(event) => setTargetReps(event.target.value)}
                    className={inputClassName(
                      Boolean(recommendationErrors?.targetReps?.[0]),
                    )}
                    placeholder="Optional"
                  />
                </FieldBlock>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={refreshEstimate}
                  disabled={!calculatorValidation.success || isPending}
                  className={primaryButtonClassName(
                    !calculatorValidation.success || isPending,
                  )}
                >
                  {isPending ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <BrainCircuit className="h-4 w-4" />
                  )}
                  Refresh estimate
                </button>

                <button
                  type="button"
                  onClick={saveCurrentSet}
                  disabled={!calculatorValidation.success || isLogging}
                  className={secondaryButtonClassName(
                    !calculatorValidation.success || isLogging,
                  )}
                >
                  {isLogging ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <Dumbbell className="h-4 w-4" />
                  )}
                  Save set
                </button>

                <button
                  type="button"
                  onClick={buildRoutine}
                  disabled={
                    !recommendationValidation.success || isGeneratingRecommendation
                  }
                  className={secondaryButtonClassName(
                    !recommendationValidation.success || isGeneratingRecommendation,
                  )}
                >
                  {isGeneratingRecommendation ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <WandSparkles className="h-4 w-4" />
                  )}
                  Build routine
                </button>
              </div>

              {(calculatorErrors || recommendationErrors) &&
              (!calculatorValidation.success || !recommendationValidation.success) ? (
                <ValidationSummary
                  errors={[
                    ...collectErrors(calculatorErrors),
                    ...collectErrors(recommendationErrors),
                  ]}
                />
              ) : null}
            </div>

            <ResultPanel
              isPending={isPending}
              result={result}
              savedPayload={savedPayload}
              recommendation={recommendation}
              recommendationError={
                recommendationState?.status === "error" &&
                recommendationMatchesCurrentRequest
                  ? recommendationState.message
                  : undefined
              }
              error={
                state?.status === "error" && stateMatchesCurrentRequest
                  ? state.message
                  : undefined
              }
              isCardio={isCardio}
              isGeneratingRecommendation={isGeneratingRecommendation}
              hasMeaningfulInput={hasMeaningfulInput}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ResultPanel({
  isPending,
  result,
  savedPayload,
  recommendation,
  recommendationError,
  error,
  isCardio,
  isGeneratingRecommendation,
  hasMeaningfulInput,
}: {
  isPending: boolean;
  result: SetCalculationResult | null | undefined;
  savedPayload?: LoggedWorkoutSetPayload | null;
  recommendation?: GeneratedWorkoutPlan | null;
  recommendationError?: string;
  error?: string;
  isCardio: boolean;
  isGeneratingRecommendation: boolean;
  hasMeaningfulInput: boolean;
}) {
  return (
    <Card className="h-full border-stone-200/80 bg-[linear-gradient(180deg,_rgba(255,255,255,0.98)_0%,_rgba(250,245,235,0.98)_100%)]">
      <CardContent className="flex h-full flex-col gap-5 p-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
            Live result
          </p>
          <h3 className="text-2xl font-semibold tracking-tight text-stone-950">
            {result?.exerciseName ?? "Waiting for a valid set"}
          </h3>
          <p className="text-sm text-stone-500">
            {isPending ? "Updating your estimate." : "Your latest result."}
          </p>
        </div>

        {error ? (
          <div className="rounded-[1.4rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <AnimatePresence mode="wait">
          {result ? (
            <motion.div
              key={`${result.exerciseId}-${result.category}-${result.confidenceScore}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="space-y-5"
            >
              {isCardio ? (
                <div className="space-y-4">
                  <PrimaryMetricCard
                    icon={<HeartPulse className="h-5 w-5" />}
                    label="Conditioning load"
                    value={formatMetric(result.cardioLoadScore, "score")}
                  />
                  <PrimaryMetricCard
                    icon={<Flame className="h-5 w-5" />}
                    label="Estimated calories"
                    value={formatMetric(result.estimatedCalories, "kcal")}
                  />
                  <PrimaryMetricCard
                    icon={<Waves className="h-5 w-5" />}
                    label="Pace"
                    value={formatMetric(result.pacePerKilometerMinutes, "min/km")}
                  />
                  <PrimaryMetricCard
                    icon={<Sparkles className="h-5 w-5" />}
                    label="Confidence"
                    value={`${Math.round(result.confidenceScore * 100)}%`}
                  />
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    <PrimaryMetricCard
                      icon={<Dumbbell className="h-5 w-5" />}
                      label="Estimated 1RM"
                      value={formatMetric(result.estimatedOneRepMaxKg, "kg")}
                    />
                    <PrimaryMetricCard
                      icon={<BrainCircuit className="h-5 w-5" />}
                      label="Training max"
                      value={formatMetric(result.trainingMaxKg, "kg")}
                    />
                  </div>

                  <div className="rounded-[1.6rem] border border-stone-200/80 bg-white/80 p-4">
                    <p className="text-sm font-semibold text-stone-950">
                      Suggested working weights
                    </p>
                    <p className="mt-1 text-sm text-stone-500">
                      Starting points for your next work sets.
                    </p>
                    <div className="mt-4 space-y-3">
                      {result.recommendedLoads.map((load) => (
                        <div
                          key={`${load.repTarget}-${load.intensityPercent}`}
                          className="rounded-[1.35rem] border border-stone-200 bg-stone-50/80 p-4"
                        >
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                            {load.repTarget} reps
                          </p>
                          <p className="mt-2 text-2xl font-semibold text-stone-950">
                            {load.weightKg.toFixed(1)}
                            <span className="ml-1 text-base text-stone-500">kg</span>
                          </p>
                          <p className="mt-1 text-sm text-stone-500">
                            {load.intensityPercent}% intensity
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div className="rounded-[1.6rem] border border-amber-200 bg-amber-50/70 p-4">
                <p className="text-sm font-semibold text-amber-900">Coaching note</p>
                <p className="mt-2 text-sm leading-7 text-amber-900/80">
                  {result.insightSummary}
                </p>
              </div>

              {savedPayload ? (
                <div className="rounded-[1.6rem] border border-emerald-200 bg-emerald-50/80 p-4">
                  <p className="text-sm font-semibold text-emerald-900">
                    Saved trend
                  </p>
                  <div className="mt-3 space-y-3 text-sm text-emerald-900/85">
                    <p>
                      Logged set #{savedPayload.loggedSet.id}
                      {savedPayload.loggedSet.isCnsFatigue
                        ? " was flagged for fatigue."
                        : " was added to your ledger."}
                    </p>
                    <p>{savedPayload.analytics.contextSummary}</p>
                    <p>
                      EMA: {formatMetric(savedPayload.analytics.emaOneRepMaxKg, "kg")}
                    </p>
                    <p>
                      Baseline:{" "}
                      {formatMetric(
                        savedPayload.analytics.baselineAverageOneRepMaxKg,
                        "kg",
                      )}
                    </p>
                  </div>
                </div>
              ) : null}

              <RecommendationPanel
                plan={recommendation}
                isGeneratingRecommendation={isGeneratingRecommendation}
                error={recommendationError}
              />

              <details className="rounded-[1.6rem] border border-stone-200 bg-white/80 p-4">
                <summary className="cursor-pointer list-none text-sm font-semibold text-stone-700">
                  Advanced details
                </summary>
                <div className="mt-4 grid gap-3 text-sm text-stone-600">
                  <p>Formula: {result.formulaUsed}</p>
                  <p>Energy system: {result.primaryEnergySystem}</p>
                  {result.effectiveReps !== null ? (
                    <p>Effective reps: {result.effectiveReps}</p>
                  ) : null}
                  {result.boundedEffectiveReps !== null ? (
                    <p>Bounded effective reps: {result.boundedEffectiveReps}</p>
                  ) : null}
                  {result.relativeIntensityPercent !== null ? (
                    <p>
                      Relative intensity: {result.relativeIntensityPercent.toFixed(1)}%
                    </p>
                  ) : null}
                  {result.volumeLoadKg !== null ? (
                    <p>Volume load: {result.volumeLoadKg.toFixed(1)} kg</p>
                  ) : null}
                  <p>Confidence: {Math.round(result.confidenceScore * 100)}%</p>
                  {result.warnings.length > 0 ? (
                    <div className="rounded-2xl border border-stone-200 bg-stone-50 p-3">
                      <p className="font-semibold text-stone-700">Warnings</p>
                      <ul className="mt-2 list-disc space-y-1 pl-5">
                        {result.warnings.map((warning) => (
                          <li key={warning}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              </details>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="flex min-h-72 flex-col items-center justify-center rounded-[1.8rem] border border-dashed border-stone-200 bg-stone-50/80 px-6 text-center"
            >
              <div className="rounded-full bg-white p-4 shadow-sm">
                <BrainCircuit className="h-8 w-8 text-stone-500" />
              </div>
              <p className="mt-4 text-lg font-semibold text-stone-900">
                {hasMeaningfulInput
                  ? "Finish the valid set to unlock your estimate."
                  : "Enter a valid set to see the estimate."}
              </p>
              <p className="mt-2 max-w-sm text-sm leading-7 text-stone-500">
                Add your set details to see your result here.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

function RecommendationPanel({
  plan,
  isGeneratingRecommendation,
  error,
}: {
  plan?: GeneratedWorkoutPlan | null;
  isGeneratingRecommendation: boolean;
  error?: string;
}) {
  return (
    <div className="rounded-[1.6rem] border border-stone-200 bg-white/85 p-4">
      <div className="flex items-center gap-2 text-stone-900">
        <WandSparkles className="h-4 w-4" />
        <p className="text-sm font-semibold">Next routine</p>
      </div>

      {isGeneratingRecommendation ? (
        <div className="mt-4 rounded-[1.4rem] border border-stone-200 bg-stone-50/80 p-4">
          <div className="flex items-center gap-3 text-stone-700">
            <LoaderCircle className="h-4 w-4 animate-spin" />
            <span className="text-sm font-medium">
              Analyzing neuromuscular trends...
            </span>
          </div>
          <div className="mt-4 space-y-3">
            <div className="h-4 w-40 rounded-full bg-stone-200/80" />
            <div className="h-16 rounded-[1rem] bg-stone-200/70" />
            <div className="h-4 w-3/4 rounded-full bg-stone-200/80" />
          </div>
        </div>
      ) : plan ? (
        <div className="mt-4 space-y-4">
          <div className="rounded-[1.35rem] border border-stone-200 bg-stone-50/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              {formatPhaseGoal(plan.phaseGoal)}
            </p>
            {plan.routine[0] ? (
              <>
                <p className="mt-2 text-2xl font-semibold text-stone-950">
                  {plan.routine[0].sets} sets x {plan.routine[0].reps} reps
                </p>
                <p className="mt-1 text-sm text-stone-500">
                  {plan.routine[0].prescribedWeightKg === null
                    ? "Technique-first session"
                    : `${plan.routine[0].prescribedWeightKg.toFixed(1)} kg working weight`}
                </p>
              </>
            ) : null}
          </div>
          <div className="rounded-[1.35rem] border border-amber-200 bg-amber-50/70 p-4">
            <p className="text-sm font-semibold text-amber-900">Plan note</p>
            <p className="mt-2 text-sm leading-7 text-amber-900/80">
              {plan.rationale}
            </p>
          </div>
          {plan.routine[0]?.rationale ? (
            <div className="rounded-[1.35rem] border border-stone-200 bg-white p-4">
              <p className="text-sm font-semibold text-stone-900">
                Session focus
              </p>
              <p className="mt-2 text-sm leading-7 text-stone-600">
                {plan.routine[0].rationale}
              </p>
            </div>
          ) : null}
        </div>
      ) : error ? (
        <p className="mt-4 text-sm text-rose-600">{error}</p>
      ) : (
        <p className="mt-4 text-sm text-stone-500">
          Save a set or choose your routine goal when you are ready to generate
          the next session.
        </p>
      )}
    </div>
  );
}

function FloatingNotice({
  kind,
  message,
  onClose,
}: {
  kind: "success" | "error";
  message: string;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="mx-auto mb-4 w-full max-w-xl"
    >
      <button
        type="button"
        onClick={onClose}
        className={[
          "w-full rounded-[1.4rem] border px-4 py-3 text-left text-sm shadow-sm transition",
          kind === "success"
            ? "border-emerald-200 bg-emerald-50 text-emerald-900"
            : "border-rose-200 bg-rose-50 text-rose-700",
        ].join(" ")}
      >
        {message}
      </button>
    </motion.div>
  );
}

function PrimaryMetricCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-stone-200 bg-white/90 p-4">
      <div className="flex items-center gap-3 text-stone-500">
        <div className="rounded-full bg-stone-100 p-2">{icon}</div>
        <p className="text-sm font-medium text-stone-600">{label}</p>
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-stone-950">
        {value}
      </p>
    </div>
  );
}

function PreviewCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50/80 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
        {label}
      </p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-stone-950">
        {value}
      </p>
    </div>
  );
}

function FieldBlock({
  label,
  children,
  error,
}: {
  label: string;
  children: ReactNode;
  error?: string;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-stone-700">{label}</span>
      {children}
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </label>
  );
}

function ValidationSummary({ errors }: { errors: string[] }) {
  const uniqueErrors = Array.from(new Set(errors));

  if (uniqueErrors.length === 0) {
    return null;
  }

  return (
    <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50/80 p-4">
      <p className="text-sm font-semibold text-rose-700">Please fix these fields</p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-rose-700">
        {uniqueErrors.map((error) => (
          <li key={error}>{error}</li>
        ))}
      </ul>
    </div>
  );
}

function SetPearlBackground() {
  return (
    <>
      <div className="pointer-events-none absolute -left-20 top-14 h-64 w-64 rounded-full bg-amber-200/40 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-1/3 h-72 w-72 rounded-full bg-sky-200/35 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-rose-100/40 blur-3xl" />
    </>
  );
}

function createCalculatorFormData(input: {
  exerciseId: string;
  category: string;
  notes?: string;
  weightKg?: number;
  reps?: number;
  rir?: number;
  durationMinutes?: number;
  distanceMeters?: number | "";
  rpe?: number;
}) {
  const formData = new FormData();
  formData.set("exerciseId", input.exerciseId);
  formData.set("category", input.category);
  formData.set("notes", input.notes ?? "");

  if (typeof input.weightKg === "number") {
    formData.set("weightKg", String(input.weightKg));
  }
  if (typeof input.reps === "number") {
    formData.set("reps", String(input.reps));
  }
  if (typeof input.rir === "number") {
    formData.set("rir", String(input.rir));
  }
  if (typeof input.durationMinutes === "number") {
    formData.set("durationMinutes", String(input.durationMinutes));
  }
  if (typeof input.distanceMeters === "number") {
    formData.set("distanceMeters", String(input.distanceMeters));
  } else {
    formData.set("distanceMeters", "");
  }
  if (typeof input.rpe === "number") {
    formData.set("rpe", String(input.rpe));
  }

  return formData;
}

function createRecommendationFormData(input: {
  exerciseId: string;
  phaseGoal: string;
  days: number;
  trainingDaysPerWeek: number;
  targetSets?: number;
  targetReps?: number;
  notes?: string;
}) {
  const formData = new FormData();
  formData.set("exerciseId", input.exerciseId);
  formData.set("phaseGoal", input.phaseGoal);
  formData.set("days", String(input.days));
  formData.set("trainingDaysPerWeek", String(input.trainingDaysPerWeek));
  formData.set("notes", input.notes ?? "");

  if (typeof input.targetSets === "number") {
    formData.set("targetSets", String(input.targetSets));
  }

  if (typeof input.targetReps === "number") {
    formData.set("targetReps", String(input.targetReps));
  }

  return formData;
}

function createCalculatorRequestKeyFromStateData(
  data: { data?: unknown } | undefined,
) {
  if (!data?.data) {
    return null;
  }

  const parsed = SetCalculatorSchema.safeParse(data.data);
  return parsed.success ? JSON.stringify(parsed.data) : null;
}

function createRecommendationRequestKeyFromStateData(
  data: SetRecommendationFormState | undefined,
) {
  if (!data?.data) {
    return null;
  }

  const parsed = SetRecommendationSchema.safeParse(data.data);
  return parsed.success ? JSON.stringify(parsed.data) : null;
}

function asOptionalInput(value: string) {
  return value.trim() === "" ? undefined : value;
}

function parseOptionalNumber(value: string) {
  if (value.trim() === "") {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function collectErrors(
  errors: Record<string, string[] | undefined> | undefined,
) {
  if (!errors) {
    return [];
  }

  return Object.values(errors)
    .flatMap((messages) => messages ?? [])
    .filter(Boolean);
}

function formatMetric(value: number | null, suffix: string) {
  if (value === null) {
    return "N/A";
  }

  return `${value.toFixed(1)} ${suffix}`;
}

function formatPhaseGoal(value: GeneratedWorkoutPlan["phaseGoal"]) {
  switch (value) {
    case "BASELINE_TESTING":
      return "Baseline";
    case "HYPERTROPHY":
      return "Hypertrophy";
    case "STRENGTH":
      return "Strength";
    case "POWER":
      return "Power";
    case "RECOVERY":
      return "Recovery";
    default:
      return "Routine";
  }
}

function formatCategory(category: string) {
  switch (category) {
    case "LOWER_BODY_COMPOUND":
      return "Lower body compound";
    case "UPPER_BODY_TECHNICAL":
      return "Upper body technical";
    case "METABOLIC_CARDIO":
      return "Metabolic cardio";
    default:
      return category;
  }
}

function inputClassName(hasError: boolean) {
  return [
    "w-full rounded-[1.2rem] border bg-white px-4 py-3 text-sm text-stone-900 outline-none transition",
    "placeholder:text-stone-400 focus:border-stone-400 focus:ring-2 focus:ring-stone-200",
    hasError ? "border-rose-300 focus:ring-rose-100" : "border-stone-200",
  ].join(" ");
}

function primaryButtonClassName(disabled: boolean) {
  return [
    "inline-flex items-center justify-center gap-2 rounded-[1.2rem] px-4 py-3 text-sm font-semibold transition",
    disabled
      ? "cursor-not-allowed bg-stone-200 text-stone-500"
      : "bg-stone-950 text-white hover:bg-stone-800",
  ].join(" ");
}

function secondaryButtonClassName(disabled: boolean) {
  return [
    "inline-flex items-center justify-center gap-2 rounded-[1.2rem] border px-4 py-3 text-sm font-semibold transition",
    disabled
      ? "cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400"
      : "border-stone-300 bg-white text-stone-900 hover:bg-stone-50",
  ].join(" ");
}
