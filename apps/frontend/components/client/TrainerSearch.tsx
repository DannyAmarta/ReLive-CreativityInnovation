"use client";

import { Clock3, Coins, Heart, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import { useState } from "react";
import { Input } from "@/components/ui/input";

const quickSearches = [
  "Strength Coaching",
  "Yoga",
  "Weight Loss",
  "Crossfit",
  "Rehab",
  "Nutrition",
  "Running",
];

type FavoriteTrainerRef = { id: number; name: string };

type TrainerSearchProps = {
  query: string;
  maxPrice: number | "";
  isLoading: boolean;
  recentQueries: string[];
  /** Real favorites from the database */
  favoriteTrainers?: FavoriteTrainerRef[];
  onQueryChange: (value: string) => void;
  onMaxPriceChange: (value: number | "") => void;
  onApplyRecentQuery: (value: string) => void;
};

export function TrainerSearch({
  query,
  maxPrice,
  isLoading,
  recentQueries,
  favoriteTrainers = [],
  onQueryChange,
  onMaxPriceChange,
  onApplyRecentQuery,
}: TrainerSearchProps) {
  const [focused, setFocused] = useState(false);
  const expanded = focused || query.length > 0;

  return (
    <motion.div
      layout
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
    >
      <motion.div
        layout
        animate={
          expanded
            ? {
                borderRadius: 24,
                borderColor: "rgba(255, 255, 255, 0.9)",
                boxShadow: `0 0 6px 1px rgba(255,255,255,0.8), 
                            0 0 0 1px rgba(255,255,255,0.6) inset, 
                            0 0 20px 4px rgba(209, 226, 196, 0.9), 
                            0 12px 40px -5px rgba(107, 142, 35, 0.6), 
                            0 0 80px 20px rgba(107, 142, 35, 0.4), 
                            inset 0 0 15px 4px rgba(209, 226, 196, 0.5)`,
                backgroundColor: "rgba(255, 255, 255, 0.7)",
                backdropFilter: "blur(40px) saturate(150%)",
              }
            : {
                borderRadius: 999,
                borderColor: "rgba(255, 255, 255, 0.7)",
                boxShadow:
                  "0 0 4px 1px rgba(255,255,255,0.6), 0 0 12px 3px rgba(209, 226, 196, 0.7)",
                backgroundColor: "rgba(255, 255, 255, 0.45)",
                backdropFilter: "blur(20px) saturate(120%)",
              }
        }
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="overflow-hidden border border-transparent backdrop-blur-3xl relative z-20"
      >
        {/* ── Main input row ── */}
        <div className="flex items-center gap-3 px-5 py-3.5">
          {/* Search icon — spins while loading */}
          <motion.div
            animate={{ rotate: isLoading ? 360 : 0 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          >
            <Search
              className={`h-5 w-5 shrink-0 transition-colors ${
                isLoading ? "text-[#3D5A35]" : "text-[#6B8E23]"
              }`}
            />
          </motion.div>

          {/* Main text input */}
          <Input
            aria-label="Search trainers by name, specialty, or keyword"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 200)}
            placeholder="Search trainers, specialties, or keywords…"
            className="h-auto flex-1 border-0 bg-transparent px-0 py-0 text-lg font-medium text-[#1a0a12] placeholder:text-[#6B8E23]/60 shadow-none ring-0 focus-visible:ring-0"
            style={{ fontFamily: "'Nunito', var(--font-geist-sans)" }}
          />

          {/* ── Max Price pill ── */}
          <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-[#D1E2C4]/40 bg-[#F1F7EC]/80 px-3 py-1.5">
            <Coins className="h-3.5 w-3.5 text-[#3D5A35]/60" />
            <Input
              aria-label="Maximum price in IDR"
              type="number"
              value={maxPrice}
              placeholder="Max"
              onChange={(e) =>
                onMaxPriceChange(
                  e.target.value === "" ? "" : Number(e.target.value),
                )
              }
              className="h-auto w-20 border-0 bg-transparent px-0 py-0 text-sm font-semibold text-[#2D4A22] shadow-none ring-0 focus-visible:ring-0 placeholder:text-[#2D4A22]/40"
            />
            <span className="text-xs text-[#2D4A22]/60">IDR</span>
          </div>

          {/* Clear button */}
          <AnimatePresence>
            {query && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => onQueryChange("")}
                className="rounded-full bg-[#6B8E23]/20 p-1 text-[#3D5A35]"
                type="button"
              >
                <X className="h-3.5 w-3.5" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Pulse dot */}
          <motion.span
            animate={
              isLoading
                ? { scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }
                : { scale: 1, opacity: 0.5 }
            }
            transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
            className={`h-2.5 w-2.5 shrink-0 rounded-full ${
              isLoading
                ? "bg-[#6B8E23] shadow-[0_0_12px_rgba(107,142,35,0.8)]"
                : "bg-[#D1E2C4]/40"
            }`}
          />
        </div>

        {/* ── Expanded panel ── */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="border-t border-[#D1E2C4]/30 px-5 pb-4 pt-3 space-y-4">

                {/* Popular Picks */}
                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#6B8E23]">
                    Popular picks
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {quickSearches.map((s) => (
                      <SuggestionChip
                        key={s}
                        label={s}
                        onClick={() => onApplyRecentQuery(s)}
                        variant="default"
                      />
                    ))}
                  </div>
                </div>

                {/* Recent searches */}
                {recentQueries.length > 0 && (
                  <div>
                    <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#6B8E23]">
                      <Clock3 className="h-3 w-3" /> Recent
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {recentQueries.slice(0, 6).map((s) => (
                        <SuggestionChip
                          key={s}
                          label={s}
                          onClick={() => onApplyRecentQuery(s)}
                          variant="recent"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Favourite Trainers — real data, falls back to empty state */}
                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#3D5A35]">
                    <Heart className="h-3 w-3 fill-[#6B8E23] text-[#6B8E23]" /> Favourites
                  </p>
                  {favoriteTrainers.length === 0 ? (
                    <p className="text-xs text-[#6B8E23]/50 italic">
                      You have no favourite trainers yet — click the ❤ on a trainer card to save them here.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {favoriteTrainers.map((f) => (
                        <SuggestionChip
                          key={f.id}
                          label={f.name}
                          onClick={() => onApplyRecentQuery(f.name)}
                          variant="favorite"
                        />
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Ambient glow */}
      <motion.div
        animate={expanded ? { opacity: 0.6, scale: 1.15 } : { opacity: 0.2, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="pointer-events-none absolute -bottom-6 left-1/2 h-16 w-5/6 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#D1E2C4] via-[#6B8E23] to-[#3D5A35] blur-[32px] mix-blend-multiply"
      />
    </motion.div>
  );
}

function SuggestionChip({
  label,
  onClick,
  variant,
}: {
  label: string;
  onClick: () => void;
  variant: "default" | "recent" | "favorite";
}) {
  const styles = {
    default: "bg-[#F1F7EC]/80 border-[#D1E2C4]/40 text-[#2D4A22]",
    recent: "bg-white/60 border-[#D1E2C4]/30 text-[#3D5A35]",
    favorite:
      "bg-gradient-to-r from-[#E1EDD9] to-[#D1E2C4] border-[#3D5A35]/30 text-[#2D4A22]",
  }[variant];

  const chipVariants: Variants = {
    hidden: { opacity: 0, y: 10, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  return (
    <motion.button
      variants={chipVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.05, y: -2, boxShadow: "0 8px 20px rgba(107,142,35,0.15)" }}
      whileTap={{ scale: 0.95 }}
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-1.5 text-sm font-bold transition-all ${styles}`}
      style={{ fontFamily: "'Nunito', var(--font-geist-sans)" }}
    >
      {label}
    </motion.button>
  );
}
