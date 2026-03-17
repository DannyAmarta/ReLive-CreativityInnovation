"use client";

import Image from "next/image";
import Link from "next/link";
import { loadAll } from "@tsparticles/all";
import type { ISourceOptions } from "@tsparticles/engine";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BookHeart,
  ChefHat,
  Clock3,
  Database,
  Dumbbell,
  ExternalLink,
  Flame,
  Leaf,
  ListChecks,
  NotebookPen,
  Search,
  Sparkles,
  Stars,
  UtensilsCrossed,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";
import { useRecipeSearch } from "@/hooks/useRecipeSearch";
import type { Recipe } from "@/types/recipe";

const RECENT_RECIPE_QUERIES_KEY = "recipe-search-recent-queries";
const BLOSSOM_TREE_FILTER =
  "hue-rotate(300deg) saturate(1.45) brightness(1.08) drop-shadow(0 0 42px rgba(255,170,210,0.28))";

type NewCookBook2Props = {
  initialQuery?: string;
  initialRecipeId?: string;
};

export function NewCookBook2({
  initialQuery = "",
  initialRecipeId,
}: NewCookBook2Props) {
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
  const [particlesReady, setParticlesReady] = useState(false);
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadAll(engine);
    }).then(() => {
      setParticlesReady(true);
    });
  }, []);

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
  const activeFoodsHref = normalizedQuery
    ? `/foods?query=${encodeURIComponent(normalizedQuery)}${
        selectedRecipe ? `&recipe=${encodeURIComponent(selectedRecipe.id)}` : ""
      }`
    : "/foods";
  const particleOptions = useMemo<ISourceOptions>(() => buildSakuraParticleOptions(), []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#130b18_0%,#1e1124_28%,#2f1535_58%,#180c19_100%)] text-white">
      <HanamiBackdrop scrollProgress={scrollYProgress} />

      {particlesReady ? (
        <div className="pointer-events-none absolute inset-0 z-20">
          <Particles id="hanami-petals" options={particleOptions} />
        </div>
      ) : null}

      <div className="relative z-30 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-10">
        <section className="relative min-h-[88vh] overflow-hidden rounded-[2.8rem] border border-white/10 shadow-[0_40px_160px_rgba(13,4,17,0.58)]">
          <HeroSceneLayer scrollProgress={scrollYProgress} />

          <div className="relative grid min-h-[88vh] gap-8 px-5 py-6 sm:px-8 sm:py-8 lg:grid-cols-[1.08fr_0.92fr] lg:px-10 lg:py-10">
            <div className="flex flex-col justify-between gap-8">
              <motion.div
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-3xl"
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-pink-50/90 backdrop-blur-xl">
                  <Sparkles className="h-4 w-4" />
                  Hanami Cookbook
                </div>
                <h1
                  className="mt-5 text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl"
                  style={{ fontFamily: "'Sora', var(--font-geist-sans)" }}
                >
                  A moonlit sakura garden for discovering meals worth cooking.
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-8 text-pink-50/76 sm:text-lg">
                  This version is intentionally overbuilt: floating petals, layered scenery,
                  animated glass, cinematic depth, and still the same recipe backend under
                  the surface. It should feel like entering a place, not opening a tool.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 36 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.12 }}
                className="rounded-[2.2rem] border border-white/12 bg-[linear-gradient(155deg,rgba(255,255,255,0.16),rgba(255,255,255,0.05))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_25px_90px_rgba(18,8,20,0.42)] backdrop-blur-2xl sm:p-5"
              >
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-[0.22em] text-pink-50/70">
                    Search the garden archive
                  </span>
                  <div className="mt-3 flex items-center gap-3 rounded-[1.7rem] border border-white/10 bg-[linear-gradient(145deg,rgba(76,26,70,0.45),rgba(20,18,45,0.42))] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                    <Search className="h-5 w-5 text-pink-100/80" />
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search teriyaki salmon, blossom oats, spring rice bowl..."
                      aria-label="Search recipes"
                      className="w-full bg-transparent text-base text-white outline-none placeholder:text-pink-100/35"
                    />
                  </div>
                </label>

                <div className="mt-4 flex flex-wrap gap-2">
                  {recentQueries.length > 0 ? (
                    recentQueries.map((recentQuery) => (
                      <motion.button
                        key={recentQuery}
                        type="button"
                        onClick={() => setQuery(recentQuery)}
                        whileHover={{ y: -2, scale: 1.02 }}
                        className="rounded-full border border-white/12 bg-white/10 px-3 py-1.5 text-sm text-white/88 backdrop-blur-md transition hover:border-pink-200/30 hover:bg-white/14"
                      >
                        {recentQuery}
                      </motion.button>
                    ))
                  ) : (
                    <p className="text-sm text-pink-50/56">
                      Your recent searches will bloom here once you start exploring.
                    </p>
                  )}
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href={activeFoodsHref}
                    className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#ffd0e3,#f7a8d0)] px-4 py-2 text-sm font-semibold text-[#341022] transition hover:brightness-105"
                  >
                    <Dumbbell className="h-4 w-4" />
                    Open in foods
                  </Link>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 py-2 text-sm text-white/82 backdrop-blur-md">
                    <Database className="h-4 w-4 text-pink-100/80" />
                    DB -&gt; Spoonacular -&gt; TheMealDB
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="grid content-start gap-4 self-end lg:pb-6">
              <OrbitCard
                title="Current recipe source"
                value={meta ? formatSourceLabel(meta.sourceUsed) : "Waiting"}
                description={
                  meta?.fallbackUsed
                    ? "This search used the fallback route and was still normalized into the same recipe shape."
                    : "Primary route is ready. Start searching to populate the cookbook."
                }
                icon={<Stars className="h-5 w-5" />}
                tone="violet"
              />
              <OrbitCard
                title="Selected path"
                value={selectedRecipe ? selectedRecipe.title : "No recipe selected yet"}
                description="The current featured recipe becomes the active destination for ingredients and instructions."
                icon={<BookHeart className="h-5 w-5" />}
                tone="rose"
              />
              <OrbitCard
                title="Loaded results"
                value={meta ? `${meta.totalReturned} recipes` : "Search to begin"}
                description="The result deck below is animated like floating recipe cards inside the garden."
                icon={<UtensilsCrossed className="h-5 w-5" />}
                tone="blue"
              />
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <HanamiPanel
            eyebrow="Recipe deck"
            title={normalizedQuery ? `Blooming results for "${normalizedQuery}"` : "Recipe deck"}
            subtitle="Hover and select from the floating cards. The goal is to make browsing feel tactile and alive, not flat."
          >
            {!normalizedQuery ? (
              <SceneMessage
                title="Start with a meal idea"
                description="Search something like salmon rice bowl, overnight oats, grilled tofu, or chicken teriyaki."
              />
            ) : null}

            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }, (_, index) => (
                  <div
                    key={index}
                    className="h-44 animate-pulse rounded-[2rem] border border-white/10 bg-white/8"
                  />
                ))}
              </div>
            ) : null}

            {!isLoading && error ? (
              <SceneMessage title="Recipe search failed" description={error} tone="error" />
            ) : null}

            {!isLoading && !error && normalizedQuery && results.length === 0 ? (
              <SceneMessage
                title="No recipes opened"
                description="Try a simpler ingredient or a broader dish phrase so the recipe providers can match more results."
              />
            ) : null}

            {!isLoading && !error && results.length > 0 ? (
              <div className="space-y-4">
                {results.map((recipe, index) => (
                  <HanamiRecipeCard
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
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-[1.8rem] border border-white/10 bg-white/8 px-4 py-4 backdrop-blur-xl">
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-pink-50/78">
                  <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1">
                    Page {page}
                  </span>
                  {meta.cacheHit ? (
                    <span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-emerald-100">
                      Cache hit
                    </span>
                  ) : null}
                  {meta.fallbackUsed ? (
                    <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-amber-100">
                      Fallback used
                    </span>
                  ) : null}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={previousPage}
                    disabled={!hasPreviousPage}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/14 disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={nextPage}
                    disabled={!hasNextPage}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/14 disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : null}
          </HanamiPanel>

          <HanamiPanel
            eyebrow="Recipe sanctum"
            title={selectedRecipe ? selectedRecipe.title : "Select a recipe"}
            subtitle="The selected recipe expands into a more cinematic cooking panel with layered sections, soft motion, and linked nutrition navigation."
            sticky
          >
            <AnimatePresence mode="wait">
              {selectedRecipe ? (
                <RecipeSanctum
                  key={selectedRecipe.id}
                  recipe={selectedRecipe}
                  query={normalizedQuery}
                  foodsHref={activeFoodsHref}
                />
              ) : (
                <SceneMessage
                  key="empty"
                  title="Nothing selected yet"
                  description="Pick a recipe card from the left and this panel will bloom into the full cooking view."
                />
              )}
            </AnimatePresence>
          </HanamiPanel>
        </div>
      </div>
    </main>
  );
}

function HanamiBackdrop({
  scrollProgress,
}: {
  scrollProgress: MotionValue<number>;
}) {
  const skyY = useTransform(scrollProgress, [0, 1], [0, -120]);
  const glowY = useTransform(scrollProgress, [0, 1], [0, 80]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* <motion.div
        style={{ y: skyY }}
        className="absolute inset-0"
      >
        <Image
          src="/assets/model/moon2.png"
          alt=""
          fill
          priority
          className="object-cover opacity-45 mix-blend-screen"
          sizes="100vw"
        />
      </motion.div> */}

      <motion.div
        style={{ y: skyY }}
        className="absolute inset-0"
      >
        <Image
          src="/assets/sakura/wallpaper2.png"
          alt=""
          fill
          priority
          className="object-cover opacity-35 mix-blend-screen"
          sizes="100vw"
        />
      </motion.div>

      <motion.div
        style={{ y: glowY }}
        className="absolute -left-24 top-20 h-[28rem] w-[28rem] rounded-full bg-pink-400/16 blur-3xl"
      />
      <motion.div
        style={{ y: glowY }}
        className="absolute right-[-5rem] top-40 h-[30rem] w-[30rem] rounded-full bg-fuchsia-400/14 blur-3xl"
      />
      <motion.div
        style={{ y: skyY }}
        className="absolute inset-x-0 bottom-0 h-[46vh] bg-[linear-gradient(180deg,transparent,rgba(12,5,15,0.92))]"
      />
    </div>
  );
}

function HeroSceneLayer({
  scrollProgress,
}: {
  scrollProgress: MotionValue<number>;
}) {
  const moonY = useTransform(scrollProgress, [0, 1], [0, -60]);
  const treeLeftY = useTransform(scrollProgress, [0, 1], [0, 55]);
  const treeRightY = useTransform(scrollProgress, [0, 1], [0, 38]);
  const benchY = useTransform(scrollProgress, [0, 1], [0, -22]);
  const pathY = useTransform(scrollProgress, [0, 1], [0, 48]);

  return (
    <>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,208,235,0.14),_transparent_18%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02)_12%,transparent_22%,rgba(10,3,12,0.45)_100%)]" />

      {/* <motion.div
        style={{ y: moonY }}
        className="absolute right-[8%] top-[6%] h-72 w-72 sm:h-96 sm:w-96"
      >
        <div className="absolute inset-0 rounded-full bg-pink-300/14 blur-3xl" />
        <Image
          src="/assets/model/moon.png"
          alt=""
          fill
          priority
          className="object-contain opacity-88 mix-blend-screen"
          sizes="(min-width: 640px) 384px, 288px"
        />
      </motion.div> */}

      <motion.div
        style={{ y: treeLeftY }}
        className="absolute bottom-0 left-[-6rem] h-[36rem] w-[36rem] sm:left-[-4rem] sm:h-[46rem] sm:w-[46rem]"
      >
        <Image
          src="/assets/wallpaper/tree2.png"
          alt=""
          fill
          className="object-contain object-left-bottom opacity-82"
          style={{ filter: BLOSSOM_TREE_FILTER }}
          sizes="(min-width: 640px) 736px, 576px"
        />
      </motion.div>

      <motion.div
        style={{ y: treeRightY }}
        className="absolute bottom-0 right-[-5rem] hidden h-[32rem] w-[32rem] scale-x-[-1] lg:block"
      >
        <Image
          src="/assets/wallpaper/tree2.png"
          alt=""
          fill
          className="object-contain object-right-bottom opacity-72"
          style={{ filter: BLOSSOM_TREE_FILTER }}
          sizes="512px"
        />
      </motion.div>

      {/* <motion.div
        style={{ y: pathY }}
        className="absolute inset-x-0 bottom-0 h-[24rem]"
      >
        <Image
          src="/assets/wallpaper/route2.png"
          alt=""
          fill
          className="object-contain object-bottom opacity-80"
          sizes="100vw"
        />
      </motion.div> */}

      {/* <motion.div
        style={{ y: benchY }}
        animate={{ x: [0, 4, 0], rotate: [0, 0.6, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-8 right-[8%] hidden h-36 w-64 lg:block"
      >
        <Image
          src="/assets/wallpaper/bench.png"
          alt=""
          fill
          className="object-contain opacity-90 drop-shadow-[0_20px_45px_rgba(0,0,0,0.38)]"
          sizes="256px"
        />
      </motion.div> */}
    </>
  );
}

function OrbitCard({
  title,
  value,
  description,
  icon,
  tone,
}: {
  title: string;
  value: string;
  description: string;
  icon: ReactNode;
  tone: "rose" | "violet" | "blue";
}) {
  const toneClass =
    tone === "rose"
      ? "from-pink-300/24 to-rose-300/10 text-pink-50"
      : tone === "violet"
        ? "from-violet-300/24 to-fuchsia-300/10 text-violet-50"
        : "from-sky-300/24 to-cyan-300/10 text-sky-50";

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 180, damping: 18 }}
      className="rounded-[2rem] border border-white/10 bg-[linear-gradient(155deg,rgba(255,255,255,0.16),rgba(255,255,255,0.05))] p-5 shadow-[0_20px_60px_rgba(12,4,13,0.4)] backdrop-blur-xl"
      style={{ transformPerspective: 1400 }}
    >
      <div className="flex items-start gap-4">
        <div
          className={`rounded-[1.4rem] border border-white/10 bg-gradient-to-br ${toneClass} p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]`}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-pink-50/62">
            {title}
          </p>
          <h3 className="mt-2 text-xl font-semibold text-white">{value}</h3>
          <p className="mt-3 text-sm leading-7 text-pink-50/68">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}

function HanamiPanel({
  eyebrow,
  title,
  subtitle,
  children,
  sticky = false,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  sticky?: boolean;
}) {
  return (
    <section className={sticky ? "xl:sticky xl:top-6" : undefined}>
      <div className="relative overflow-hidden rounded-[2.4rem] border border-white/10 bg-[linear-gradient(165deg,rgba(37,18,41,0.76),rgba(16,13,30,0.78))] p-5 shadow-[0_28px_120px_rgba(9,4,14,0.46)] backdrop-blur-2xl sm:p-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,220,236,0.12),_transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(169,111,255,0.14),_transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent)]" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-pink-50/78">
            <ChefHat className="h-3.5 w-3.5" />
            {eyebrow}
          </div>
          <h2
            className="mt-4 text-3xl font-semibold leading-tight text-white"
            style={{ fontFamily: "'Sora', var(--font-geist-sans)" }}
          >
            {title}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-pink-50/66">{subtitle}</p>
        </div>
        <div className="relative mt-6">{children}</div>
      </div>
    </section>
  );
}

function HanamiRecipeCard({
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
      initial={{ opacity: 0, y: 24, rotateX: -8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ delay: index * 0.06, duration: 0.55, ease: "easeOut" }}
      whileHover={{ y: -10, scale: 1.015, rotateX: 5, rotateY: -4 }}
      style={{ transformPerspective: 1600 }}
      className={`group w-full overflow-hidden rounded-[2rem] border text-left transition ${
        isSelected
          ? "border-pink-200/30 bg-[linear-gradient(145deg,rgba(255,214,232,0.18),rgba(255,255,255,0.08))] shadow-[0_24px_70px_rgba(120,34,90,0.28)]"
          : "border-white/10 bg-white/8 hover:border-white/16 hover:bg-white/11"
      }`}
    >
      <div className="grid gap-0 md:grid-cols-[11rem_1fr]">
        <div className="relative h-44 overflow-hidden md:h-full">
          <img
            src={recipe.image}
            alt={recipe.title}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(13,7,14,0.6))]" />
          <div className="absolute left-3 top-3 rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white backdrop-blur-md">
            {formatSourceLabel(recipe.source)}
          </div>
        </div>

        <div className="relative p-5">
          <div className="absolute -right-5 top-0 h-24 w-24 rounded-full bg-pink-300/10 blur-2xl" />
          <div className="relative">
            <div className="flex flex-wrap items-center gap-2">
              {recipe.dietTags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-emerald-300/18 bg-emerald-300/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-100"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h3
              className="mt-3 text-xl font-semibold text-white"
              style={{ fontFamily: "'Sora', var(--font-geist-sans)" }}
            >
              {recipe.title}
            </h3>
            <p className="mt-2 line-clamp-3 text-sm leading-7 text-pink-50/70">
              {buildRecipePreview(recipe)}
            </p>

            <div className="mt-4 flex flex-wrap gap-2 text-xs text-pink-50/90">
              <RecipeMetric icon={<Clock3 className="h-3.5 w-3.5" />}>
                {recipe.cookTime ? `${recipe.cookTime} min` : "Time unknown"}
              </RecipeMetric>
              <RecipeMetric icon={<Flame className="h-3.5 w-3.5" />}>
                {recipe.calories ? `${Math.round(recipe.calories)} kcal` : "Calories n/a"}
              </RecipeMetric>
              <RecipeMetric icon={<Leaf className="h-3.5 w-3.5" />}>
                {recipe.protein ? `${Math.round(recipe.protein)} g protein` : "Protein n/a"}
              </RecipeMetric>
            </div>
          </div>
        </div>
      </div>
    </motion.button>
  );
}

function RecipeSanctum({
  recipe,
  query,
  foodsHref,
}: {
  recipe: Recipe;
  query: string;
  foodsHref: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 18 }}
      transition={{ duration: 0.45 }}
      className="space-y-6"
    >
      <div className="overflow-hidden rounded-[2.2rem] border border-white/10 bg-white/8 shadow-[0_25px_80px_rgba(13,6,16,0.42)]">
        <div className="relative aspect-[16/9] overflow-hidden bg-[#1b1420]">
          <img
            src={recipe.image}
            alt={recipe.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),transparent_25%,rgba(13,6,16,0.72)_100%)]" />
          <div className="absolute inset-x-0 top-0 h-28 bg-[linear-gradient(180deg,rgba(255,220,236,0.12),transparent)]" />

          <div className="absolute left-5 right-5 top-5 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-md">
              {formatSourceLabel(recipe.source)}
            </span>
            {recipe.dietTags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-emerald-300/18 bg-emerald-300/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="absolute bottom-5 left-5 right-5">
            <h3
              className="max-w-3xl text-3xl font-semibold text-white sm:text-4xl"
              style={{ fontFamily: "'Sora', var(--font-geist-sans)" }}
            >
              {recipe.title}
            </h3>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-pink-50/76">
              {query
                ? `This recipe is aligned with the current search term "${query}".`
                : "This recipe is currently featured directly from the cookbook route."}
            </p>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="grid gap-3 md:grid-cols-3">
            <SanctumStat
              icon={<Clock3 className="h-4 w-4" />}
              label="Cook time"
              value={recipe.cookTime ? `${recipe.cookTime} min` : "Unknown"}
            />
            <SanctumStat
              icon={<Flame className="h-4 w-4" />}
              label="Calories"
              value={recipe.calories ? `${Math.round(recipe.calories)} kcal` : "--"}
            />
            <SanctumStat
              icon={<Dumbbell className="h-4 w-4" />}
              label="Protein"
              value={recipe.protein ? `${Math.round(recipe.protein)} g` : "--"}
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href={foodsHref}
              className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#ffd0e3,#f7a8d0)] px-4 py-2 text-sm font-semibold text-[#341022] transition hover:brightness-105"
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
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/12"
              >
                <ExternalLink className="h-4 w-4" />
                Open original recipe
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/8 p-5 shadow-[0_18px_60px_rgba(8,4,12,0.28)]">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-pink-50/80">
            <ListChecks className="h-4 w-4" />
            Ingredient petals
          </div>
          <ul className="mt-4 space-y-3">
            {recipe.ingredients.map((ingredient, index) => (
              <motion.li
                key={ingredient}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <Link
                  href={`/foods?query=${encodeURIComponent(extractIngredientSearchTerm(ingredient))}&recipe=${encodeURIComponent(recipe.id)}`}
                  className="block rounded-[1.35rem] border border-white/10 bg-white/8 px-4 py-3 text-sm leading-6 text-pink-50/88 transition hover:border-pink-200/24 hover:bg-white/12"
                >
                  {ingredient}
                </Link>
              </motion.li>
            ))}
          </ul>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/8 p-5 shadow-[0_18px_60px_rgba(8,4,12,0.28)]">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-pink-50/80">
            <NotebookPen className="h-4 w-4" />
            Instructions
          </div>
          <div className="mt-4 whitespace-pre-line rounded-[1.45rem] border border-white/10 bg-[linear-gradient(145deg,rgba(33,13,35,0.4),rgba(255,255,255,0.05))] px-4 py-4 text-sm leading-7 text-pink-50/88">
            {recipe.instructions}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function SanctumStat({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="rounded-[1.45rem] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.12),rgba(255,255,255,0.06))] px-4 py-4"
    >
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-pink-50/66">
        {icon}
        {label}
      </div>
      <p className="mt-3 text-base font-semibold text-white">{value}</p>
    </motion.div>
  );
}

function RecipeMetric({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/8 px-3 py-1.5 backdrop-blur-md">
      {icon}
      {children}
    </span>
  );
}

function SceneMessage({
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
      className={`rounded-[2rem] border px-5 py-10 text-center ${
        tone === "error"
          ? "border-rose-300/22 bg-rose-400/10 text-rose-50"
          : "border-white/10 bg-white/8 text-pink-50"
      }`}
    >
      <h3
        className="text-2xl font-semibold"
        style={{ fontFamily: "'Sora', var(--font-geist-sans)" }}
      >
        {title}
      </h3>
      <p className="mt-3 text-sm leading-7 text-inherit/78">{description}</p>
    </div>
  );
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

function buildRecipePreview(recipe: Recipe) {
  const ingredientText = recipe.ingredients.slice(0, 3).join(", ");
  if (ingredientText) {
    return ingredientText;
  }

  return "Ingredients and instructions are waiting once this recipe card is opened.";
}

function extractIngredientSearchTerm(value: string) {
  return value
    .replace(/^\d+([./]\d+)?\s*/g, "")
    .replace(/\b(cup|cups|tbsp|tsp|g|kg|ml|l|oz|lb|lbs)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function buildSakuraParticleOptions(): ISourceOptions {
  const petalSprites = [
    createPetalSprite("#ffd6ea", "#f09bc0", "#fffafc"),
    createPetalSprite("#ffc6df", "#ef8eb6", "#fff6fb"),
    createPetalSprite("#ffe2ef", "#f6afca", "#ffffff"),
  ];

  return {
    fullScreen: {
      enable: false,
    },
    fpsLimit: 60,
    background: {
      color: "transparent",
    },
    detectRetina: true,
    interactivity: {
      events: {
        onHover: {
          enable: false,
          mode: "bubble",
        },
        resize: {
          enable: true,
        },
      },
      modes: {
        bubble: {
          distance: 120,
          duration: 1.5,
          opacity: 1,
          size: 26,
        },
      },
    },
    particles: {
      number: {
        value: 34,
        density: {
          enable: true,
          width: 1200,
          height: 900,
        },
      },
      color: {
        value: ["#ffd3e6", "#ffc4da", "#ffe7f1"],
      },
      opacity: {
        value: {
          min: 0.45,
          max: 0.95,
        },
        animation: {
          enable: true,
          speed: 0.35,
          sync: false,
        },
      },
      size: {
        value: {
          min: 12,
          max: 30,
        },
      },
      shape: {
        type: "image",
        options: {
          image: petalSprites.map((src) => ({
            src,
            width: 40,
            height: 40,
          })),
        },
      },
      rotate: {
        value: {
          min: 0,
          max: 360,
        },
        direction: "random",
        animation: {
          enable: true,
          speed: 12,
          sync: false,
        },
      },
      move: {
        enable: true,
        direction: "bottom",
        speed: {
          min: 0.9,
          max: 2.2,
        },
        straight: false,
        outModes: {
          default: "out",
        },
      },
    },
  };
}

function createPetalSprite(fill: string, stroke: string, accent: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 42 42">
      <defs>
        <radialGradient id="g" cx="50%" cy="35%" r="65%">
          <stop offset="0%" stop-color="${accent}" stop-opacity="0.95" />
          <stop offset="48%" stop-color="${fill}" stop-opacity="0.98" />
          <stop offset="100%" stop-color="${stroke}" stop-opacity="1" />
        </radialGradient>
      </defs>
      <path
        d="M21 4 C28 5, 34 10, 33 19 C32 27, 27 35, 21 38 C15 35, 10 27, 9 19 C8 10, 14 5, 21 4 Z"
        fill="url(#g)"
        stroke="${stroke}"
        stroke-width="1.15"
      />
      <path
        d="M21 8 C24 14, 24 22, 21 33"
        stroke="rgba(255,255,255,0.45)"
        stroke-width="1"
        stroke-linecap="round"
      />
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
