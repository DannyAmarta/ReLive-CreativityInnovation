"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { MapPin, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { formatIDR } from "@/lib/format";
import {
  getTrainerLowestIdr,
  lamportsToTokenUnits,
  type TrainerProfileRecord,
} from "@/lib/marketplace";
import { TrainerSearch } from "./TrainerSearch";
import { TrainerCard } from "@/components/shared/TrainerCard";

const RECENT_KEY = "trainer_search_recent";
const MAX_RECENT = 6;

function saveRecent(query: string) {
  if (!query.trim()) return;
  try {
    const prev: string[] = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
    const next = [query, ...prev.filter((q) => q !== query)].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {}
}

function loadRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function TrainersPageClient({
  trainers,
  favoriteIds,
  favoriteTrainerNames,
}: {
  trainers: TrainerProfileRecord[];
  /** Set of trainerProfileIds the current user has favorited */
  favoriteIds: number[];
  /** Name+id pairs for the search panel favorites section */
  favoriteTrainerNames: { id: number; name: string }[];
}) {
  const [query, setQuery] = useState("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [recentQueries, setRecentQueries] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const PAGE_SIZE = 8;

  const favoriteIdSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);

  // Hydrate recents from localStorage after mount
  useEffect(() => {
    setRecentQueries(loadRecent());
  }, []);

  function handleQueryChange(value: string) {
    setQuery(value);
    setCurrentPage(1);
  }

  function handleApplyQuery(value: string) {
    setQuery(value);
    saveRecent(value);
    setRecentQueries(loadRecent());
    setCurrentPage(1);
  }

  const handleMaxPriceChange = useCallback((val: number | "") => {
    setMaxPrice(val);
    setCurrentPage(1);
  }, []);

  // Commit search to recent when user blurs with a non-empty query
  useEffect(() => {
    if (!query) return;
    const timer = setTimeout(() => {
      saveRecent(query);
      setRecentQueries(loadRecent());
    }, 1500);
    return () => clearTimeout(timer);
  }, [query]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return trainers.filter((trainer) => {
      if (q) {
        const inName = trainer.user.name.toLowerCase().includes(q);
        const inBio = (trainer.bio ?? trainer.user.bio ?? "").toLowerCase().includes(q);
        const inServices = trainer.services.some(
          (s) =>
            s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q),
        );
        if (!inName && !inBio && !inServices) return false;
      }
      if (maxPrice !== "") {
        const lowestIdr = getTrainerLowestIdr(trainer);
        if (lowestIdr === null || lowestIdr > maxPrice) return false;
      }
      return true;
    });
  }, [trainers, query, maxPrice]);

  // Prioritize favorited trainers — they always appear at the top
  const sortedFiltered = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aFav = favoriteIdSet.has(a.id) ? 0 : 1;
      const bFav = favoriteIdSet.has(b.id) ? 0 : 1;
      return aFav - bFav;
    });
  }, [filtered, favoriteIdSet]);

  const totalPages = Math.ceil(sortedFiltered.length / PAGE_SIZE);
  const paginatedTrainers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return sortedFiltered.slice(start, start + PAGE_SIZE);
  }, [sortedFiltered, currentPage]);

  function handlePageChange(page: number) {
    setCurrentPage(page);
    const el = document.getElementById("trainers-grid-top");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      {/* ── Search bar ── */}
      <div className="mb-8">
        <TrainerSearch
          query={query}
          maxPrice={maxPrice}
          isLoading={false}
          recentQueries={recentQueries}
          favoriteTrainers={favoriteTrainerNames}
          onQueryChange={handleQueryChange}
          onMaxPriceChange={handleMaxPriceChange}
          onApplyRecentQuery={handleApplyQuery}
        />
      </div>

      {/* ── Result count & page info ── */}
      <div id="trainers-grid-top" className="mb-4 flex flex-wrap items-center justify-between gap-2 scroll-mt-6">
        <p className="text-sm text-[#67715f]">
          {filtered.length === trainers.length
            ? `${trainers.length} trainers available`
            : `${filtered.length} of ${trainers.length} trainers match your search`}
          {favoriteIdSet.size > 0 && (
            <span className="ml-2 text-xs text-amber-600 font-medium">★ Favorites shown first</span>
          )}
        </p>
        {totalPages > 1 && (
          <p className="text-xs text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
        )}
      </div>

      {/* ── Trainer grid ── */}
      {filtered.length === 0 ? (
        <div className="py-24 text-center text-muted-foreground text-sm">
          No trainers match your search. Try a different keyword or clear the price filter.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {paginatedTrainers.map((trainer) => {
            const isFav = favoriteIdSet.has(trainer.id);
            return (
              <TrainerCard
                key={trainer.id}
                trainer={trainer}
                isFavorite={isFav}
                isClientView={true}
              />
            );
          })}
        </div>
      )}

      {/* ── Pagination Controls ── */}
      {totalPages > 1 && (
        <div className="mt-10 flex flex-wrap items-center justify-between border-t border-border/60 pt-6 gap-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/40 disabled:opacity-40 disabled:pointer-events-none transition-all"
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </button>

          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              const isActive = currentPage === pageNum;
              // Show first, last, current ±1, and ellipsis
              const show =
                pageNum === 1 ||
                pageNum === totalPages ||
                Math.abs(pageNum - currentPage) <= 1;
              if (!show) {
                // Show ellipsis once between gaps
                const prevShown =
                  pageNum - 1 === 1 ||
                  pageNum - 1 === totalPages ||
                  Math.abs(pageNum - 1 - currentPage) <= 1;
                if (!prevShown) return null;
                return (
                  <span key={pageNum} className="px-1 text-muted-foreground/50 text-sm select-none">
                    …
                  </span>
                );
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`h-9 w-9 inline-flex items-center justify-center rounded-xl text-sm font-bold transition-all ${
                    isActive
                      ? "bg-[#4a5d3e] text-white shadow-sm"
                      : "border border-border text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/40 disabled:opacity-40 disabled:pointer-events-none transition-all"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </>
  );
}
