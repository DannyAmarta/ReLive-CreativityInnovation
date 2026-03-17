"use client";

import { memo } from "react";
import { Heart, Info, Flame, Plus } from "lucide-react";
import { formatNutrientValue } from "@/lib/food";
import { cn } from "@/lib/utils";
import type { Food } from "@/types/food";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type FoodCardProps = {
  food: Food;
  isSelected: boolean;
  isFavorite: boolean;
  onSelect: (food: Food) => void;
  onToggleFavorite: (food: Food) => void;
  onAddToMeal: (food: Food) => void;
};

export const FoodCard = memo(function FoodCard({
  food,
  isSelected,
  isFavorite,
  onSelect,
  onToggleFavorite,
  onAddToMeal,
}: FoodCardProps) {
  return (
    <Card
      className={cn(
        "border p-0 transition",
        isSelected
          ? "border-amber-400 bg-[linear-gradient(135deg,rgba(255,247,214,0.96),rgba(255,255,255,0.98))]"
          : "border-stone-200/80 bg-[linear-gradient(135deg,rgba(255,251,235,0.9),rgba(255,255,255,0.96))]",
      )}
    >
      <CardContent className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3
                className="text-xl font-semibold text-stone-950"
                style={{ fontFamily: "'Sora', var(--font-geist-sans)" }}
              >
                {food.name}
              </h3>
              <Badge>{food.source}</Badge>
            </div>
            <p
              className="mt-1 text-sm text-stone-600"
              style={{ fontFamily: "'Nunito', var(--font-geist-sans)" }}
            >
              {food.brand || food.description || "Standardized nutrition result"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={isFavorite ? "danger" : "outline"}
              size="icon"
              onClick={() => onToggleFavorite(food)}
              aria-label={isFavorite ? "Remove favorite" : "Add favorite"}
              aria-pressed={isFavorite}
            >
              <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
            </Button>

            <div className="rounded-[1.3rem] bg-amber-500 px-4 py-3 text-amber-950 shadow-[0_10px_30px_rgba(217,119,6,0.24)]">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em]">
                <Flame className="h-4 w-4" />
                Calories
              </div>
              <p className="mt-1 text-2xl font-bold">
                {formatNutrientValue(food.nutrients.calories)}
              </p>
              <p className="text-xs opacity-80">for {food.servingSize}g</p>
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          <MacroStat label="Protein" value={food.nutrients.proteinGrams} unit="g" />
          <MacroStat label="Carbs" value={food.nutrients.carbsGrams} unit="g" />
          <MacroStat label="Fat" value={food.nutrients.fatGrams} unit="g" />
          <MacroStat label="Fiber" value={food.nutrients.fiberGrams} unit="g" />
        </div>

        <div className="mt-4 flex flex-col gap-3 rounded-[1.3rem] bg-stone-950 px-4 py-4 text-stone-100 sm:flex-row sm:items-center sm:justify-between">
          <div className="grid gap-1">
            <p className="text-[11px] uppercase tracking-[0.18em] text-stone-400">
              Reference serving
            </p>
            <p className="text-sm font-semibold text-stone-50">
              {food.referenceServingSize && food.referenceServingUnit
                ? `${food.referenceServingSize}${food.referenceServingUnit}`
                : "100g"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onAddToMeal(food)}
              aria-label={`Add ${food.name} to meal`}
            >
              <Plus className="h-4 w-4" />
              Add to meal
            </Button>
            <Button
              type="button"
              variant={isSelected ? "outline" : "default"}
              onClick={() => onSelect(food)}
              aria-label={`View details for ${food.name}`}
            >
              <Info className="h-4 w-4" />
              {isSelected ? "Viewing details" : "View details"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

function MacroStat({
  label,
  value,
  unit,
}: {
  label: string;
  value: number | null;
  unit: string;
}) {
  return (
    <div className="rounded-[1.2rem] border border-stone-200 bg-white/75 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold text-stone-950">
        {formatNutrientValue(value)}
        <span className="ml-1 text-sm font-medium text-stone-500">{unit}</span>
      </p>
    </div>
  );
}
