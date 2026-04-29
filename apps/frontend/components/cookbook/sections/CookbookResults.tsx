"use client";

import { ChefHat, SearchX, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Recipe, RecipeSearchResponse } from "@/types/recipe";
import { RecipeCard } from "../components/RecipeCard";
import { Button } from "@/components/ui/Button";

type CookbookResultsProps = {
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

export function CookbookResults({
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
}: CookbookResultsProps) {
  return (
    <section aria-labelledby="recipe-results-heading">
      {/* Status bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#9B2C5A]/50"
            style={{ fontFamily: "'Sora', var(--font-geist-sans)" }}>
            Search results
          </p>
          <h2 id="recipe-results-heading" className="mt-1 text-2xl font-bold text-[#1a0a12]"
            style={{ fontFamily: "'Sora', var(--font-geist-sans)" }}>
            Recipe matches
          </h2>
          <p className="mt-2 text-sm text-[#6b3550]/70">
            {meta
              ? `${meta.totalReturned} recipe${meta.totalReturned === 1 ? "" : "s"}`
              : "Search for a recipe to begin."}
          </p>
        </div>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            role="alert"
            className="mb-4 rounded-[1.5rem] border border-rose-200/60 bg-rose-50/70 p-4 text-sm text-rose-700 backdrop-blur-sm"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty states */}
      {!hasQuery && !error && (
        <EmptyState
          title="Start with a meal idea"
          description="Search recipes like high-protein breakfasts, chicken dinners, or healthy comfort meals."
          icon={<ChefHat className="h-10 w-10 text-[#C94F7E]" />}
        />
      )}
      {hasQuery && !isLoading && items.length === 0 && !error && (
        <EmptyState
          title="No recipes found"
          description='Try a broader search like "healthy chicken", "salmon bowl", or "overnight oats".'
          icon={<SearchX className="h-10 w-10 text-[#C94F7E]" />}
        />
      )}

      {/* Results */}
      <div aria-live="polite" aria-busy={isLoading}>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => <RecipeCardSkeleton key={i} />)}
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.div
              key={`page-${page}-q-${items.map((i) => i.id).join("-").slice(0, 40)}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {items.map((recipe, index) => (
                <motion.div
                  key={recipe.id}
                  initial={{ opacity: 0, y: 20, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: index * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <RecipeCard
                    recipe={recipe}
                    isSelected={recipe.id === selectedRecipeId}
                    onSelect={onSelectRecipe}
                  />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Pagination */}
      <AnimatePresence>
        {hasQuery && !isLoading && (items.length > 0 || hasPreviousPage) && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-[#FFB7C5]/25 bg-white/40 px-5 py-3.5 backdrop-blur-xl"
          >
            <span className="text-sm text-[#6b3550]">
              Page <span className="font-bold text-[#2d1520]">{page}</span>
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onPreviousPage}
                disabled={!hasPreviousPage}
                aria-label="Previous page"
                className="rounded-full border-[#FFB7C5]/50 bg-white/70 text-[#9B2C5A] hover:bg-[#FFF0F5] disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" /> Prev
              </Button>
              <Button
                onClick={onNextPage}
                disabled={!hasNextPage}
                aria-label="Next page"
                className="rounded-full bg-gradient-to-r from-[#C94F7E] to-[#9B2C5A] text-white shadow-[0_6px_20px_rgba(180,50,100,0.4)] hover:opacity-90 disabled:opacity-30"
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function EmptyState({ title, description, icon }: { title: string; description: string; icon?: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-[2rem] border border-dashed border-[#FFB7C5]/40 bg-white/35 px-6 py-14 text-center backdrop-blur-sm"
    >
      {icon && (
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-[#FFB7C5]/40 bg-[#FFF0F5]/80 shadow-[0_0_30px_rgba(200,80,130,0.15)]">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-semibold text-[#2d1520]" style={{ fontFamily: "'Sora', var(--font-geist-sans)" }}>
        {title}
      </h3>
      <p className="mt-2 text-sm text-[#6b3550]/70" style={{ fontFamily: "'Nunito', var(--font-geist-sans)" }}>
        {description}
      </p>
    </motion.div>
  );
}

function RecipeCardSkeleton() {
  return (
    <div className="animate-pulse rounded-[1.8rem] border border-[#FFB7C5]/25 bg-white/50">
      <div className="aspect-[16/9] rounded-t-[1.8rem] bg-[#FFB7C5]/20" />
      <div className="p-5 space-y-3">
        <div className="h-5 w-3/4 rounded-full bg-[#FFB7C5]/30" />
        <div className="h-4 w-1/2 rounded-full bg-[#FFB7C5]/20" />
        <div className="grid grid-cols-3 gap-2 mt-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-[#FFB7C5]/20" />
          ))}
        </div>
      </div>
    </div>
  );
}
