"use server";

import { BACKEND_URL } from "./constants";
import { getSession } from "./session.server";
import type { SetRecommendationFormState } from "./types/formState";
import { SetRecommendationSchema } from "./zodSchemas/setRecommendationSchema";
import type { GeneratedWorkoutPlan } from "@/types/set";

export async function GenerateWorkoutRecommendation(
  _state: SetRecommendationFormState | undefined,
  formData: FormData,
): Promise<SetRecommendationFormState> {
  const rawData = {
    exerciseId: formData.get("exerciseId")?.toString() || "",
    phaseGoal: formData.get("phaseGoal")?.toString() || "",
    days: readOptionalNumber(formData.get("days")),
    trainingDaysPerWeek: readOptionalNumber(formData.get("trainingDaysPerWeek")),
    targetSets: readOptionalNumber(formData.get("targetSets")),
    targetReps: readOptionalNumber(formData.get("targetReps")),
    notes: formData.get("notes")?.toString() || "",
  };

  const validatedFields = SetRecommendationSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      data: rawData,
      errors: validatedFields.error.flatten().fieldErrors,
      status: "error",
    };
  }

  try {
    const session = await getSession();

    const response = await fetch(`${BACKEND_URL}/recommendations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.accessToken}`,
      },
      cache: "no-store",
      body: JSON.stringify(validatedFields.data),
    });

    const result = await readJsonResponse(response);

    if (!response.ok) {
      throw new Error(
        getResponseMessage(result) ??
          "Unable to generate a routine right now. Please try again.",
      );
    }

    return {
      data: rawData,
      result: result as GeneratedWorkoutPlan,
      status: "success",
      message: "Routine ready.",
    };
  } catch (error) {
    return {
      data: rawData,
      message:
        error instanceof Error
          ? error.message
          : "Unable to generate a routine right now. Please try again.",
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

async function readJsonResponse(response: Response) {
  const raw = await response.text();

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return {
      message: raw.trim() || "The backend returned a non-JSON response.",
    };
  }
}

function getResponseMessage(result: Record<string, unknown> | null) {
  return typeof result?.message === "string" ? result.message : undefined;
}
