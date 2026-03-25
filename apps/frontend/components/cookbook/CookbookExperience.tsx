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
import { BookOpen, Sparkles } from "lucide-react";
import Link from "next/link";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";
import { SearchRecipes } from "@/lib/recipeSearch";
import { RecipeDetailsPanel } from "./RecipeDetailsPanel";
import { RecipeResultList } from "./RecipeResultList";
import { RecipeSearchInput } from "./RecipeSearchInput";
import type { Recipe } from "@/types/recipe";

const RECENT_RECIPE_QUERIES_KEY = "recipe-search-recent-queries";
const DEFAULT_PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 350;

type CookbookExperienceProps = {
  initialQuery?: string;
  initialRecipeId?: string;
};

export function CookbookExperience({
  initialQuery = "",
  initialRecipeId,
}: CookbookExperienceProps) {
  const [state, action, pending] = useActionState(SearchRecipes, undefined);
  const [query, setQuery] = useState(initialQuery);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const manualSubmitRef = useRef(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [recentQueries, setRecentQueries] = useLocalStorageState<string[]>(
    RECENT_RECIPE_QUERIES_KEY,
    [],
  );
  const normalizedQuery = query.trim();
  const hasQuery = normalizedQuery.length > 0;
  const results = useMemo(
    () => (hasQuery ? state?.result?.items ?? [] : []),
    [hasQuery, state?.result?.items],
  );
  const meta = hasQuery ? state?.result ?? null : null;
  const page = meta?.page ?? 1;
  const pageSize = meta?.pageSize ?? DEFAULT_PAGE_SIZE;
  const hasNextPage = results.length >= pageSize;
  const hasPreviousPage = page > 1;
  const isLoading = pending && hasQuery;
  const error =
    hasQuery && state?.status === "error"
      ? state.message ?? "Unable to load recipe results."
      : null;

  const submitSearch = useCallback(
    (nextQuery: string, nextPage: number) => {
      const trimmedQuery = nextQuery.trim();
      if (!trimmedQuery) return;
      const formData = new FormData();
      formData.set("query", trimmedQuery);
      formData.set("page", String(nextPage));
      formData.set("limit", String(DEFAULT_PAGE_SIZE));
      startTransition(() => {
        action(formData);
      });
    },
    [action],
  );

  useEffect(() => {
    if (results.length === 0) { setSelectedRecipe(null); return; }
    setSelectedRecipe((current) => {
      if (initialRecipeId) {
        const initialMatch = results.find((item) => item.id === initialRecipeId);
        if (initialMatch) return initialMatch;
      }
      if (!current) return results[0];
      return results.find((item) => item.id === current.id) ?? results[0];
    });
  }, [initialRecipeId, results]);

  useEffect(() => {
    if (!normalizedQuery || normalizedQuery.length < 2 || !meta || meta.items.length === 0) return;
    setRecentQueries((current) => {
      const withoutDuplicate = current.filter((item) => item !== normalizedQuery);
      return [normalizedQuery, ...withoutDuplicate].slice(0, 6);
    });
  }, [meta, normalizedQuery, setRecentQueries]);

  useEffect(() => {
    if (!normalizedQuery) return;
    if (manualSubmitRef.current) { manualSubmitRef.current = false; return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      submitSearch(normalizedQuery, 1);
    }, SEARCH_DEBOUNCE_MS);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [normalizedQuery, submitSearch]);

  return (
    <>
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
        {/* Center Accent Glow */}
        <motion.div
          animate={{
            opacity: [0.15, 0.3, 0.15],
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute left-[20%] top-[30%] h-[40vh] w-[60vw] rounded-full bg-gradient-to-r from-[#FF9EBB] to-[#FFB7C5] opacity-20 blur-[110px]"
        />
        {/* Subtle dot matrix */}
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
            {/* Radial glow blobs */}
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
              Recipe Discovery — Cook Something Beautiful
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.18, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-4xl text-5xl font-extrabold leading-[1.1] tracking-tight text-[#1a0a12] sm:text-6xl lg:text-7xl xl:text-[5.5rem]"
              style={{ fontFamily: "'Sora', var(--font-geist-sans)" }}
            >
              Cook in the{" "}
              <span className="bg-gradient-to-br from-[#C94F7E] via-[#FF9EBB] to-[#9B2C5A] bg-clip-text text-transparent drop-shadow-[0_4px_24px_rgba(200,80,130,0.2)]">
                sakura bloom.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 max-w-2xl text-lg leading-relaxed text-[#6b3550]/80 sm:text-xl font-medium"
              style={{ fontFamily: "'Nunito', var(--font-geist-sans)" }}
            >
              Discover healthy recipes, explore ingredients and macros, and pick something beautiful to cook today.
            </motion.p>

            {/* Bounce arrow */}
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
            <BookOpen className="h-5 w-5 text-[#C94F7E]" />
            <span
              className="text-sm font-bold text-[#9B2C5A] uppercase tracking-[0.2em]"
              style={{ fontFamily: "'Sora', var(--font-geist-sans)" }}
            >
              Cookbook
            </span>
            <span className="mx-3 h-px flex-1 bg-gradient-to-r from-[#FFB7C5]/60 to-transparent" />
            <Link
              href={query.trim() ? `/foods?query=${encodeURIComponent(query.trim())}` : "/foods"}
              className="text-sm font-bold text-[#C94F7E] transition hover:text-[#9B2C5A]"
            >
              → Search macros
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FLOATING SEARCH BAR ── */}
      <div className={`relative z-30 ${hasQuery ? "pt-3" : "pt-0"}`}>
        <motion.div
          layout
          className="mx-auto max-w-3xl px-4 sm:px-6"
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <RecipeSearchInput
            query={query}
            isLoading={isLoading}
            recentQueries={recentQueries}
            onQueryChange={setQuery}
            onApplySuggestion={handleApplyQuery}
          />
        </motion.div>
      </div>

      {/* ── MAIN RESULTS ── */}
      <main className="relative z-10 mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <AnimatePresence>
          {hasQuery && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-6"
            >
              <RecipeResultList
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

              <RecipeDetailsPanel recipe={selectedRecipe} searchBaseTerm={query} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </>
  );

  function handleApplyQuery(value: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    manualSubmitRef.current = true;
    setQuery(value);
    submitSearch(value, 1);
  }

  function handleNextPage() {
    if (!hasNextPage) return;
    submitSearch(normalizedQuery, page + 1);
  }

  function handlePreviousPage() {
    if (!hasPreviousPage) return;
    submitSearch(normalizedQuery, page - 1);
  }
}
