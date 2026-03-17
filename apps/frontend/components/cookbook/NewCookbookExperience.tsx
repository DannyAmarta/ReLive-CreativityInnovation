"use client";

import Link from "next/link";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenText,
  ChefHat,
  Clock3,
  Database,
  Dumbbell,
  ExternalLink,
  Flame,
  ListChecks,
  NotebookPen,
  ScrollText,
  Search,
  Sparkles,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useRecipeSearch } from "@/hooks/useRecipeSearch";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";
import type { Recipe } from "@/types/recipe";

const RECENT_RECIPE_QUERIES_KEY = "recipe-search-recent-queries";

type NewCookbookExperienceProps = {
  initialQuery?: string;
  initialRecipeId?: string;
};

export function NewCookbookExperience({
  initialQuery = "",
  initialRecipeId,
}: NewCookbookExperienceProps) {
  const {
    query,
    results,
    meta,
    page,
    hasNextPage,
    hasPreviousPage,
    isLoading,
    error,
    setQuery,
    nextPage,
    previousPage,
  } = useRecipeSearch(initialQuery);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [recentQueries, setRecentQueries] = useLocalStorageState<string[]>(
    RECENT_RECIPE_QUERIES_KEY,
    [],
  );
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    if (results.length === 0) {
      setSelectedRecipe(null);
      return;
    }

    setSelectedRecipe((current) => {
      if (initialRecipeId) {
        const initialMatch = results.find((item) => item.id === initialRecipeId);
        if (initialMatch) {
          return initialMatch;
        }
      }

      if (!current) {
        return results[0];
      }

      return results.find((item) => item.id === current.id) ?? results[0];
    });
  }, [initialRecipeId, results]);

  useEffect(() => {
    const normalizedQuery = query.trim();
    if (!normalizedQuery || normalizedQuery.length < 2 || !meta || meta.items.length === 0) {
      return;
    }

    setRecentQueries((current) => {
      const withoutDuplicate = current.filter((item) => item !== normalizedQuery);
      return [normalizedQuery, ...withoutDuplicate].slice(0, 6);
    });
  }, [meta, query, setRecentQueries]);

  const normalizedQuery = query.trim();
  const sourceLabel = meta ? formatSourceLabel(meta.sourceUsed) : "Waiting";
  const recipeCountLabel = meta ? `${meta.totalReturned} recipes loaded` : "Search to begin";
  const foodsHref = normalizedQuery ? `/foods?query=${encodeURIComponent(normalizedQuery)}` : "/foods";

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,_rgba(252,236,204,0.16),_transparent_22%),radial-gradient(circle_at_20%_20%,_rgba(136,67,32,0.25),_transparent_28%),radial-gradient(circle_at_85%_15%,_rgba(110,36,18,0.28),_transparent_24%),linear-gradient(180deg,_#1b120c_0%,_#2a180f_36%,_#120b07_100%)] px-4 py-8 text-stone-950 sm:px-6 lg:px-10">
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute left-[8%] top-24 h-56 w-56 rounded-full bg-amber-300/10 blur-3xl"
          animate={{ opacity: [0.35, 0.8, 0.35], scale: [1, 1.14, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-[6%] top-56 h-72 w-72 rounded-full bg-rose-400/10 blur-3xl"
          animate={{ opacity: [0.25, 0.65, 0.25], scale: [1, 1.08, 1] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-x-0 top-0 h-64 bg-[linear-gradient(180deg,rgba(255,241,213,0.08),transparent)]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <ScrollSection
          scrollProgress={scrollYProgress}
          eyebrow="New cookbook route"
          title="A living parchment for recipe discovery"
          description="This keeps the same recipe backend but replaces the simple layout with a long-form scroll design inspired by the old fantasy cookbook."
        >
          <div className="grid gap-6 lg:grid-cols-[1.18fr_0.82fr]">
            <div className="space-y-5">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.26em] text-amber-900/70">
                  Search healthy recipes
                </span>
                <div className="mt-3 flex items-center gap-3 rounded-[1.8rem] border border-amber-950/15 bg-white/55 px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] backdrop-blur-sm">
                  <Search className="h-5 w-5 text-amber-900/60" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search grilled chicken, oats, rice bowl..."
                    className="w-full bg-transparent text-base text-stone-900 outline-none placeholder:text-stone-500"
                    aria-label="Search recipes"
                  />
                </div>
              </label>

              <div className="flex flex-wrap gap-2">
                {recentQueries.length > 0 ? (
                  recentQueries.map((recentQuery) => (
                    <button
                      key={recentQuery}
                      type="button"
                      onClick={() => setQuery(recentQuery)}
                      className="rounded-full border border-amber-900/15 bg-white/55 px-3 py-1.5 text-sm text-stone-700 transition hover:border-amber-900/30 hover:bg-white/80"
                    >
                      {recentQuery}
                    </button>
                  ))
                ) : (
                  <span className="text-sm text-stone-600">
                    Recent recipe searches will appear here after you search.
                  </span>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <StatusCard
                  icon={<Database className="h-4 w-4" />}
                  label="Search flow"
                  value="DB -> Spoonacular -> TheMealDB"
                />
                <StatusCard
                  icon={<Sparkles className="h-4 w-4" />}
                  label="Source"
                  value={sourceLabel}
                />
                <StatusCard
                  icon={<BookOpenText className="h-4 w-4" />}
                  label="Loaded"
                  value={recipeCountLabel}
                />
              </div>
            </div>

            <div className="rounded-[2rem] border border-amber-950/15 bg-[linear-gradient(145deg,rgba(72,38,23,0.96),rgba(39,18,11,0.96))] px-5 py-5 text-amber-50 shadow-[0_20px_55px_rgba(17,10,6,0.35)]">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-white/10 p-3">
                  <ScrollText className="h-7 w-7 text-amber-200" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-amber-200/65">
                    Design direction
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-amber-50">
                    Scroll instead of a flat dashboard
                  </h2>
                </div>
              </div>
              <div className="mt-5 space-y-3 text-sm leading-7 text-amber-100/80">
                <p>
                  The route is now structured like an animated parchment so long recipe
                  content feels intentional instead of stretched inside generic cards.
                </p>
                <p>
                  This is a new component only. The previous cookbook implementation stays
                  untouched for comparison and future reuse.
                </p>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href={foodsHref}
                  className="inline-flex items-center gap-2 rounded-full bg-amber-200 px-4 py-2 text-sm font-semibold text-stone-900 transition hover:bg-amber-100"
                >
                  <Dumbbell className="h-4 w-4" />
                  Search in foods
                </Link>
                <span className="inline-flex items-center rounded-full border border-white/15 px-4 py-2 text-sm text-amber-100/75">
                  Same backend, new visual shell
                </span>
              </div>
            </div>
          </div>
        </ScrollSection>

        <div className="mt-10 grid gap-8 xl:grid-cols-[0.88fr_1.12fr]">
          <ScrollSection
            scrollProgress={scrollYProgress}
            eyebrow="Recipe index"
            title={normalizedQuery ? `Results for "${normalizedQuery}"` : "Recipe results"}
            description="Select a recipe from the parchment list to inspect ingredients and cooking instructions."
          >
            <div className="space-y-4">
              {!normalizedQuery ? (
                <EmptyMessage
                  title="Start with a recipe idea"
                  description="Try searching for something like chicken rice bowl, overnight oats, or banana smoothie."
                />
              ) : null}

              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 4 }, (_, index) => (
                    <div
                      key={index}
                      className="h-36 animate-pulse rounded-[1.8rem] border border-amber-900/10 bg-white/45"
                    />
                  ))}
                </div>
              ) : null}

              {!isLoading && error ? (
                <EmptyMessage
                  title="Recipe search failed"
                  description={error}
                  tone="error"
                />
              ) : null}

              {!isLoading && !error && normalizedQuery && results.length === 0 ? (
                <EmptyMessage
                  title="No recipes found"
                  description="Try a broader keyword or a simpler food phrase to pull more recipe matches."
                />
              ) : null}

              {!isLoading && !error && results.length > 0 ? (
                <div className="space-y-4">
                  {results.map((recipe, index) => (
                    <RecipeListCard
                      key={recipe.id}
                      recipe={recipe}
                      isSelected={recipe.id === selectedRecipe?.id}
                      index={index}
                      onSelect={() => setSelectedRecipe(recipe)}
                    />
                  ))}
                </div>
              ) : null}

              {meta ? (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-amber-900/10 bg-white/45 px-4 py-3 text-sm text-stone-700">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-900">
                      Page {page}
                    </span>
                    {meta.cacheHit ? (
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800">
                        Cache hit
                      </span>
                    ) : null}
                    {meta.fallbackUsed ? (
                      <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
                        Fallback used
                      </span>
                    ) : null}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={previousPage}
                      disabled={!hasPreviousPage}
                      className="inline-flex items-center gap-2 rounded-full border border-amber-900/15 bg-white/70 px-4 py-2 font-semibold text-stone-800 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Previous
                    </button>
                    <button
                      type="button"
                      onClick={nextPage}
                      disabled={!hasNextPage}
                      className="inline-flex items-center gap-2 rounded-full border border-amber-900/15 bg-white/70 px-4 py-2 font-semibold text-stone-800 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      Next
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </ScrollSection>

          <ScrollSection
            scrollProgress={scrollYProgress}
            eyebrow="Selected recipe"
            title={selectedRecipe ? selectedRecipe.title : "Recipe details"}
            description="Ingredients, nutrition clues, and preparation steps are presented inside a long parchment so the recipe can breathe."
            sticky
          >
            {selectedRecipe ? (
              <RecipeInspector
                recipe={selectedRecipe}
                query={normalizedQuery}
              />
            ) : (
              <EmptyMessage
                title="Pick a recipe"
                description="Once you choose a result from the left side, the full recipe will expand here."
              />
            )}
          </ScrollSection>
        </div>
      </div>
    </main>
  );
}

function ScrollSection({
  scrollProgress,
  eyebrow,
  title,
  description,
  children,
  sticky = false,
}: {
  scrollProgress: MotionValue<number>;
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  sticky?: boolean;
}) {
  const topRollY = useTransform(scrollProgress, [0, 1], [0, -14]);
  const bottomRollY = useTransform(scrollProgress, [0, 1], [0, 18]);
  const paperLift = useTransform(scrollProgress, [0, 1], [0, -8]);

  return (
    <motion.section
      style={{ y: paperLift }}
      className={sticky ? "xl:sticky xl:top-6" : undefined}
    >
      <div className="relative overflow-hidden rounded-[2.6rem] border border-amber-950/20 bg-[linear-gradient(180deg,rgba(247,233,203,0.98),rgba(235,213,173,0.96))] px-5 pb-8 pt-12 shadow-[0_35px_110px_rgba(0,0,0,0.28)] sm:px-7">
        <motion.div
          style={{ y: topRollY }}
          className="pointer-events-none absolute inset-x-8 -top-6 h-12 rounded-full border border-amber-950/20 bg-[linear-gradient(180deg,#c79247,#8b5a24)] shadow-[0_10px_25px_rgba(44,21,8,0.3)]"
        />
        <motion.div
          style={{ y: bottomRollY }}
          className="pointer-events-none absolute inset-x-8 -bottom-6 h-12 rounded-full border border-amber-950/20 bg-[linear-gradient(180deg,#8b5a24,#c79247)] shadow-[0_-10px_25px_rgba(44,21,8,0.25)]"
        />
        <div className="pointer-events-none absolute inset-[10px] rounded-[2.1rem] border border-amber-950/10" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.45),_transparent_34%),linear-gradient(90deg,rgba(140,90,36,0.08)_0,transparent_14%,transparent_86%,rgba(140,90,36,0.08)_100%)]" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-900/15 bg-white/45 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-950/80">
            <ChefHat className="h-3.5 w-3.5" />
            {eyebrow}
          </div>
          <h2 className="mt-4 text-3xl font-semibold leading-tight text-stone-950 sm:text-4xl">
            {title}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-700 sm:text-base">
            {description}
          </p>
        </div>

        <div className="relative mt-8">{children}</div>
      </div>
    </motion.section>
  );
}

function StatusCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-amber-900/10 bg-white/45 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-900/70">
        {icon}
        {label}
      </div>
      <p className="mt-3 text-sm font-semibold text-stone-900">{value}</p>
    </div>
  );
}

function RecipeListCard({
  recipe,
  isSelected,
  index,
  onSelect,
}: {
  recipe: Recipe;
  isSelected: boolean;
  index: number;
  onSelect: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ y: -2, scale: 1.01 }}
      className={`w-full overflow-hidden rounded-[1.8rem] border text-left transition ${
        isSelected
          ? "border-amber-700/35 bg-[linear-gradient(180deg,rgba(255,247,225,0.96),rgba(244,223,178,0.9))] shadow-[0_24px_60px_rgba(92,55,18,0.15)]"
          : "border-amber-900/10 bg-white/48 hover:border-amber-900/20 hover:bg-white/72"
      }`}
    >
      <div className="grid gap-0 md:grid-cols-[11rem_1fr]">
        <div className="relative h-40 overflow-hidden md:h-full">
          <img
            src={recipe.image}
            alt={recipe.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(28,15,8,0.28))]" />
        </div>
        <div className="p-5">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-900/70">
            <span>{formatSourceLabel(recipe.source)}</span>
            {recipe.dietTags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] text-emerald-800"
              >
                {tag}
              </span>
            ))}
          </div>

          <h3 className="mt-3 text-xl font-semibold text-stone-950">{recipe.title}</h3>
          <p className="mt-2 line-clamp-3 text-sm leading-7 text-stone-700">
            {buildRecipePreview(recipe)}
          </p>

          <div className="mt-4 flex flex-wrap gap-2 text-xs text-stone-700">
            <MetricChip icon={<Clock3 className="h-3.5 w-3.5" />}>
              {recipe.cookTime ? `${recipe.cookTime} min` : "Time unknown"}
            </MetricChip>
            <MetricChip icon={<Flame className="h-3.5 w-3.5" />}>
              {recipe.calories ? `${Math.round(recipe.calories)} kcal` : "Calories n/a"}
            </MetricChip>
            <MetricChip icon={<Dumbbell className="h-3.5 w-3.5" />}>
              {recipe.protein ? `${Math.round(recipe.protein)} g protein` : "Protein n/a"}
            </MetricChip>
          </div>
        </div>
      </div>
    </motion.button>
  );
}

function RecipeInspector({
  recipe,
  query,
}: {
  recipe: Recipe;
  query: string;
}) {
  const foodsHref = `/foods?query=${encodeURIComponent(query || recipe.title)}&recipe=${encodeURIComponent(recipe.id)}`;

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-[2rem] border border-amber-900/15 bg-white/40">
        <div className="relative aspect-[16/10] overflow-hidden bg-stone-200">
          <img src={recipe.image} alt={recipe.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(27,15,8,0.35))]" />
          <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-black/55 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-50 backdrop-blur-sm">
              {formatSourceLabel(recipe.source)}
            </span>
            {recipe.dietTags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-emerald-100/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-900"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <DetailStat
              icon={<Clock3 className="h-4 w-4" />}
              label="Cook time"
              value={recipe.cookTime ? `${recipe.cookTime} min` : "Unknown"}
            />
            <DetailStat
              icon={<Flame className="h-4 w-4" />}
              label="Calories"
              value={recipe.calories ? `${Math.round(recipe.calories)} kcal` : "--"}
            />
            <DetailStat
              icon={<Dumbbell className="h-4 w-4" />}
              label="Protein"
              value={recipe.protein ? `${Math.round(recipe.protein)} g` : "--"}
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href={foodsHref}
              className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-4 py-2 text-sm font-semibold text-stone-50 transition hover:bg-stone-800"
            >
              <Dumbbell className="h-4 w-4" />
              Search in foods
            </Link>
            {recipe.sourceUrl ? (
              <button
                type="button"
                onClick={() =>
                  window.open(recipe.sourceUrl ?? "", "_blank", "noopener,noreferrer")
                }
                className="inline-flex items-center gap-2 rounded-full border border-amber-900/15 bg-white/70 px-4 py-2 text-sm font-semibold text-stone-900 transition hover:bg-white"
              >
                <ExternalLink className="h-4 w-4" />
                Open original recipe
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[1.9rem] border border-amber-900/10 bg-white/40 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-amber-900/75">
            <ListChecks className="h-4 w-4" />
            Ingredients
          </div>
          <ul className="mt-4 space-y-3">
            {recipe.ingredients.map((ingredient) => (
              <li key={ingredient}>
                <Link
                  href={`/foods?query=${encodeURIComponent(extractIngredientSearchTerm(ingredient))}&recipe=${encodeURIComponent(recipe.id)}`}
                  className="block rounded-[1.2rem] border border-amber-900/10 bg-[rgba(255,250,241,0.82)] px-4 py-3 text-sm leading-6 text-stone-800 transition hover:border-amber-900/20 hover:bg-white"
                >
                  {ingredient}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-[1.9rem] border border-amber-900/10 bg-white/40 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-amber-900/75">
            <NotebookPen className="h-4 w-4" />
            Instructions
          </div>
          <div className="mt-4 whitespace-pre-line rounded-[1.35rem] border border-amber-900/10 bg-[rgba(255,250,241,0.82)] px-4 py-4 text-sm leading-7 text-stone-800">
            {recipe.instructions}
          </div>
        </section>
      </div>
    </div>
  );
}

function DetailStat({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.4rem] border border-amber-900/10 bg-white/55 px-4 py-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-900/70">
        {icon}
        {label}
      </div>
      <p className="mt-3 text-base font-semibold text-stone-950">{value}</p>
    </div>
  );
}

function MetricChip({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-900/10 bg-amber-50 px-3 py-1.5">
      {icon}
      {children}
    </span>
  );
}

function EmptyMessage({
  title,
  description,
  tone = "default",
}: {
  title: string;
  description: string;
  tone?: "default" | "error";
}) {
  return (
    <div
      className={`rounded-[1.8rem] border px-5 py-8 text-center ${
        tone === "error"
          ? "border-rose-300 bg-rose-50/80 text-rose-800"
          : "border-amber-900/10 bg-white/45 text-stone-700"
      }`}
    >
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-7">{description}</p>
    </div>
  );
}

function buildRecipePreview(recipe: Recipe) {
  const ingredientText = recipe.ingredients.slice(0, 3).join(", ");
  if (ingredientText) {
    return ingredientText;
  }

  return "Ingredients and instructions are available in the detail panel.";
}

function formatSourceLabel(source: string) {
  if (source === "THE_MEAL_DB") {
    return "TheMealDB";
  }

  if (source === "SPOONACULAR") {
    return "Spoonacular";
  }

  if (source === "DATABASE") {
    return "Database";
  }

  return source;
}

function extractIngredientSearchTerm(value: string) {
  return value
    .replace(/^\d+([./]\d+)?\s*/g, "")
    .replace(/\b(cup|cups|tbsp|tsp|g|kg|ml|l|oz|lb|lbs)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}
