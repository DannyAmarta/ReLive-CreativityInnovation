"use client";

import { ChevronLeft, ChevronRight, Database, Salad, ShieldCheck } from "lucide-react";
import { FoodCard } from "./FoodCard";
import type { Food, FoodSearchResponse } from "@/types/food";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type FoodResultListProps = {
  items: Food[];
  meta: FoodSearchResponse | null;
  isLoading: boolean;
  error: string | null;
  hasQuery: boolean;
  selectedFoodId: string | null;
  favoriteIds: string[];
  page: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onSelectFood: (food: Food) => void;
  onToggleFavorite: (food: Food) => void;
  onAddToMeal: (food: Food) => void;
  onNextPage: () => void;
  onPreviousPage: () => void;
};

export function FoodResultList({
  items,
  meta,
  isLoading,
  error,
  hasQuery,
  selectedFoodId,
  favoriteIds,
  page,
  hasNextPage,
  hasPreviousPage,
  onSelectFood,
  onToggleFavorite,
  onAddToMeal,
  onNextPage,
  onPreviousPage,
}: FoodResultListProps) {
  return (
    <section
      aria-labelledby="food-results-heading"
      className="rounded-[2rem] border border-stone-900/10 bg-stone-950/[0.06] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] sm:p-4"
    >
      <Card className="p-5 sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-500"
              style={{ fontFamily: "'Sora', var(--font-geist-sans)" }}
            >
              Search Results
            </p>
            <h2
              id="food-results-heading"
              className="mt-2 text-2xl font-semibold text-stone-950"
              style={{ fontFamily: "'Sora', var(--font-geist-sans)" }}
            >
              Nutrition matches
            </h2>
          </div>

          {meta ? (
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              <StatusPill icon={Database} label={meta.cacheHit ? "Cache hit" : "Fresh fetch"} />
              <StatusPill icon={ShieldCheck} label={`Source: ${meta.sourceUsed}`} />
              <StatusPill
                icon={Salad}
                label={`${meta.totalReturned} result${meta.totalReturned === 1 ? "" : "s"}`}
              />
            </div>
          ) : null}
        </div>

        {error ? (
          <div
            role="alert"
            className="mb-4 rounded-[1.5rem] border border-rose-200 bg-rose-50 p-4 text-rose-700"
          >
            {error}
          </div>
        ) : null}

        {!hasQuery && !error ? (
          <EmptyState
            title="Start with a food name"
            description="Try gym staples like chicken breast, rice, eggs, oats, or banana."
          />
        ) : null}

        {hasQuery && !isLoading && items.length === 0 && !error ? (
          <EmptyState
            title="No foods matched that search"
            description="Try a broader term, a brand name, or another common spelling."
          />
        ) : null}

        <div
          aria-live="polite"
          aria-busy={isLoading}
          className="max-h-[42rem] space-y-3 overflow-y-auto pr-1"
        >
          {isLoading ? (
            Array.from({ length: 4 }).map((_, index) => <FoodCardSkeleton key={index} />)
          ) : (
            items.map((item) => (
              <FoodCard
                key={item.id}
                food={item}
                isSelected={selectedFoodId === item.id}
                isFavorite={favoriteIds.includes(item.id)}
                onSelect={onSelectFood}
                onToggleFavorite={onToggleFavorite}
                onAddToMeal={onAddToMeal}
              />
            ))
          )}
        </div>

        {hasQuery && !isLoading && (items.length > 0 || hasPreviousPage) ? (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-[1.4rem] border border-stone-200 bg-stone-50/75 px-4 py-3">
            <div className="text-sm text-stone-600">
              Page <span className="font-semibold text-stone-950">{page}</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onPreviousPage}
                disabled={!hasPreviousPage}
                aria-label="Go to previous page of results"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                type="button"
                onClick={onNextPage}
                disabled={!hasNextPage}
                aria-label="Go to next page of results"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : null}
      </Card>
    </section>
  );
}

function StatusPill({
  icon: Icon,
  label,
}: {
  icon: typeof Database;
  label: string;
}) {
  return (
    <Badge variant="outline" className="gap-2 normal-case tracking-normal text-xs">
      <Icon className="h-4 w-4" />
      {label}
    </Badge>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-4 rounded-[1.6rem] border border-dashed border-stone-300 bg-stone-50/70 px-5 py-8 text-center">
      <h3
        className="text-lg font-semibold text-stone-900"
        style={{ fontFamily: "'Sora', var(--font-geist-sans)" }}
      >
        {title}
      </h3>
      <p
        className="mt-2 text-sm text-stone-600"
        style={{ fontFamily: "'Nunito', var(--font-geist-sans)" }}
      >
        {description}
      </p>
    </div>
  );
}

function FoodCardSkeleton() {
  return (
    <div className="animate-pulse rounded-[1.5rem] border border-stone-200 bg-stone-100/80 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <div className="h-5 w-44 rounded-full bg-stone-200" />
          <div className="h-4 w-32 rounded-full bg-stone-200" />
        </div>
        <div className="h-20 w-28 rounded-[1.3rem] bg-stone-200" />
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-[4.5rem] rounded-2xl bg-stone-200/80 p-4" />
        ))}
      </div>
      <div className="mt-4 h-16 rounded-[1.3rem] bg-stone-200/90" />
    </div>
  );
}
