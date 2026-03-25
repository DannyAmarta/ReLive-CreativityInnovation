"use server";

import { print } from "graphql";
import { fetchGraphql } from "./fetchGraphQL";
import { SEARCH_RECIPES_QUERY } from "./gqlQueries";
import type { RecipeSearchFormState } from "./types/formState";
import type { RecipeSearchResponse } from "@/types/recipe";
import { RecipeSearchSchema } from "./zodSchemas/foodSearchSchema";

// This server action validates cookbook search input and hits the GraphQL recipe query.
// It mirrors the auth form pattern so the cookbook page can use form state + zod.
export async function SearchRecipes(
  state: RecipeSearchFormState | undefined,
  formData: FormData,
): Promise<RecipeSearchFormState> {
  const rawData = {
    query: formData.get("query")?.toString() || "",
    page: Number(formData.get("page")?.toString() || "1"),
    limit: Number(formData.get("limit")?.toString() || "10"),
  };

  const validatedFields = RecipeSearchSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      data: rawData,
      errors: validatedFields.error.flatten().fieldErrors,
      status: "error",
    };
  }

  const { query, page, limit } = validatedFields.data;
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return {
      data: {
        query: normalizedQuery,
        page,
        limit,
      },
      result: null,
      status: "success",
    };
  }

  try {
    const data = (await fetchGraphql(print(SEARCH_RECIPES_QUERY), {
      query: normalizedQuery,
      page,
      pageSize: limit,
    })) as { searchRecipes: RecipeSearchResponse };

    return {
      data: {
        query: normalizedQuery,
        page,
        limit,
      },
      result: data.searchRecipes,
      status: "success",
    };
  } catch (e: any) {
    return {
      data: {
        query: normalizedQuery,
        page,
        limit,
      },
      message: e?.message ?? "Unable to search recipes right now.",
      status: "error",
    };
  }
}
