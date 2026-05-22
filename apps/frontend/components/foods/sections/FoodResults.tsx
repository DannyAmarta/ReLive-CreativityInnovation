"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FoodCard } from "../components/FoodCard";
import type { Food, FoodSearchResponse } from "@/types/food";
import { Button } from "@/components/ui/button";

type FoodResultsProps = {
  items: Food[];
  meta: FoodSearchResponse | null;
  isLoading: boolean;
  error: string | null;
  hasQuery: boolean;
  selectedFoodId: string | null;
  favoriteIds: string[];
  page: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onSelectFood: (food: Food) => void;
  onToggleFavorite: (food: Food) => void;
  onAddToMeal: (food: Food) => void;
  onNextPage: () => void;
  onPreviousPage: () => void;
};

export function FoodResults({
  items,
  meta,
  isLoading,
  error,
  hasQuery,
  selectedFoodId,
  favoriteIds,
  page,
  hasNextPage,
  hasPreviousPage,
  onSelectFood,
  onToggleFavorite,
  onAddToMeal,
  onNextPage,
  onPreviousPage,
}: FoodResultsProps) {
  return (
    <section aria-labelledby="food-results-heading">

      {/* Status bar - updated to green tones */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#7B8F6E]"
            style={{ fontFamily: "'Sora', var(--font-geist-sans)" }}>
            Search results
          </p>
          <h2 id="food-results-heading" className="mt-1 text-2xl font-bold text-[#1C2E14]"
            style={{ fontFamily: "'Sora', var(--font-geist-sans)" }}>
            Nutrition matches
          </h2>
          <p className="mt-2 text-sm text-[#5A6E52]">
            {meta
              ? `${meta.totalReturned} food result${meta.totalReturned === 1 ? "" : "s"}`
              : "Search for a food to begin."}
          </p>
        </div>
      </div>

      {/* Error - green themed */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            role="alert"
            className="mb-4 rounded-[1.5rem] border border-[#c5e0b4]/60 bg-[#f1f9eb]/80 p-4 text-sm text-[#3A6B2F] backdrop-blur-sm"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty states - updated green border/background */}
      {!hasQuery && !error && <EmptyState title="Start with a food name" description="Try chicken breast, rice, eggs, oats, or banana." />}
      {hasQuery && !isLoading && items.length === 0 && !error && <EmptyState title="No matches found" description="Try a broader term or different spelling." />}

      {/* Bento results grid */}
      <div aria-live="polite" aria-busy={isLoading}>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => <FoodCardSkeleton key={i} />)}
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
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    delay: index * 0.06,
                    duration: 0.4,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <FoodCard
                    key={item.id}
                    food={item}
                    isSelected={selectedFoodId === item.id}
                    isFavorite={favoriteIds.includes(item.id)}
                    onSelect={onSelectFood}
                    onToggleFavorite={onToggleFavorite}
                    onAddToMeal={onAddToMeal}
                  />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Pagination - updated green theme */}
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

// EmptyState with green border and background
function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-[2rem] border border-dashed border-[#bcdd9c] bg-white/60 px-6 py-14 text-center shadow-sm"
    >
      <h3 className="text-xl font-semibold text-[#1C2E14]" style={{ fontFamily: "'Sora', var(--font-geist-sans)" }}>
        {title}
      </h3>
      <p className="mt-2 text-sm text-[#5A6E52]" style={{ fontFamily: "'Nunito', var(--font-geist-sans)" }}>
        {description}
      </p>
    </motion.div>
  );
}

// Skeleton with green placeholders
function FoodCardSkeleton() {
  return (
    <div className="animate-pulse rounded-[1.6rem] border border-[#cde2c0] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2 flex-1">
          <div className="h-5 w-3/4 rounded-full bg-[#e8f0e1]" />
          <div className="h-4 w-1/2 rounded-full bg-[#eef5e8]" />
        </div>
        <div className="h-16 w-20 rounded-[1rem] bg-[#dcf0ce]" />
      </div>
      <div className="mt-4 grid grid-cols-4 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 rounded-[1rem] bg-[#eef5e8]" />
        ))}
      </div>
    </div>
  );
}