"use client";

import { Clock3, Flame, Dumbbell, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import type { Recipe } from "@/types/recipe";
import { cn } from "@/lib/utils";

type RecipeCardProps = {
  recipe: Recipe;
  isSelected: boolean;
  onSelect: (recipe: Recipe) => void;
};

export function RecipeCard({ recipe, isSelected, onSelect }: RecipeCardProps) {
  return (
    <motion.div
      layout
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "group relative overflow-hidden rounded-[1.8rem] border border-white/80 transition-all duration-300 cursor-pointer backdrop-blur-2xl",
        isSelected
          ? "border-[#E879A0]/70 shadow-[0_16px_40px_rgba(200,80,130,0.15),inset_0_1px_1px_rgba(255,255,255,0.7)] ring-1 ring-[#E879A0]/50"
          : "shadow-[0_4px_24px_rgba(180,60,100,0.04),inset_0_1px_1px_rgba(255,255,255,0.5)] hover:shadow-[0_12px_32px_rgba(200,80,130,0.12),inset_0_1px_1px_rgba(255,255,255,0.8)] hover:border-white",
      )}
      onClick={() => onSelect(recipe)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(recipe); }
      }}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
    >
      {/* Glassmorphism background */}
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-300",
          isSelected
            ? "bg-[linear-gradient(135deg,rgba(255,240,248,0.7),rgba(255,255,255,0.6))]"
            : "bg-[linear-gradient(135deg,rgba(255,255,255,0.5),rgba(255,240,248,0.3))]",
        )}
      />

      {/* Selected left-edge stripe */}
      {isSelected && (
        <div className="absolute left-0 top-4 bottom-4 w-[3px] rounded-r-full bg-gradient-to-b from-[#FFB7C5] to-[#C94F7E]" />
      )}

      {/* Recipe image */}
      <div className="relative aspect-[16/9] overflow-hidden">
        <img
          src={recipe.image}
          alt={recipe.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        {/* Sakura gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a0a12]/75 via-[#2d1520]/20 to-transparent" />

        {/* Source badge */}
        <div className="absolute left-3 top-3 rounded-full border border-white/30 bg-black/50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-md">
          {recipe.source === "SPOONACULAR" ? "Spoonacular" : "TheMealDB"}
        </div>

        {/* Selected indicator — glowing sakura pink */}
        {isSelected && (
          <div className="absolute right-4 top-4 h-3 w-3 rounded-full bg-[#FF8DA1] shadow-[0_0_12px_4px_rgba(255,141,161,0.9)] animate-pulse" />
        )}
      </div>

      {/* Card body */}
      <div className="relative z-10 space-y-4 p-5">
        <div>
          <h3
            className="line-clamp-2 text-lg font-bold leading-snug text-[#1a0a12]"
            style={{ fontFamily: "'Sora', var(--font-geist-sans)" }}
          >
            {recipe.title}
          </h3>
          <p className="mt-1.5 line-clamp-1 text-sm font-medium text-[#6b3550]/70">
            {recipe.ingredients.slice(0, 3).join(", ") || "Ingredients unavailable"}
          </p>
        </div>

        {/* Macro chips */}
        <div className="grid grid-cols-3 gap-2.5 text-xs">
          <div className="rounded-xl bg-gradient-to-br from-[#FFE4EC] to-[#FFD0DC] px-3 py-2.5">
            <div className="flex items-center gap-1.5 text-[#9B2C5A] mb-1">
              <Clock3 className="h-3.5 w-3.5" />
              <span className="font-bold uppercase tracking-wider text-[9px]">Time</span>
            </div>
            <p className="font-bold text-[#1a0a12] text-sm">
              {recipe.cookTime ? `${recipe.cookTime}m` : "--"}
            </p>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-[#FFE8F4] to-[#FFD6E7] px-3 py-2.5">
            <div className="flex items-center gap-1.5 text-[#8B2A5A] mb-1">
              <Flame className="h-3.5 w-3.5" />
              <span className="font-bold uppercase tracking-wider text-[9px]">Kcal</span>
            </div>
            <p className="font-bold text-[#1a0a12] text-sm">
              {recipe.calories ? Math.round(recipe.calories) : "--"}
            </p>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-[#F8E8FF] to-[#F0D4FC] px-3 py-2.5">
            <div className="flex items-center gap-1.5 text-[#7A2C8C] mb-1">
              <Dumbbell className="h-3.5 w-3.5" />
              <span className="font-bold uppercase tracking-wider text-[9px]">Pro</span>
            </div>
            <p className="font-bold text-[#1a0a12] text-sm">
              {recipe.protein ? `${Math.round(recipe.protein)}g` : "--"}
            </p>
          </div>
        </div>

        {/* Diet tags */}
        {recipe.dietTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {recipe.dietTags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[#FFB7C5]/50 bg-[#FFF0F5]/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#9B2C5A]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center justify-between gap-2 rounded-[1.2rem] border border-[#FFB7C5]/20 bg-[#1a0a12]/80 px-4 py-3 text-white backdrop-blur-sm">
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#FFB7C5]/60">
            {recipe.source === "SPOONACULAR" ? "Spoonacular" : "TheMealDB"}
          </p>
          <div className="flex items-center gap-2">
            {recipe.sourceUrl && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(recipe.sourceUrl ?? "", "_blank", "noopener,noreferrer");
                }}
                className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/20 transition"
              >
                <ExternalLink className="h-3.5 w-3.5" /> View
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => onSelect(recipe)}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition",
                isSelected
                  ? "bg-white/15 text-white/70"
                  : "bg-gradient-to-r from-[#FFB7C5] to-[#C94F7E] text-white shadow-[0_4px_14px_rgba(200,80,130,0.5)]",
              )}
            >
              {isSelected ? "Open" : "Inspect"}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
