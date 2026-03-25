import { BACKEND_URL } from "@/lib/constants";
import { fetchGraphql } from "@/lib/fetchGraphQL";
import { SEARCH_RECIPES_QUERY } from "@/lib/gqlQueries";
import type { RecipeSearchResponse, SearchRecipesParams } from "@/types/recipe";
import { print } from "graphql";

const RECIPE_SEARCH_CACHE_TTL_MS = 60_000;
const responseCache = new Map<
  string,
  { expiresAt: number; value: Promise<RecipeSearchResponse> }
>();

export async function searchRecipes({
  query,
  page = 1,
  limit = 10,
  signal,
}: SearchRecipesParams): Promise<RecipeSearchResponse> {
  const normalizedQuery = query.trim();
  const cacheKey = `${normalizedQuery.toLowerCase()}:${page}:${limit}`;
  const cachedEntry = responseCache.get(cacheKey);

  if (cachedEntry && cachedEntry.expiresAt > Date.now()) {
    return cachedEntry.value;
  }

  const nextValue = searchRecipesViaGraphql({
    query: normalizedQuery,
    page,
    limit,
    signal,
  });

  responseCache.set(cacheKey, {
    expiresAt: Date.now() + RECIPE_SEARCH_CACHE_TTL_MS,
    value: nextValue,
  });

  try {
    return await nextValue;
  } catch (error) {
    responseCache.delete(cacheKey);
    throw error;
  }
}

async function searchRecipesViaGraphql({
  query,
  page,
  limit,
  signal,
}: Required<Pick<SearchRecipesParams, "query" | "page" | "limit">> & {
  signal?: AbortSignal;
}) {
  try {
    const data = (await fetchGraphql(print(SEARCH_RECIPES_QUERY), {
      query,
      page,
      pageSize: limit,
    })) as { searchRecipes?: RecipeSearchResponse };

    if (!data?.searchRecipes) {
      throw new Error("Recipe search returned no data.");
    }

    return data.searchRecipes;
  } catch {
    return searchRecipesViaRest({ query, page, limit, signal });
  }
}

async function searchRecipesViaRest({
  query,
  page,
  limit,
  signal,
}: Required<Pick<SearchRecipesParams, "query" | "page" | "limit">> & {
  signal?: AbortSignal;
}) {
  const searchParams = new URLSearchParams({
    query,
    page: String(page),
    limit: String(limit),
  });

  let response: Response;

  try {
    response = await fetch(`${BACKEND_URL}/api/recipes?${searchParams.toString()}`, {
      method: "GET",
      signal,
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });
  } catch (error) {
    throw new Error(getNetworkErrorMessage(error));
  }

  if (!response.ok) {
    let message = "Failed to search recipes.";

    try {
      const errorPayload = (await response.json()) as { message?: string };
      if (errorPayload.message) {
        message = errorPayload.message;
      }
    } catch {
      message = response.statusText || message;
    }

    throw new Error(message);
  }

  try {
    return (await response.json()) as RecipeSearchResponse;
  } catch {
    throw new Error("The recipe API returned an invalid response.");
  }
}

function getNetworkErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return `Unable to reach the recipe backend at ${BACKEND_URL}. ${error.message}`;
  }

  return `Unable to reach the recipe backend at ${BACKEND_URL}.`;
}
