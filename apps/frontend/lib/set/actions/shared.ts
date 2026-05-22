export function readOptionalNumber(value: FormDataEntryValue | null) {
  const raw = value?.toString();

  if (!raw) {
    return undefined;
  }

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function buildSetCalculatorRawData(formData: FormData) {
  return {
    exerciseId: formData.get("exerciseId")?.toString() || "",
    category: formData.get("category")?.toString() || "",
    weightKg: readOptionalNumber(formData.get("weightKg")),
    reps: readOptionalNumber(formData.get("reps")),
    rir: readOptionalNumber(formData.get("rir")),
    durationMinutes: readOptionalNumber(formData.get("durationMinutes")),
    distanceMeters:
      formData.get("distanceMeters")?.toString() === ""
        ? ("" as const)
        : readOptionalNumber(formData.get("distanceMeters")),
    rpe: readOptionalNumber(formData.get("rpe")),
    notes: formData.get("notes")?.toString() || "",
  };
}

export function buildSetEstimateRawData(formData: FormData) {
  return {
    exerciseId: formData.get("exerciseId")?.toString() || "",
    category: formData.get("category")?.toString() || "",
    weightKg: readOptionalNumber(formData.get("weightKg")),
    reps: readOptionalNumber(formData.get("reps")),
    rir: readOptionalNumber(formData.get("rir")),
    durationMinutes: readOptionalNumber(formData.get("durationMinutes")),
    distanceMeters:
      formData.get("distanceMeters")?.toString() === ""
        ? ("" as const)
        : readOptionalNumber(formData.get("distanceMeters")),
    rpe: readOptionalNumber(formData.get("rpe")),
  };
}

export function toSetGraphqlInput(payload: {
  exerciseId: string;
  notes?: string;
  weightKg?: number;
  reps?: number;
  rir?: number;
  durationMinutes?: number;
  distanceMeters?: number | "";
  rpe?: number;
}) {
  return {
    exerciseId: payload.exerciseId,
    weightKg: "weightKg" in payload ? payload.weightKg : undefined,
    reps: "reps" in payload ? payload.reps : undefined,
    rir: "rir" in payload ? payload.rir : undefined,
    durationMinutes:
      "durationMinutes" in payload ? payload.durationMinutes : undefined,
    distanceMeters:
      "distanceMeters" in payload && payload.distanceMeters !== ""
        ? payload.distanceMeters
        : undefined,
    rpe: "rpe" in payload ? payload.rpe : undefined,
    notes: payload.notes || undefined,
  };
}
