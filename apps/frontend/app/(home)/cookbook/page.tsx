import { CookbookPageClient } from "@/components/cookbook/CookbookPageClient";
import { getSession } from "@/lib/session.server";

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
  const session = await getSession();
  const userRole = session?.user?.role;
  return (
    <CookbookPageClient
      initialQuery={resolvedSearchParams?.query}
      initialRecipeId={resolvedSearchParams?.recipe}
      userRole={userRole}
    />
  );
}
