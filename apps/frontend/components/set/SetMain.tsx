"use client";

import { AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { useSetManager } from "@/hooks/features/set/useSetManager";
import {
  calculateBrzyckiPreview,
  calculateTrainingMaxPreview,
} from "@/lib/set/preview";
import { parseOptionalNumber } from "@/lib/set/forms";
import { hasMeaningfulSetInput } from "@/lib/set/experience";
import type {
  RecommendationPhaseGoal,
  SetExerciseDefinition,
} from "@/types/set";

import { SetControls } from "./sections/SetControls";
import { SetHero } from "./components/SetHero";
import { SetResults } from "./sections/SetResults";
import { FloatingNotice, SetPearlBackground } from "./components/SetUi";

type SetExperienceProps = {
  initialExercises: SetExerciseDefinition[];
};

export function SetMain({ initialExercises }: SetExperienceProps) {
  const {
    form,
    exercises,
    selectedExercise,
    category,
    isCardio,
    notice,
    setNotice,
    states,
    status,
    actions,
    validation,
  } = useSetManager(initialExercises);

  const weightNum = parseOptionalNumber(form.weightKg);
  const repsNum = parseOptionalNumber(form.reps);
  const rirNum = parseOptionalNumber(form.rir);

  const isValid =
    weightNum != null &&
    repsNum != null &&
    rirNum != null &&
    weightNum > 0 &&
    repsNum > 0;

  const previewOneRepMaxKg = isValid
    ? calculateBrzyckiPreview(weightNum, repsNum, rirNum)
    : null;

  const previewTrainingMaxKg = calculateTrainingMaxPreview(previewOneRepMaxKg);

  return (
    <div className="relative min-h-screen overflow-hidden bg-cream-50 bg-[radial-gradient(circle_at_top_left,_rgba(138,154,107,0.08)_0%,_transparent_50%),_radial-gradient(circle_at_bottom_right,_rgba(199,122,90,0.06)_0%,_transparent_60%)] text-stone-900">
      <SetPearlBackground />

      <div className="relative mx-auto flex w-full max-w-5xl flex-col px-4 py-8 sm:px-6 lg:px-8">
        <AnimatePresence>
          {notice && (
            <FloatingNotice
              kind={notice.kind}
              message={notice.message}
              onClose={() => setNotice(null)}
            />
          )}
        </AnimatePresence>

        <Card className="border-sage-100/50 bg-white/90 shadow-sm backdrop-blur-[2px]">
          <CardContent className="space-y-8 p-6 sm:p-8">
            <SetHero />

            <SetControls
              {...form}
              exercises={exercises}
              selectedExerciseDescription={selectedExercise?.description}
              category={category}
              isCardio={isCardio}
              previewOneRepMaxKg={previewOneRepMaxKg}
              previewTrainingMaxKg={previewTrainingMaxKg}
              isPending={status.isPending}
              isLogging={status.isLogging}
              isGeneratingRecommendation={status.isGeneratingRecommendation}
              canRefreshEstimate={validation.estimateValidation?.success}
              canSaveSet={validation.calculatorValidation?.success}
              canBuildRoutine={validation.recommendationValidation?.success}
              calculatorErrors={
                validation.calculatorValidation?.success
                  ? undefined
                  : validation.calculatorValidation?.error.flatten().fieldErrors
              }
              recommendationErrors={
                validation.recommendationValidation?.success
                  ? undefined
                  : validation.recommendationValidation?.error.flatten()
                      .fieldErrors
              }
              onExerciseChange={actions.handleExerciseChange}
              onWeightKgChange={(v) => actions.updateField("weightKg", v)}
              onRepsChange={(v) => actions.updateField("reps", v)}
              onRirChange={(v) => actions.updateField("rir", v)}
              onDurationMinutesChange={(v) =>
                actions.updateField("durationMinutes", v)
              }
              onDistanceMetersChange={(v) =>
                actions.updateField("distanceMeters", v)
              }
              onRpeChange={(v) => actions.updateField("rpe", v)}
              onNotesChange={(v) => actions.updateField("notes", v)}
              onPhaseGoalChange={(v) =>
                actions.updateField("phaseGoal", v as RecommendationPhaseGoal)
              }
              onDaysChange={(v) => actions.updateField("days", v)}
              onTrainingDaysPerWeekChange={(v) =>
                actions.updateField("trainingDaysPerWeek", v)
              }
              onTargetSetsChange={(v) => actions.updateField("targetSets", v)}
              onTargetRepsChange={(v) => actions.updateField("targetReps", v)}
              onRefreshEstimate={actions.refreshEstimate}
              onSaveSet={actions.saveCurrentSet}
              onBuildRoutine={actions.buildRoutine}
            />

            <SetResults
              isPending={status.isPending}
              result={states.estimateState?.result}
              savedPayload={states.logState?.result}
              recommendation={states.recommendationState?.result}
              recommendationError={states.recommendationState?.message}
              error={states.estimateState?.message}
              isCardio={isCardio}
              isGeneratingRecommendation={status.isGeneratingRecommendation}
              hasMeaningfulInput={hasMeaningfulSetInput(form)}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
