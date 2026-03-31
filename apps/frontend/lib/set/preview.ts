export function calculateEffectiveReps(
  reps?: number | null,
  rir?: number | null,
) {
  if (
    typeof reps !== "number" ||
    !Number.isFinite(reps) ||
    reps < 1 ||
    reps > 15
  ) {
    return null;
  }

  const safeRir =
    typeof rir === "number" && Number.isFinite(rir) && rir >= 0 ? rir : 0;

  return reps + safeRir;
}

export function calculateBrzyckiPreview(
  weightKg?: number | null,
  reps?: number | null,
  rir?: number | null,
) {
  if (
    typeof weightKg !== "number" ||
    !Number.isFinite(weightKg) ||
    weightKg <= 0
  ) {
    return null;
  }

  const effectiveReps = calculateEffectiveReps(reps, rir);

  if (effectiveReps === null || effectiveReps >= 37) {
    return null;
  }

  return roundToTenth(weightKg * (36 / (37 - effectiveReps)));
}

export function calculateTrainingMaxPreview(oneRepMaxKg?: number | null) {
  if (
    typeof oneRepMaxKg !== "number" ||
    !Number.isFinite(oneRepMaxKg) ||
    oneRepMaxKg <= 0
  ) {
    return null;
  }

  return roundToTenth(oneRepMaxKg * 0.9);
}

function roundToTenth(value: number) {
  return Math.round(value * 10) / 10;
}
