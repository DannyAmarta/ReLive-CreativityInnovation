"use client";

import {
  startTransition,
  useDeferredValue,
  useEffect,
  useEffectEvent,
  useMemo,
  useReducer,
} from "react";
import { withServingSize } from "@/lib/food";
import { searchFoods } from "@/services/food.service";
import type { Food, FoodSearchResponse } from "@/types/food";
import { useDebounce } from "./useDebounce";

type FoodSearchState = {
  query: string;
  servingSize: number;
  limit: number;
  page: number;
  data: FoodSearchResponse | null;
  isLoading: boolean;
  error: string | null;
};

type FoodSearchAction =
  | { type: "setQuery"; payload: string }
  | { type: "setServingSize"; payload: number }
  | { type: "setPage"; payload: number }
  | { type: "request" }
  | { type: "success"; payload: FoodSearchResponse }
  | { type: "failure"; payload: string }
  | { type: "reset" };

const initialState: FoodSearchState = {
  query: "",
  servingSize: 100,
  limit: 8,
  page: 1,
  data: null,
  isLoading: false,
  error: null,
};

function reducer(state: FoodSearchState, action: FoodSearchAction): FoodSearchState {
  switch (action.type) {
    case "setQuery":
      return {
        ...state,
        query: action.payload,
        page: 1,
      };
    case "setServingSize":
      return {
        ...state,
        servingSize: action.payload,
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

export function useFoodSearch(initialQuery = "") {
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    query: initialQuery,
  });
  const debouncedQuery = useDebounce(state.query.trim(), 350);
  const deferredQuery = useDeferredValue(debouncedQuery);

  // Network fetches only care about the search term + pagination.
  // Serving-size changes are handled locally from per-100g values.
  const runSearch = useEffectEvent(async (signal: AbortSignal) => {
    console.log("[foods] fetch:start", {
      query: deferredQuery,
      page: state.page,
      limit: state.limit,
    });

    dispatch({ type: "request" });

    try {
      const response = await searchFoods({
        query: deferredQuery,
        limit: state.limit,
        page: state.page,
        signal,
      });

      startTransition(() => {
        dispatch({ type: "success", payload: response });
      });

      console.log("[foods] fetch:success", {
        query: deferredQuery,
        page: state.page,
        totalReturned: response.totalReturned,
        sourceUsed: response.sourceUsed,
        cacheHit: response.cacheHit,
      });
    } catch (error) {
      if (signal.aborted) {
        console.log("[foods] fetch:aborted", {
          query: deferredQuery,
          page: state.page,
        });
        return;
      }

      const message =
        error instanceof Error ? error.message : "Unable to load food results.";

      startTransition(() => {
        dispatch({ type: "failure", payload: message });
      });

      console.error("[foods] fetch:error", {
        query: deferredQuery,
        page: state.page,
        message,
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

  const results: Food[] = useMemo(
    () =>
      (state.data?.items ?? []).map((item) => withServingSize(item, state.servingSize)),
    [state.data?.items, state.servingSize],
  );

  // We keep the response shape close to the backend contract, but swap in the
  // locally re-scaled items so the UI can stay transport-agnostic.
  const meta = useMemo(
    () =>
      state.data
        ? {
            ...state.data,
            items: results,
            servingSize: state.servingSize,
          }
        : null,
    [results, state.data, state.servingSize],
  );

  return {
    query: state.query,
    servingSize: state.servingSize,
    results,
    rawResults: state.data?.items ?? [],
    meta,
    page: state.page,
    limit: state.limit,
    hasNextPage: (state.data?.items.length ?? 0) >= state.limit,
    hasPreviousPage: state.page > 1,
    isLoading: state.isLoading,
    error: state.error,
    setQuery(value: string) {
      dispatch({ type: "setQuery", payload: value });
    },
    setServingSize(value: number) {
      dispatch({ type: "setServingSize", payload: Math.max(1, Math.trunc(value || 100)) });
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
    goToPage(page: number) {
      dispatch({ type: "setPage", payload: Math.max(1, Math.trunc(page)) });
    },
  };
}
