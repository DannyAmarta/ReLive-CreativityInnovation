"use client";

import { Minus, Plus, Soup, Trash2 } from "lucide-react";
import { formatNutrientValue, summarizeMealNutrition } from "@/lib/food";
import type { MealFoodItem } from "@/types/food";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

type MealSummaryPanelProps = {
  items: MealFoodItem[];
  onUpdateServing: (itemId: string, servingSize: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClear: () => void;
};

export function MealSummaryPanel({
  items,
  onUpdateServing,
  onRemoveItem,
  onClear,
}: MealSummaryPanelProps) {
  // The meal summary is purely a UI aggregation over already-fetched foods.
  // Nothing here requires another backend round-trip.
  const totals = summarizeMealNutrition(items);

  return (
    <Card className="border-stone-900/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(255,247,237,0.94))]">
      <CardHeader className="pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Badge variant="secondary" className="mb-3 w-fit">
              Meal Summary
            </Badge>
            <CardTitle style={{ fontFamily: "'Sora', var(--font-geist-sans)" }}>
              Combined nutrition
            </CardTitle>
            <CardDescription
              style={{ fontFamily: "'Nunito', var(--font-geist-sans)" }}
            >
              Add foods to build a meal and watch total macros update live.
            </CardDescription>
          </div>

          {items.length > 0 ? (
            <Button variant="outline" onClick={onClear}>
              Clear meal
            </Button>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div
          aria-live="polite"
          className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
        >
          <SummaryMetric label="Calories" value={formatNutrientValue(totals.calories)} unit="" />
          <SummaryMetric label="Protein" value={formatNutrientValue(totals.proteinGrams)} unit="g" />
          <SummaryMetric label="Carbs" value={formatNutrientValue(totals.carbsGrams)} unit="g" />
          <SummaryMetric label="Fat" value={formatNutrientValue(totals.fatGrams)} unit="g" />
        </div>

        {items.length === 0 ? (
          <div className="rounded-[1.4rem] border border-dashed border-stone-300 bg-stone-50/80 px-5 py-8 text-center">
            <Soup className="mx-auto h-8 w-8 text-stone-400" />
            <p
              className="mt-3 text-base font-semibold text-stone-900"
              style={{ fontFamily: "'Sora', var(--font-geist-sans)" }}
            >
              Your meal is empty
            </p>
            <p
              className="mt-2 text-sm text-stone-600"
              style={{ fontFamily: "'Nunito', var(--font-geist-sans)" }}
            >
              Add foods from the result list to build a meal summary.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-4 rounded-[1.4rem] border border-stone-200 bg-white/80 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p
                      className="truncate text-base font-semibold text-stone-950"
                      style={{ fontFamily: "'Sora', var(--font-geist-sans)" }}
                    >
                      {item.name}
                    </p>
                    <Badge variant="outline">{item.source}</Badge>
                  </div>
                  <p
                    className="mt-1 text-sm text-stone-600"
                    style={{ fontFamily: "'Nunito', var(--font-geist-sans)" }}
                  >
                    {item.brand || "Custom serving"}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div
                    className="flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-3 py-2"
                    aria-label={`Adjust serving for ${item.name}`}
                  >
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 rounded-full"
                      onClick={() => onUpdateServing(item.id, Math.max(1, item.servingSize - 25))}
                      aria-label={`Decrease ${item.name} serving`}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="min-w-16 text-center text-sm font-semibold text-stone-900">
                      {item.servingSize}g
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 rounded-full"
                      onClick={() => onUpdateServing(item.id, item.servingSize + 25)}
                      aria-label={`Increase ${item.name} serving`}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="text-right">
                    <p className="text-xs uppercase tracking-[0.18em] text-stone-500">
                      Calories
                    </p>
                    <p className="text-lg font-semibold text-stone-950">
                      {formatNutrientValue(item.nutrients.calories)}
                    </p>
                  </div>

                  <Button
                    size="icon"
                    variant="danger"
                    onClick={() => onRemoveItem(item.id)}
                    aria-label={`Remove ${item.name} from meal`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SummaryMetric({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <div className="rounded-[1.3rem] border border-stone-200 bg-white/85 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-stone-950">
        {value}
        {unit ? <span className="ml-1 text-base text-stone-500">{unit}</span> : null}
      </p>
    </div>
  );
}
