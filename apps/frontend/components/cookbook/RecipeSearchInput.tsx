"use client";

import { Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type RecipeSearchInputProps = {
  query: string;
  isLoading: boolean;
  recentQueries: string[];
  onQueryChange: (value: string) => void;
  onApplySuggestion: (value: string) => void;
};

const QUICK_SEARCHES = [
  "high protein chicken",
  "healthy salmon bowl",
  "easy oatmeal breakfast",
  "balanced rice meal",
  "vegetarian gym dinner",
];

export function RecipeSearchInput({
  query,
  isLoading,
  recentQueries,
  onQueryChange,
  onApplySuggestion,
}: RecipeSearchInputProps) {
  return (
    <Card className="border-white/70 bg-white/80">
      <CardHeader className="pb-4">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800">
          <Sparkles className="h-3.5 w-3.5" />
          Recipe discovery
        </div>
        <CardTitle style={{ fontFamily: "'Sora', var(--font-geist-sans)" }}>
          Find healthy meals you can actually cook
        </CardTitle>
        <CardDescription>
          Search by ingredients, meal style, or fitness goal. The backend checks cache first,
          then Spoonacular, then TheMealDB if needed.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-stone-700">
            Search healthy recipes
          </span>
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <Input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Try “high protein chicken” or “healthy pasta”"
              aria-label="Search healthy recipes"
              className="h-12 rounded-[1.4rem] border-stone-200 pl-11"
            />
          </div>
        </label>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
            Quick ideas
          </p>
          <div className="flex flex-wrap gap-2">
            {QUICK_SEARCHES.map((suggestion) => (
              <Button
                key={suggestion}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onApplySuggestion(suggestion)}
                className="rounded-full border-stone-200 bg-white/70"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>

        {recentQueries.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              Recent searches
            </p>
            <div className="flex flex-wrap gap-2">
              {recentQueries.map((item) => (
                <Button
                  key={item}
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onApplySuggestion(item)}
                  className="rounded-full bg-stone-100/80 text-stone-700 hover:bg-stone-200"
                >
                  {item}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-[1.4rem] border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-900">
          {isLoading
            ? "Searching recipes from cache and external sources..."
            : "Search results are capped and cached to keep the page fast even with API limits."}
        </div>
      </CardContent>
    </Card>
  );
}
