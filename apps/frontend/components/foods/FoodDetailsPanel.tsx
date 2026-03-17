"use client";

import { useEffect, useState } from "react";
import { Microscope, Plus, Scale, Waves, Zap } from "lucide-react";
import { calculateNutrientsForServing, formatNutrientValue, withServingSize } from "@/lib/food";
import type { Food } from "@/types/food";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type FoodDetailsPanelProps = {
  food: Food | null;
  defaultServingSize: number;
  onAddToMeal: (food: Food) => void;
};

export function FoodDetailsPanel({
  food,
  defaultServingSize,
  onAddToMeal,
}: FoodDetailsPanelProps) {
  const [servingSize, setServingSize] = useState(defaultServingSize);

  useEffect(() => {
    setServingSize(defaultServingSize);
  }, [defaultServingSize, food?.id]);

  if (!food) {
    return (
      <Card className="p-6">
        <div className="rounded-[1.6rem] border border-dashed border-stone-300 bg-stone-50/70 px-5 py-10 text-center">
          <h3
            className="text-xl font-semibold text-stone-900"
            style={{ fontFamily: "'Sora', var(--font-geist-sans)" }}
          >
            Select a food for details
          </h3>
          <p
            className="mt-2 text-sm text-stone-600"
            style={{ fontFamily: "'Nunito', var(--font-geist-sans)" }}
          >
            Choose a result card to inspect full nutrition details and test custom serving sizes.
          </p>
        </div>
      </Card>
    );
  }

  const nutrients = calculateNutrientsForServing(food.per100gNutrients, servingSize);
  const mealReadyFood = withServingSize(food, servingSize);

  return (
    <Card className="shadow-[0_30px_100px_rgba(94,72,36,0.1)]">
      <CardContent className="p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Badge variant="secondary" className="mb-3 w-fit">
            Food Details
          </Badge>
          <h2
            className="mt-2 text-3xl font-semibold text-stone-950"
            style={{ fontFamily: "'Sora', var(--font-geist-sans)" }}
          >
            {food.name}
          </h2>
          <p
            className="mt-2 text-sm text-stone-600"
            style={{ fontFamily: "'Nunito', var(--font-geist-sans)" }}
          >
            {food.brand || food.description || "Detailed standardized nutrition profile"}
          </p>
        </div>

        <div className="rounded-[1.4rem] bg-stone-950 px-4 py-4 text-stone-50">
          <p className="text-[11px] uppercase tracking-[0.2em] text-stone-400">
            Source / reference
          </p>
          <p className="mt-2 text-sm font-semibold">{food.source}</p>
          <p className="mt-1 text-sm text-stone-300">
            {food.referenceServingSize && food.referenceServingUnit
              ? `${food.referenceServingSize}${food.referenceServingUnit}`
              : "100g basis"}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-[1.6rem] border border-amber-200 bg-[linear-gradient(135deg,rgba(255,247,214,0.86),rgba(255,255,255,0.96))] p-5">
        <div className="flex flex-wrap items-end gap-4">
          <label className="grid gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
              Serving size
            </span>
            {/* This input is intentionally local to the details panel so users
                can experiment with portions without triggering a refetch. */}
            <div className="flex items-center gap-3 rounded-[1.2rem] border border-amber-300 bg-white/85 px-4 py-3">
              <Scale className="h-5 w-5 text-amber-700" />
              <Input
                aria-label={`Serving size for ${food.name}`}
                type="number"
                min={1}
                max={5000}
                value={servingSize}
                onChange={(event) =>
                  setServingSize(Math.max(1, Math.trunc(Number(event.target.value) || 100)))
                }
                className="h-auto w-24 border-0 bg-transparent px-0 py-0 text-lg font-semibold text-stone-950 shadow-none ring-0 focus-visible:ring-0"
              />
              <span className="text-sm text-stone-500">grams</span>
            </div>
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-[1.2rem] bg-amber-500 px-5 py-4 text-amber-950 shadow-[0_10px_30px_rgba(217,119,6,0.2)]">
              <p className="text-xs font-semibold uppercase tracking-[0.22em]">
                Total calories
              </p>
              <p className="mt-1 text-3xl font-bold">
                {formatNutrientValue(nutrients.calories)}
              </p>
            </div>
            <Button
              onClick={() => onAddToMeal(mealReadyFood)}
              className="h-12"
              aria-label={`Add ${food.name} with ${servingSize} grams to meal`}
            >
              <Plus className="h-4 w-4" />
              Add to meal
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Zap} label="Protein" total={`${formatNutrientValue(nutrients.proteinGrams)} g`} baseline={`${formatNutrientValue(food.per100gNutrients.proteinGrams)} g / 100g`} />
        <MetricCard icon={Waves} label="Carbohydrates" total={`${formatNutrientValue(nutrients.carbsGrams)} g`} baseline={`${formatNutrientValue(food.per100gNutrients.carbsGrams)} g / 100g`} />
        <MetricCard icon={Microscope} label="Fat" total={`${formatNutrientValue(nutrients.fatGrams)} g`} baseline={`${formatNutrientValue(food.per100gNutrients.fatGrams)} g / 100g`} />
        <MetricCard icon={Scale} label="Fiber" total={`${formatNutrientValue(nutrients.fiberGrams)} g`} baseline={`${formatNutrientValue(food.per100gNutrients.fiberGrams)} g / 100g`} />
      </div>

      <div className="mt-6 grid gap-4 rounded-[1.6rem] bg-stone-950 px-5 py-5 text-stone-100 sm:grid-cols-3">
        <Detail label="Sugar" value={`${formatNutrientValue(nutrients.sugarGrams)} g`} />
        <Detail label="Sodium" value={`${formatNutrientValue(nutrients.sodiumMilligrams)} mg`} />
        <Detail label="Per 100g calories" value={`${formatNutrientValue(food.per100gNutrients.calories)}`} />
      </div>
      </CardContent>
    </Card>
  );
}

function MetricCard({
  icon: Icon,
  label,
  total,
  baseline,
}: {
  icon: typeof Scale;
  label: string;
  total: string;
  baseline: string;
}) {
  return (
    <div className="rounded-[1.4rem] border border-stone-200 bg-stone-50/80 p-4">
      <div className="flex items-center gap-2 text-stone-500">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-semibold uppercase tracking-[0.18em]">{label}</span>
      </div>
      <p className="mt-3 text-2xl font-semibold text-stone-950">{total}</p>
      <p className="mt-1 text-xs text-stone-500">{baseline}</p>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.18em] text-stone-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-stone-50">{value}</p>
    </div>
  );
}
