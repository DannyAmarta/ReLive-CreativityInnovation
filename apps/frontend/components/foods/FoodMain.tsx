"use client";

import {
  useActionState, useCallback, useEffect, useMemo, useRef, useState, startTransition
} from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { CherryIcon, Sparkles, X } from "lucide-react";
import { useFoodSearch } from "@/hooks/features/foods/useFoodSearch";
import { FoodDetails } from "./sections/FoodDetails";
import { FoodSummary } from "./sections/FoodSummary";
import { FoodRecipePanel } from "./sections/FoodRecipePanel";
import { FoodResults } from "./sections/FoodResults";
import { FoodSearch } from "./components/FoodSearch";
import { useLocalStorageState } from "@/hooks/ui/useLocalStorageState";
import {
  createMealItem,
  rememberRecentValue,
  toggleFavoriteFood,
  updateMealItemServing,
  withServingSize,
} from "@/lib/food";
import { SearchFoods } from "@/lib/foodSearch";
import type { Food, MealFoodItem, SavedFoodReference } from "@/types/food";

// Lazy-load: tsParticles/slim + sakura assets are heavy. Deferring them
// lets the hero + search bar render immediately on first paint.
const FallingSakura = dynamic(
  () => import("@/components/foods/components/FallingSakura").then((m) => ({ default: m.FallingSakura })),
  { ssr: false, loading: () => null }
);

const RECENT_SEARCHES_KEY = "food-search-recent-queries";
const FAVORITE_FOODS_KEY = "food-search-favorite-foods";
const MEAL_ITEMS_KEY = "food-search-meal-items";
const DEFAULT_SERVING_SIZE = 100;
const DEFAULT_PAGE_SIZE = 8;
const SEARCH_DEBOUNCE_MS = 350;

type FoodMainProps = {
  initialQuery?: string;
  initialRecipeId?: string;
};

export function FoodMain({
  initialQuery = "",
  initialRecipeId,
}: FoodMainProps) {
 const {
    query, setQuery, servingSize, setServingSize,
    selectedFood, setSelectedFood, setRecentQueries, drawerOpen, setDrawerOpen, mealOpen, setMealOpen,
    recentQueries, favoriteFoods, setFavoriteFoods, mealItems, setMealItems,
    results, meta, page, hasQuery, isLoading, error, hasNextPage, hasPreviousPage, favoriteIds,
    handleAddToMeal, submitSearch, manualSubmitRef
  } = useFoodSearch(initialQuery);

  // Small local handlers
  const handleApplyQuery = (value: string) => {
    manualSubmitRef.current = true;
    setQuery(value);
    submitSearch(value, 1);
  };

  return (
    <>
      {/* <FallingSakura /> */}
      {/* ── AMBIENT MESH BACKGROUND ── */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#FFFAFB]">
        {/* Top Left Soft Glow */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.7, 0.5],
            x: [0, 40, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -left-[15%] -top-[15%] h-[60vh] w-[60vw] rounded-full bg-gradient-to-br from-[#FFB7C5] to-[#FF9EBB] opacity-40 blur-[130px]"
        />
        
        {/* Bottom Right Deep Magenta Glow */}
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
            y: [0, -60, 0],
            x: [0, -30, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          className="absolute -bottom-[25%] -right-[15%] h-[70vh] w-[70vw] rounded-full bg-gradient-to-tl from-[#FFE4EE] via-[#FFB7C5] to-[#C94F7E] opacity-30 blur-[150px]"
        />

        {/* Center Accent Glow (Follows the search bar area roughly) */}
        <motion.div
          animate={{
            opacity: [0.15, 0.3, 0.15],
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute left-[20%] top-[30%] h-[40vh] w-[60vw] rounded-full bg-gradient-to-r from-[#FF9EBB] to-[#FFB7C5] opacity-20 blur-[110px]"
        />

        {/* Subtle dot matrix pattern (Optional, gives it that tech/macro tracker feel) */}
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{ 
            backgroundImage: "radial-gradient(#1a0a12 1px, transparent 1px)", 
            backgroundSize: "24px 24px" 
          }} 
        />
      </div>
      {/* ── HERO (collapses once user types) ── */}
      <AnimatePresence>
        {!hasQuery && (
          <motion.header
            key="hero"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40, height: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex min-h-[62vh] flex-col items-center justify-center overflow-hidden px-6 text-center"
          >
            {/* Radial glow blobs (Optimized without blur) */}
            <div className="pointer-events-none absolute -top-20 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,183,197,0.3)_0%,transparent_70%)]" />
            <div className="pointer-events-none absolute top-1/3 -left-20 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(249,168,192,0.25)_0%,transparent_70%)]" />
            <div className="pointer-events-none absolute top-1/3 -right-20 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(201,79,126,0.2)_0%,transparent_70%)]" />

            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6, type: "spring", stiffness: 200, damping: 20 }}
              className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-white/80 bg-white/40 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-[#9B2C5A] backdrop-blur-2xl shadow-[0_8px_32px_rgba(200,80,130,0.15),inset_0_1px_1px_rgba(255,255,255,0.8)]"
            >
              <Sparkles className="h-4 w-4 text-[#C94F7E]" />
              Powered by USDA & Open Food Facts
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.18, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-4xl text-5xl font-extrabold leading-[1.1] tracking-tight text-[#1a0a12] sm:text-6xl lg:text-7xl xl:text-[5.5rem]"
              style={{ fontFamily: "'Sora', var(--font-geist-sans)" }}
            >
              Every meal,{" "}
              <span
                className="bg-gradient-to-br from-[#C94F7E] via-[#FF9EBB] to-[#9B2C5A] bg-clip-text text-transparent drop-shadow-[0_4px_24px_rgba(200,80,130,0.2)]"
              >
                perfectly scaled.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 max-w-2xl text-lg leading-relaxed text-[#6b3550]/80 sm:text-xl font-medium"
              style={{ fontFamily: "'Nunito', var(--font-geist-sans)" }}
            >
              Search any food and get exact macros for your portion size — instantly, without a page reload.
            </motion.p>

            {/* Big arrow pointing down to search */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: [0, 8, 0] }}
              transition={{ delay: 0.8, duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="mt-12 text-[#C94F7E]/50"
            >
              <svg width="24" height="36" viewBox="0 0 24 36" fill="none">
                <path d="M12 0v28M2 20l10 12 10-12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* ── FLOATING SEARCH (always visible) ── */}
      <div className={`relative z-30 ${hasQuery ? "pt-4" : "pt-0"}`}>
        <motion.div
          layout
          className="mx-auto max-w-3xl px-4 sm:px-6"
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <FoodSearch
            query={query}
            servingSize={servingSize}
            isLoading={isLoading}
            recentQueries={recentQueries}
            favoriteFoods={favoriteFoods}
            onQueryChange={setQuery}
            onServingSizeChange={(value) => setServingSize(Math.max(1, Math.trunc(value || DEFAULT_SERVING_SIZE)))}
            onApplyRecentQuery={handleApplyQuery}
            onApplyFavoriteFood={(food) => handleApplyQuery(food.name)}
          />
        </motion.div>
      </div>

      {/* ── BENTO RESULTS CANVAS ── */}
      <main className="relative z-10 mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <AnimatePresence>
          {hasQuery && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <FoodResults
                items={results}
                meta={meta}
                isLoading={isLoading}
                error={error}
                hasQuery={hasQuery}
                selectedFoodId={selectedFood?.id ?? null}
                favoriteIds={favoriteIds}
                page={page}
                hasNextPage={hasNextPage}
                hasPreviousPage={hasPreviousPage}
                onSelectFood={(food) => {
                  setSelectedFood(food);
                  setRecentQueries((cur) => rememberRecentValue(cur, food.name));
                }}
                onToggleFavorite={(food) => setFavoriteFoods((cur) => toggleFavoriteFood(cur, food))}
                onAddToMeal={handleAddToMeal}
                onNextPage={() => { if (hasNextPage) submitSearch(query, page + 1); }}
                onPreviousPage={() => { if (hasPreviousPage) submitSearch(query, page - 1); }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recipe section — below results */}
        <AnimatePresence>
          {hasQuery && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.45 }}
              className="mt-6"
            >
              <FoodRecipePanel
                food={selectedFood}
                fallbackQuery={query}
                initialRecipeId={initialRecipeId}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── MEAL TRAY (floating bottom bar) ── */}
      <AnimatePresence>
        {mealItems.length > 0 && (
          <motion.div
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="fixed bottom-6 left-1/2 z-40 w-full max-w-2xl -translate-x-1/2 px-4"
          >
            <button
              type="button"
              onClick={() => setMealOpen(true)}
              className="w-full overflow-hidden rounded-[2rem] border border-white/50 bg-[#2d1520]/92 px-6 py-4 text-left shadow-[0_24px_80px_rgba(100,10,50,0.55)] backdrop-blur-2xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CherryIcon className="h-5 w-5 text-[#FFB7C5]" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[#FFB7C5]/70">Meal tray</p>
                    <p className="text-base font-semibold text-white">{mealItems.length} item{mealItems.length !== 1 ? "s" : ""} added</p>
                  </div>
                </div>
                <span className="rounded-full bg-[#C94F7E] px-4 py-1.5 text-sm font-bold text-white shadow-[0_4px_16px_rgba(200,80,130,0.5)]">
                  View meal →
                </span>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FOOD DETAIL DRAWER ── */}
      <AnimatePresence>
        {drawerOpen && selectedFood && (
          <>
            {/* Backdrop */}
            <motion.div
              key="drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-40 bg-[#1a0a12]/40 backdrop-blur-sm"
              onClick={() => setDrawerOpen(false)}
            />
            {/* Drawer panel */}
            <motion.aside
              key="detail-drawer"
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 32 }}
              className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[520px] flex-col overflow-y-auto border-l border-[#FFB7C5]/20 bg-[#fff5f8]/92 shadow-[-40px_0_120px_rgba(180,50,100,0.18)] backdrop-blur-3xl"
            >
              <div className="flex items-center justify-between border-b border-[#FFB7C5]/20 px-6 py-4">
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#9B2C5A]">
                  <Sparkles className="h-4 w-4" /> Food details
                </span>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="rounded-full border border-[#FFB7C5]/40 bg-white/60 p-1.5 text-[#9B2C5A] hover:bg-[#FFB7C5]/20 transition"
                  aria-label="Close food details"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 p-4">
                <FoodDetails
                  food={selectedFood}
                  defaultServingSize={servingSize}
                  onAddToMeal={(food) => { handleAddToMeal(food); }}
                />
              </div>
            </motion.aside>
          </>
        )}
        
      </AnimatePresence>

      {/* ── MEAL SUMMARY MODAL ── */}
      <AnimatePresence>
        {mealOpen && (
          <>
            <motion.div
              key="meal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-[#1a0a12]/60 backdrop-blur-md"
              onClick={() => setMealOpen(false)}
            />
            <motion.div
              key="meal-modal"
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 35 }}
              className="fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-[2.5rem] border-t border-[#FFB7C5]/30 bg-[#fff5f8]/95 shadow-[0_-40px_100px_rgba(180,50,100,0.3)] backdrop-blur-3xl"
            >
              <div className="sticky top-0 flex items-center justify-between border-b border-[#FFB7C5]/20 bg-[#fff5f8]/80 px-6 py-4 backdrop-blur-xl">
                <span className="text-lg font-bold text-[#2d1520]" style={{ fontFamily: "'Sora', var(--font-geist-sans)" }}>
                  🍱 Meal Summary
                </span>
                <button
                  onClick={() => setMealOpen(false)}
                  className="rounded-full border border-[#FFB7C5]/40 bg-white/60 p-1.5 text-[#9B2C5A] hover:bg-[#FFB7C5]/20 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="p-4 pb-10">
                <FoodSummary
                  items={mealItems}
                  onUpdateServing={(id, s) => setMealItems((cur) => cur.map((i) => i.id === id ? updateMealItemServing(i, s) : i))}
                  onRemoveItem={(id) => setMealItems((cur) => cur.filter((i) => i.id !== id))}
                  onClear={() => { setMealItems([]); setMealOpen(false); }}
                />
              </div>
            </motion.div>
          </>
        )}
        
      </AnimatePresence>

      {/* Spacer to prevent pagination from being eaten by the fixed Meal Tray */}
        <AnimatePresence>
          {mealItems.length > 0 && (
            <motion.div 
              initial={{ height: 0 }} 
              animate={{ height: "100px" }} // Roughly the height of the meal tray + padding
              exit={{ height: 0 }} 
              aria-hidden="true" 
            />
          )}
        </AnimatePresence>
    </>
  );
}
