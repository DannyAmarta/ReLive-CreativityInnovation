"use client";

import {
  Clock3,
  Dumbbell,
  ExternalLink,
  Flame,
  ListChecks,
  NotebookPen,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import type { Recipe } from "@/types/recipe";

type RecipeDetailsPanelProps = {
  recipe: Recipe | null;
  searchBaseTerm?: string;
};

export function RecipeDetailsPanel({ recipe, searchBaseTerm }: RecipeDetailsPanelProps) {
  if (!recipe) {
    return (
      <div className="overflow-hidden rounded-[2rem] border border-dashed border-[#FFB7C5]/40 bg-white/35 backdrop-blur-xl">
        <div className="px-6 py-14 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-[#FFB7C5]/40 bg-[#FFF0F5]/80 shadow-[0_0_25px_rgba(200,80,130,0.15)]">
            <BookOpen className="h-8 w-8 text-[#C94F7E]" />
          </div>
          <h2
            className="text-xl font-bold text-[#1a0a12]"
            style={{ fontFamily: "'Sora', var(--font-geist-sans)" }}
          >
            Recipe details
          </h2>
          <p className="mt-2 text-base font-medium text-[#6b3550]/70 px-4">
            Pick a recipe from the results to inspect ingredients, cooking time, and full instructions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[2rem] border border-white/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.5),rgba(255,240,248,0.3))] shadow-[0_4px_24px_rgba(180,60,100,0.04),inset_0_1px_1px_rgba(255,255,255,0.5)] backdrop-blur-2xl">
      {/* Recipe image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-[#FFF0F5]">
        <img src={recipe.image} alt={recipe.title} className="h-full w-full object-cover" />
        {/* Sakura gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a0a12]/80 via-[#2d1520]/30 to-transparent" />
        {/* Overlaid title */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="mb-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/30 bg-black/50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.15em] text-white backdrop-blur-md">
              {recipe.source === "SPOONACULAR" ? "Spoonacular" : "TheMealDB"}
            </span>
            {recipe.dietTags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[#FFB7C5]/50 bg-[#C94F7E]/50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#FFE4EE] shadow-[0_0_10px_rgba(200,80,130,0.3)] backdrop-blur-sm"
              >
                {tag}
              </span>
            ))}
          </div>
          <h2
            className="text-2xl sm:text-3xl font-bold leading-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]"
            style={{ fontFamily: "'Sora', var(--font-geist-sans)" }}
          >
            {recipe.title}
          </h2>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6 p-7 relative">
        {/* Ambient pink bloom */}
        <div className="absolute -top-10 -right-10 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(255,183,197,0.12)_0%,transparent_70%)] pointer-events-none" />

        {/* Macro row */}
        <div className="grid grid-cols-3 gap-3 text-sm relative z-10">
          <div className="rounded-[1.2rem] bg-gradient-to-br from-[#FFE4EC] to-[#FFD0DC] px-4 py-3">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#9B2C5A] mb-2">
              <Clock3 className="h-4 w-4" />
              Time
            </div>
            <p className="text-lg font-bold text-[#1a0a12]">
              {recipe.cookTime ? `${recipe.cookTime} m` : "--"}
            </p>
          </div>
          <div className="rounded-[1.2rem] bg-gradient-to-br from-[#FFE8F4] to-[#FFD6E7] px-4 py-3">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#8B2A5A] mb-2">
              <Flame className="h-4 w-4" />
              Kcal
            </div>
            <p className="text-lg font-bold text-[#1a0a12]">
              {recipe.calories ? Math.round(recipe.calories) : "--"}
            </p>
          </div>
          <div className="rounded-[1.2rem] bg-gradient-to-br from-[#F8E8FF] to-[#F0D4FC] px-4 py-3">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#7A2C8C] mb-2">
              <Dumbbell className="h-4 w-4" />
              Protein
            </div>
            <p className="text-lg font-bold text-[#1a0a12]">
              {recipe.protein ? `${Math.round(recipe.protein)} g` : "--"}
            </p>
          </div>
        </div>

        {/* Ingredients */}
        <section className="space-y-4 relative z-10">
          <div className="flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-[#C94F7E]" />
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[#9B2C5A]">
              Ingredients
            </h3>
          </div>
          <ul className="space-y-2 text-sm">
            {recipe.ingredients.map((ingredient) => (
              <li key={ingredient}>
                <Link
                  href={`/foods?query=${encodeURIComponent(extractIngredientSearchTerm(ingredient))}&recipe=${encodeURIComponent(recipe.id)}`}
                  className="block rounded-xl border border-[#FFB7C5]/30 bg-white/60 px-4 py-3 font-medium text-[#6b3550] transition hover:border-[#FFB7C5]/60 hover:bg-[#FFF0F5]/60 hover:text-[#1a0a12] hover:shadow-[0_0_15px_rgba(200,80,130,0.1)] shadow-sm"
                >
                  {ingredient}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Instructions */}
        <section className="space-y-4 relative z-10">
          <div className="flex items-center gap-2">
            <NotebookPen className="h-5 w-5 text-[#C94F7E]" />
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[#9B2C5A]">
              Instructions
            </h3>
          </div>
          <div className="whitespace-pre-line rounded-[1.4rem] border border-[#FFB7C5]/30 bg-white/50 px-5 py-5 text-base font-medium leading-relaxed text-[#6b3550] shadow-inner">
            {recipe.instructions}
          </div>
        </section>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 pt-2 relative z-10">
          <Link
            href={`/foods?query=${encodeURIComponent(searchBaseTerm || recipe.title)}&recipe=${encodeURIComponent(recipe.id)}`}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#C94F7E] to-[#9B2C5A] border border-[#FFB7C5]/40 px-6 py-2.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(200,80,130,0.4)] transition hover:opacity-90 hover:shadow-[0_0_30px_rgba(200,80,130,0.55)]"
          >
            <Dumbbell className="h-4 w-4" />
            Search Macros in Foods
          </Link>
          {recipe.sourceUrl && (
            <button
              type="button"
              onClick={() => window.open(recipe.sourceUrl ?? "", "_blank", "noopener,noreferrer")}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-[#FFB7C5]/40 bg-white/60 px-6 py-2.5 text-sm font-bold text-[#9B2C5A] transition hover:border-[#C94F7E]/70 hover:bg-[#FFF0F5]/60 hover:text-[#1a0a12] shadow-sm"
            >
              <ExternalLink className="h-4 w-4" />
              Open Original Recipe
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function extractIngredientSearchTerm(value: string) {
  return value
    .replace(/^\d+([./]\d+)?\s*/g, "")
    .replace(/\b(cup|cups|tbsp|tsp|g|kg|ml|l|oz|lb|lbs)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}
