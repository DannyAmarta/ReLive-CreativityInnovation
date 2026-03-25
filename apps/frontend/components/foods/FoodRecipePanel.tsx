"use client";

import Link from "next/link";
import { ChefHat, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { searchRecipes } from "@/services/recipe.service";
import type { Food } from "@/types/food";
import type { Recipe } from "@/types/recipe";
import { Card, CardContent } from "@/components/ui/card";
import { RecipeDetailsPanel } from "@/components/cookbook/RecipeDetailsPanel";

type FoodRecipePanelProps = {
  food: Food | null;
  fallbackQuery: string;
  initialRecipeId?: string;
};

type RecipePanelState = {
  items: Recipe[];
  isLoading: boolean;
  error: string | null;
};

const initialState: RecipePanelState = {
  items: [],
  isLoading: false,
  error: null,
};

const FOOD_RECIPE_RESULT_LIMIT = 10;

export function FoodRecipePanel({
  food,
  fallbackQuery,
  initialRecipeId,
}: FoodRecipePanelProps) {
  const searchTerm = useMemo(
    () => resolveRecipeSearchTerm(fallbackQuery, food?.name),
    [fallbackQuery, food?.name],
  );
  const [state, setState] = useState<RecipePanelState>(initialState);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);

  useEffect(() => {
    if (!searchTerm) {
      setState(initialState);
      setSelectedRecipeId(null);
      return;
    }

    const controller = new AbortController();

    setState((current) => ({
      ...current,
      isLoading: true,
      error: null,
    }));

    searchRecipes({
      query: searchTerm,
      // Match the cookbook page result window so both routes can land on the same recipe.
      limit: FOOD_RECIPE_RESULT_LIMIT,
      page: 1,
      signal: controller.signal,
    })
      .then((response) => {
        setState({
          items: response.items,
          isLoading: false,
          error: null,
        });
        setSelectedRecipeId((current) =>
          pickRecipeSelection(response.items, current, initialRecipeId),
        );
      })
      .catch((error) => {
        if (controller.signal.aborted) {
          return;
        }

        setState({
          items: [],
          isLoading: false,
          error:
            error instanceof Error ? error.message : "Unable to load recipe suggestions.",
        });
        setSelectedRecipeId(null);
      });

    return () => controller.abort();
  }, [initialRecipeId, searchTerm]);

  const selectedRecipe =
    state.items.find((item) => item.id === selectedRecipeId) ?? state.items[0] ?? null;

  return (
    <Card className="shadow-[0_30px_100px_rgba(94,72,36,0.1)]">
      <CardContent className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800">
              <ChefHat className="h-3.5 w-3.5" />
              Related recipes
            </div>
            <h2
              className="mt-3 text-3xl font-semibold text-stone-950"
              style={{ fontFamily: "'Sora', var(--font-geist-sans)" }}
            >
              How to make it
            </h2>
          </div>

          <Link
            href={
              searchTerm
                ? `/cookbook?query=${encodeURIComponent(searchTerm)}${selectedRecipe ? `&recipe=${encodeURIComponent(selectedRecipe.id)}` : ""
                }`
                : "/cookbook"
            }
            className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white/80 px-4 py-2 text-sm font-semibold text-stone-800 transition hover:border-stone-400 hover:bg-white"
          >
            <Sparkles className="h-4 w-4" />
            Open cookbook
          </Link>
        </div>

        {!searchTerm ? (
          <div className="mt-6 rounded-[1.6rem] border border-dashed border-stone-300 bg-stone-50/70 px-5 py-10 text-center">
            <h3 className="text-xl font-semibold text-stone-900">Search a food first</h3>
            <p className="mt-2 text-sm text-stone-600">
              Once you search or select a food, recipe suggestions will appear here.
            </p>
          </div>
        ) : null}

        {state.isLoading ? (
          <div className="mt-6 space-y-4">
            {Array.from({ length: 3 }, (_, index) => (
              <div
                key={index}
                className="h-28 animate-pulse rounded-[1.4rem] border border-stone-200 bg-stone-100/80"
              />
            ))}
            <div className="h-[32rem] animate-pulse rounded-[1.8rem] border border-stone-200 bg-stone-100/80" />
          </div>
        ) : null}

        {!state.isLoading && state.error ? (
          <div className="mt-6 rounded-[1.6rem] border border-rose-200 bg-rose-50 px-5 py-6 text-sm text-rose-700">
            {state.error}
          </div>
        ) : null}

        {!state.isLoading && !state.error && searchTerm && state.items.length === 0 ? (
          <div className="mt-6 rounded-[1.6rem] border border-dashed border-stone-300 bg-stone-50/70 px-5 py-10 text-center">
            <h3 className="text-xl font-semibold text-stone-900">No recipes matched yet</h3>
            <p className="mt-2 text-sm text-stone-600">
              Try opening the cookbook page for a broader recipe search around “{searchTerm}”.
            </p>
          </div>
        ) : null}

        {!state.isLoading && !state.error && state.items.length > 0 && selectedRecipe ? (
          <div className="mt-6 space-y-4">
            <div className="max-h-[32rem] space-y-3 overflow-y-auto pr-1">
              {state.items.map((recipe) => (
                <button
                  key={recipe.id}
                  type="button"
                  onClick={() => setSelectedRecipeId(recipe.id)}
                  className={`w-full rounded-[1.5rem] border p-3 text-left transition ${recipe.id === selectedRecipe.id
                      ? "border-emerald-400 bg-emerald-50/80 shadow-[0_16px_45px_rgba(52,131,103,0.12)]"
                      : "border-stone-200 bg-white/75 hover:border-stone-300"
                    }`}
                >
                  <div className="flex gap-3">
                    <div className="h-20 w-24 overflow-hidden rounded-[1rem] bg-stone-200">
                      <img
                        src={recipe.image}
                        alt={recipe.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                        {recipe.source === "SPOONACULAR" ? "Spoonacular" : "TheMealDB"}
                      </p>
                      <h3
                        className="mt-1 line-clamp-2 text-base font-semibold text-stone-950"
                        style={{ fontFamily: "'Sora', var(--font-geist-sans)" }}
                      >
                        {recipe.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm text-stone-600">
                        {recipe.ingredients.slice(0, 2).join(", ") || "Ingredients unavailable"}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <RecipeDetailsPanel recipe={selectedRecipe} searchBaseTerm={searchTerm} />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function resolveRecipeSearchTerm(fallbackQuery: string, foodName?: string | null) {
  const normalizedQuery = fallbackQuery.trim();
  if (normalizedQuery) {
    return normalizedQuery;
  }

  return foodName?.trim() ?? "";
}

function pickRecipeSelection(
  items: Recipe[],
  currentRecipeId: string | null,
  preferredRecipeId?: string,
) {
  if (preferredRecipeId) {
    const exactMatch = items.find((item) => item.id === preferredRecipeId);
    if (exactMatch) {
      return exactMatch.id;
    }
  }

  if (currentRecipeId) {
    const currentMatch = items.find((item) => item.id === currentRecipeId);
    if (currentMatch) {
      return currentMatch.id;
    }
  }

  return items[0]?.id ?? null;
}
