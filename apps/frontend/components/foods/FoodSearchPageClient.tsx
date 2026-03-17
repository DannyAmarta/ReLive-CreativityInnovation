"use client";

import { useEffect, useState } from "react";
import { FoodSearchExperience } from "./FoodSearchExperience";

type FoodSearchPageClientProps = {
  initialQuery?: string;
  initialRecipeId?: string;
};

export function FoodSearchPageClient({
  initialQuery,
  initialRecipeId,
}: FoodSearchPageClientProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.28),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(134,239,172,0.18),_transparent_22%),linear-gradient(180deg,_#fff8eb_0%,_#f5efe4_40%,_#efe3d2_100%)] px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <section className="rounded-[2.6rem] border border-white/65 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(255,248,235,0.78))] px-6 py-8 shadow-[0_35px_120px_rgba(94,72,36,0.16)] backdrop-blur-xl sm:px-8 sm:py-10 lg:px-12">
            <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="space-y-4">
                <div className="h-10 w-40 animate-pulse rounded-full bg-amber-100" />
                <div className="h-14 w-full max-w-3xl animate-pulse rounded-3xl bg-stone-200/80" />
                <div className="h-6 w-full max-w-2xl animate-pulse rounded-2xl bg-stone-200/70" />
              </div>
              <div className="h-52 animate-pulse rounded-[2rem] bg-stone-900" />
            </div>
          </section>

          <div className="mt-8 grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
            <div className="space-y-6">
              <div className="h-80 animate-pulse rounded-[2rem] bg-white/70" />
              <div className="h-96 animate-pulse rounded-[2rem] bg-white/70" />
              <div className="h-80 animate-pulse rounded-[2rem] bg-white/70" />
            </div>
            <div className="h-[60rem] animate-pulse rounded-[2rem] bg-white/70" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <FoodSearchExperience initialQuery={initialQuery} initialRecipeId={initialRecipeId} />
  );
}
