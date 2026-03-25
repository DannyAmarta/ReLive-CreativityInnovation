"use client";

import { Search, Clock3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

type RecipeSearchInputProps = {
  query: string;
  isLoading: boolean;
  recentQueries: string[];
  onQueryChange: (value: string) => void;
  onApplySuggestion: (value: string) => void;
};

const QUICK_SEARCHES = [
  "High protein chicken",
  "Healthy salmon bowl",
  "Easy oatmeal breakfast",
  "Balanced rice meal",
  "Vegetarian gym dinner",
];

export function RecipeSearchInput({
  query,
  isLoading,
  recentQueries,
  onQueryChange,
  onApplySuggestion,
}: RecipeSearchInputProps) {
  const [focused, setFocused] = useState(false);
  const expanded = focused || query.length > 0;

  return (
    <motion.div
      layout
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
    >
      {/* The Dynamic Island LED Capsule */}
      <motion.div
        layout
        animate={
          expanded
            ? {
              borderRadius: 24,
              borderColor: "rgba(255, 255, 255, 0.9)",
              boxShadow: "0 0 6px 1px rgba(255,255,255,0.8), 0 0 0 1px rgba(255,255,255,0.6) inset, 0 0 20px 4px rgba(255,183,197,0.9), 0 12px 40px -5px rgba(255,183,197,0.6), 0 0 80px 20px rgba(255,183,197,0.4), inset 0 0 15px 4px rgba(255,183,197,0.5)",
              backgroundColor: "rgba(255, 255, 255, 0.7)",
              backdropFilter: "blur(40px) saturate(150%)",
            }
            : {
              borderRadius: 999,
              borderColor: "rgba(255, 255, 255, 0.7)",
              boxShadow: "0 0 4px 1px rgba(255,255,255,0.6), 0 0 0 1px rgba(255,255,255,0.5) inset, 0 0 12px 3px rgba(255,183,197,0.7), 0 6px 20px -5px rgba(255,183,197,0.4), 0 0 30px 10px rgba(255,183,197,0.25), inset 0 0 10px 2px rgba(255,183,197,0.4)",
              backgroundColor: "rgba(255, 255, 255, 0.45)",
              backdropFilter: "blur(20px) saturate(120%)",
            }
        }
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="overflow-hidden border border-transparent backdrop-blur-3xl relative z-20"
      >
        {/* Primary search bar row */}
        <div className="flex items-center gap-3 px-5 py-3.5">
          <motion.div animate={{ rotate: isLoading ? 360 : 0 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
            <Search className={`h-5 w-5 shrink-0 transition-colors ${isLoading ? "text-[#C94F7E]" : "text-[#FF8DA1]"}`} />
          </motion.div>

          <Input
            aria-label="Search recipes by name or ingredient"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 200)}
            placeholder='Try "high protein chicken" or "salmon bowl"…'
            className="h-auto flex-1 border-0 bg-transparent px-0 py-0 text-lg font-medium text-[#1a0a12] placeholder:text-[#FF8DA1]/60 shadow-none ring-0 focus-visible:ring-0"
            style={{ fontFamily: "'Nunito', var(--font-geist-sans)" }}
          />

          {/* Clear button */}
          <AnimatePresence>
            {query && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onQueryChange("")}
                className="rounded-full bg-[#FF8DA1]/30 p-1 text-[#C94F7E]"
              >
                <X className="h-3.5 w-3.5" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Status dot */}
          <motion.span
            animate={isLoading ? { scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] } : { scale: 1, opacity: 0.5 }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
            className={`h-2.5 w-2.5 shrink-0 rounded-full ${isLoading ? "bg-[#FF8DA1] shadow-[0_0_12px_rgba(255,141,161,0.8)]" : "bg-[#FFB7C5]/40"}`}
          />
        </div>

        {/* Expanded section */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="border-t border-[#FFB7C5]/30 px-5 pb-4 pt-3 space-y-4">
                {/* Quick searches */}
                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF8DA1]">
                    Quick ideas
                  </p>
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{ visible: { transition: { staggerChildren: 0.04 } }, hidden: {} }}
                    className="flex flex-wrap gap-2"
                  >
                    {QUICK_SEARCHES.map((s) => (
                      <SuggestionChip key={s} label={s} onClick={() => onApplySuggestion(s)} variant="default" />
                    ))}
                  </motion.div>
                </div>

                {/* Recent searches */}
                {recentQueries.length > 0 && (
                  <div>
                    <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF8DA1]">
                      <Clock3 className="h-3 w-3" /> Recent
                    </p>
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
                      className="flex flex-wrap gap-2"
                    >
                      {recentQueries.map((s) => (
                        <SuggestionChip key={s} label={s} onClick={() => onApplySuggestion(s)} variant="recent" />
                      ))}
                    </motion.div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Ambient glow under the capsule */}
      <motion.div
        animate={expanded ? { opacity: 0.7, scale: 1.15 } : { opacity: 0.3, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="pointer-events-none absolute -bottom-6 left-1/2 h-16 w-5/6 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#FFB7C5] via-[#FF8DA1] to-[#FF9EBB] blur-[32px] mix-blend-multiply"
      />
    </motion.div>
  );
}

function SuggestionChip({
  label, onClick, variant,
}: { label: string; onClick: () => void; variant: "default" | "recent" }) {
  const styles = {
    default: "bg-[#FFF0F5]/80 border-[#FFB7C5]/40 text-[#9B2C5A]",
    recent: "bg-white/60 border-[#FFB7C5]/30 text-[#6b3550]",
  }[variant];

  const chipVariants: Variants = {
    hidden: { opacity: 0, y: 10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } },
  };

  return (
    <motion.button
      variants={chipVariants}
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
