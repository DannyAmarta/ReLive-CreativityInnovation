"use client";

import { useEffect, useState } from "react";
import type { SetExerciseDefinition } from "@/types/set";
import { SetCalculatorPageClient } from "./SetCalculatorPageClient";

type SetPageClientProps = {
  initialExercises: SetExerciseDefinition[];
};

export function SetPageClient({ initialExercises }: SetPageClientProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,_#fffdf7_0%,_#fffaf0_46%,_#ffffff_100%)] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-stone-200 bg-white/90 p-8 shadow-sm">
          <div className="space-y-4">
            <div className="h-5 w-24 rounded-full bg-stone-200/80" />
            <div className="h-12 w-3/4 rounded-[1rem] bg-stone-200/70" />
            <div className="h-24 rounded-[1.5rem] bg-stone-100/80" />
            <div className="h-64 rounded-[1.5rem] bg-stone-100/80" />
          </div>
        </div>
      </div>
    );
  }

  return <SetCalculatorPageClient initialExercises={initialExercises} />;
}
