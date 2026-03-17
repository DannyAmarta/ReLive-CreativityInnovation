"use client";

import {
  startTransition,
  useDeferredValue,
  useEffect,
  useEffectEvent,
  useReducer,
} from "react";
import { searchRecipes } from "@/services/recipe.service";
import type { Recipe, RecipeSearchResponse } from "@/types/recipe";
import { useDebounce } from "./useDebounce";

type RecipeSearchState = {
  query: string;
  page: number;
  limit: number;
  data: RecipeSearchResponse | null;
  isLoading: boolean;
  error: string | null;
};

type RecipeSearchAction =
  | { type: "setQuery"; payload: string }
  | { type: "setPage"; payload: number }
  | { type: "request" }
  | { type: "success"; payload: RecipeSearchResponse }
  | { type: "failure"; payload: string }
  | { type: "reset" };

const initialState: RecipeSearchState = {
  query: "",
  page: 1,
  limit: 10,
  data: null,
  isLoading: false,
  error: null,
};

function reducer(
  state: RecipeSearchState,
  action: RecipeSearchAction,
): RecipeSearchState {
  switch (action.type) {
    case "setQuery":
      return {
        ...state,
        query: action.payload,
        page: 1,
      };
    case "setPage":
      return {
        ...state,
        page: action.payload,
      };
    case "request":
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case "success":
      return {
        ...state,
        data: action.payload,
        isLoading: false,
        error: null,
      };
    case "failure":
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case "reset":
      return {
        ...state,
        page: 1,
        data: null,
        isLoading: false,
        error: null,
      };
    default:
      return state;
  }
}

export function useRecipeSearch(initialQuery = "") {
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    query: initialQuery,
  });
  const debouncedQuery = useDebounce(state.query.trim(), 350);
  const deferredQuery = useDeferredValue(debouncedQuery);

  const runSearch = useEffectEvent(async (signal: AbortSignal) => {
    dispatch({ type: "request" });

    try {
      const response = await searchRecipes({
        query: deferredQuery,
        limit: state.limit,
        page: state.page,
        signal,
      });

      startTransition(() => {
        dispatch({ type: "success", payload: response });
      });
    } catch (error) {
      if (signal.aborted) {
        return;
      }

      const message =
        error instanceof Error ? error.message : "Unable to load recipe results.";

      startTransition(() => {
        dispatch({ type: "failure", payload: message });
      });
    }
  });

  useEffect(() => {
    if (!deferredQuery) {
      dispatch({ type: "reset" });
      return;
    }

    const controller = new AbortController();
    runSearch(controller.signal);

    return () => controller.abort();
  }, [deferredQuery, state.limit, state.page]);

  const results: Recipe[] = state.data?.items ?? [];

  return {
    query: state.query,
    results,
    meta: state.data,
    page: state.page,
    limit: state.limit,
    hasNextPage: (state.data?.items.length ?? 0) >= state.limit,
    hasPreviousPage: state.page > 1,
    isLoading: state.isLoading,
    error: state.error,
    setQuery(value: string) {
      dispatch({ type: "setQuery", payload: value });
    },
    nextPage() {
      if ((state.data?.items.length ?? 0) < state.limit) {
        return;
      }

      dispatch({ type: "setPage", payload: state.page + 1 });
    },
    previousPage() {
      if (state.page === 1) {
        return;
      }

      dispatch({ type: "setPage", payload: state.page - 1 });
    },
  };
}
