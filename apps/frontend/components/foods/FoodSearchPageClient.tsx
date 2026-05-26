"use client";

import { useEffect, useState } from "react";
import { FoodMain } from "./FoodMain";

type FoodSearchPageClientProps = {
  initialQuery?: string;
  initialRecipeId?: string;
  userRole?: string;
};

export function FoodSearchPageClient({ initialQuery, initialRecipeId, userRole }: FoodSearchPageClientProps) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  if (!isMounted) {
    return (
      /* Botanical Mesh Background for Skeleton[cite: 3] */
      <div className="min-h-screen bg-[#F7F9F7]">
        <div className="flex min-h-[58vh] flex-col items-center justify-center gap-6 px-6">
          <div className="h-8 w-52 animate-pulse rounded-full bg-[#D1E2C4]/40" />
          <div className="h-16 w-full max-w-2xl animate-pulse rounded-3xl bg-[#D1E2C4]/30" />
          <div className="h-7 w-full max-w-xl animate-pulse rounded-2xl bg-[#D1E2C4]/25" />
        </div>
        {/* Search Bar Skeleton[cite: 3] */}
        <div className="mx-auto max-w-3xl px-4">
          <div className="h-14 animate-pulse rounded-full border border-[#D1E2C4]/30 bg-white/50" />
        </div>
        {/* Bento Card Skeleton[cite: 3] */}
        <div className="mx-auto mt-8 max-w-7xl grid gap-4 sm:grid-cols-2 px-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-52 animate-pulse rounded-[1.8rem] border border-[#D1E2C4]/25 bg-white/50" />
          ))}
        </div>
      </div>
    );
  }

  return <FoodMain initialQuery={initialQuery} initialRecipeId={initialRecipeId} userRole={userRole} />;
}
