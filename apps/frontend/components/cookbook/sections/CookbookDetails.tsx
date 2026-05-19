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
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-[#D1E2C4] bg-white shadow-sm">
          <BookOpen className="h-8 w-8 text-[#2D4A22]" />
        </div>
        <h2 className="text-xl font-bold text-[#1a1c1a]" style={{ fontFamily: "'Sora', sans-serif" }}>
          Recipe Archive
        </h2>
        <p className="mt-2 text-base text-stone-500 max-w-xs">
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
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE/Edge */
          scrollbar-gutter: stable; /* Optional: prevents layout shift */
        }

        /* 2. The Nuclear Option for Chrome/Webkit */
        .specimen-scroll-area::-webkit-scrollbar {
          display: none !important;
        }
      `}</style>

      {/* Recipe image stays fixed at the top */}
      <div className="relative aspect-video w-full overflow-hidden">
        <img src={recipe.image} alt={recipe.title} className="h-full w-full object-cover rounded-t-[2.5rem]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1c1a]/90 via-[#1a1c1a]/20 to-transparent" />
        
        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <h2 className="text-3xl font-bold leading-tight text-white" style={{ fontFamily: "'Sora', sans-serif" }}>
            {recipe.title}
          </h2>
        </div>
      </div>

      {/* ── SCROLLABLE CONTENT (BUT INVISIBLE SCROLLBAR) ── */}
      <div className="no-scrollbar flex-1 overflow-y-auto p-8 space-y-8">
        
        {/* Macro row (Updated to match the Botanical 3-col look) */}
        <div className="grid grid-cols-3 border-b border-stone-100 pb-8">
          <div className="flex flex-col items-center border-r border-stone-100">
            <div className="flex items-center gap-2 text-[#2D4A22] mb-1">
              <Clock3 className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-tighter">Time</span>
            </div>
            <p className="text-lg font-bold text-[#1a1c1a]">{recipe.cookTime ? `${recipe.cookTime} MINS` : "--"}</p>
          </div>
          <div className="flex flex-col items-center border-r border-stone-100">
            <div className="flex items-center gap-2 text-[#2D4A22] mb-1">
              <Flame className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-tighter">Energy</span>
            </div>
            <p className="text-lg font-bold text-[#1a1c1a]">{recipe.calories ? `${Math.round(recipe.calories)} KCAL` : "--"}</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 text-[#2D4A22] mb-1">
              <Dumbbell className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-tighter">Protein</span>
            </div>
            <p className="text-lg font-bold text-[#1a1c1a]">{recipe.protein ? `${Math.round(recipe.protein)}G` : "--"}</p>
          </div>
        </div>

        {/* Ingredients */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-[#2D4A22]" />
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#2D4A22]">Ingredients</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {recipe.ingredients.map((ingredient) => (
              <Link
                key={ingredient}
                href={`/foods?query=${encodeURIComponent(extractIngredientSearchTerm(ingredient))}&recipe=${encodeURIComponent(recipe.id)}`}
                className="block rounded-xl border border-stone-100 bg-white px-4 py-3 text-sm font-medium text-stone-600 transition hover:border-[#2D4A22] hover:text-[#2D4A22] shadow-sm"
              >
                {ingredient}
              </Link>
            ))}
          </div>
        </section>

        {/* Instructions */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <NotebookPen className="h-5 w-5 text-[#2D4A22]" />
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#2D4A22]">Method</h3>
          </div>
          <div className="whitespace-pre-line rounded-2xl border border-stone-100 bg-stone-50/50 px-6 py-6 text-base leading-relaxed text-stone-600 italic">
            {recipe.instructions}
          </div>
        </section>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 pt-4 pb-8">
          <Link
            href={`/foods?query=${encodeURIComponent(searchBaseTerm || recipe.title)}&recipe=${encodeURIComponent(recipe.id)}`}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#2D4A22] px-8 text-sm font-bold text-white shadow-lg transition hover:bg-[#1a2e14]"
          >
            <Dumbbell className="h-4 w-4" />
            Analyze Macros
          </Link>
          {recipe.sourceUrl && (
            <button
              type="button"
              onClick={() => window.open(recipe.sourceUrl ?? "", "_blank", "noopener,noreferrer")}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-stone-200 bg-white px-8 text-sm font-bold text-stone-700 transition hover:bg-stone-50"
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
