"use client";

import {
  BrainCircuit,
  Dumbbell,
  LoaderCircle,
  WandSparkles,
} from "lucide-react";
import type { RecommendationPhaseGoal, SetExerciseDefinition } from "@/types/set";
import { collectErrors, formatCategory } from "@/lib/set/forms";
import {
  FieldBlock,
  PreviewCard,
  ValidationSummary,
  inputClassName,
  primaryButtonClassName,
  secondaryButtonClassName,
} from "./SetUi";

type FieldErrors = Record<string, string[] | undefined> | undefined;

type SetControlPanelProps = {
  exercises: SetExerciseDefinition[];
  selectedExerciseId: string;
  selectedExerciseDescription?: string | null;
  category: string;
  isCardio: boolean;
  weightKg: string;
  reps: string;
  rir: string;
  durationMinutes: string;
  distanceMeters: string;
  rpe: string;
  notes: string;
  phaseGoal: RecommendationPhaseGoal;
  days: string;
  trainingDaysPerWeek: string;
  targetSets: string;
  targetReps: string;
  previewOneRepMaxKg: number | null;
  previewTrainingMaxKg: number | null;
  calculatorErrors: FieldErrors;
  recommendationErrors: FieldErrors;
  canRefreshEstimate: boolean;
  canSaveSet: boolean;
  canBuildRoutine: boolean;
  isPending: boolean;
  isLogging: boolean;
  isGeneratingRecommendation: boolean;
  onExerciseChange: (value: string) => void;
  onWeightKgChange: (value: string) => void;
  onRepsChange: (value: string) => void;
  onRirChange: (value: string) => void;
  onDurationMinutesChange: (value: string) => void;
  onDistanceMetersChange: (value: string) => void;
  onRpeChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onPhaseGoalChange: (value: RecommendationPhaseGoal) => void;
  onDaysChange: (value: string) => void;
  onTrainingDaysPerWeekChange: (value: string) => void;
  onTargetSetsChange: (value: string) => void;
  onTargetRepsChange: (value: string) => void;
  onRefreshEstimate: () => void;
  onSaveSet: () => void;
  onBuildRoutine: () => void;
};

export function SetControlPanel({
  exercises,
  selectedExerciseId,
  selectedExerciseDescription,
  category,
  isCardio,
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
  previewOneRepMaxKg,
  previewTrainingMaxKg,
  calculatorErrors,
  recommendationErrors,
  canRefreshEstimate,
  canSaveSet,
  canBuildRoutine,
  isPending,
  isLogging,
  isGeneratingRecommendation,
  onExerciseChange,
  onWeightKgChange,
  onRepsChange,
  onRirChange,
  onDurationMinutesChange,
  onDistanceMetersChange,
  onRpeChange,
  onNotesChange,
  onPhaseGoalChange,
  onDaysChange,
  onTrainingDaysPerWeekChange,
  onTargetSetsChange,
  onTargetRepsChange,
  onRefreshEstimate,
  onSaveSet,
  onBuildRoutine,
}: SetControlPanelProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldBlock
          label="Exercise"
          error={calculatorErrors?.exerciseId?.[0]}
        >
          <select
            value={selectedExerciseId}
            onChange={(event) => onExerciseChange(event.target.value)}
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

      {selectedExerciseDescription ? (
        <div className="rounded-[1.5rem] border border-stone-200/80 bg-stone-50/80 px-4 py-3 text-sm leading-7 text-stone-600">
          {selectedExerciseDescription}
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
              onChange={(event) => onDurationMinutesChange(event.target.value)}
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
              onChange={(event) => onRpeChange(event.target.value)}
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
              onChange={(event) => onDistanceMetersChange(event.target.value)}
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
              onChange={(event) => onWeightKgChange(event.target.value)}
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
              onChange={(event) => onRepsChange(event.target.value)}
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
              onChange={(event) => onRirChange(event.target.value)}
              className={inputClassName(Boolean(calculatorErrors?.rir?.[0]))}
              placeholder="0"
            />
          </FieldBlock>
        </div>
      )}

      <FieldBlock label="Notes" error={calculatorErrors?.notes?.[0]}>
        <textarea
          value={notes}
          onChange={(event) => onNotesChange(event.target.value)}
          className={`${inputClassName(Boolean(calculatorErrors?.notes?.[0]))} min-h-28 resize-none`}
          placeholder="Add anything important from the set."
        />
      </FieldBlock>

      {!isCardio ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <PreviewCard
            label="Live 1RM preview"
            value={
              previewOneRepMaxKg === null
                ? "Waiting"
                : `${previewOneRepMaxKg.toFixed(1)} kg`
            }
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

      <div className="rounded-[1.6rem] border border-stone-200/80 bg-white/80 p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-stone-100 p-2 text-stone-600">
            <WandSparkles className="h-4 w-4" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-stone-950">
              Recommendation inputs
            </p>
            <p className="text-sm leading-6 text-stone-500">
              These fields only shape the next routine suggestion. They do not
              change your live estimate.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FieldBlock
            label="Goal"
            error={recommendationErrors?.phaseGoal?.[0]}
          >
            <select
              value={phaseGoal}
              onChange={(event) =>
                onPhaseGoalChange(event.target.value as RecommendationPhaseGoal)
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

          <FieldBlock
            label="Recent window (days)"
            error={recommendationErrors?.days?.[0]}
          >
            <input
              type="number"
              inputMode="numeric"
              min="7"
              max="28"
              step="1"
              value={days}
              onChange={(event) => onDaysChange(event.target.value)}
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
              onChange={(event) => onTrainingDaysPerWeekChange(event.target.value)}
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
              onChange={(event) => onTargetSetsChange(event.target.value)}
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
              onChange={(event) => onTargetRepsChange(event.target.value)}
              className={inputClassName(
                Boolean(recommendationErrors?.targetReps?.[0]),
              )}
              placeholder="Optional"
            />
          </FieldBlock>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onRefreshEstimate}
          disabled={!canRefreshEstimate || isPending}
          className={primaryButtonClassName(!canRefreshEstimate || isPending)}
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
          onClick={onSaveSet}
          disabled={!canSaveSet || isLogging}
          className={secondaryButtonClassName(!canSaveSet || isLogging)}
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
          onClick={onBuildRoutine}
          disabled={!canBuildRoutine || isGeneratingRecommendation}
          className={secondaryButtonClassName(
            !canBuildRoutine || isGeneratingRecommendation,
          )}
        >
          {isGeneratingRecommendation ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : (
            <WandSparkles className="h-4 w-4" />
          )}
          Build AI routine
        </button>
      </div>

      {(calculatorErrors || recommendationErrors) &&
      (Object.keys(calculatorErrors ?? {}).length > 0 ||
        Object.keys(recommendationErrors ?? {}).length > 0) ? (
        <ValidationSummary
          errors={[
            ...collectErrors(calculatorErrors),
            ...collectErrors(recommendationErrors),
          ]}
        />
      ) : null}
    </div>
  );
}
