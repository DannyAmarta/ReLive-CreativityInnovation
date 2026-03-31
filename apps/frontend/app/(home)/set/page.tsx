import type { Metadata } from "next";
import { print } from "graphql";
import { SetPageClient } from "@/components/set/SetPageClient";
import { fetchGraphql } from "@/lib/fetchGraphQL";
import { GET_SET_EXERCISES_QUERY } from "@/lib/gqlQueries";
import { FALLBACK_SET_EXERCISES } from "@/lib/set/catalog";
import type { SetExerciseDefinition } from "@/types/set";

export const metadata: Metadata = {
  title: "Set Lab | ReLive",
  description:
    "Estimate, save, and turn your latest sets into safer backend-guided workout recommendations.",
};

type GetSetExercisesResult = {
  setExercises: SetExerciseDefinition[];
};

export default async function SetPage() {
  let exercises = FALLBACK_SET_EXERCISES;

  try {
    const data = await fetchGraphql<GetSetExercisesResult>(
      print(GET_SET_EXERCISES_QUERY),
    );
    exercises =
      data?.setExercises && data.setExercises.length > 0
        ? data.setExercises
        : FALLBACK_SET_EXERCISES;
  } catch {
    exercises = FALLBACK_SET_EXERCISES;
  }

  return <SetPageClient initialExercises={exercises} />;
}
