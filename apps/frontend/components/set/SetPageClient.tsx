"use client";

import type { SetExerciseDefinition } from "@/types/set";
import { SetMain } from "./SetMain";

type SetPageClientProps = {
  initialExercises: SetExerciseDefinition[];
  userRole?: string;
};

export function SetPageClient({ initialExercises, userRole }: SetPageClientProps) {
  return <SetMain initialExercises={initialExercises} userRole={userRole} />;
}
