"use client";

import type { SetExerciseDefinition } from "@/types/set";
import { SetMain } from "./SetMain";

type SetPageClientProps = {
  initialExercises: SetExerciseDefinition[];
};

export function SetPageClient({ initialExercises }: SetPageClientProps) {
  return <SetMain initialExercises={initialExercises} />;
}
