import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Recipe, RecipeSearchResponse, SearchRecipesArgs } from './recipe.types';
import {
  SpoonacularConnector,
  SpoonacularQuotaExceededError,
} from './providers/spoonacular.connector';
import { TheMealDbConnector } from './providers/themealdb.connector';
import { createRecipeId } from './providers/recipe-mapper';

type CachedRecipeRecord = {
  source: Recipe['source'];
  sourceId: string;
  title: string;
  normalizedTitle: string;
  image: string;
  calories: number | null;
  protein: number | null;
  cookTime: number | null;
  ingredients: string[];
  instructions: string;
  sourceUrl: string | null;
  dietTags: string[];
};

type ResponseCacheEntry = {
  expiresAt: number;
  value: RecipeSearchResponse;
};

type RecipeCacheModel = {
  findMany: (args: Record<string, unknown>) => Promise<CachedRecipeRecord[]>;
  upsert: (args: {
    where: { source_sourceId: { source: string; sourceId: string } };
    update: Record<string, unknown>;
    create: Record<string, unknown>;
  }) => Promise<unknown>;
};

@Injectable()
export class RecipeService {
  private readonly logger = new Logger(RecipeService.name);
  private readonly responseCache = new Map<string, ResponseCacheEntry>();
  private readonly responseCacheTtlMs = 60_000;

  constructor(
    private readonly prisma: PrismaService,
    private readonly spoonacularConnector: SpoonacularConnector,
    private readonly theMealDbConnector: TheMealDbConnector,
  ) {}

  // This is the main recipe discovery workflow.
  // It is used by RecipeController so the frontend always gets database-first, primary-source, then fallback-source behavior.
  async searchRecipes(args: SearchRecipesArgs): Promise<RecipeSearchResponse> {
    const normalizedArgs = this.normalizeArgs(args);
    const cacheKey = this.createResponseCacheKey(normalizedArgs);
    const inMemoryHit = this.getCachedResponse(cacheKey);

    if (inMemoryHit) {
      return inMemoryHit;
    }

    const cachedRecipes = await this.findCachedRecipes(normalizedArgs);
    if (this.hasUsefulResults(cachedRecipes)) {
      const response = this.buildResponse({
        args: normalizedArgs,
        items: cachedRecipes,
        sourceUsed: 'DATABASE',
        cacheHit: true,
        fallbackUsed: false,
      });

      this.storeResponseCache(cacheKey, response);
      return response;
    }

    const spoonacularRecipes = await this.trySpoonacular(normalizedArgs);
    if (spoonacularRecipes.length > 0) {
      await this.upsertRecipes(spoonacularRecipes);
    }

    const mergedCachedAndPrimary = this.mergeRecipes(
      cachedRecipes,
      spoonacularRecipes,
      normalizedArgs.pageSize,
    );

    if (this.hasUsefulResults(mergedCachedAndPrimary)) {
      const response = this.buildResponse({
        args: normalizedArgs,
        items: mergedCachedAndPrimary,
        sourceUsed: 'SPOONACULAR',
        cacheHit: cachedRecipes.length > 0,
        fallbackUsed: false,
      });

      this.storeResponseCache(cacheKey, response);
      return response;
    }

    const fallbackRecipes = await this.tryTheMealDb(normalizedArgs);
    if (fallbackRecipes.length > 0) {
      await this.upsertRecipes(fallbackRecipes);
    }

    const finalItems = this.mergeRecipes(
      mergedCachedAndPrimary,
      fallbackRecipes,
      normalizedArgs.pageSize,
    );

    const response = this.buildResponse({
      args: normalizedArgs,
      items: finalItems,
      sourceUsed: this.resolveSourceUsed({
        cachedRecipes,
        spoonacularRecipes,
        fallbackRecipes,
      }),
      cacheHit: cachedRecipes.length > 0,
      fallbackUsed: fallbackRecipes.length > 0,
    });

    this.storeResponseCache(cacheKey, response);
    return response;
  }

  // This helper normalizes the incoming recipe query and pagination values.
  // It is used once at the top of searchRecipes so all later layers work with safe values.
  private normalizeArgs(args: SearchRecipesArgs): SearchRecipesArgs {
    return {
      query: args.query.trim(),
      page: Math.max(1, Math.trunc(args.page || 1)),
      pageSize: Math.min(20, Math.max(1, Math.trunc(args.pageSize || 10))),
    };
  }

  // This helper builds the short-lived in-memory cache key.
  // It is used only by searchRecipes.
  private createResponseCacheKey(args: SearchRecipesArgs) {
    return `${this.normalizeQuery(args.query)}:${args.page}:${args.pageSize}`;
  }

  // This helper checks whether a recent in-memory response can be reused.
  // It is used only by searchRecipes before the database or external APIs are touched.
  private getCachedResponse(cacheKey: string) {
    const cachedValue = this.responseCache.get(cacheKey);
    if (!cachedValue) {
      return null;
    }

    if (cachedValue.expiresAt < Date.now()) {
      this.responseCache.delete(cacheKey);
      return null;
    }

    return cachedValue.value;
  }

  // This helper stores completed recipe responses in short-lived memory cache.
  // It is used by searchRecipes for faster repeated pagination and repeat queries.
  private storeResponseCache(cacheKey: string, value: RecipeSearchResponse) {
    this.responseCache.set(cacheKey, {
      expiresAt: Date.now() + this.responseCacheTtlMs,
      value,
    });
  }

  // This helper looks up recipe matches from the local database cache.
  // It is used before any external recipe API is called.
  private async findCachedRecipes(args: SearchRecipesArgs): Promise<Recipe[]> {
    const normalizedQuery = this.normalizeQuery(args.query);
    const recipeCacheModel = this.getRecipeCacheModel();

    if (!recipeCacheModel) {
      return [];
    }

    const records = await recipeCacheModel.findMany({
      where: {
        OR: [
          {
            normalizedTitle: {
              contains: normalizedQuery,
              mode: 'insensitive',
            },
          },
          {
            title: {
              contains: args.query,
              mode: 'insensitive',
            },
          },
        ],
      },
      orderBy: [{ normalizedTitle: 'asc' }, { createdAt: 'desc' }],
      take: args.pageSize,
      skip: (args.page - 1) * args.pageSize,
    });

    return records.map((record) => this.mapCachedRecipeToResponse(record));
  }

  // This helper converts a cached database row back into the unified recipe object.
  // It is used only by findCachedRecipes after Prisma reads.
  private mapCachedRecipeToResponse(record: CachedRecipeRecord): Recipe {
    return {
      id: createRecipeId(record.source, record.sourceId),
      source: record.source,
      sourceId: record.sourceId,
      title: record.title,
      image: record.image,
      calories: record.calories,
      protein: record.protein,
      cookTime: record.cookTime,
      ingredients: record.ingredients,
      instructions: record.instructions,
      sourceUrl: record.sourceUrl,
      dietTags: record.dietTags,
    };
  }

  // This helper decides whether a recipe set is good enough to stop the fallback chain.
  // It is used after database and Spoonacular results are loaded.
  private hasUsefulResults(items: Recipe[]) {
    return items.length > 0;
  }

  // This helper merges recipe results from cache + providers without duplicates.
  // It is used when combining cached data with primary and fallback provider results.
  private mergeRecipes(primary: Recipe[], secondary: Recipe[], limit: number) {
    const mergedRecipes = new Map<string, Recipe>();

    for (const item of [...primary, ...secondary]) {
      mergedRecipes.set(`${item.source}:${item.sourceId}`, item);
    }

    return Array.from(mergedRecipes.values()).slice(0, limit);
  }

  // This helper shapes the final recipe search payload sent back to the frontend.
  // It is used by every successful response path inside searchRecipes.
  private buildResponse(input: {
    args: SearchRecipesArgs;
    items: Recipe[];
    sourceUsed: RecipeSearchResponse['sourceUsed'];
    cacheHit: boolean;
    fallbackUsed: boolean;
  }): RecipeSearchResponse {
    return {
      query: input.args.query,
      sourceUsed: input.sourceUsed,
      cacheHit: input.cacheHit,
      fallbackUsed: input.fallbackUsed,
      page: input.args.page,
      pageSize: input.args.pageSize,
      totalReturned: input.items.length,
      items: input.items,
    };
  }

  // This helper runs the primary Spoonacular search and safely swallows upstream failures.
  // It is used by searchRecipes before the fallback provider.
  private async trySpoonacular(args: SearchRecipesArgs): Promise<Recipe[]> {
    try {
      const result = await this.spoonacularConnector.searchRecipes(args);
      return result.items;
    } catch (error) {
      if (error instanceof SpoonacularQuotaExceededError) {
        this.logger.warn(
          `Spoonacular quota reached for "${args.query}". Falling back to TheMealDB.`,
        );
        return [];
      }

      const message =
        error instanceof Error ? error.message : 'Unknown Spoonacular error';
      this.logger.warn(`Spoonacular search failed for "${args.query}": ${message}`);
      return [];
    }
  }

  // This helper runs TheMealDB fallback search when the primary source is not usable.
  // It is used only after Spoonacular fails or returns no useful items.
  private async tryTheMealDb(args: SearchRecipesArgs): Promise<Recipe[]> {
    try {
      const result = await this.theMealDbConnector.searchRecipes(args);
      return result.items;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown TheMealDB error';
      this.logger.warn(`TheMealDB search failed for "${args.query}": ${message}`);
      return [];
    }
  }

  // This helper writes provider results into the local recipe cache for future users.
  // It is used after Spoonacular or TheMealDB return recipe results.
  private async upsertRecipes(items: Recipe[]) {
    const recipeCacheModel = this.getRecipeCacheModel();

    if (!recipeCacheModel) {
      return;
    }

    for (const item of items) {
      const data = this.createRecipeCacheRecord(item);

      await recipeCacheModel.upsert({
        where: {
          source_sourceId: {
            source: item.source,
            sourceId: item.sourceId,
          },
        },
        update: data,
        create: data,
      });
    }
  }

  // This helper normalizes free-text recipe queries into a stable cache/search form.
  // It is used by memory cache keys, database lookup, and cache writes.
  private normalizeQuery(value: string) {
    return value.trim().toLowerCase().replace(/\s+/g, ' ');
  }

  // This helper centralizes access to Prisma's RecipeCache model.
  // It is used by findCachedRecipes and upsertRecipes so generated Prisma types stay isolated in one place.
  private getRecipeCacheModel(): RecipeCacheModel | undefined {
    return (this.prisma as PrismaService & {
      recipeCache?: RecipeCacheModel;
    }).recipeCache;
  }

  // This helper maps the unified recipe object into the database cache columns.
  // It is used by upsertRecipes before Prisma upserts.
  private createRecipeCacheRecord(item: Recipe) {
    return {
      source: item.source,
      sourceId: item.sourceId,
      title: item.title,
      normalizedTitle: this.normalizeQuery(item.title),
      image: item.image,
      calories: item.calories,
      protein: item.protein,
      cookTime: item.cookTime,
      ingredients: item.ingredients,
      instructions: item.instructions,
      sourceUrl: item.sourceUrl,
      dietTags: item.dietTags,
    };
  }

  // This helper decides which source label best explains the final response path.
  // It is used only when searchRecipes builds the final outbound payload.
  private resolveSourceUsed(input: {
    cachedRecipes: Recipe[];
    spoonacularRecipes: Recipe[];
    fallbackRecipes: Recipe[];
  }): RecipeSearchResponse['sourceUsed'] {
    if (input.fallbackRecipes.length > 0) {
      return 'THE_MEAL_DB';
    }

    if (input.spoonacularRecipes.length > 0) {
      return 'SPOONACULAR';
    }

    if (input.cachedRecipes.length > 0) {
      return 'DATABASE';
    }

    return 'NONE';
  }
}
