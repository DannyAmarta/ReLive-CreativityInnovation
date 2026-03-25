"use server";

import { print } from "graphql";
import { authFetchGraphql } from "./fetchGraphQL";
import { LOG_WORKOUT_SET_MUTATION } from "./gqlQueries";
import type { SetLogFormState } from "./types/formState";
import type { LoggedWorkoutSetPayload } from "@/types/set";
import { SetCalculatorSchema } from "./zodSchemas/setCalculatorSchema";

export async function LogWorkoutSet(
  _state: SetLogFormState | undefined,
  formData: FormData,
): Promise<SetLogFormState> {
  const rawData = {
    exerciseId: formData.get("exerciseId")?.toString() || "",
    category: formData.get("category")?.toString() || "",
    weightKg: readOptionalNumber(formData.get("weightKg")),
    reps: readOptionalNumber(formData.get("reps")),
    rir: readOptionalNumber(formData.get("rir")),
    durationMinutes: readOptionalNumber(formData.get("durationMinutes")),
    distanceMeters:
      formData.get("distanceMeters")?.toString() === ""
        ? ""
        : readOptionalNumber(formData.get("distanceMeters")),
    rpe: readOptionalNumber(formData.get("rpe")),
    notes: formData.get("notes")?.toString() || "",
  };

  const validatedFields = SetCalculatorSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      data: rawData,
      errors: validatedFields.error.flatten().fieldErrors,
      status: "error",
    };
  }

  const payload = validatedFields.data;

  try {
    const data = await authFetchGraphql<{ logWorkoutSet: LoggedWorkoutSetPayload }>(
      print(LOG_WORKOUT_SET_MUTATION),
      {
        input: {
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
        },
      },
    );

    return {
      data: rawData,
      result: data.logWorkoutSet,
      status: "success",
      message: "Set saved.",
    };
  } catch (e: any) {
    return {
      data: rawData,
      message: e?.message ?? "Unable to save your set right now.",
      status: "error",
    };
  }
}

function readOptionalNumber(value: FormDataEntryValue | null) {
  const raw = value?.toString();

  if (!raw) {
    return undefined;
  }

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
}
