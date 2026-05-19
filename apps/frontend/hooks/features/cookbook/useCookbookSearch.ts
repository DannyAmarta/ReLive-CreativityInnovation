import { useState, useMemo, useRef, useEffect, useCallback, startTransition } from "react";
import { useActionState } from "react";
import { SearchRecipes } from "@/lib/recipeSearch";
import { useLocalStorageState } from "@/hooks/ui/useLocalStorageState";
import type { Recipe } from "@/types/recipe";

const RECENT_RECIPE_QUERIES_KEY = "recipe-search-recent-queries";
const DEFAULT_PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 350;

export function useCookbookSearch(initialQuery: string, initialRecipeId?: string) {
  const [state, action, pending] = useActionState(SearchRecipes, undefined);
  const [query, setQuery] = useState(initialQuery);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const manualSubmitRef = useRef(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [recentQueries, setRecentQueries] = useLocalStorageState<string[]>(RECENT_RECIPE_QUERIES_KEY, []);

  const normalizedQuery = query.trim();
  const hasQuery = normalizedQuery.length > 0;
  
  const results = useMemo(() => (hasQuery ? state?.result?.items ?? [] : []), [hasQuery, state?.result?.items]);
  const meta = hasQuery ? state?.result ?? null : null;
  const page = meta?.page ?? 1;
  const hasNextPage = results.length >= (meta?.pageSize ?? DEFAULT_PAGE_SIZE);
  const hasPreviousPage = page > 1;
  const isLoading = pending && hasQuery;

  const error =
    hasQuery && state?.status === "error"
      ? state.message ?? "Unable to load recipe results."
      : null;

  const submitSearch = useCallback((nextQuery: string, nextPage: number) => {
    const trimmedQuery = nextQuery.trim();
    if (!trimmedQuery) return;
    const formData = new FormData();
    formData.set("query", trimmedQuery);
    formData.set("page", String(nextPage));
    formData.set("limit", String(DEFAULT_PAGE_SIZE));
    startTransition(() => { action(formData); });
  }, [action]);

  // Handle automatic debounced search
  useEffect(() => {
    if (!normalizedQuery) return;
    if (manualSubmitRef.current) { manualSubmitRef.current = false; return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => submitSearch(normalizedQuery, 1), SEARCH_DEBOUNCE_MS);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [normalizedQuery, submitSearch]);

  // Selection logic
  const initialMatch = useMemo(() => {
    if (!initialRecipeId || results.length === 0) return null;
    return results.find((item) => item.id === initialRecipeId) ?? null;
  }, [initialRecipeId, results]);

  useEffect(() => {
    if (results.length === 0) { setSelectedRecipe(null); return; }
    if (initialMatch) { setSelectedRecipe(initialMatch); } 
    else if (!selectedRecipe || !results.some(r => r.id === selectedRecipe.id)) {
      setSelectedRecipe(results[0]);
    }
  }, [initialMatch, results]);

  // function handleNextPage() {
  //   if (!hasNextPage) return;
  //   submitSearch(normalizedQuery, page + 1);
  // }

  // function handlePreviousPage() {
  //   if (!hasPreviousPage) return;
  //   submitSearch(normalizedQuery, page - 1);
  // }

  const handleNextPage = useCallback(() => {
  if (hasNextPage) {
    submitSearch(normalizedQuery, page + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}, [hasNextPage, normalizedQuery, page, submitSearch]);

  const handlePreviousPage = useCallback(() => {
    if (hasPreviousPage) {
      submitSearch(normalizedQuery, page - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [hasPreviousPage, normalizedQuery, page, submitSearch]);

  return {
    query, setQuery,
    selectedRecipe, setSelectedRecipe,
    recentQueries, setRecentQueries,
    results, meta, page, isLoading, error, hasQuery, hasNextPage, hasPreviousPage,
    submitSearch, manualSubmitRef, handleNextPage, handlePreviousPage
  };
}
