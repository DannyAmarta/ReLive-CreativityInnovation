import { BACKEND_URL } from "@/lib/constants";
import type { RecipeSearchResponse, SearchRecipesParams } from "@/types/recipe";

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

  const nextValue = searchRecipesViaRest({
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

  const response = await fetch(`${BACKEND_URL}/api/recipes?${searchParams.toString()}`, {
    method: "GET",
    signal,
    headers: {
      Accept: "application/json",
    },
  });

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

  return (await response.json()) as RecipeSearchResponse;
}
