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

type CookbookDetailsProps = {
  recipe: Recipe | null;
  searchBaseTerm?: string;
};

export function CookbookDetails({ recipe, searchBaseTerm }: CookbookDetailsProps) {
  if (!recipe) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-[#D1E2C4] bg-white/60 backdrop-blur-sm shadow-md">
          <BookOpen className="h-8 w-8 text-[#2D4A22]" />
        </div>
        <h2 className="text-xl font-bold text-[#1C2E14]" style={{ fontFamily: "'Sora', sans-serif" }}>
          Recipe Archive
        </h2>
        <p className="mt-2 text-base text-[#5A6E52] max-w-xs">
          Select a specimen from the collection to view detailed botanical and nutritional records.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <style jsx global>{`
        /* Custom Botanical Scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #D1E2C4;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3D5A35;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .specimen-scroll-area {
          scrollbar-width: none;
          -ms-overflow-style: none;
          scrollbar-gutter: stable;
        }
        .specimen-scroll-area::-webkit-scrollbar {
          display: none !important;
        }
      `}</style>

      {/* Recipe image with green-tinted gradient overlay */}
      <div className="relative aspect-video w-full overflow-hidden rounded-t-[2.5rem]">
        <img src={recipe.image} alt={recipe.title} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a2e14]/90 via-[#2D4A22]/40 to-transparent" />

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <h2 className="text-3xl font-bold leading-tight text-white drop-shadow-lg" style={{ fontFamily: "'Sora', sans-serif" }}>
            {recipe.title}
          </h2>
        </div>
      </div>

      {/* Scrollable content with green glassmorphism */}
      <div className="no-scrollbar flex-1 overflow-y-auto p-8 space-y-8 bg-white/60 backdrop-blur-sm rounded-b-[2.5rem]">
        {/* Macro row – green botanical styling */}
        <div className="grid grid-cols-3 border-b border-[#D1E2C4]/30 pb-8">
          <div className="flex flex-col items-center border-r border-[#D1E2C4]/30">
            <div className="flex items-center gap-2 text-[#3D5A35] mb-1">
              <Clock3 className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-tighter">Time</span>
            </div>
            <p className="text-lg font-bold text-[#1C2E14]">{recipe.cookTime ? `${recipe.cookTime} mins` : "--"}</p>
          </div>
          <div className="flex flex-col items-center border-r border-[#D1E2C4]/30">
            <div className="flex items-center gap-2 text-[#3D5A35] mb-1">
              <Flame className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-tighter">Energy</span>
            </div>
            <p className="text-lg font-bold text-[#1C2E14]">{recipe.calories ? `${Math.round(recipe.calories)} kcal` : "--"}</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 text-[#3D5A35] mb-1">
              <Dumbbell className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-tighter">Protein</span>
            </div>
            <p className="text-lg font-bold text-[#1C2E14]">{recipe.protein ? `${Math.round(recipe.protein)} g` : "--"}</p>
          </div>
        </div>

        {/* Ingredients – green button style */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-[#6B8E23]" />
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#2D4A22]">Ingredients</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {recipe.ingredients.map((ingredient) => (
              <Link
                key={ingredient}
                href={`/foods?query=${encodeURIComponent(extractIngredientSearchTerm(ingredient))}&recipe=${encodeURIComponent(recipe.id)}`}
                className="block rounded-xl border border-[#D1E2C4]/40 bg-white/80 px-4 py-3 text-sm font-medium text-[#3D5A35] shadow-sm transition hover:border-[#6B8E23] hover:bg-[#F1F7EC] hover:text-[#2D4A22]"
              >
                {ingredient}
              </Link>
            ))}
          </div>
        </section>

        {/* Instructions – subtle green border and background */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <NotebookPen className="h-5 w-5 text-[#6B8E23]" />
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#2D4A22]">Method</h3>
          </div>
          <div className="whitespace-pre-line rounded-2xl border border-[#D1E2C4]/30 bg-[#F7F9F7]/80 px-6 py-6 text-base leading-relaxed text-[#3D5A35] shadow-sm">
            {recipe.instructions}
          </div>
        </section>

        {/* Actions – green gradient buttons */}
        <div className="flex flex-wrap gap-3 pt-4 pb-8">
          <Link
            href={`/foods?query=${encodeURIComponent(searchBaseTerm || recipe.title)}&recipe=${encodeURIComponent(recipe.id)}`}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#7CB342] to-[#558B2F] px-8 text-sm font-bold text-white shadow-md transition hover:shadow-lg hover:from-[#8BC34A] hover:to-[#689F38]"
          >
            <Dumbbell className="h-4 w-4" />
            Analyze Macros
          </Link>
          {recipe.sourceUrl && (
            <button
              type="button"
              onClick={() => window.open(recipe.sourceUrl ?? "", "_blank", "noopener,noreferrer")}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#c5e0b4] bg-white px-8 text-sm font-bold text-[#3A6B2F] transition hover:bg-[#f1f9eb]"
            >
              <ExternalLink className="h-4 w-4" />
              Source Website
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