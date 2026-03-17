"use client";

import { Clock3, Heart, Search, TimerReset } from "lucide-react";
import type { SavedFoodReference } from "@/types/food";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type FoodSearchInputProps = {
  query: string;
  servingSize: number;
  isLoading: boolean;
  recentQueries: string[];
  favoriteFoods: SavedFoodReference[];
  onQueryChange: (value: string) => void;
  onServingSizeChange: (value: number) => void;
  onApplyRecentQuery: (value: string) => void;
  onApplyFavoriteFood: (value: SavedFoodReference) => void;
};

const quickSearches = ["Chicken breast", "Rice", "Eggs", "Oats", "Banana"];

export function FoodSearchInput({
  query,
  servingSize,
  isLoading,
  recentQueries,
  favoriteFoods,
  onQueryChange,
  onServingSizeChange,
  onApplyRecentQuery,
  onApplyFavoriteFood,
}: FoodSearchInputProps) {
  return (
    <Card className="p-5 sm:p-7">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Badge variant="secondary" className="w-fit">
            Food Search
          </Badge>
          <div className="flex flex-col gap-3 lg:flex-row">
            <label className="group flex min-h-16 flex-1 items-center gap-3 rounded-[1.5rem] border border-stone-300/70 bg-stone-50/80 px-4 shadow-inner shadow-amber-100/40 transition focus-within:border-amber-500 focus-within:bg-white">
              <Search className="h-5 w-5 text-amber-700/70" />
              <Input
                aria-label="Search foods by name"
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
                placeholder="Search chicken breast, oats, salmon..."
                className="h-auto w-full border-0 bg-transparent px-0 py-0 text-base shadow-none ring-0 focus-visible:ring-0"
                style={{ fontFamily: "'Nunito', var(--font-geist-sans)" }}
              />
            </label>

            <label className="flex min-h-16 items-center gap-3 rounded-[1.5rem] border border-stone-300/70 bg-stone-50/85 px-4 shadow-inner shadow-amber-100/40">
              <TimerReset className="h-5 w-5 text-amber-700/70" />
              <div className="flex flex-col">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                  Serving
                </span>
                <div className="flex items-center gap-2">
                  <Input
                    aria-label="Serving size in grams"
                    type="number"
                    min={1}
                    max={5000}
                    value={servingSize}
                    onChange={(event) =>
                      onServingSizeChange(Number(event.target.value) || 100)
                    }
                    className="h-auto w-20 border-0 bg-transparent px-0 py-0 text-base shadow-none ring-0 focus-visible:ring-0"
                    style={{ fontFamily: "'Nunito', var(--font-geist-sans)" }}
                  />
                  <span className="text-sm text-stone-500">grams</span>
                </div>
              </div>
            </label>
          </div>
        </div>

        <QuickSection
          icon={Search}
          title="Popular picks"
          items={quickSearches}
          onClick={onApplyRecentQuery}
        />

        {recentQueries.length > 0 ? (
          <QuickSection
            icon={Clock3}
            title="Recent searches"
            items={recentQueries}
            onClick={onApplyRecentQuery}
          />
        ) : null}

        {favoriteFoods.length > 0 ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              <Heart className="h-4 w-4 text-rose-500" />
              Favorite foods
            </div>
            <div className="flex flex-wrap gap-2">
              {favoriteFoods.map((food) => (
                <Button
                  key={food.id}
                  type="button"
                  onClick={() => onApplyFavoriteFood(food)}
                  variant="danger"
                  className="rounded-full"
                  style={{ fontFamily: "'Nunito', var(--font-geist-sans)" }}
                >
                  {food.name}
                </Button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="flex items-center justify-between text-sm text-stone-500">
          <p style={{ fontFamily: "'Nunito', var(--font-geist-sans)" }}>
            Nutrition totals are recalculated instantly on the client from per-100g values.
          </p>
          <span
            role="status"
            aria-live="polite"
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              isLoading
                ? "bg-amber-200 text-amber-900"
                : "bg-emerald-100 text-emerald-800"
            }`}
          >
            {isLoading ? "Searching..." : "Ready"}
          </span>
        </div>
      </div>
    </Card>
  );
}

function QuickSection({
  icon: Icon,
  title,
  items,
  onClick,
}: {
  icon: typeof Search;
  title: string;
  items: string[];
  onClick: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
        <Icon className="h-4 w-4 text-amber-700/70" />
        {title}
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Button
            key={item}
            type="button"
            onClick={() => onClick(item)}
            variant="secondary"
            className="rounded-full"
            style={{ fontFamily: "'Nunito', var(--font-geist-sans)" }}
          >
            {item}
          </Button>
        ))}
      </div>
    </div>
  );
}
