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
        plan.safetyWindow.maxWeightKg === null),
  );
  const sourceBadge = getSourceBadge(plan);

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
              {loadingMessage ?? "Analyzing neuromuscular trends..."}
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
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                {formatPhaseGoal(plan.phaseGoal)}
              </p>
              <span
                className={[
                  "rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]",
                  sourceBadge.className,
                ].join(" ")}
              >
                {sourceBadge.label}
              </span>
            </div>
            <p className="mt-2 text-sm leading-7 text-stone-600">
              {plan.contextSummary}
            </p>
          </div>

          {needsHistory ? (
            <StatusCallout
              tone="neutral"
              title="Need more history first"
              body={`We need a few clean ${plan.routine[0]?.exercise ?? "exercise"} logs before we can prescribe working weight naturally. Log submaximal sessions first, then the range can unlock.`}
            />
          ) : null}

          {providerStatus ? (
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
          ) : null}

          {plan.source === "RULE_FALLBACK" ? (
            <StatusCallout
              tone="amber"
              title="Cloud AI fallback active"
              body="Cloud AI is unavailable right now, so this routine came from the safe server fallback."
            />
          ) : null}

          {plan.source === "USER_OPENROUTER" ? (
            <StatusCallout
              tone="sky"
              title="Connected OpenRouter fallback active"
              body="The shared server key was unavailable, so this routine was generated with your connected OpenRouter key."
            />
          ) : null}

          <div className="grid gap-3 sm:grid-cols-3">
            <SafetyChip
              label="Weight range"
              value={
                plan.safetyWindow.minWeightKg === null ||
                plan.safetyWindow.maxWeightKg === null
                  ? "Technique first"
                  : `${plan.safetyWindow.minWeightKg.toFixed(1)}-${plan.safetyWindow.maxWeightKg.toFixed(1)} kg`
              }
            />
            <SafetyChip
              label="Set range"
              value={`${plan.safetyWindow.minSets}-${plan.safetyWindow.maxSets} sets`}
            />
            <SafetyChip
              label="Rep range"
              value={`${plan.safetyWindow.minReps}-${plan.safetyWindow.maxReps} reps`}
            />
          </div>

          <div className="rounded-[1.35rem] border border-amber-200 bg-amber-50/70 p-4">
            <p className="text-sm font-semibold text-amber-900">Plan note</p>
            <p className="mt-2 text-sm leading-7 text-amber-900/80">
              {plan.rationale}
            </p>
          </div>

          {plan.routine.length > 0 ? (
            <div className="space-y-3">
              {plan.routine.map((entry, index) => (
                <div
                  key={`${entry.exercise}-${index}`}
                  className="rounded-[1.35rem] border border-stone-200 bg-white p-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                    Session block {index + 1}
                  </p>
                  <p className="mt-2 text-lg font-semibold text-stone-950">
                    {entry.exercise}
                  </p>
                  <p className="mt-1 text-sm text-stone-500">
                    {entry.sets} sets x {entry.reps} reps
                    {entry.prescribedWeightKg === null
                      ? " - Technique-first session"
                      : ` - ${entry.prescribedWeightKg.toFixed(1)} kg`}
                  </p>
                  {entry.rationale ? (
                    <p className="mt-2 text-sm leading-7 text-stone-600">
                      {entry.rationale}
                    </p>
                  ) : null}
                </div>
              ))}
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

function SafetyChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.2rem] border border-stone-200 bg-stone-50/80 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-stone-800">{value}</p>
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
      ? "border-amber-200 bg-amber-50/70 text-amber-900"
      : tone === "rose"
        ? "border-rose-200 bg-rose-50/70 text-rose-900"
      : tone === "sky"
        ? "border-sky-200 bg-sky-50/70 text-sky-900"
        : "border-stone-200 bg-stone-50/80 text-stone-800";

  return (
    <div className={`rounded-[1.35rem] border p-4 ${className}`}>
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-2 text-sm leading-7 opacity-90">{body}</p>
      {action}
    </div>
  );
}

function getSourceBadge(plan?: GeneratedWorkoutPlan | null) {
  if (plan?.source === "USER_OPENROUTER") {
    return {
      label: "Connected OpenRouter",
      className: "bg-sky-100 text-sky-900",
    };
  }

  if (plan?.source === "RULE_FALLBACK") {
    return {
      label: "Server fallback",
      className: "bg-amber-100 text-amber-900",
    };
  }

  return {
    label: "Cloud AI",
    className: "bg-emerald-100 text-emerald-900",
  };
}

function getProviderStatus(plan?: GeneratedWorkoutPlan | null) {
  if (!plan?.providerNotice) {
    return null;
  }

  if (plan.providerNotice.includes("Reconnect OpenRouter")) {
    return {
      tone: "rose" as const,
      title: "Reconnect OpenRouter",
      body: plan.providerNotice,
      actionLabel: "Reconnect in profile",
    };
  }

  if (plan.providerNotice.includes("Connect OpenRouter")) {
    return {
      tone: "sky" as const,
      title: "OpenRouter second layer",
      body: plan.providerNotice,
      actionLabel: "Connect in profile",
    };
  }

  return {
    tone: "sky" as const,
    title: "OpenRouter second layer",
    body: plan.providerNotice,
    actionLabel: null,
  };
}
