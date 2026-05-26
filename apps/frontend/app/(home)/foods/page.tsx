import type { Metadata } from "next";
import { FoodSearchPageClient } from "@/components/foods/FoodSearchPageClient";
import { getSession } from "@/lib/session.server";

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
  const session = await getSession();
  const userRole = session?.user?.role;
  return (
    <FoodSearchPageClient
      initialQuery={resolvedSearchParams?.query}
      initialRecipeId={resolvedSearchParams?.recipe}
      userRole={userRole}
    />
  );
}
