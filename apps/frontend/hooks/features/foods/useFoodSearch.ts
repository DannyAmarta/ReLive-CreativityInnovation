import { useState, useMemo, useRef, useEffect, useCallback, startTransition } from "react";
import { useActionState } from "react";
import { SearchFoods } from "@/lib/foodSearch";
import { useLocalStorageState } from "@/hooks/ui/useLocalStorageState";
import {
  toggleFavoriteFood,
  createMealItem,
  updateMealItemServing,
  withServingSize,
  rememberRecentValue,
  calculateNutrientsForServing,
} from "@/lib/food";
import type { Food, MealFoodItem, SavedFoodReference, FoodNutrients } from "@/types/food";
import { authFetchGraphql } from "@/lib/fetchGraphQL";
import { print } from "graphql";
import {
  MY_FAVORITE_FOODS_QUERY,
  MY_MEAL_ITEMS_QUERY,
  TOGGLE_FAVORITE_FOOD_MUTATION,
  UPSERT_MEAL_ITEM_MUTATION,
  REMOVE_MEAL_ITEM_MUTATION,
  CLEAR_MEAL_ITEMS_MUTATION,
} from "@/lib/gqlQueries";

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
  
  // DB + LocalStorage Sync States
  const [favoriteFoods, _setFavoriteFoods] = useState<SavedFoodReference[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(FAVORITE_FOODS_KEY);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [mealItems, _setMealItems] = useState<MealFoodItem[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(MEAL_ITEMS_KEY);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const pendingUpsertsRef = useRef<Record<string, { timer: NodeJS.Timeout; item: MealFoodItem }>>({});
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const manualSubmitRef = useRef(false);

  // ─── Hydration & Merge Logic ───────────────────────────────────────────────
  useEffect(() => {
    const hydrate = async () => {
      try {
        // 1. Hydrate Favorites
        const favData = await authFetchGraphql<{ myFavoriteFoods: any[] }>(
          print(MY_FAVORITE_FOODS_QUERY)
        );
        if (favData?.myFavoriteFoods) {
          if (favData.myFavoriteFoods.length > 0) {
            const mappedFavorites: SavedFoodReference[] = favData.myFavoriteFoods.map((f) => ({
              id: f.foodId,
              name: f.foodName,
              brand: f.brand,
              source: f.source,
            }));
            _setFavoriteFoods(mappedFavorites);
            localStorage.setItem(FAVORITE_FOODS_KEY, JSON.stringify(mappedFavorites));
          } else {
            // DB is empty. If local storage has items, sync them to DB!
            const localSaved = localStorage.getItem(FAVORITE_FOODS_KEY);
            const localFavs: SavedFoodReference[] = localSaved ? JSON.parse(localSaved) : [];
            for (const item of localFavs) {
              await authFetchGraphql(print(TOGGLE_FAVORITE_FOOD_MUTATION), {
                input: {
                  foodId: item.id,
                  foodName: item.name,
                  brand: item.brand,
                  source: item.source,
                }
              });
            }
          }
        }

        // 2. Hydrate Meal Items
        const mealData = await authFetchGraphql<{ myMealItems: any[] }>(
          print(MY_MEAL_ITEMS_QUERY)
        );
        if (mealData?.myMealItems) {
          if (mealData.myMealItems.length > 0) {
            const mappedMealItems: MealFoodItem[] = mealData.myMealItems.map((item) => {
              const per100gNutrients = item.nutrientsJson as FoodNutrients;
              const nutrients = calculateNutrientsForServing(per100gNutrients, item.servingSize);
              return {
                id: String(item.id),
                foodId: item.foodId,
                name: item.foodName,
                brand: item.brand,
                source: item.source,
                servingSize: item.servingSize,
                per100gNutrients,
                nutrients,
              };
            });
            _setMealItems(mappedMealItems);
            localStorage.setItem(MEAL_ITEMS_KEY, JSON.stringify(mappedMealItems));
          } else {
            // DB is empty. If local storage has items, sync them to DB!
            const localSaved = localStorage.getItem(MEAL_ITEMS_KEY);
            const localMeals: MealFoodItem[] = localSaved ? JSON.parse(localSaved) : [];
            for (const item of localMeals) {
              const res = await authFetchGraphql<{ upsertMealItem: { id: number } }>(
                print(UPSERT_MEAL_ITEM_MUTATION),
                {
                  input: {
                    foodId: item.foodId,
                    foodName: item.name,
                    brand: item.brand,
                    source: item.source,
                    servingSize: item.servingSize,
                    nutrientsJson: item.per100gNutrients,
                  }
                }
              );
              if (res?.upsertMealItem?.id) {
                item.id = String(res.upsertMealItem.id);
              }
            }
            if (localMeals.length > 0) {
              _setMealItems(localMeals);
              localStorage.setItem(MEAL_ITEMS_KEY, JSON.stringify(localMeals));
            }
          }
        }
      } catch (err) {
        console.warn("Failed to sync food data with DB on mount:", err);
      }
    };
    hydrate();
  }, []);

  // ─── Debounced DB Sync ──────────────────────────────────────────────────────
  const debounceUpsert = useCallback((item: MealFoodItem) => {
    const foodId = item.foodId;
    const source = item.source;
    const key = `${foodId}:${source}`;

    if (pendingUpsertsRef.current[key]) {
      clearTimeout(pendingUpsertsRef.current[key].timer);
    }

    const timer = setTimeout(async () => {
      try {
        const response = await authFetchGraphql<{ upsertMealItem: { id: number } }>(
          print(UPSERT_MEAL_ITEM_MUTATION),
          {
            input: {
              foodId: item.foodId,
              foodName: item.name,
              brand: item.brand,
              source: item.source,
              servingSize: item.servingSize,
              nutrientsJson: item.per100gNutrients,
            }
          }
        );
        if (response?.upsertMealItem?.id) {
          const dbId = String(response.upsertMealItem.id);
          _setMealItems(current => current.map(c => 
            c.foodId === item.foodId && c.source === item.source ? { ...c, id: dbId } : c
          ));
        }
      } catch (err) {
        console.error("Failed to sync meal item upsert to DB:", err);
      } finally {
        delete pendingUpsertsRef.current[key];
      }
    }, 1000);

    pendingUpsertsRef.current[key] = { timer, item };
  }, []);

  // ─── Sync Handlers ──────────────────────────────────────────────────────────
  const setFavoriteFoods = useCallback((valOrUpdater: SavedFoodReference[] | ((cur: SavedFoodReference[]) => SavedFoodReference[])) => {
    _setFavoriteFoods((cur) => {
      const next = typeof valOrUpdater === "function" ? valOrUpdater(cur) : valOrUpdater;
      localStorage.setItem(FAVORITE_FOODS_KEY, JSON.stringify(next));

      const toggledItem = cur.length > next.length 
        ? cur.find(item => !next.some(n => n.id === item.id)) 
        : next.find(item => !cur.some(c => c.id === item.id));

      if (toggledItem) {
        authFetchGraphql(print(TOGGLE_FAVORITE_FOOD_MUTATION), {
          input: {
            foodId: toggledItem.id,
            foodName: toggledItem.name,
            brand: toggledItem.brand,
            source: toggledItem.source,
          }
        }).catch(err => {
          console.error("Failed to sync favorite food to DB:", err);
        });
      }

      return next;
    });
  }, []);

  const setMealItems = useCallback((valOrUpdater: MealFoodItem[] | ((cur: MealFoodItem[]) => MealFoodItem[])) => {
    _setMealItems((cur) => {
      const next = typeof valOrUpdater === "function" ? valOrUpdater(cur) : valOrUpdater;
      localStorage.setItem(MEAL_ITEMS_KEY, JSON.stringify(next));

      // Removals
      const removedItems = cur.filter(item => !next.some(n => n.foodId === item.foodId && n.source === item.source));
      for (const item of removedItems) {
        const key = `${item.foodId}:${item.source}`;
        if (pendingUpsertsRef.current[key]) {
          clearTimeout(pendingUpsertsRef.current[key].timer);
          delete pendingUpsertsRef.current[key];
        }

        if (/^\d+$/.test(item.id)) {
          authFetchGraphql(print(REMOVE_MEAL_ITEM_MUTATION), { id: parseInt(item.id, 10) })
            .catch(err => console.error("Failed to remove meal item from DB:", err));
        }
      }

      // Additions & Updates
      const addedOrUpdated = next.filter(n => {
        const matching = cur.find(c => c.foodId === n.foodId && c.source === n.source);
        return !matching || matching.servingSize !== n.servingSize;
      });

      for (const item of addedOrUpdated) {
        debounceUpsert(item);
      }

      // Bulk clear
      if (next.length === 0 && cur.length > 0) {
        Object.keys(pendingUpsertsRef.current).forEach(k => {
          clearTimeout(pendingUpsertsRef.current[k].timer);
        });
        pendingUpsertsRef.current = {};

        authFetchGraphql(print(CLEAR_MEAL_ITEMS_MUTATION))
          .catch(err => console.error("Failed to clear meal items in DB:", err));
      }

      return next;
    });
  }, [debounceUpsert]);

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
