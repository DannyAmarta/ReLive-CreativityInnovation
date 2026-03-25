"use client";

import { useEffect, useState } from "react";
import { CookbookExperience } from "./CookbookExperience";

type CookbookPageClientProps = {
  initialQuery?: string;
  initialRecipeId?: string;
};

export function CookbookPageClient({
  initialQuery,
  initialRecipeId,
}: CookbookPageClientProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(123,31,162,0.32),_transparent_24%),linear-gradient(180deg,_#080510_0%,_#16091e_52%,_#080510_100%)]">
        <div className="flex min-h-[58vh] flex-col items-center justify-center gap-6 px-6 text-center">
          <div className="h-8 w-48 animate-pulse rounded-full bg-fuchsia-200/20" />
          <div className="h-16 w-full max-w-3xl animate-pulse rounded-3xl bg-fuchsia-200/15" />
          <div className="h-7 w-full max-w-xl animate-pulse rounded-2xl bg-fuchsia-100/10" />
          <div className="mt-4 h-5 w-6 animate-pulse rounded-full bg-fuchsia-200/20" />
        </div>

        <div className="mx-auto max-w-3xl px-4">
          <div className="h-56 animate-pulse rounded-[2rem] border border-fuchsia-200/15 bg-white/5" />
        </div>

        <div className="mx-auto mt-8 max-w-7xl px-4">
          <div className="grid gap-4 lg:grid-cols-[0.72fr_1.28fr]">
            <div className="h-80 animate-pulse rounded-[2rem] border border-fuchsia-200/15 bg-white/5" />
            <div className="h-[32rem] animate-pulse rounded-[2rem] border border-fuchsia-200/15 bg-white/5" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <CookbookExperience
      initialQuery={initialQuery}
      initialRecipeId={initialRecipeId}
    />
  );
}
