import { CookbookPageClient } from "@/components/cookbook/CookbookPageClient";

export const metadata = {
  title: "Cookbook | ReLive",
  description:
    "Discover healthy recipes, ingredients, and macros in a focused single-column cookbook experience.",
};

export default async function CookbookPage({
  searchParams,
}: {
  searchParams?: Promise<{ query?: string; recipe?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#fffaf4]">
      <CookbookPageClient
        initialQuery={resolvedSearchParams?.query}
        initialRecipeId={resolvedSearchParams?.recipe}
      />
    </div>
  );
}

