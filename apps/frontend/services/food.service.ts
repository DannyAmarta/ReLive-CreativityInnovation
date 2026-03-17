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

  const response = await fetch(`${BACKEND_URL}/api/foods?${searchParams.toString()}`, {
    method: "GET",
    signal,
    headers: {
      Accept: "application/json",
    },
  });

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

  return (await response.json()) as FoodSearchResponse;
}

async function searchFoodsViaGraphql({
  query,
  page,
  limit,
}: Required<Pick<SearchFoodsParams, "query" | "page" | "limit">>) {
  const data = (await fetchGraphql(getDocumentBody(SEARCH_FOODS_QUERY), {
    query,
    page,
    pageSize: limit,
    servingSize: 100,
  })) as { searchFoods: FoodSearchResponse };

  return data.searchFoods;
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
