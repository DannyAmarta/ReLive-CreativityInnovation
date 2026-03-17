"use client";

import { Clock3, Flame, Dumbbell, ExternalLink } from "lucide-react";
import type { Recipe } from "@/types/recipe";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type RecipeCardProps = {
  recipe: Recipe;
  isSelected: boolean;
  onSelect: (recipe: Recipe) => void;
};

export function RecipeCard({ recipe, isSelected, onSelect }: RecipeCardProps) {
  return (
    <Card
      className={`overflow-hidden border transition-all ${
        isSelected
          ? "border-emerald-400 shadow-[0_24px_65px_rgba(52,131,103,0.22)]"
          : "border-white/70"
      }`}
    >
      <div
        onClick={() => onSelect(recipe)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onSelect(recipe);
          }
        }}
        className="block w-full cursor-pointer text-left"
        aria-pressed={isSelected}
        role="button"
        tabIndex={0}
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-stone-200">
          <img
            src={recipe.image}
            alt={recipe.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute left-4 top-4 rounded-full bg-black/55 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
            {recipe.source === "SPOONACULAR" ? "Spoonacular" : "TheMealDB"}
          </div>
        </div>
        <CardContent className="space-y-4 p-5">
          <div>
            <h3
              className="line-clamp-2 text-lg font-semibold text-stone-950"
              style={{ fontFamily: "'Sora', var(--font-geist-sans)" }}
            >
              {recipe.title}
            </h3>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-stone-600">
              {recipe.ingredients.slice(0, 3).join(", ") || "Ingredients unavailable"}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs text-stone-600">
            <div className="rounded-2xl bg-stone-100/80 px-3 py-2">
              <div className="flex items-center gap-1 text-stone-500">
                <Clock3 className="h-3.5 w-3.5" />
                Time
              </div>
              <p className="mt-1 font-semibold text-stone-900">
                {recipe.cookTime ? `${recipe.cookTime} min` : "Unknown"}
              </p>
            </div>
            <div className="rounded-2xl bg-stone-100/80 px-3 py-2">
              <div className="flex items-center gap-1 text-stone-500">
                <Flame className="h-3.5 w-3.5" />
                Calories
              </div>
              <p className="mt-1 font-semibold text-stone-900">
                {recipe.calories ? Math.round(recipe.calories) : "--"}
              </p>
            </div>
            <div className="rounded-2xl bg-stone-100/80 px-3 py-2">
              <div className="flex items-center gap-1 text-stone-500">
                <Dumbbell className="h-3.5 w-3.5" />
                Protein
              </div>
              <p className="mt-1 font-semibold text-stone-900">
                {recipe.protein ? `${Math.round(recipe.protein)} g` : "--"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {recipe.dietTags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-800"
              >
                {tag}
              </span>
            ))}
          </div>

          {recipe.sourceUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="rounded-full px-0 text-stone-700 hover:bg-transparent hover:text-stone-950"
              onClick={(event) => {
                event.stopPropagation();
                window.open(recipe.sourceUrl ?? "", "_blank", "noopener,noreferrer");
              }}
            >
              <ExternalLink className="h-4 w-4" />
              View original
            </Button>
          )}
        </CardContent>
      </div>
    </Card>
  );
}
