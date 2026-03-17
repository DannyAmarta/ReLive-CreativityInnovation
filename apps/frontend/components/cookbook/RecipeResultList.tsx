"use client";

import { ChefHat, SearchX } from "lucide-react";
import type { Recipe, RecipeSearchResponse } from "@/types/recipe";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecipeCard } from "./RecipeCard";

type RecipeResultListProps = {
  items: Recipe[];
  meta: RecipeSearchResponse | null;
  isLoading: boolean;
  error: string | null;
  hasQuery: boolean;
  selectedRecipeId: string | null;
  page: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onSelectRecipe: (recipe: Recipe) => void;
  onNextPage: () => void;
  onPreviousPage: () => void;
};

export function RecipeResultList({
  items,
  meta,
  isLoading,
  error,
  hasQuery,
  selectedRecipeId,
  page,
  hasNextPage,
  hasPreviousPage,
  onSelectRecipe,
  onNextPage,
  onPreviousPage,
}: RecipeResultListProps) {
  return (
    <Card className="border-white/70 bg-white/80">
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-4">
        <div>
          <CardTitle style={{ fontFamily: "'Sora', var(--font-geist-sans)" }}>
            Healthy recipe results
          </CardTitle>
          <p className="mt-2 text-sm text-stone-600">
            {meta
              ? `${meta.totalReturned} recipes • source: ${meta.sourceUsed} ${
                  meta.fallbackUsed ? "• fallback used" : ""
                }`
              : "Search to explore meals with ingredients and instructions."}
          </p>
        </div>
        <div className="rounded-full border border-stone-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-stone-600">
          Page {page}
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {isLoading && (
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }, (_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-[1.6rem] border border-stone-200 bg-stone-100/70"
              >
                <div className="aspect-[16/10] animate-pulse bg-stone-200" />
                <div className="space-y-3 p-5">
                  <div className="h-4 w-3/4 animate-pulse rounded-full bg-stone-200" />
                  <div className="h-3 w-full animate-pulse rounded-full bg-stone-200" />
                  <div className="h-3 w-2/3 animate-pulse rounded-full bg-stone-200" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && error && (
          <div className="rounded-[1.6rem] border border-rose-200 bg-rose-50 px-5 py-6 text-sm text-rose-700">
            {error}
          </div>
        )}

        {!isLoading && !error && !hasQuery && (
          <div className="flex flex-col items-center justify-center rounded-[1.8rem] border border-dashed border-stone-200 bg-stone-50/80 px-6 py-14 text-center">
            <ChefHat className="h-10 w-10 text-stone-400" />
            <h3 className="mt-4 text-lg font-semibold text-stone-900">
              Start with a meal idea
            </h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-stone-600">
              Search for recipes like high-protein breakfasts, chicken dinners, or healthy
              comfort meals to see ingredients, visuals, and cooking steps.
            </p>
          </div>
        )}

        {!isLoading && !error && hasQuery && items.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-[1.8rem] border border-dashed border-stone-200 bg-stone-50/80 px-6 py-14 text-center">
            <SearchX className="h-10 w-10 text-stone-400" />
            <h3 className="mt-4 text-lg font-semibold text-stone-900">
              No recipes found
            </h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-stone-600">
              Try a broader search like “healthy chicken”, “salmon bowl”, or “overnight oats”.
            </p>
          </div>
        )}

        {!isLoading && !error && items.length > 0 && (
          <>
            <div className="grid gap-4 lg:grid-cols-2">
              {items.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  isSelected={recipe.id === selectedRecipeId}
                  onSelect={onSelectRecipe}
                />
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.4rem] border border-stone-200 bg-stone-50/80 px-4 py-3">
              <p className="text-sm text-stone-600">
                Cached results and hard limits help control recipe API usage.
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onPreviousPage}
                  disabled={!hasPreviousPage}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  onClick={onNextPage}
                  disabled={!hasNextPage}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
