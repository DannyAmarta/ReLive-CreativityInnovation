"use client";

import { ArrowRight, Dumbbell, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { FoodDetailsPanel } from "./FoodDetailsPanel";
import { MealSummaryPanel } from "./MealSummaryPanel";
import { FoodRecipePanel } from "./FoodRecipePanel";
import { FoodResultList } from "./FoodResultList";
import { FoodSearchInput } from "./FoodSearchInput";
import { useFoodSearch } from "@/hooks/useFoodSearch";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";
import {
  createMealItem,
  rememberRecentValue,
  toggleFavoriteFood,
  updateMealItemServing,
} from "@/lib/food";
import type { Food, MealFoodItem, SavedFoodReference } from "@/types/food";

const RECENT_SEARCHES_KEY = "food-search-recent-queries";
const FAVORITE_FOODS_KEY = "food-search-favorite-foods";
const MEAL_ITEMS_KEY = "food-search-meal-items";

type FoodSearchExperienceProps = {
  initialQuery?: string;
  initialRecipeId?: string;
};

export function FoodSearchExperience({
  initialQuery = "",
  initialRecipeId,
}: FoodSearchExperienceProps) {
  const {
    query,
    servingSize,
    results,
    meta,
    page,
    hasNextPage,
    hasPreviousPage,
    isLoading,
    error,
    setQuery,
    setServingSize,
    nextPage,
    previousPage,
  } = useFoodSearch(initialQuery);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [recentQueries, setRecentQueries] = useLocalStorageState<string[]>(
    RECENT_SEARCHES_KEY,
    [],
  );
  const [favoriteFoods, setFavoriteFoods] = useLocalStorageState<SavedFoodReference[]>(
    FAVORITE_FOODS_KEY,
    [],
  );
  const [mealItems, setMealItems] = useLocalStorageState<MealFoodItem[]>(
    MEAL_ITEMS_KEY,
    [],
  );

  useEffect(() => {
    // Keep the detail panel anchored to a real result as pagination/search terms change.
    if (results.length === 0) {
      setSelectedFood(null);
      return;
    }

    setSelectedFood((current) => {
      if (!current) {
        return results[0];
      }

      const matchingFood = results.find((item) => item.id === current.id);
      return matchingFood ?? results[0];
    });
  }, [results]);

  useEffect(() => {
    const normalizedQuery = query.trim();
    if (!normalizedQuery || normalizedQuery.length < 2 || !meta || meta.items.length === 0) {
      return;
    }

    setRecentQueries((current) => {
      return rememberRecentValue(current, normalizedQuery);
    });
  }, [meta, query, setRecentQueries]);

  const favoriteIds = useMemo(
    () => favoriteFoods.map((item) => item.id),
    [favoriteFoods],
  );

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.28),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(134,239,172,0.18),_transparent_22%),linear-gradient(180deg,_#fff8eb_0%,_#f5efe4_40%,_#efe3d2_100%)] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <section className="relative overflow-hidden rounded-[2.6rem] border border-white/65 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(255,248,235,0.78))] px-6 py-8 shadow-[0_35px_120px_rgba(94,72,36,0.16)] backdrop-blur-xl sm:px-8 sm:py-10 lg:px-12">
          <div className="absolute -left-10 top-8 h-40 w-40 rounded-full bg-amber-300/30 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-52 w-52 rounded-full bg-emerald-300/20 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/70 bg-amber-50/90 px-4 py-2 text-sm font-semibold text-amber-900">
                <Sparkles className="h-4 w-4" />
                Nutrition Finder
              </div>
              <h1
                className="mt-5 max-w-3xl text-4xl font-semibold leading-tight text-stone-950 sm:text-5xl lg:text-6xl"
                style={{ fontFamily: "'Sora', var(--font-geist-sans)" }}
              >
                Search foods, inspect macros, and scale every result to the
                portion you actually eat.
              </h1>
              <p
                className="mt-4 max-w-2xl text-base leading-7 text-stone-600 sm:text-lg"
                style={{ fontFamily: "'Nunito', var(--font-geist-sans)" }}
              >
                This frontend talks to the unified food backend, keeps searches
                debounced, and calculates serving totals instantly on the client.
              </p>
            </div>

            <div className="rounded-[2rem] border border-stone-900/10 bg-stone-950 px-6 py-5 text-stone-50 shadow-[0_25px_65px_rgba(34,30,22,0.24)]">
              <div className="flex items-center gap-3">
                <Dumbbell className="h-8 w-8 text-amber-300" />
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-stone-400">
                    Built for tracking
                  </p>
                  <h2
                    className="text-xl font-semibold"
                    style={{ fontFamily: "'Sora', var(--font-geist-sans)" }}
                  >
                    Fast food lookup
                  </h2>
                </div>
              </div>
              <div className="mt-5 space-y-3 text-sm text-stone-300">
                <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                  <span>Search source order</span>
                  <span className="inline-flex items-center gap-2 font-semibold text-white">
                    Cache <ArrowRight className="h-4 w-4" /> USDA <ArrowRight className="h-4 w-4" /> OFF
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                  <span>Serving math</span>
                  <span className="font-semibold text-white">Per 100g to custom grams</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                  <span>Interaction model</span>
                  <span className="font-semibold text-white">Debounced + paginated</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
          <div className="space-y-6">
            <FoodSearchInput
              query={query}
              servingSize={servingSize}
              isLoading={isLoading}
              recentQueries={recentQueries}
              favoriteFoods={favoriteFoods}
              onQueryChange={setQuery}
              onServingSizeChange={setServingSize}
              onApplyRecentQuery={setQuery}
              onApplyFavoriteFood={(food) => setQuery(food.name)}
            />

            <FoodDetailsPanel
              food={selectedFood}
              defaultServingSize={servingSize}
              onAddToMeal={handleAddToMeal}
            />

            <FoodRecipePanel
              food={selectedFood}
              fallbackQuery={query}
              initialRecipeId={initialRecipeId}
            />

            <MealSummaryPanel
              items={mealItems}
              onUpdateServing={(itemId, nextServingSize) => {
                setMealItems((current) =>
                  current.map((item) =>
                    item.id === itemId
                      ? updateMealItemServing(item, nextServingSize)
                      : item,
                  ),
                );
              }}
              onRemoveItem={(itemId) => {
                setMealItems((current) => current.filter((item) => item.id !== itemId));
              }}
              onClear={() => setMealItems([])}
            />
          </div>

          <FoodResultList
            items={results}
            meta={meta}
            isLoading={isLoading}
            error={error}
            hasQuery={query.trim().length > 0}
            selectedFoodId={selectedFood?.id ?? null}
            favoriteIds={favoriteIds}
            page={page}
            hasNextPage={hasNextPage}
            hasPreviousPage={hasPreviousPage}
            onSelectFood={(food) => {
              setSelectedFood(food);
              setRecentQueries((current) => rememberRecentValue(current, food.name));
            }}
            onToggleFavorite={(food) => {
              setFavoriteFoods((current) => toggleFavoriteFood(current, food));
            }}
            onAddToMeal={handleAddToMeal}
            onNextPage={nextPage}
            onPreviousPage={previousPage}
          />
        </div>
      </div>
    </main>
  );

  function handleAddToMeal(food: Food) {
    setMealItems((current) => [
      createMealItem(food, food.servingSize),
      ...current,
    ].slice(0, 12));
  }
}
