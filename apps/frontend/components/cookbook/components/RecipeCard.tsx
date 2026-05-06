"use client";

import { Clock3, Flame, Dumbbell, ExternalLink, Bookmark } from "lucide-react";
import { motion } from "framer-motion";
import type { Recipe } from "@/types/recipe";
import { cn } from "@/lib/utils";
import { memo } from "react";

type RecipeCardProps = {
  recipe: Recipe;
  isSelected: boolean;
  onSelect: (recipe: Recipe) => void;
};

function RecipeCard({ recipe, isSelected, onSelect }: RecipeCardProps) {
  return (
    <motion.div
      layout
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-3xl bg-white transition-all duration-500",
        isSelected 
          ? "ring-2 ring-[#2D4A22] shadow-2xl" 
          : "shadow-sm hover:shadow-xl"
      )}
      onClick={() => onSelect(recipe)}
      role="button"
      tabIndex={0}
    >
      {/* ── IMAGE SECTION ── */}
      <div className="relative aspect-[16/9] overflow-hidden">
        <img
          src={recipe.image}
          alt={recipe.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Difficulty Badge (Top Left) */}
        <div className="absolute left-4 top-4 rounded-md bg-white/90 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-[#2D4A22] backdrop-blur-sm">
          {recipe.cookTime && recipe.cookTime > 30 ? "Advanced" : "Beginner"}
        </div>
      </div>

      {/* ── CARD BODY ── */}
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-4">
          <h3 className="line-clamp-1 text-xl font-bold text-[#1a1c1a]" style={{ fontFamily: "'Sora', sans-serif" }}>
            {recipe.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-stone-500">
            {recipe.ingredients.join(", ")}
          </p>
        </div>

        {/* ── MACRO TABS (Botanical Style) ── */}
        <div className="mt-auto grid grid-cols-3 border-t border-stone-100 pt-5">
          <div className="flex items-center gap-2">
            <Clock3 className="h-4 w-4 text-[#2D4A22]" />
            <span className="text-[10px] font-bold text-stone-700 uppercase tracking-tight">
              {recipe.cookTime ? `${recipe.cookTime} MINS` : "--"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-[#2D4A22]" />
            <span className="text-[10px] font-bold text-stone-700 uppercase tracking-tight">
              {recipe.calories ? `${Math.round(recipe.calories)} KCAL` : "--"}
            </span>
          </div>
          {/* PROTEIN TAB INCLUDED */}
          <div className="flex items-center gap-2">
            <Dumbbell className="h-4 w-4 text-[#2D4A22]" />
            <span className="text-[10px] font-bold text-stone-700 uppercase tracking-tight">
              {recipe.protein ? `${Math.round(recipe.protein)}G PRO` : "--"}
            </span>
          </div>
        </div>

        {/* ── FOOTER ACTIONS ── */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex gap-2">
             {recipe.dietTags.slice(0, 1).map(tag => (
               <span key={tag} className="rounded-full bg-stone-100 px-3 py-1 text-[9px] font-bold uppercase text-stone-500">
                 {tag}
               </span>
             ))}
          </div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            className={cn(
              "rounded-full p-2.5 transition-colors",
              isSelected ? "bg-[#2D4A22] text-white" : "bg-stone-100 text-stone-400 hover:text-[#2D4A22]"
            )}
          >
            <Bookmark className="h-4 w-4" fill={isSelected ? "currentColor" : "none"} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export const MemoizedRecipeCard = memo(RecipeCard);