"use client";

import type { SetExerciseDefinition } from "@/types/set";
import { SetExperience } from "./SetExperience";

type SetPageClientProps = {
  initialExercises: SetExerciseDefinition[];
};

export function SetPageClient({ initialExercises }: SetPageClientProps) {
  return <SetExperience initialExercises={initialExercises} />;
}
