import { asOptionalInput, parseOptionalNumber } from "@/lib/set/forms";
import type {
  RecommendationPhaseGoal,
  SetExerciseCategory,
  SetExerciseDefinition,
} from "@/types/set";

export type SetExperienceNotice = {
  kind: "success" | "error" | "info";
  message: string;
};

export type SetExperienceFormValues = {
  selectedExerciseId: string;
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
};

const DEFAULT_CATEGORY: SetExerciseCategory = "LOWER_BODY_COMPOUND";

export function createInitialSetExperienceForm(
  defaultExercise?: SetExerciseDefinition,
): SetExperienceFormValues {
  return {
    selectedExerciseId: defaultExercise?.id ?? "",
    weightKg: "",
    reps: "",
    rir: "0",
    durationMinutes: "",
    distanceMeters: "",
    rpe: "",
    notes: "",
    phaseGoal: "HYPERTROPHY",
    days: "14",
    trainingDaysPerWeek: "3",
    targetSets: "",
    targetReps: "",
  };
}

export function findSelectedSetExercise(
  exercises: SetExerciseDefinition[],
  selectedExerciseId: string,
  defaultExercise?: SetExerciseDefinition,
) {
  return (
    exercises.find((exercise) => exercise.id === selectedExerciseId) ??
    defaultExercise
  );
}

export function resolveSetCategory(
  selectedExercise?: SetExerciseDefinition,
): SetExerciseCategory {
  return selectedExercise?.category ?? DEFAULT_CATEGORY;
}

export function resetFieldsForCategoryChange(
  form: SetExperienceFormValues,
  category: SetExerciseCategory,
) {
  return category === "METABOLIC_CARDIO"
    ? {
        ...form,
        weightKg: "",
        reps: "",
        rir: "0",
      }
    : {
        ...form,
        durationMinutes: "",
        distanceMeters: "",
        rpe: "",
      };
}

export function createSetCalculatorRawValues(
  form: SetExperienceFormValues,
  category: SetExerciseCategory,
) {
  return {
    exerciseId: form.selectedExerciseId,
    category,
    weightKg: asOptionalInput(form.weightKg),
    reps: asOptionalInput(form.reps),
    rir: asOptionalInput(form.rir),
    durationMinutes: asOptionalInput(form.durationMinutes),
    distanceMeters: asOptionalInput(form.distanceMeters),
    rpe: asOptionalInput(form.rpe),
    notes: form.notes,
  };
}

// Notes matter for logging and recommendations, but they should not keep
// retriggering the live estimate while the user is typing.
export function createSetEstimateRawValues(
  form: SetExperienceFormValues,
  category: SetExerciseCategory,
) {
  return {
    exerciseId: form.selectedExerciseId,
    category,
    weightKg: asOptionalInput(form.weightKg),
    reps: asOptionalInput(form.reps),
    rir: asOptionalInput(form.rir),
    durationMinutes: asOptionalInput(form.durationMinutes),
    distanceMeters: asOptionalInput(form.distanceMeters),
    rpe: asOptionalInput(form.rpe),
  };
}

export function createSetRecommendationRawValues(form: SetExperienceFormValues) {
  return {
    exerciseId: form.selectedExerciseId,
    phaseGoal: form.phaseGoal, 
    days: parseOptionalNumber(form.days),
    trainingDaysPerWeek: parseOptionalNumber(form.trainingDaysPerWeek),
    targetSets: parseOptionalNumber(form.targetSets),
    targetReps: parseOptionalNumber(form.targetReps),
    notes: form.notes,
  };
}

export function hasMeaningfulSetInput(form: SetExperienceFormValues) {
  return Boolean(
    form.weightKg ||
      form.reps ||
      form.durationMinutes ||
      form.distanceMeters ||
      form.rpe ||
      form.notes.trim(),
  );
}
