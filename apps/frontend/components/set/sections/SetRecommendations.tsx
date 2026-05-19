"use client";

import Link from "next/link";
import { ArrowRight, LoaderCircle, WandSparkles } from "lucide-react";
import type { ReactNode } from "react";
import { formatPhaseGoal } from "@/lib/set/forms";
import type { GeneratedWorkoutPlan } from "@/types/set";

type SetRecommendationsProps = {
  plan?: GeneratedWorkoutPlan | null;
  isGeneratingRecommendation: boolean;
  loadingMessage?: string;
  error?: string;
};

export function SetRecommendations({
  plan,
  isGeneratingRecommendation,
  loadingMessage,
  error,
}: SetRecommendationsProps) {
  const providerStatus = getProviderStatus(plan);
  const needsHistory = Boolean(
    plan &&
      (plan.safetyWindow.minWeightKg === null ||
        plan.safetyWindow.maxWeightKg === null)
  );
  const sourceBadge = getSourceBadge(plan);

  return (
    <div className="rounded-2xl border border-sage-100 bg-cream-50/40 p-4">
      <div className="flex items-center gap-2 text-olive-900">
        <WandSparkles className="h-4 w-4" />
        <p className="text-sm font-semibold">Suggested routine</p>
      </div>

      {isGeneratingRecommendation ? (
        <div className="mt-4 rounded-xl border border-sage-100 bg-cream-50/70 p-4">
          <div className="flex items-center gap-3 text-sage-800">
            <LoaderCircle className="h-4 w-4 animate-spin" />
            <span className="text-sm font-medium">
              {loadingMessage ?? "Building your next session..."}
            </span>
          </div>
          <div className="mt-4 space-y-3">
            <div className="h-3 w-40 rounded-full bg-sage-200/80" />
            <div className="h-16 rounded-xl bg-sage-100/60" />
            <div className="h-3 w-3/4 rounded-full bg-sage-200/80" />
          </div>
        </div>
      ) : plan ? (
        <div className="mt-4 space-y-4">
          <div className="rounded-xl border border-sage-100 bg-cream-50/80 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">
                {formatPhaseGoal(plan.phaseGoal)}
              </p>
              <span
                className={[
                  "rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em]",
                  sourceBadge.className,
                ].join(" ")}
              >
                {sourceBadge.label}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-stone-700">
              {plan.contextSummary}
            </p>
          </div>

          {needsHistory && (
            <StatusCallout
              tone="neutral"
              title="Not enough history yet"
              body={`We need a few more logged sets of ${
                plan.routine[0]?.exercise ?? "this exercise"
              } before suggesting specific weights. Keep your sets clean and consistent.`}
            />
          )}

          {providerStatus && (
            <StatusCallout
              tone={providerStatus.tone}
              title={providerStatus.title}
              body={providerStatus.body}
              action={
                providerStatus.actionLabel ? (
                  <Link
                    href="/profile"
                    className="mt-3 inline-flex items-center gap-2 rounded-full border border-current/20 bg-white/70 px-3 py-2 text-sm font-semibold transition hover:bg-white"
                  >
                    {providerStatus.actionLabel}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : null
              }
            />
          )}

          {plan.source === "RULE_FALLBACK" && (
            <StatusCallout
              tone="amber"
              title="Fallback recommendation"
              body="The AI service is temporarily unavailable. This routine comes from our safe rule‑based system."
            />
          )}

          {plan.source === "USER_OPENROUTER" && (
            <StatusCallout
              tone="sky"
              title="Using your personal key"
              body="The default AI service was unavailable. This routine was generated using your connected OpenRouter key."
            />
          )}

          <div className="grid gap-3 sm:grid-cols-3">
            <SafetyChip
              label="Weight range"
              value={
                plan.safetyWindow.minWeightKg === null ||
                plan.safetyWindow.maxWeightKg === null
                  ? "Technique focus"
                  : `${plan.safetyWindow.minWeightKg.toFixed(1)}–${plan.safetyWindow.maxWeightKg.toFixed(1)} kg`
              }
            />
            <SafetyChip
              label="Set range"
              value={`${plan.safetyWindow.minSets}–${plan.safetyWindow.maxSets} sets`}
            />
            <SafetyChip
              label="Rep range"
              value={`${plan.safetyWindow.minReps}–${plan.safetyWindow.maxReps} reps`}
            />
          </div>

          <div className="rounded-xl border border-terracotta-100 bg-terracotta-50/60 p-4">
            <p className="text-sm font-semibold text-terracotta-800">Plan note</p>
            <p className="mt-2 text-sm leading-relaxed text-terracotta-800/80">
              {plan.rationale}
            </p>
          </div>

          {plan.routine.length > 0 && (
            <div className="space-y-3">
              {plan.routine.map((entry, index) => (
                <div
                  key={`${entry.exercise}-${index}`}
                  className="rounded-xl border border-sage-100 bg-white p-4"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">
                    Session block {index + 1}
                  </p>
                  <p className="mt-2 text-lg font-medium text-olive-900">
                    {entry.exercise}
                  </p>
                  <p className="mt-1 text-sm text-stone-500">
                    {entry.sets} sets × {entry.reps} reps
                    {entry.prescribedWeightKg === null
                      ? " — technique first"
                      : ` — ${entry.prescribedWeightKg.toFixed(1)} kg`}
                  </p>
                  {entry.rationale && (
                    <p className="mt-2 text-sm leading-relaxed text-stone-600">
                      {entry.rationale}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : error ? (
        <p className="mt-4 text-sm text-terracotta-600">{error}</p>
      ) : (
        <p className="mt-4 text-sm text-stone-500">
          Save a set or adjust your routine preferences above, then generate a
          suggestion.
        </p>
      )}
    </div>
  );
}

function SafetyChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-sage-100 bg-cream-50/70 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-olive-800">{value}</p>
    </div>
  );
}

function StatusCallout({
  title,
  body,
  tone,
  action,
}: {
  title: string;
  body: string;
  tone: "neutral" | "amber" | "sky" | "rose";
  action?: ReactNode;
}) {
  const className =
    tone === "amber"
      ? "border-terracotta-200 bg-terracotta-50/70 text-terracotta-900"
      : tone === "rose"
      ? "border-rose-200 bg-rose-50/70 text-rose-900"
      : tone === "sky"
      ? "border-sky-200 bg-sky-50/70 text-sky-900"
      : "border-sage-200 bg-cream-50/80 text-stone-800";

  return (
    <div className={`rounded-xl border p-4 ${className}`}>
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-2 text-sm leading-relaxed opacity-90">{body}</p>
      {action}
    </div>
  );
}

function getSourceBadge(plan?: GeneratedWorkoutPlan | null) {
  if (plan?.source === "USER_OPENROUTER") {
    return {
      label: "Personal key",
      className: "bg-sky-100 text-sky-800",
    };
  }
  if (plan?.source === "RULE_FALLBACK") {
    return {
      label: "Fallback",
      className: "bg-terracotta-100 text-terracotta-800",
    };
  }
  return {
    label: "Cloud AI",
    className: "bg-sage-100 text-sage-800",
  };
}

function getProviderStatus(plan?: GeneratedWorkoutPlan | null) {
  if (!plan?.providerNotice) return null;

  if (plan.providerNotice.includes("Reconnect OpenRouter")) {
    return {
      tone: "rose" as const,
      title: "Reconnect your key",
      body: plan.providerNotice,
      actionLabel: "Reconnect in profile",
    };
  }
  if (plan.providerNotice.includes("Connect OpenRouter")) {
    return {
      tone: "sky" as const,
      title: "Connect your key",
      body: plan.providerNotice,
      actionLabel: "Connect in profile",
    };
  }
  return {
    tone: "sky" as const,
    title: "Using personal key",
    body: plan.providerNotice,
    actionLabel: null,
  };
}
