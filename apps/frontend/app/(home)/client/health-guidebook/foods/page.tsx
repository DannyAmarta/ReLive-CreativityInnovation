import { redirect } from "next/navigation";

export default async function FoodsPage({
  searchParams,
}: {
  searchParams?: Promise<{ query?: string; recipe?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams?.query ? `?query=${encodeURIComponent(resolvedSearchParams.query)}` : "";
  const recipe = resolvedSearchParams?.recipe ? `${query ? "&" : "?"}recipe=${encodeURIComponent(resolvedSearchParams.recipe)}` : "";
  redirect(`/foods${query}${recipe}`);
}
