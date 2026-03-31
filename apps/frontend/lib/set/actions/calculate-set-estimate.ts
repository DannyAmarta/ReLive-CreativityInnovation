"use server";

import { print } from "graphql";
import { fetchGraphql } from "@/lib/fetchGraphQL";
import { CALCULATE_SET_ESTIMATE_QUERY } from "@/lib/gqlQueries";
import type { SetCalculatorFormState } from "@/lib/types/formState";
import { SetCalculatorSchema } from "@/lib/zodSchemas/setCalculatorSchema";
import type { SetCalculationResult } from "@/types/set";
import {
  buildSetEstimateRawData,
  toSetGraphqlInput,
} from "./shared";

export async function CalculateSetEstimate(
  _state: SetCalculatorFormState | undefined,
  formData: FormData,
): Promise<SetCalculatorFormState> {
  const rawData = buildSetEstimateRawData(formData);
  const validatedFields = SetCalculatorSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      data: rawData,
      errors: validatedFields.error.flatten().fieldErrors,
      status: "error",
    };
  }

  try {
    const data = await fetchGraphql<{ calculateSetEstimate: SetCalculationResult }>(
      print(CALCULATE_SET_ESTIMATE_QUERY),
      {
        input: toSetGraphqlInput(validatedFields.data),
      },
    );

    return {
      data: rawData,
      result: data.calculateSetEstimate,
      status: "success",
    };
  } catch (error) {
    return {
      data: rawData,
      message:
        error instanceof Error
          ? error.message
          : "Unable to calculate your set right now.",
      status: "error",
    };
  }
}
