"use client";

import {
  useActionState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  startTransition,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Sparkles, X, Leaf } from "lucide-react";
import Link from "next/link";
import { useLocalStorageState } from "@/hooks/ui/useLocalStorageState";
import { useCookbookSearch } from "@/hooks/features/cookbook/useCookbookSearch";
import { SearchRecipes } from "@/lib/recipeSearch";
import { CookbookDetails } from "./sections/CookbookDetails";
import { CookbookResults } from "./sections/CookbookResults";
import { CookbookSearch } from "./components/CookbookSearch";
import type { Recipe } from "@/types/recipe";

const RECENT_RECIPE_QUERIES_KEY = "recipe-search-recent-queries";
const DEFAULT_PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 350;

type CookbookMainProps = {
  initialQuery?: string;
  initialRecipeId?: string;
};

export function CookbookMain({
  initialQuery = "",
  initialRecipeId,
}: CookbookMainProps) {
  const {
    query, setQuery,
    selectedRecipe, setSelectedRecipe,
    recentQueries,
    results, meta, page, isLoading, error, hasQuery, hasNextPage, hasPreviousPage,
    submitSearch, manualSubmitRef, handleNextPage, handlePreviousPage
  } = useCookbookSearch(initialQuery, initialRecipeId);

  const handleApplyQuery = (value: string) => {
    manualSubmitRef.current = true;
    setQuery(value);
    submitSearch(value, 1);
  };

  return (
    <>
      {/* ── AMBIENT MESH BACKGROUND (EXACT COPY FROM FOODMAIN) ── */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#F7F9F7]">
        {/* Top Left Soft Glow */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.7, 0.5], x: [0, 40, 0], y: [0, -20, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -left-[15%] -top-[15%] h-[60vh] w-[60vw] rounded-full bg-gradient-to-br from-[#D1E2C4] to-[#D1E2C4] opacity-40 blur-[130px]"
        />
        
        {/* Bottom Right Deep Magenta Glow (same as food) */}
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3], y: [0, -60, 0], x: [0, -30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          className="absolute -bottom-[25%] -right-[15%] h-[70vh] w-[70vw] rounded-full bg-gradient-to-tl from-[#FFE4EE] via-[#D1E2C4] to-[#2D4A22] opacity-30 blur-[150px]"
        />

        {/* Center Accent Glow */}
        <motion.div
          animate={{
            opacity: [0.15, 0.3, 0.15],
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute left-[20%] top-[30%] h-[40vh] w-[60vw] rounded-full bg-gradient-to-r from-[#E1EDD9] to-[#D1E2C4] opacity-20 blur-[110px]"
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

      {/* ── HERO (with exact same radial blobs as FoodMain) ── */}
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
            {/* Radial glow blobs – exact copy from FoodMain */}
            <div className="pointer-events-none absolute -top-20 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(209,226,196,0.3)_0%,transparent_70%)]" />
            <div className="pointer-events-none absolute top-1/3 -left-20 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(107,142,35,0.2)_0%,transparent_70%)]" />
            <div className="pointer-events-none absolute top-1/3 -right-20 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(61,90,53,0.15)_0%,transparent_70%)]" />

            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6, type: "spring", stiffness: 200, damping: 20 }}
              className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-[#D1E2C4]/50 bg-white/40 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.15em] text-[#3D5A35] backdrop-blur-2xl shadow-[0_8px_32px_rgba(45,74,34,0.08),inset_0_1px_1px_rgba(255,255,255,0.8)]"
            >
              <Leaf className="h-4 w-4 text-[#6B8E23]" />
              Recipe Discovery — Cook in the Garden
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.18, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-4xl text-5xl font-extrabold leading-[1.1] tracking-tight text-[#1a0a12] sm:text-6xl lg:text-7xl xl:text-[5.5rem]"
              style={{ fontFamily: "'Sora', var(--font-geist-sans)" }}
            >
              Cook in the{" "}
              <span className="bg-gradient-to-br from-[#3D5A35] via-[#6B8E23] to-[#3D5A35] bg-clip-text text-transparent drop-shadow-[0_4px_24px_rgba(45,74,34,0.2)]">
                evergreen archive.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 max-w-2xl text-lg leading-relaxed text-[#3D5A35]/80 sm:text-xl font-medium"
              style={{ fontFamily: "'Nunito', var(--font-geist-sans)" }}
            >
              Discover healthy recipes, explore ingredients and macros, and pick something beautiful to cook today.
            </motion.p>

            {/* Gentle bounce arrow */}
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

      {/* ── Compact header strip when searching ── */}
      <AnimatePresence>
        {hasQuery && (
          <motion.div
            key="compact-header"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="relative z-10 flex items-center gap-3 px-6 pt-6 pb-2"
          >
            <BookOpen className="h-5 w-5 text-[#6B8E23]" />
            <span
              className="text-sm font-bold text-[#2D4A22] uppercase tracking-[0.2em]"
              style={{ fontFamily: "'Sora', var(--font-geist-sans)" }}
            >
              Cookbook
            </span>
            <span className="mx-3 h-px flex-1 bg-gradient-to-r from-[#C5E0B4]/60 to-transparent" />
            <Link
              href={query.trim() ? `/foods?query=${encodeURIComponent(query.trim())}` : "/foods"}
              className="text-sm font-bold text-[#3D5A35] transition-all hover:text-[#6B8E23] hover:translate-x-1 flex items-center gap-1"
            >
              <span className="tracking-wide">→ Search macros</span>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FLOATING SEARCH BAR (adjusted margin) ── */}
      <div className={`relative z-30 ${hasQuery ? "pt-4" : "pt-0"}`}>
        <motion.div
          layout
          className="mx-auto max-w-3xl px-4 sm:px-6"
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <CookbookSearch
            query={query}
            isLoading={isLoading}
            recentQueries={recentQueries}
            onQueryChange={setQuery}
            onApplySuggestion={handleApplyQuery}
          />
        </motion.div>
      </div>

      {/* ── MAIN RESULTS GRID (green theme) ── */}
      <main className="relative z-10 mx-auto max-w-8xl px-4 py-8 sm:px-6 lg:px-8">
        <AnimatePresence>
          {hasQuery && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <CookbookResults
                items={results}
                meta={meta}
                isLoading={isLoading}
                error={error}
                hasQuery={hasQuery}
                selectedRecipeId={selectedRecipe?.id ?? null}
                page={page}
                hasNextPage={hasNextPage}
                hasPreviousPage={hasPreviousPage}
                onSelectRecipe={setSelectedRecipe}
                onNextPage={handleNextPage}
                onPreviousPage={handlePreviousPage}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── MODAL POP-OUT (central focus, green theme) ── */}
      <AnimatePresence>
        {selectedRecipe && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop - soft forest */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRecipe(null)}
              className="absolute inset-0 bg-[#1a2e14]/40 backdrop-blur-md"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative z-[110] p-2 flex w-full max-w-4xl max-h-[90vh] flex-col overflow-hidden rounded-[2.5rem] bg-white shadow-[0_32px_128px_rgba(45,74,34,0.3)] border border-[#D1E2C4]/50 isolate"
              style={{
                WebkitMaskImage: "linear-gradient(#fff 0 0), linear-gradient(#fff 0 0)",
                maskImage: "linear-gradient(#fff 0 0), linear-gradient(#fff 0 0)",
                WebkitMaskClip: "content-box, border-box",
                maskClip: "content-box, border-box",
                WebkitMaskComposite: "destination-in",
                maskComposite: "intersect",
              }}
            >
              {/* Close button - green themed */}
              <button 
                onClick={() => setSelectedRecipe(null)}
                className="absolute right-8 top-8 z-[130] flex h-10 w-10 items-center justify-center rounded-full bg-[#2D4A22]/80 text-white backdrop-blur-md transition-transform hover:scale-110 active:scale-95 border border-white/30"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Scrollable content area */}
              <div className="no-scrollbar flex-1 overflow-y-auto rounded-[2rem] overflow-hidden">
                <CookbookDetails 
                  recipe={selectedRecipe} 
                  searchBaseTerm={query} 
                />
              </div>

              <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar {
                  display: none !important;
                  width: 0 !important;
                }
              `}</style>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}