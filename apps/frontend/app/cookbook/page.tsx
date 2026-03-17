import { CookbookExperience } from "@/components/cookbook/CookbookExperience";
import { NewCookBook2 } from "@/components/cookbook/NewCookBook2";

export default async function CookbookPage({
  searchParams,
}: {
  searchParams?: Promise<{ query?: string; recipe?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  return (
    <>
      
      <CookbookExperience
        initialQuery={resolvedSearchParams?.query}
        initialRecipeId={resolvedSearchParams?.recipe}
      />

      {/*
      <NewCookbookExperience
        initialQuery={resolvedSearchParams?.query}
        initialRecipeId={resolvedSearchParams?.recipe}
      />
      */}

      {/* <NewCookBook2
        initialQuery={resolvedSearchParams?.query}
        initialRecipeId={resolvedSearchParams?.recipe}
      /> */}
    </>
  );
}
