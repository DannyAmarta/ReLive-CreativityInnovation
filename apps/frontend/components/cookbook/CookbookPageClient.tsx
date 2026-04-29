"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

type CookbookPageClientProps = {
  initialQuery?: string;
  initialRecipeId?: string;
};

function CookbookSkeleton() {
  return (
    <div className="min-h-screen bg-[#FFFAFB] overflow-hidden">
      {/* Skeleton Background Blobs (Static) */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute -left-[10%] -top-[10%] h-[50vh] w-[50vw] rounded-full bg-[#FFB7C5]/10 blur-[80px]" />
        <div className="absolute -bottom-[10%] -right-[10%] h-[50vh] w-[50vw] rounded-full bg-[#FFE4EE]/10 blur-[80px]" />
      </div>

      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        {/* Badge Skeleton */}
        <div className="mb-8 h-10 w-64 animate-pulse rounded-full bg-[#FFB7C5]/20" />
        {/* Title Skeleton */}
        <div className="h-16 w-full max-w-2xl animate-pulse rounded-2xl bg-[#1a0a12]/5" />
        <div className="mt-4 h-16 w-3/4 max-w-xl animate-pulse rounded-2xl bg-[#1a0a12]/5" />
        {/* Description Skeleton */}
        <div className="mt-8 h-6 w-full max-w-lg animate-pulse rounded-lg bg-[#6b3550]/10" />
      </div>

      {/* Search Bar Skeleton */}
      <div className="mx-auto max-w-3xl px-4">
        <div className="h-16 w-full animate-pulse rounded-2xl border border-white bg-white/40 shadow-sm" />
      </div>
    </div>
  );
}

const CookbookExperience = dynamic(
  () => import("./CookbookMain").then((mod) => mod.CookbookMain),
  { 
    ssr: false, 
    loading: () => <CookbookSkeleton /> 
  }
);

export function CookbookPageClient({ initialQuery, initialRecipeId }: CookbookPageClientProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <CookbookSkeleton />;

  return (
    <CookbookExperience 
      initialQuery={initialQuery} 
      initialRecipeId={initialRecipeId} 
    />
  );
}