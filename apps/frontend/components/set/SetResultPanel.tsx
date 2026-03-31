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
import { SetRecommendationPanel } from "./SetRecommendationPanel";

export function SetResultPanel({
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

              <SetRecommendationPanel
                plan={recommendation}
                isGeneratingRecommendation={isGeneratingRecommendation}
                loadingMessage={recommendationLoadingMessage}
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
