"use client";

import { ChefHat, SearchX, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Recipe, RecipeSearchResponse } from "@/types/recipe";
import { MemoizedRecipeCard } from "../components/RecipeCard";
import { Button } from "@/components/ui/button";

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
    <section aria-labelledby="recipe-results-heading" className="w-full">
      {/* Status bar - Updated Colors */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3 px-1">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#2D4A22]/60"
            style={{ fontFamily: "'Sora', var(--font-geist-sans)" }}>
            Search results
          </p>
          <h2 id="recipe-results-heading" className="mt-1 text-3xl font-bold text-[#1a1c1a]"
            style={{ fontFamily: "'Sora', var(--font-geist-sans)" }}>
            Recipe matches
          </h2>
          <p className="mt-2 text-sm text-stone-500">
            {meta
              ? `${meta.totalReturned} curated archive specimens found`
              : "Explore the collection to begin."}
          </p>
        </div>
      </div>

      {/* Results Area */}
      <div aria-live="polite" aria-busy={isLoading}>
        {isLoading ? (
          /* ── GRID SKELETONS ── */
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <RecipeCardSkeleton key={i} />)}
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.div
              key={`page-${page}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3"
            >
              {items.map((recipe, index) => (
                <motion.div
                  key={recipe.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: index * 0.05, 
                    duration: 0.5, 
                    ease: [0.22, 1, 0.36, 1] 
                  }}
                >
                  <MemoizedRecipeCard
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

      {/* Pagination - matching FoodResults green botanical theme */}
      <AnimatePresence>
        {hasQuery && !isLoading && (items.length > 0 || hasPreviousPage) && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-[#cde2c0] bg-white/80 px-5 py-3.5 shadow-sm"
          >
            <span className="text-sm text-[#5A6E52]">
              Page <span className="font-bold text-[#2C4E1E]">{page}</span>
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onPreviousPage}
                disabled={!hasPreviousPage}
                aria-label="Previous page"
                className="rounded-full border-[#c5e0b4] bg-white text-[#3A6B2F] hover:bg-[#f1f9eb] hover:text-[#2C4E1E] disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" /> Prev
              </Button>
              <Button
                onClick={onNextPage}
                disabled={!hasNextPage}
                aria-label="Next page"
                className="rounded-full bg-gradient-to-r from-[#7CB342] to-[#558B2F] text-white shadow-md hover:from-[#8BC34A] hover:to-[#689F38] disabled:opacity-30"
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

// EmptyState and RecipeCardSkeleton remain unchanged
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
    <div className="animate-pulse rounded-3xl border border-stone-100 bg-white shadow-sm">
      <div className="aspect-[4/3] rounded-t-3xl bg-stone-100" />
      <div className="p-6 space-y-4">
        <div className="h-5 w-3/4 rounded-full bg-stone-100" />
        <div className="h-3 w-full rounded-full bg-stone-50" />
        <div className="flex gap-4 pt-4 border-t border-stone-50">
          <div className="h-4 w-12 rounded bg-stone-100" />
          <div className="h-4 w-12 rounded bg-stone-100" />
        </div>
      </div>
    </div>
  );
}