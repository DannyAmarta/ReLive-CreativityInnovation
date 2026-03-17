"use client";

import {
  Clock3,
  Dumbbell,
  ExternalLink,
  Flame,
  ListChecks,
  NotebookPen,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Recipe } from "@/types/recipe";

type RecipeDetailsPanelProps = {
  recipe: Recipe | null;
  searchBaseTerm?: string;
};

export function RecipeDetailsPanel({
  recipe,
  searchBaseTerm,
}: RecipeDetailsPanelProps) {
  if (!recipe) {
    return (
      <Card className="border-white/70 bg-white/80">
        <CardHeader>
          <CardTitle style={{ fontFamily: "'Sora', var(--font-geist-sans)" }}>
            Recipe details
          </CardTitle>
          <CardDescription>
            Pick a recipe from the results to inspect ingredients, cooking time, and full
            instructions.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-white/70 bg-white/80 xl:sticky xl:top-6">
      <div className="aspect-[16/10] overflow-hidden rounded-t-[1.6rem] bg-stone-200">
        <img src={recipe.image} alt={recipe.title} className="h-full w-full object-cover" />
      </div>
      <CardHeader className="pb-4">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
          <span>{recipe.source === "SPOONACULAR" ? "Spoonacular" : "TheMealDB"}</span>
          {recipe.dietTags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-800"
            >
              {tag}
            </span>
          ))}
        </div>
        <CardTitle
          className="text-2xl"
          style={{ fontFamily: "'Sora', var(--font-geist-sans)" }}
        >
          {recipe.title}
        </CardTitle>
        <CardDescription>
          Home-cooked guidance with a nutrition-aware source order: cache, Spoonacular, then
          TheMealDB fallback.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="rounded-[1.2rem] bg-stone-100/80 px-4 py-3">
            <div className="flex items-center gap-2 text-stone-500">
              <Clock3 className="h-4 w-4" />
              Time
            </div>
            <p className="mt-2 font-semibold text-stone-950">
              {recipe.cookTime ? `${recipe.cookTime} min` : "Unknown"}
            </p>
          </div>
          <div className="rounded-[1.2rem] bg-stone-100/80 px-4 py-3">
            <div className="flex items-center gap-2 text-stone-500">
              <Flame className="h-4 w-4" />
              Calories
            </div>
            <p className="mt-2 font-semibold text-stone-950">
              {recipe.calories ? Math.round(recipe.calories) : "--"}
            </p>
          </div>
          <div className="rounded-[1.2rem] bg-stone-100/80 px-4 py-3">
            <div className="flex items-center gap-2 text-stone-500">
              <Dumbbell className="h-4 w-4" />
              Protein
            </div>
            <p className="mt-2 font-semibold text-stone-950">
              {recipe.protein ? `${Math.round(recipe.protein)} g` : "--"}
            </p>
          </div>
        </div>

        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-emerald-700" />
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-600">
              Ingredients
            </h3>
          </div>
          <ul className="space-y-2 text-sm leading-6 text-stone-700">
            {recipe.ingredients.map((ingredient) => (
              <li key={ingredient}>
                <Link
                  href={`/foods?query=${encodeURIComponent(extractIngredientSearchTerm(ingredient))}&recipe=${encodeURIComponent(recipe.id)}`}
                  className="block rounded-2xl border border-stone-200 bg-stone-50/80 px-4 py-3 transition hover:border-stone-300 hover:bg-white"
                >
                  {ingredient}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <NotebookPen className="h-4 w-4 text-amber-700" />
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-600">
              Instructions
            </h3>
          </div>
          <div className="whitespace-pre-line rounded-[1.4rem] border border-stone-200 bg-stone-50/80 px-4 py-4 text-sm leading-7 text-stone-700">
            {recipe.instructions}
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link
            href={`/foods?query=${encodeURIComponent(searchBaseTerm || recipe.title)}&recipe=${encodeURIComponent(recipe.id)}`}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-stone-950 px-4 py-2 text-sm font-medium text-stone-50 transition hover:bg-stone-800"
          >
            <Dumbbell className="h-4 w-4" />
            Search in foods
          </Link>
          {recipe.sourceUrl && (
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                window.open(recipe.sourceUrl ?? "", "_blank", "noopener,noreferrer")
              }
            >
              <ExternalLink className="h-4 w-4" />
              Open original recipe
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function extractIngredientSearchTerm(value: string) {
  return value
    .replace(/^\d+([./]\d+)?\s*/g, "")
    .replace(/\b(cup|cups|tbsp|tsp|g|kg|ml|l|oz|lb|lbs)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}
