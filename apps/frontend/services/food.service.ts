import { BACKEND_URL } from "@/lib/constants";
import { fetchGraphql } from "@/lib/fetchGraphQL";
import { SEARCH_FOODS_QUERY } from "@/lib/gqlQueries";
import type { FoodSearchResponse, SearchFoodsParams } from "@/types/food";

const FOOD_SEARCH_CACHE_TTL_MS = 60_000;
const responseCache = new Map<
  string,
  { expiresAt: number; value: Promise<FoodSearchResponse> }
>();

export async function searchFoods({
  query,
  page = 1,
  limit = 10,
  signal,
}: SearchFoodsParams): Promise<FoodSearchResponse> {
  const normalizedQuery = query.trim();
  const cacheKey = `${normalizedQuery.toLowerCase()}:${page}:${limit}`;
  const cachedEntry = responseCache.get(cacheKey);

  // Short-lived client caching smooths out back/forward pagination and repeated
  // searches for the same term without changing the backend contract.
  if (cachedEntry && cachedEntry.expiresAt > Date.now()) {
    return cachedEntry.value;
  }

  // REST stays the default transport. GraphQL can be enabled with an env var
  // when the backend schema is preferred by the team.
  const nextValue = shouldUseGraphql()
    ? searchFoodsViaGraphql({
        query: normalizedQuery,
        page,
        limit,
        signal,
      })
    : searchFoodsViaRest({
        query: normalizedQuery,
        page,
        limit,
        signal,
      });

  responseCache.set(cacheKey, {
    expiresAt: Date.now() + FOOD_SEARCH_CACHE_TTL_MS,
    value: nextValue,
  });

  try {
    return await nextValue;
  } catch (error) {
    responseCache.delete(cacheKey);
    throw error;
  }
}

async function searchFoodsViaRest({
  query,
  page,
  limit,
  signal,
}: Required<Pick<SearchFoodsParams, "query" | "page" | "limit">> & {
  signal?: AbortSignal;
}) {
  const searchParams = new URLSearchParams({
    query,
    page: String(page),
    limit: String(limit),
    servingSize: "100",
  });

  let response: Response;

  try {
    response = await fetch(`${BACKEND_URL}/api/foods?${searchParams.toString()}`, {
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
    let message = "Failed to search foods.";

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
    return (await response.json()) as FoodSearchResponse;
  } catch {
    throw new Error("The food API returned an invalid response.");
  }
}

async function searchFoodsViaGraphql({
  query,
  page,
  limit,
  signal,
}: Required<Pick<SearchFoodsParams, "query" | "page" | "limit">> & {
  signal?: AbortSignal;
}) {
  try {
    const data = (await fetchGraphql(getDocumentBody(SEARCH_FOODS_QUERY), {
      query,
      page,
      pageSize: limit,
      servingSize: 100,
    })) as { searchFoods?: FoodSearchResponse };

    if (!data?.searchFoods) {
      throw new Error("Food search returned no data.");
    }

    return data.searchFoods;
  } catch {
    return searchFoodsViaRest({ query, page, limit, signal });
  }
}

function getDocumentBody(document: { loc?: { source: { body: string } } }) {
  const body = document.loc?.source.body;
  if (!body) {
    throw new Error("GraphQL document body is unavailable.");
  }

  return body;
}

function shouldUseGraphql() {
  return process.env.NEXT_PUBLIC_FOOD_SEARCH_TRANSPORT === "graphql";
}

function getNetworkErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return `Unable to reach the food backend at ${BACKEND_URL}. ${error.message}`;
  }

  return `Unable to reach the food backend at ${BACKEND_URL}.`;
}
