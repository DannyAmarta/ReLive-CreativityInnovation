"use server";

import { print } from "graphql";
import { authFetchGraphql } from "@/lib/fetchGraphQL";
import { GENERATE_WORKOUT_RECOMMENDATION_MUTATION } from "@/lib/gqlQueries";
import type { SetRecommendationFormState } from "@/lib/types/formState";
import { SetRecommendationSchema } from "@/lib/zodSchemas/setRecommendationSchema";
import type { GeneratedWorkoutPlan } from "@/types/set";
import { readOptionalNumber } from "./shared";

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
    const data = await authFetchGraphql<{
      generateWorkoutRecommendation: GeneratedWorkoutPlan;
    }>(print(GENERATE_WORKOUT_RECOMMENDATION_MUTATION), {
      input: validatedFields.data,
    });

    const recommendation = data.generateWorkoutRecommendation;

    return {
      data: rawData,
      result: recommendation,
      status: "success",
      message:
        recommendation.providerNotice ??
        (recommendation.source === "USER_OPENROUTER"
          ? "Connected OpenRouter routine ready."
          : recommendation.source === "RULE_FALLBACK"
            ? "Fallback routine ready."
            : "Routine ready."),
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
