"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import {
  BrainCircuit,
  Dumbbell,
  Flame,
  HeartPulse,
  Sparkles,
  Waves,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatMetric } from "@/lib/set/forms";
import type {
  GeneratedWorkoutPlan,
  LoggedWorkoutSetPayload,
  SetCalculationResult,
} from "@/types/set";
import { SetRecommendations } from "./SetRecommendations";

export function SetResults({
  isPending,
  result,
  savedPayload,
  recommendation,
  recommendationError,
  recommendationLoadingMessage,
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
  recommendationLoadingMessage?: string;
  error?: string;
  isCardio: boolean;
  isGeneratingRecommendation: boolean;
  hasMeaningfulInput: boolean;
}) {
  return (
    <Card className="h-full border-sage-100/70 bg-gradient-to-b from-white to-cream-50/90">
      <CardContent className="flex h-full flex-col gap-5 p-6">
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-500">
            Current estimate
          </p>
          <h3 className="font-serif text-2xl font-medium tracking-tight text-olive-900">
            {result?.exerciseName ?? "Awaiting valid set"}
          </h3>
          <p className="text-sm text-stone-500">
            {isPending ? "Updating your numbers…" : "Based on your latest input."}
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-terracotta-200 bg-terracotta-50 px-4 py-3 text-sm text-terracotta-700">
            {error}
          </div>
        )}

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
                    label="Load score"
                    value={formatMetric(result.cardioLoadScore, "score")}
                  />
                  <PrimaryMetricCard
                    icon={<Flame className="h-5 w-5" />}
                    label="Est. calories"
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
                      label="Training max (90%)"
                      value={formatMetric(result.trainingMaxKg, "kg")}
                    />
                  </div>

                  <div className="rounded-2xl border border-sage-100/80 bg-white/90 p-4">
                    <p className="text-sm font-semibold text-olive-900">
                      Suggested working weights
                    </p>
                    <p className="mt-1 text-sm text-stone-500">
                      Starting points for your next work sets.
                    </p>
                    <div className="mt-4 space-y-3">
                      {result.recommendedLoads.map((load) => (
                        <div
                          key={`${load.repTarget}-${load.intensityPercent}`}
                          className="rounded-xl border border-sage-100 bg-cream-50/80 p-4"
                        >
                          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">
                            {load.repTarget} reps
                          </p>
                          <p className="mt-2 text-2xl font-medium text-olive-900">
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

              <div className="rounded-xl border border-terracotta-100 bg-terracotta-50/70 p-4">
                <p className="text-sm font-semibold text-terracotta-800">
                  Coaching note
                </p>
                <p className="mt-2 text-sm leading-relaxed text-terracotta-800/80">
                  {result.insightSummary}
                </p>
              </div>

              {savedPayload && (
                <div className="rounded-xl border border-sage-200 bg-sage-50/70 p-4">
                  <p className="text-sm font-semibold text-sage-800">
                    Set saved
                  </p>
                  <div className="mt-3 space-y-3 text-sm text-sage-800/85">
                    <p>
                      Logged set #{savedPayload.loggedSet.id}
                      {savedPayload.loggedSet.isCnsFatigue
                        ? " flagged for fatigue."
                        : " added to your history."}
                    </p>
                    <p>{savedPayload.analytics.contextSummary}</p>
                    <p>
                      EMA (1RM): {formatMetric(savedPayload.analytics.emaOneRepMaxKg, "kg")}
                    </p>
                    <p>
                      Baseline:{" "}
                      {formatMetric(
                        savedPayload.analytics.baselineAverageOneRepMaxKg,
                        "kg"
                      )}
                    </p>
                  </div>
                </div>
              )}

              <SetRecommendations
                plan={recommendation}
                isGeneratingRecommendation={isGeneratingRecommendation}
                loadingMessage={recommendationLoadingMessage}
                error={recommendationError}
              />

              <details className="rounded-xl border border-sage-100 bg-white/80 p-4">
                <summary className="cursor-pointer list-none text-sm font-semibold text-stone-700">
                  Advanced details
                </summary>
                <div className="mt-4 grid gap-3 text-sm text-stone-600">
                  <p>Formula: {result.formulaUsed}</p>
                  <p>Energy system: {result.primaryEnergySystem}</p>
                  {result.effectiveReps !== null && (
                    <p>Effective reps: {result.effectiveReps}</p>
                  )}
                  {result.boundedEffectiveReps !== null && (
                    <p>Bounded effective reps: {result.boundedEffectiveReps}</p>
                  )}
                  {result.relativeIntensityPercent !== null && (
                    <p>
                      Relative intensity: {result.relativeIntensityPercent.toFixed(1)}%
                    </p>
                  )}
                  {result.volumeLoadKg !== null && (
                    <p>Volume load: {result.volumeLoadKg.toFixed(1)} kg</p>
                  )}
                  <p>Confidence: {Math.round(result.confidenceScore * 100)}%</p>
                  {result.warnings.length > 0 && (
                    <div className="rounded-xl border border-sage-200 bg-cream-50 p-3">
                      <p className="font-semibold text-stone-700">Warnings</p>
                      <ul className="mt-2 list-disc space-y-1 pl-5">
                        {result.warnings.map((warning) => (
                          <li key={warning}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}
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
              className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-sage-200 bg-cream-50/80 px-6 text-center"
            >
              <div className="rounded-full bg-white p-3 shadow-sm">
                <BrainCircuit className="h-8 w-8 text-sage-600" />
              </div>
              <p className="mt-4 font-serif text-lg font-medium text-olive-900">
                {hasMeaningfulInput
                  ? "Complete a valid set to see your estimate"
                  : "Fill in the fields above"}
              </p>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-stone-500">
                {hasMeaningfulInput
                  ? "Add weight, reps, and RIR (or duration/RPE for cardio)."
                  : "Choose an exercise and enter your set details."}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
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
    <div className="rounded-xl border border-sage-100 bg-white/90 p-4">
      <div className="flex items-center gap-3 text-stone-500">
        <div className="rounded-full bg-sage-100 p-2 text-sage-700">{icon}</div>
        <p className="text-sm font-medium text-stone-600">{label}</p>
      </div>
      <p className="mt-3 text-3xl font-medium tracking-tight text-olive-900">
        {value}
      </p>
    </div>
  );
}
