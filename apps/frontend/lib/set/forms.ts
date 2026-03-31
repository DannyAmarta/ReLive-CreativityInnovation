import type { SetRecommendationFormState } from "@/lib/types/formState";
import { SetCalculatorSchema } from "@/lib/zodSchemas/setCalculatorSchema";
import { SetRecommendationSchema } from "@/lib/zodSchemas/setRecommendationSchema";
import type { GeneratedWorkoutPlan } from "@/types/set";

export function createCalculatorFormData(input: {
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

export function createRecommendationFormData(input: {
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

export function createCalculatorRequestKeyFromStateData(
  data: { data?: unknown } | undefined,
) {
  if (!data?.data) {
    return null;
  }

  const parsed = SetCalculatorSchema.safeParse(data.data);
  return parsed.success ? JSON.stringify(parsed.data) : null;
}

export function createRecommendationRequestKeyFromStateData(
  data: SetRecommendationFormState | undefined,
) {
  if (!data?.data) {
    return null;
  }

  const parsed = SetRecommendationSchema.safeParse(data.data);
  return parsed.success ? JSON.stringify(parsed.data) : null;
}

export function asOptionalInput(value: string) {
  return value.trim() === "" ? undefined : value;
}

export function parseOptionalNumber(value: string) {
  if (value.trim() === "") {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function collectErrors(
  errors: Record<string, string[] | undefined> | undefined,
) {
  if (!errors) {
    return [];
  }

  return Object.values(errors)
    .flatMap((messages) => messages ?? [])
    .filter(Boolean);
}

export function formatMetric(value: number | null, suffix: string) {
  if (value === null) {
    return "N/A";
  }

  return `${value.toFixed(1)} ${suffix}`;
}

export function formatPhaseGoal(value: GeneratedWorkoutPlan["phaseGoal"]) {
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

export function formatCategory(category: string) {
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
