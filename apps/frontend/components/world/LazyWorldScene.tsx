"use client";

import dynamic from "next/dynamic";

// Lazy-load WorldScene: defers Vanta Clouds + Birds (Three.js ~600KB CDN)
// and AstrolabeProfile so the sky-blue shell renders within <1s.
export const LazyWorldScene = dynamic(
  () =>
    import("@/components/world/WorldScene").then((m) => ({
      default: m.WorldScene,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-[#87CEEB]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-white/40 border-t-white" />
          <p className="text-white/80 font-semibold tracking-widest uppercase text-sm">
            Loading World…
          </p>
        </div>
      </div>
    ),
  }
);
