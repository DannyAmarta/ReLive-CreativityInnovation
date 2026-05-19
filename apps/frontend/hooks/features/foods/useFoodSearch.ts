import { useState, useMemo, useRef, useEffect, useCallback, startTransition } from "react";
import { useActionState } from "react";
import { SearchFoods } from "@/lib/foodSearch";
import { useLocalStorageState } from "@/hooks/ui/useLocalStorageState";
import { toggleFavoriteFood, createMealItem, updateMealItemServing, withServingSize, rememberRecentValue } from "@/lib/food";
import type { Food, MealFoodItem, SavedFoodReference } from "@/types/food";

// Constants moved inside or imported
const RECENT_SEARCHES_KEY = "food-search-recent-queries";
const FAVORITE_FOODS_KEY = "food-search-favorite-foods";
const MEAL_ITEMS_KEY = "food-search-meal-items";
const DEFAULT_SERVING_SIZE = 100;
const DEFAULT_PAGE_SIZE = 8;
const SEARCH_DEBOUNCE_MS = 350;

export function useFoodSearch(initialQuery: string) {
  const [state, action, pending] = useActionState(SearchFoods, undefined);
  const [query, setQuery] = useState(initialQuery);
  const [servingSize, setServingSize] = useState(DEFAULT_SERVING_SIZE);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  
  // UI States
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mealOpen, setMealOpen] = useState(false);

  // Persistence
  const [recentQueries, setRecentQueries] = useLocalStorageState<string[]>(RECENT_SEARCHES_KEY, []);
  const [favoriteFoods, setFavoriteFoods] = useLocalStorageState<SavedFoodReference[]>(FAVORITE_FOODS_KEY, []);
  const [mealItems, setMealItems] = useLocalStorageState<MealFoodItem[]>(MEAL_ITEMS_KEY, []);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const manualSubmitRef = useRef(false);

  const normalizedQuery = query.trim();
  const hasQuery = normalizedQuery.length > 0;
  const rawItems = hasQuery ? state?.result?.items ?? [] : [];

  // Derived State
  const results = useMemo(
    () => hasQuery ? rawItems.map((item) => withServingSize(item, servingSize)) : [],
    [hasQuery, rawItems, servingSize]
  );

  const meta = hasQuery && state?.result ? { ...state.result, items: results, servingSize } : null;
  const page = meta?.page ?? 1;
  const hasNextPage = rawItems.length >= (meta?.pageSize ?? DEFAULT_PAGE_SIZE);
  const hasPreviousPage = page > 1;
  const isLoading = pending && hasQuery;
  const error = hasQuery && state?.status === "error" ? state.message ?? "Unable to load results." : null;
  const favoriteIds = useMemo(() => favoriteFoods.map((f) => f.id), [favoriteFoods]);

  // Actions
  const submitSearch = useCallback((nextQuery: string, nextPage: number) => {
    const trimmed = nextQuery.trim();
    if (!trimmed) return;
    const fd = new FormData();
    fd.set("query", trimmed);
    fd.set("page", String(nextPage));
    fd.set("limit", String(DEFAULT_PAGE_SIZE));
    fd.set("servingSize", String(DEFAULT_SERVING_SIZE));
    startTransition(() => { action(fd); });
  }, [action]);

  // Effects logic...
  useEffect(() => {
    if (!normalizedQuery) return;
    if (manualSubmitRef.current) { manualSubmitRef.current = false; return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => submitSearch(normalizedQuery, 1), SEARCH_DEBOUNCE_MS);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [normalizedQuery, submitSearch]);

  const handleAddToMeal = (food: Food) => {
    setMealItems((cur) => [createMealItem(food, food.servingSize), ...cur].slice(0, 12));
  };

  return {
    // 1. Data & Query
    query,
    setQuery,
    servingSize,
    setServingSize,
    results,
    meta,
    
    // 2. Persistence
    favoriteFoods,
    setFavoriteFoods,
    mealItems,
    setMealItems,
    recentQueries,
    favoriteIds, // Add this!
    
    // 3. Flags & Status
    hasQuery,
    isLoading,
    error,
    page,         // Add this!
    hasNextPage,  // Add this!
    hasPreviousPage, // Add this!
    
    // 4. UI states
    drawerOpen,
    setDrawerOpen,
    mealOpen,
    setMealOpen,
    selectedFood,
    setSelectedFood,
    setRecentQueries,

    // 5. Functions & Refs
    handleAddToMeal,
    submitSearch,
    manualSubmitRef, // Add this!
  };
}
