"use client";

import { Search, Clock3, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import { useState } from "react";
import { Input } from "@/components/ui/input";

type CookbookSearchProps = {
  query: string;
  isLoading: boolean;
  recentQueries: string[];
  onQueryChange: (value: string) => void;
  onApplySuggestion: (value: string) => void;
};

const QUICK_SEARCHES = [
  "Wild-caught", "Omega-3 Rich", "Quick Prep", "Keto Friendly"
];

export function CookbookSearch({
  query,
  isLoading,
  recentQueries,
  onQueryChange,
  onApplySuggestion,
}: CookbookSearchProps) {
  const [focused, setFocused] = useState(false);
  const expanded = focused || query.length > 0;

  return (
    <motion.div
      layout
      animate={{
        borderRadius: expanded ? 28 : 16,
        backgroundColor: expanded ? "rgba(255, 255, 255, 1)" : "rgba(234, 236, 233, 0.8)",
        /* ── NEON BOTANICAL SHADOW ── */
        boxShadow: `0 0 0 2px rgba(107, 142, 35, 0.4),            /* Sharp Wire Edge */
         0 0 25px 10px rgba(209, 226, 196, 0.6),       /* Thick Inner Glow */
         0 0 70px 25px rgba(107, 142, 35, 0.2),        /* Massive Ambient Bloom */
         0 25px 80px -15px rgba(45, 74, 34, 0.35)` 
      }}
        className="overflow-hidden border border-stone-200/60 backdrop-blur-xl transition-all"
      >
      <motion.div
        layout
        animate={{
          borderRadius: expanded ? 28 : 16,
          backgroundColor: expanded ? "rgba(255, 255, 255, 1)" : "rgba(234, 236, 233, 0.8)",
          boxShadow: expanded 
            ? "0 20px 40px rgba(22, 60, 20, 0.1), 0 0 0 1px rgba(22, 60, 20, 0.05)" 
            : "0 4px 12px rgba(0,0,0,0.02)",
        }}
        className="overflow-hidden border border-stone-200/60 backdrop-blur-xl transition-all"
      >
        {/* Main Input Row */}
        <div className="flex items-center gap-3 px-6 py-3">
          <Search className={`h-5 w-5 shrink-0 ${expanded ? "text-[#2D4A22]" : "text-stone-400"}`} />
          
          <Input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 200)}
            placeholder="Salmon"
            className="h-12 flex-1 border-0 bg-transparent p-0 text-xl font-medium text-stone-800 placeholder:text-stone-400 focus-visible:ring-0 ring-0 shadow-none"
          />

          <AnimatePresence>
            {expanded && (
              <motion.button
                initial={{ opacity: 0, x: 20, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 10, scale: 0.9 }}
                whileHover={{ scale: 1.02, backgroundColor: "#243d1c" }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 rounded-xl bg-[#2D4A22] px-6 py-2.5 font-bold text-white shadow-lg transition-colors"
              >
                <span>Search</span>
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Expanded Suggestions */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-stone-100 px-6 pb-6 pt-4"
            >
              <div className="space-y-6">
                {/* Popular Tags / Quick Searches */}
                <div className="flex flex-wrap gap-2">
                  {QUICK_SEARCHES.map((s) => (
                    <SuggestionChip 
                      key={s} 
                      label={s} 
                      onClick={() => onApplySuggestion(s)} 
                      variant="default" 
                    />
                  ))}
                </div>

                {/* Recent History */}
                {recentQueries.length > 0 && (
                  <div>
                    <p className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-stone-400">
                      <Clock3 className="h-3 w-3" /> Recent Searches
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {recentQueries.slice(0, 3).map((s) => (
                        <SuggestionChip 
                          key={s} 
                          label={s} 
                          onClick={() => onApplySuggestion(s)} 
                          variant="recent" 
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
            </motion.div>
          )}
          
        </AnimatePresence>
        
      </motion.div>
      
    </motion.div>
  );
}

function SuggestionChip({ label, onClick, variant }: { label: string; onClick: () => void; variant: "default" | "recent" }) {
  const styles = variant === "default" 
    ? "bg-[#D1E2C4]/40 text-[#2D4A22] border-[#D1E2C4]" 
    : "bg-stone-100 text-stone-600 border-stone-200";

  return (
    <motion.button
      whileHover={{ y: -1, backgroundColor: variant === "default" ? "#D1E2C4" : "#e5e7eb" }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`rounded-full border px-4 py-1.5 text-xs font-bold transition-all ${styles}`}
    >
      {label}
    </motion.button>
  );
}
