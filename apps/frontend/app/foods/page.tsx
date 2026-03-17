import type { Metadata } from "next";
import { FoodSearchPageClient } from "@/components/foods/FoodSearchPageClient";

export const metadata: Metadata = {
  title: "Foods | ReLive",
  description: "Search foods and inspect nutrition details by serving size.",
};

export default async function FoodsPage({
  searchParams,
}: {
  searchParams?: Promise<{ query?: string; recipe?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  return (
    <FoodSearchPageClient
      initialQuery={resolvedSearchParams?.query}
      initialRecipeId={resolvedSearchParams?.recipe}
    />
  );
}
