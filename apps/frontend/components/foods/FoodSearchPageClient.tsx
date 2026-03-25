"use client";

import { useEffect, useState } from "react";
import { FoodSearchExperience } from "./FoodSearchExperience";

type FoodSearchPageClientProps = {
  initialQuery?: string;
  initialRecipeId?: string;
};

export function FoodSearchPageClient({ initialQuery, initialRecipeId }: FoodSearchPageClientProps) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  if (!isMounted) {
    return (
      // Sakura skeleton — matches the hero layout
      <div className="min-h-screen bg-gradient-to-br from-[#fff5f8] via-[#fde8f0] to-[#f8e0ec]">
        {/* Fake hero */}
        <div className="flex min-h-[58vh] flex-col items-center justify-center gap-6 px-6">
          <div className="h-8 w-52 animate-pulse rounded-full bg-[#FFB7C5]/35" />
          <div className="h-16 w-full max-w-2xl animate-pulse rounded-3xl bg-[#FFB7C5]/25" />
          <div className="h-7 w-full max-w-xl animate-pulse rounded-2xl bg-[#FFB7C5]/20" />
          <div className="mt-4 h-5 w-6 animate-pulse rounded-full bg-[#FFB7C5]/30" />
        </div>
        {/* Fake Dynamic Island search */}
        <div className="mx-auto max-w-3xl px-4">
          <div className="h-14 animate-pulse rounded-full border border-[#FFB7C5]/30 bg-white/50" />
        </div>
        {/* Fake bento cards */}
        <div className="mx-auto mt-8 max-w-7xl grid gap-4 sm:grid-cols-2 px-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-52 animate-pulse rounded-[1.8rem] border border-[#FFB7C5]/25 bg-white/50" />
          ))}
        </div>
      </div>
    );
  }

  return <FoodSearchExperience initialQuery={initialQuery} initialRecipeId={initialRecipeId} />;
}
