"use server";

import { print } from "graphql";
import { authFetchGraphql } from "@/lib/fetchGraphQL";
import { LOG_WORKOUT_SET_MUTATION } from "@/lib/gqlQueries";
import type { SetLogFormState } from "@/lib/types/formState";
import { SetCalculatorSchema } from "@/lib/zodSchemas/setCalculatorSchema";
import type { LoggedWorkoutSetPayload } from "@/types/set";
import {
  buildSetCalculatorRawData,
  toSetGraphqlInput,
} from "./shared";

export async function LogWorkoutSet(
  _state: SetLogFormState | undefined,
  formData: FormData,
): Promise<SetLogFormState> {
  const rawData = buildSetCalculatorRawData(formData);
  const validatedFields = SetCalculatorSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      data: rawData,
      errors: validatedFields.error.flatten().fieldErrors,
      status: "error",
    };
  }

  try {
    const data = await authFetchGraphql<{ logWorkoutSet: LoggedWorkoutSetPayload }>(
      print(LOG_WORKOUT_SET_MUTATION),
      {
        input: toSetGraphqlInput(validatedFields.data),
      },
    );

    return {
      data: rawData,
      result: data.logWorkoutSet,
      status: "success",
      message: "Set saved.",
    };
  } catch (error) {
    return {
      data: rawData,
      message:
        error instanceof Error
          ? error.message
          : "Unable to save your set right now.",
      status: "error",
    };
  }
}
