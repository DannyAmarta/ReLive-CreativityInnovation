"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { MapPin, Star } from "lucide-react";
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

  const favoriteIdSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);

  // Hydrate recents from localStorage after mount
  useEffect(() => {
    setRecentQueries(loadRecent());
  }, []);

  function handleQueryChange(value: string) {
    setQuery(value);
  }

  function handleApplyQuery(value: string) {
    setQuery(value);
    saveRecent(value);
    setRecentQueries(loadRecent());
  }

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
          onMaxPriceChange={setMaxPrice}
          onApplyRecentQuery={handleApplyQuery}
        />
      </div>

      {/* ── Result count ── */}
      <p className="mb-4 text-sm text-[#67715f]">
        {filtered.length === trainers.length
          ? `${trainers.length} trainers loaded from the backend marketplace.`
          : `${filtered.length} of ${trainers.length} trainers match your search.`}
      </p>

      {/* ── Trainer grid ── */}
      {filtered.length === 0 ? (
        <div className="py-24 text-center text-muted-foreground text-sm">
          No trainers match your search. Try a different keyword or clear the price filter.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((trainer) => {
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
    </>
  );
}
