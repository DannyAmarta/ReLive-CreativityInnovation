"use client";

import { AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/Card";
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
    validation, // 1. Added validation destructure
  } = useSetManager(initialExercises);

  // 2. Fixed params for calculateBrzyckiPreview
  const previewOneRepMaxKg = isCardio 
    ? null 
    : calculateBrzyckiPreview(
        parseOptionalNumber(form.weightKg),
        parseOptionalNumber(form.reps),
        parseOptionalNumber(form.rir)
      );

  const previewTrainingMaxKg = calculateTrainingMaxPreview(previewOneRepMaxKg);

  return (
    <div className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(253,230,138,0.4),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(125,211,252,0.22),transparent_30%),linear-gradient(180deg,#fffdf7_0%,#fffaf0_46%,#ffffff_100%)] text-stone-950">
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

            <SetControls
              {...form} 
              exercises={exercises}
              selectedExerciseDescription={selectedExercise?.description}
              category={category}
              isCardio={isCardio}
              previewOneRepMaxKg={previewOneRepMaxKg}
              previewTrainingMaxKg={previewTrainingMaxKg} // 3. Fixed variable name
              
              isPending={status.isPending}
              isLogging={status.isLogging}
              isGeneratingRecommendation={status.isGeneratingRecommendation}
              
              // 4. Mapped validation data
              canRefreshEstimate={validation.estimateValidation?.success}
              canSaveSet={validation.calculatorValidation?.success}
              canBuildRoutine={validation.recommendationValidation?.success}
              calculatorErrors={validation.calculatorValidation?.success ? undefined : validation.calculatorValidation?.error.flatten().fieldErrors}
              recommendationErrors={validation.recommendationValidation?.success ? undefined : validation.recommendationValidation?.error.flatten().fieldErrors}
              
              onExerciseChange={actions.handleExerciseChange}
              onWeightKgChange={(v) => actions.updateField("weightKg", v)}
              onRepsChange={(v) => actions.updateField("reps", v)}
              onRirChange={(v) => actions.updateField("rir", v)}
              onDurationMinutesChange={(v) => actions.updateField("durationMinutes", v)}
              onDistanceMetersChange={(v) => actions.updateField("distanceMeters", v)}
              onRpeChange={(v) => actions.updateField("rpe", v)}
              onNotesChange={(v) => actions.updateField("notes", v)}
              onPhaseGoalChange={(v) => actions.updateField("phaseGoal", v as RecommendationPhaseGoal)}
              onDaysChange={(v) => actions.updateField("days", v)}
              onTrainingDaysPerWeekChange={(v) => actions.updateField("trainingDaysPerWeek", v)}
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