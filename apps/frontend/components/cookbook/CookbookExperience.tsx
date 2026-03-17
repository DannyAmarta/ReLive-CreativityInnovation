"use client";

import { ChefHat, Database, FlameKindling, Salad } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRecipeSearch } from "@/hooks/useRecipeSearch";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";
import { RecipeDetailsPanel } from "./RecipeDetailsPanel";
import { RecipeResultList } from "./RecipeResultList";
import { RecipeSearchInput } from "./RecipeSearchInput";
import type { Recipe } from "@/types/recipe";

const RECENT_RECIPE_QUERIES_KEY = "recipe-search-recent-queries";

type CookbookExperienceProps = {
  initialQuery?: string;
  initialRecipeId?: string;
};

export function CookbookExperience({
  initialQuery = "",
  initialRecipeId,
}: CookbookExperienceProps) {
  const {
    query,
    results,
    meta,
    page,
    hasNextPage,
    hasPreviousPage,
    isLoading,
    error,
    setQuery,
    nextPage,
    previousPage,
  } = useRecipeSearch(initialQuery);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [recentQueries, setRecentQueries] = useLocalStorageState<string[]>(
    RECENT_RECIPE_QUERIES_KEY,
    [],
  );

  useEffect(() => {
    if (results.length === 0) {
      setSelectedRecipe(null);
      return;
    }

    setSelectedRecipe((current) => {
      if (initialRecipeId) {
        const initialMatch = results.find((item) => item.id === initialRecipeId);
        if (initialMatch) {
          return initialMatch;
        }
      }

      if (!current) {
        return results[0];
      }

      return results.find((item) => item.id === current.id) ?? results[0];
    });
  }, [initialRecipeId, results]);

  useEffect(() => {
    const normalizedQuery = query.trim();
    if (!normalizedQuery || normalizedQuery.length < 2 || !meta || meta.items.length === 0) {
      return;
    }

    setRecentQueries((current) => {
      const withoutDuplicate = current.filter((item) => item !== normalizedQuery);
      return [normalizedQuery, ...withoutDuplicate].slice(0, 6);
    });
  }, [meta, query, setRecentQueries]);

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(251,191,36,0.18),_transparent_22%),linear-gradient(180deg,_#fffaf2_0%,_#f5efe5_42%,_#efe7dc_100%)] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <section className="relative overflow-hidden rounded-[2.8rem] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.93),rgba(250,245,236,0.84))] px-6 py-8 shadow-[0_35px_120px_rgba(76,61,31,0.16)] backdrop-blur-xl sm:px-8 sm:py-10 lg:px-12">
          <div className="absolute -left-12 top-6 h-44 w-44 rounded-full bg-emerald-300/25 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-amber-300/20 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[1.12fr_0.88fr] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/70 bg-emerald-50/90 px-4 py-2 text-sm font-semibold text-emerald-900">
                <ChefHat className="h-4 w-4" />
                Cookbook Router
              </div>
              <h1
                className="mt-5 max-w-3xl text-4xl font-semibold leading-tight text-stone-950 sm:text-5xl lg:text-6xl"
                style={{ fontFamily: "'Sora', var(--font-geist-sans)" }}
              >
                Discover healthy meals, see the ingredients, and cook them at home.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-stone-600 sm:text-lg">
                This page turns the old in-world cookbook idea into a real route with recipe
                discovery, images, instructions, and a cache-first API flow built for a
                fitness-focused app.
              </p>
              <div className="mt-5">
                <Link
                  href={query.trim() ? `/foods?query=${encodeURIComponent(query.trim())}` : "/foods"}
                  className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white/80 px-4 py-2 text-sm font-semibold text-stone-800 transition hover:border-stone-400 hover:bg-white"
                >
                  Search this idea in foods
                </Link>
              </div>
            </div>

            <div className="rounded-[2rem] border border-stone-900/10 bg-stone-950 px-6 py-5 text-stone-50 shadow-[0_25px_65px_rgba(34,30,22,0.24)]">
              <div className="flex items-center gap-3">
                <Salad className="h-8 w-8 text-emerald-300" />
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-stone-400">
                    Recipe flow
                  </p>
                  <h2
                    className="text-xl font-semibold"
                    style={{ fontFamily: "'Sora', var(--font-geist-sans)" }}
                  >
                    Cache-aware discovery
                  </h2>
                </div>
              </div>
              <div className="mt-5 space-y-3 text-sm text-stone-300">
                <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                  <span>Search order</span>
                  <span className="inline-flex items-center gap-2 font-semibold text-white">
                    <Database className="h-4 w-4" /> DB → Spoonacular → TheMealDB
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                  <span>Goal</span>
                  <span className="font-semibold text-white">Healthy home cooking</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                  <span>What you see</span>
                  <span className="inline-flex items-center gap-2 font-semibold text-white">
                    <FlameKindling className="h-4 w-4" /> Images, ingredients, instructions
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
          <div className="space-y-6">
            <RecipeSearchInput
              query={query}
              isLoading={isLoading}
              recentQueries={recentQueries}
              onQueryChange={setQuery}
              onApplySuggestion={setQuery}
            />

            <RecipeDetailsPanel recipe={selectedRecipe} searchBaseTerm={query} />
          </div>

          <RecipeResultList
            items={results}
            meta={meta}
            isLoading={isLoading}
            error={error}
            hasQuery={query.trim().length > 0}
            selectedRecipeId={selectedRecipe?.id ?? null}
            page={page}
            hasNextPage={hasNextPage}
            hasPreviousPage={hasPreviousPage}
            onSelectRecipe={setSelectedRecipe}
            onNextPage={nextPage}
            onPreviousPage={previousPage}
          />
        </div>
      </div>
    </main>
  );
}
