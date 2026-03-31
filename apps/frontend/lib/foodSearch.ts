"use server";

import { print } from "graphql";
import { fetchGraphql } from "./fetchGraphQL";
import { SEARCH_FOODS_QUERY } from "./gqlQueries";
import type { FoodSearchFormState } from "./types/formState";
import type { FoodSearchResponse } from "@/types/food";
import { FoodSearchSchema } from "./zodSchemas/foodSearchSchema";

// Food search stays GraphQL-first by design: Zod validates form input here,
// and the Nest resolver/schema remains the only contract for this feature.
export async function SearchFoods(
  state: FoodSearchFormState | undefined,
  formData: FormData,
): Promise<FoodSearchFormState> {
  const rawData = {
    query: formData.get("query")?.toString() || "",
    page: Number(formData.get("page")?.toString() || "1"),
    limit: Number(formData.get("limit")?.toString() || "8"),
    servingSize: Number(formData.get("servingSize")?.toString() || "100"),
  };

  const validatedFields = FoodSearchSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      data: rawData,
      errors: validatedFields.error.flatten().fieldErrors,
      status: "error",
    };
  }

  const { query, page, limit, servingSize } = validatedFields.data;
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return {
      data: {
        query: normalizedQuery,
        page,
        limit,
        servingSize,
      },
      result: null,
      status: "success",
    };
  }

  try {
    const data = (await fetchGraphql(print(SEARCH_FOODS_QUERY), {
      query: normalizedQuery,
      page,
      pageSize: limit,
      // Keep the backend on per-100g canonical values; the UI rescales locally.
      servingSize: 100,
    })) as { searchFoods: FoodSearchResponse };

    return {
      data: {
        query: normalizedQuery,
        page,
        limit,
        servingSize,
      },
      result: data.searchFoods,
      status: "success",
    };
  } catch (e: any) {
    return {
      data: {
        query: normalizedQuery,
        page,
        limit,
        servingSize,
      },
      message: e?.message ?? "Unable to search foods right now.",
      status: "error",
    };
  }
}
