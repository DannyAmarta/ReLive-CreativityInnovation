"use client";

import {
  useActionState, useCallback, useEffect, useMemo, useRef, useState, startTransition
} from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { CherryIcon, Sparkles, X, Leaf } from "lucide-react";
import { useFoodSearch } from "@/hooks/features/foods/useFoodSearch";
import { FoodDetails } from "./sections/FoodDetails";
import { FoodSummary } from "./sections/FoodSummary";
import { FoodRecipePanel } from "./sections/FoodRecipePanel";
import { FoodResults } from "./sections/FoodResults";
import { FoodSearch } from "./components/FoodSearch";
import { useLocalStorageState } from "@/hooks/ui/useLocalStorageState";
import { HealthGuidebookHeader } from "@/components/client/HealthGuidebookHeader";
import {
  createMealItem,
  rememberRecentValue,
  toggleFavoriteFood,
  updateMealItemServing,
  withServingSize,
} from "@/lib/food";
import type { Food, MealFoodItem, SavedFoodReference } from "@/types/food";



const RECENT_SEARCHES_KEY = "food-search-recent-queries";
const FAVORITE_FOODS_KEY = "food-search-favorite-foods";
const MEAL_ITEMS_KEY = "food-search-meal-items";
const DEFAULT_SERVING_SIZE = 100;
const DEFAULT_PAGE_SIZE = 8;
const SEARCH_DEBOUNCE_MS = 350;

type FoodMainProps = {
  initialQuery?: string;
  initialRecipeId?: string;
  userRole?: string;
};

export function FoodMain({
  initialQuery = "",
  initialRecipeId,
  userRole,
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
      <HealthGuidebookHeader activeTab="foods" userRole={userRole} />

      {/* ── AMBIENT MESH BACKGROUND ── */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#F7F9F7]">
        {/* Top Left Soft Glow - Saturated Sage/Mint */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.55, 0.75, 0.55], x: [0, 40, 0], y: [0, -20, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -left-[15%] -top-[15%] h-[60vh] w-[60vw] rounded-full bg-gradient-to-br from-[#A9C893] to-[#B3D69C] opacity-55 blur-[130px]"
        />
        
        {/* Bottom Right Deep Magenta Glow - Saturated Pink/Rose to Forest */}
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.45, 0.65, 0.45], y: [0, -60, 0], x: [0, -30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          className="absolute -bottom-[25%] -right-[15%] h-[70vh] w-[70vw] rounded-full bg-gradient-to-tl from-[#FFAEC9] via-[#B8DBA3] to-[#365A28] opacity-45 blur-[150px]"
        />

        {/* Center Accent Glow - Saturated Spring Green */}
        <motion.div
          animate={{
            opacity: [0.3, 0.45, 0.3],
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute left-[20%] top-[30%] h-[40vh] w-[60vw] rounded-full bg-gradient-to-r from-[#C3E4AD] to-[#B2DB9A] opacity-35 blur-[110px]"
        />

        {/* Subtle dot matrix pattern */}
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
            <div className="pointer-events-none absolute -top-20 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(209,226,196,0.3)_0%,transparent_70%)]" />
            <div className="pointer-events-none absolute top-1/3 -left-20 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(107,142,35,0.2)_0%,transparent_70%)]" />
            <div className="pointer-events-none absolute top-1/3 -right-20 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(61,90,53,0.15)_0%,transparent_70%)]" />
            <motion.div 
              className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-[#D1E2C4]/50 bg-white/40 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.15em] text-[#3D5A35] backdrop-blur-2xl shadow-[0_8px_32px_rgba(45,74,34,0.08),inset_0_1px_1px_rgba(255,255,255,0.8)]"
            >
              <Sparkles className="h-4 w-4 text-[#6B8E23]" />
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
              <span className="bg-gradient-to-br from-[#3D5A35] via-[#6B8E23] to-[#3D5A35] bg-clip-text text-transparent drop-shadow-[0_4px_24px_rgba(45,74,34,0.2)]">
                perfectly scaled.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 max-w-2xl text-lg leading-relaxed text-[#3D5A35]/80 sm:text-xl font-medium"
              style={{ fontFamily: "'Nunito', var(--font-geist-sans)" }}
            >
              Search any food and get exact macros for your portion size — instantly, without a page reload.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: [0, 8, 0] }}
              transition={{ delay: 0.8, duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="mt-12 text-[#6B8E23]/50"
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

      {/* ── TWO‑COLUMN MAIN CONTENT with margin & hidden scrollbars ── */}
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <AnimatePresence>
          {hasQuery && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-1 gap-6 lg:grid-cols-2"
            >
              {/* LEFT COLUMN: Search results */}
              <div 
                className="flex flex-col mt-4 overflow-y-auto max-h-[calc(100vh-280px)] lg:max-h-[calc(100vh-200px)]
                           [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
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
              </div>

              {/* RIGHT COLUMN: Recipe panel */}
              <div 
                className="flex flex-col mt-4 overflow-y-auto max-h-[calc(100vh-280px)] lg:max-h-[calc(100vh-200px)]
                           [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              >
                <FoodRecipePanel
                  food={selectedFood}
                  fallbackQuery={query}
                  initialRecipeId={initialRecipeId}
                />
              </div>
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
              className="w-full overflow-hidden rounded-[2rem] border border-white/40 bg-[#1a2e14]/92 px-6 py-4 text-left shadow-[0_24px_80px_rgba(45,74,34,0.45)] backdrop-blur-2xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Leaf className="h-5 w-5 text-[#D1E2C4]" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[#D1E2C4]/70">Meal tray</p>
                    <p className="text-base font-semibold text-white">
                      {mealItems.length} item{mealItems.length !== 1 ? "s" : ""} added
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-[#3D5A35] px-4 py-1.5 text-sm font-bold text-white shadow-[0_4px_16px_rgba(107,142,35,0.4)]">
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
            <motion.div
              key="drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-40 bg-[#1a0a12]/40 backdrop-blur-sm"
              onClick={() => setDrawerOpen(false)}
            />
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
              className="fixed inset-0 z-50 bg-[#1a2e14]/60 backdrop-blur-md"
              onClick={() => setMealOpen(false)}
            />
            
            <motion.div
              key="meal-modal"
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 35 }}
              className="fixed bottom-0 left-0 right-0 md:left-70 z-50 max-h-[85vh] overflow-y-auto rounded-t-[2.5rem] border-t border-[#D1E2C4]/30 bg-[#F7F9F7]/95 shadow-[0_-40px_100px_rgba(45,74,34,0.25)] backdrop-blur-3xl"
            >
              <div className="sticky top-0 flex items-center justify-between border-b border-[#D1E2C4]/20 bg-[#F7F9F7]/80 px-6 py-4 backdrop-blur-xl">
                <span className="text-lg font-bold text-[#1a2e14]" style={{ fontFamily: "'Sora', var(--font-geist-sans)" }}>
                  🍱 Meal Summary
                </span>
                <button
                  onClick={() => setMealOpen(false)}
                  className="rounded-full border border-[#D1E2C4]/40 bg-white/60 p-1.5 text-[#3D5A35] hover:bg-[#D1E2C4]/20 transition"
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
            animate={{ height: "100px" }}
            exit={{ height: 0 }} 
            aria-hidden="true" 
          />
        )}
      </AnimatePresence>
    </>
  );
}