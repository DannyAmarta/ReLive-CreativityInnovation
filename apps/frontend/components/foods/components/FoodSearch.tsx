"use client";

import { Clock3, Heart, Search, TimerReset, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import { useState } from "react";
import type { SavedFoodReference } from "@/types/food";
import { Input } from "@/components/ui/input";

type FoodSearchProps = {
  query: string;
  servingSize: number;
  isLoading: boolean;
  recentQueries: string[];
  favoriteFoods: SavedFoodReference[];
  onQueryChange: (value: string) => void;
  onServingSizeChange: (value: number) => void;
  onApplyRecentQuery: (value: string) => void;
  onApplyFavoriteFood: (value: SavedFoodReference) => void;
};

const quickSearches = ["Chicken breast", "Rice", "Eggs", "Oats", "Banana", "Salmon", "Avocado"];

export function FoodSearch({
  query,
  servingSize,
  isLoading,
  recentQueries,
  favoriteFoods,
  onQueryChange,
  onServingSizeChange,
  onApplyRecentQuery,
  onApplyFavoriteFood,
}: FoodSearchProps) {
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
          expanded ? {
            borderRadius: 24,
            borderColor: "rgba(255, 255, 255, 0.9)",
            /* Flashy Neon Botanical Shadow */
            boxShadow: `0 0 6px 1px rgba(255,255,255,0.8), 
                        0 0 0 1px rgba(255,255,255,0.6) inset, 
                        0 0 20px 4px rgba(209, 226, 196, 0.9), 
                        0 12px 40px -5px rgba(107, 142, 35, 0.6), 
                        0 0 80px 20px rgba(107, 142, 35, 0.4), 
                        inset 0 0 15px 4px rgba(209, 226, 196, 0.5)`,
            backgroundColor: "rgba(255, 255, 255, 0.7)",
            backdropFilter: "blur(40px) saturate(150%)",
          } : {
            borderRadius: 999,
            borderColor: "rgba(255, 255, 255, 0.7)",
            boxShadow: "0 0 4px 1px rgba(255,255,255,0.6), 0 0 12px 3px rgba(209, 226, 196, 0.7)",
            backgroundColor: "rgba(255, 255, 255, 0.45)",
            backdropFilter: "blur(20px) saturate(120%)",
          }
        }
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="overflow-hidden border border-transparent backdrop-blur-3xl relative z-20"
      >
        <div className="flex items-center gap-3 px-5 py-3.5">
          <motion.div animate={{ rotate: isLoading ? 360 : 0 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
            {/* Search Icon: Forest Green */}
            <Search className={`h-5 w-5 shrink-0 transition-colors ${isLoading ? "text-[#3D5A35]" : "text-[#6B8E23]"}`} />
          </motion.div>

          <Input
            aria-label="Search foods by name"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 200)}
            placeholder="Search any food…"
            /* Placeholder: Sage Green[cite: 4] */
            className="h-auto flex-1 border-0 bg-transparent px-0 py-0 text-lg font-medium text-[#1a0a12] placeholder:text-[#6B8E23]/60 shadow-none ring-0 focus-visible:ring-0"
            style={{ fontFamily: "'Nunito', var(--font-geist-sans)" }}
          />

          {/* Serving pill: Sage theme[cite: 4] */}
          <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-[#D1E2C4]/40 bg-[#F1F7EC]/80 px-3 py-1.5">
            <TimerReset className="h-3.5 w-3.5 text-[#3D5A35]/60" />
            <Input
              aria-label="Serving size in grams"
              type="number"
              value={servingSize}
              onChange={(e) => onServingSizeChange(Number(e.target.value) || 100)}
              className="h-auto w-14 border-0 bg-transparent px-0 py-0 text-sm font-semibold text-[#2D4A22] shadow-none ring-0 focus-visible:ring-0"
            />
            <span className="text-xs text-[#2D4A22]/60">g</span>
          </div>

          <AnimatePresence>
            {query && (
              <motion.button
                /* ... animation props ... */
                onClick={() => onQueryChange("")}
                /* Clear button: Olive theme[cite: 4] */
                className="rounded-full bg-[#6B8E23]/20 p-1 text-[#3D5A35]"
              >
                <X className="h-3.5 w-3.5" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Status dot: Neon Sage[cite: 9] */}
          <motion.span
            animate={isLoading ? { scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] } : { scale: 1, opacity: 0.5 }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
            className={`h-2.5 w-2.5 shrink-0 rounded-full ${isLoading ? "bg-[#6B8E23] shadow-[0_0_12px_rgba(107,142,35,0.8)]" : "bg-[#D1E2C4]/40"}`}
          />
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div /* ... */ className="overflow-hidden">
              {/* Border: Light Sage[cite: 4] */}
              <div className="border-t border-[#D1E2C4]/30 px-5 pb-4 pt-3 space-y-4">
                {/* Headers: Forest/Olive colors */}
                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#6B8E23]">Popular picks</p>
                  <div className="flex flex-wrap gap-2">
                    {quickSearches.map((s) => (
                      <SuggestionChip key={s} label={s} onClick={() => onApplyRecentQuery(s)} variant="default" />
                    ))}
                  </div>
                </div>

                {recentQueries.length > 0 && (
                  <div>
                    <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#6B8E23]">
                      <Clock3 className="h-3 w-3" /> Recent
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {recentQueries.slice(0, 6).map((s) => (
                        <SuggestionChip key={s} label={s} onClick={() => onApplyRecentQuery(s)} variant="recent" />
                      ))}
                    </div>
                  </div>
                )}

                {favoriteFoods.length > 0 && (
                  <div>
                    <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#3D5A35]">
                      <Heart className="h-3 w-3 fill-[#6B8E23] text-[#6B8E23]" /> Favorites
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {favoriteFoods.map((f) => (
                        <SuggestionChip key={f.id} label={f.name} onClick={() => onApplyFavoriteFood(f)} variant="favorite" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Ambient glow: Botanical Green */}
      <motion.div 
        animate={expanded ? { opacity: 0.6, scale: 1.15 } : { opacity: 0.2, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="pointer-events-none absolute -bottom-6 left-1/2 h-16 w-5/6 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#D1E2C4] via-[#6B8E23] to-[#3D5A35] blur-[32px] mix-blend-multiply" 
      />
    </motion.div>
  );
}

function SuggestionChip({
  label, onClick, variant,
}: { label: string; onClick: () => void; variant: "default" | "recent" | "favorite" }) {
  const styles = {
    default: "bg-[#F1F7EC]/80 border-[#D1E2C4]/40 text-[#2D4A22]",
    recent: "bg-white/60 border-[#D1E2C4]/30 text-[#3D5A35]",
    favorite: "bg-gradient-to-r from-[#E1EDD9] to-[#D1E2C4] border-[#3D5A35]/30 text-[#2D4A22]",
  }[variant];

  const variants: Variants = {
    hidden: { opacity: 0, y: 10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } },
  };

  return (
    <motion.button
      variants={variants}
      whileHover={{ scale: 1.05, y: -2, boxShadow: "0 8px 20px rgba(200,80,130,0.15)" }}
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
