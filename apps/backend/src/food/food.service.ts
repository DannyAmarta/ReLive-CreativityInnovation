import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SearchFoodsArgs } from './dto/search-foods.args';
import { Food } from './entities/food.entity';
import { FoodSearchResponse } from './entities/food-search-response.entity';
import { OpenFoodFactsConnector } from './providers/open-food-facts.connector';
import { scaleNutrientsForServing } from './providers/food-mapper';
import { UsdaFoodConnector } from './providers/usda-food.connector';

type CachedFoodRecord = {
  source: string;
  sourceId: string;
  name: string;
  normalizedName: string;
  description: string | null;
  brand: string | null;
  referenceServingSize: number | null;
  referenceServingUnit: string | null;
  caloriesPer100g: number | null;
  proteinGramsPer100g: number | null;
  carbsGramsPer100g: number | null;
  fatGramsPer100g: number | null;
  fiberGramsPer100g: number | null;
  sugarGramsPer100g: number | null;
  sodiumMilligramsPer100g: number | null;
};

type ResponseCacheEntry = {
  expiresAt: number;
  value: FoodSearchResponse;
};

type FoodCacheModel = {
  findMany: (args: Record<string, unknown>) => Promise<CachedFoodRecord[]>;
  upsert: (args: {
    where: { source_sourceId: { source: string; sourceId: string } };
    update: Record<string, unknown>;
    create: Record<string, unknown>;
  }) => Promise<unknown>;
};

@Injectable()
export class FoodService {
  private readonly logger = new Logger(FoodService.name);
  private readonly responseCache = new Map<string, ResponseCacheEntry>();
  private readonly responseCacheTtlMs = 60_000;

  constructor(
    private readonly prisma: PrismaService,
    private readonly usdaFoodConnector: UsdaFoodConnector,
    private readonly openFoodFactsConnector: OpenFoodFactsConnector,
  ) {}

  // Main entry point for both REST and GraphQL food search.
  // Used by FoodController.searchFoods and FoodResolver.searchFoods.
  async searchFoods(args: SearchFoodsArgs): Promise<FoodSearchResponse> {
    // We normalize once so every layer below works with the same safe values.
    const normalizedArgs = this.normalizeArgs(args);
    const cacheKey = this.createResponseCacheKey(normalizedArgs);
    const inMemoryHit = this.getCachedResponse(cacheKey);

    if (inMemoryHit) {
      return inMemoryHit;
    }

    const cachedFoods = await this.findCachedFoods(normalizedArgs);
    if (this.hasUsefulResults(cachedFoods)) {
      const response = this.buildResponse({
        args: normalizedArgs,
        items: cachedFoods,
        sourceUsed: 'DATABASE',
        cacheHit: true,
        fallbackUsed: false,
      });

      this.storeResponseCache(cacheKey, response);
      return response;
    }

    const usdaFoods = await this.tryUsda(normalizedArgs);
    if (usdaFoods.length > 0) {
      await this.upsertFoods(usdaFoods);
    }

    const mergedCachedAndUsda = this.mergeFoods(cachedFoods, usdaFoods, normalizedArgs.pageSize);
    if (this.hasUsefulResults(mergedCachedAndUsda)) {
      const response = this.buildResponse({
        args: normalizedArgs,
        items: mergedCachedAndUsda,
        sourceUsed: 'USDA',
        cacheHit: cachedFoods.length > 0,
        fallbackUsed: false,
      });

      this.storeResponseCache(cacheKey, response);
      return response;
    }

    const openFoodFactsFoods = await this.tryOpenFoodFacts(normalizedArgs);
    if (openFoodFactsFoods.length > 0) {
      await this.upsertFoods(openFoodFactsFoods);
    }

    const finalItems = this.mergeFoods(
      mergedCachedAndUsda,
      openFoodFactsFoods,
      normalizedArgs.pageSize,
    );

    const response = this.buildResponse({
      args: normalizedArgs,
      items: finalItems,
      sourceUsed: this.resolveSourceUsed({
        cachedFoods,
        usdaFoods,
        openFoodFactsFoods,
      }),
      cacheHit: cachedFoods.length > 0,
      fallbackUsed: openFoodFactsFoods.length > 0,
    });

    this.storeResponseCache(cacheKey, response);
    return response;
  }

  // Normalizes incoming arguments so all later steps work with trimmed query text
  // and bounded numeric values regardless of how the request arrived.
  private normalizeArgs(args: SearchFoodsArgs): SearchFoodsArgs {
    return {
      query: args.query.trim(),
      page: Math.max(1, Math.trunc(args.page || 1)),
      pageSize: Math.min(20, Math.max(1, Math.trunc(args.pageSize || 10))),
      servingSize: Math.max(1, Math.trunc(args.servingSize || 100)),
    };
  }

  // Builds the in-memory cache key for a specific search term + pagination + serving size.
  // Used only inside searchFoods to reuse recent responses.
  private createResponseCacheKey(args: SearchFoodsArgs) {
    return `${this.normalizeQuery(args.query)}:${args.page}:${args.pageSize}:${args.servingSize}`;
  }

  // Reads the short-lived response cache before we touch the database or providers.
  // Used only by searchFoods.
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

  // Stores a completed response in the short-lived in-memory cache.
  // Used by searchFoods after each successful search path.
  private storeResponseCache(cacheKey: string, value: FoodSearchResponse) {
    this.responseCache.set(cacheKey, {
      expiresAt: Date.now() + this.responseCacheTtlMs,
      value,
    });
  }

  // Looks up normalized food records from the local database cache.
  // Used by searchFoods before calling USDA or Open Food Facts.
  private async findCachedFoods(args: SearchFoodsArgs): Promise<Food[]> {
    // This normalized value is what we use for tolerant contains-searches in the database.
    const normalizedQuery = this.normalizeQuery(args.query);
    const foodCacheModel = this.getFoodCacheModel();

    if (!foodCacheModel) {
      return [];
    }

    const records = await foodCacheModel.findMany({
      where: {
        OR: [
          {
            normalizedName: {
              contains: normalizedQuery,
              mode: 'insensitive',
            },
          },
          {
            name: {
              contains: args.query,
              mode: 'insensitive',
            },
          },
          {
            brand: {
              contains: args.query,
              mode: 'insensitive',
            },
          },
        ],
      },
      orderBy: [{ normalizedName: 'asc' }, { createdAt: 'desc' }],
      take: args.pageSize,
      skip: (args.page - 1) * args.pageSize,
    });

    return records.map((record) => this.mapCachedFoodToResponse(record, args.servingSize));
  }

  // Converts a cached Prisma record back into the unified API response shape.
  // Used by findCachedFoods after database reads.
  private mapCachedFoodToResponse(record: CachedFoodRecord, servingSize: number): Food {
    // Cached values are stored per 100g, so we rebuild the standard nutrient object first.
    const per100gNutrients = this.buildPer100gNutrientsFromRecord(record);

    return {
      id: `${record.source.toLowerCase()}:${record.sourceId}`,
      source: record.source,
      sourceId: record.sourceId,
      name: record.name,
      description: record.description,
      brand: record.brand,
      referenceServingSize: record.referenceServingSize,
      referenceServingUnit: record.referenceServingUnit,
      servingSize,
      servingUnit: 'g',
      per100gNutrients,
      nutrients: scaleNutrientsForServing(per100gNutrients, servingSize),
    };
  }

  // Rehydrates the per-100g nutrient object from a database record.
  // Used by mapCachedFoodToResponse.
  private buildPer100gNutrientsFromRecord(record: CachedFoodRecord) {
    return {
      calories: record.caloriesPer100g,
      proteinGrams: record.proteinGramsPer100g,
      carbsGrams: record.carbsGramsPer100g,
      fatGrams: record.fatGramsPer100g,
      fiberGrams: record.fiberGramsPer100g,
      sugarGrams: record.sugarGramsPer100g,
      sodiumMilligrams: record.sodiumMilligramsPer100g,
    };
  }

  // Decides whether a result set is good enough to stop the fallback chain.
  // Used after database and USDA lookups.
  private hasUsefulResults(items: Food[]) {
    return items.length > 0;
  }

  // Merges results from multiple sources while preserving source/id uniqueness.
  // Used when combining cached foods with USDA and fallback provider results.
  private mergeFoods(primary: Food[], secondary: Food[], limit: number) {
    const mergedFoods = new Map<string, Food>();

    for (const item of [...primary, ...secondary]) {
      mergedFoods.set(`${item.source}:${item.sourceId}`, item);
    }

    return Array.from(mergedFoods.values()).slice(0, limit);
  }

  // Shapes the final API payload returned to REST or GraphQL callers.
  // Used by searchFoods for every successful response path.
  private buildResponse(input: {
    args: SearchFoodsArgs;
    items: Food[];
    sourceUsed: string;
    cacheHit: boolean;
    fallbackUsed: boolean;
  }): FoodSearchResponse {
    return {
      query: input.args.query,
      sourceUsed: input.sourceUsed,
      cacheHit: input.cacheHit,
      fallbackUsed: input.fallbackUsed,
      page: input.args.page,
      pageSize: input.args.pageSize,
      servingSize: input.args.servingSize,
      totalReturned: input.items.length,
      items: input.items,
    };
  }

  // Calls the USDA connector and applies the requested serving size to the result.
  // Used by searchFoods as the primary external lookup path.
  private async tryUsda(args: SearchFoodsArgs): Promise<Food[]> {
    try {
      const result = await this.usdaFoodConnector.searchFoods(args);
      return result.items.map((item) => this.withServingSize(item, args.servingSize));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown USDA error';
      this.logger.warn(`USDA search failed for "${args.query}": ${message}`);
      return [];
    }
  }

  // Calls the Open Food Facts connector and applies the requested serving size.
  // Used by searchFoods only after the primary source is not useful enough.
  private async tryOpenFoodFacts(args: SearchFoodsArgs): Promise<Food[]> {
    try {
      const result = await this.openFoodFactsConnector.searchFoods(args);
      return result.items.map((item) => this.withServingSize(item, args.servingSize));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown Open Food Facts error';
      this.logger.warn(
        `Open Food Facts search failed for "${args.query}": ${message}`,
      );
      return [];
    }
  }

  // Recomputes the display nutrients for a custom serving over the stored per-100g base.
  // Used after provider fetches before results are returned to clients.
  private withServingSize(item: Food, servingSize: number): Food {
    return {
      ...item,
      servingSize,
      servingUnit: 'g',
      nutrients: scaleNutrientsForServing(item.per100gNutrients, servingSize),
    };
  }

  // Persists external provider results into the database cache for future searches.
  // Used by searchFoods after USDA or Open Food Facts returns usable items.
  private async upsertFoods(items: Food[]) {
    const foodCacheModel = this.getFoodCacheModel();

    if (!foodCacheModel) {
      return;
    }

    for (const item of items) {
      const data = this.createFoodCacheRecord(item);

      await foodCacheModel.upsert({
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

  // Normalizes arbitrary search text into the same lowercase single-space form used
  // by cache keys and database lookup fields.
  private normalizeQuery(value: string) {
    return value.trim().toLowerCase().replace(/\s+/g, ' ');
  }

  // Prisma Client types are generated outside this environment, so we keep
  // access to the new FoodCache model in one place instead of scattering casts.
  // Used by findCachedFoods and upsertFoods.
  private getFoodCacheModel(): FoodCacheModel | undefined {
    return (this.prisma as PrismaService & {
      foodCache?: FoodCacheModel;
    }).foodCache;
  }

  // Maps the unified Food object into the columns stored in FoodCache.
  // Used by upsertFoods before calling Prisma upsert.
  private createFoodCacheRecord(item: Food) {
    return {
      source: item.source,
      sourceId: item.sourceId,
      name: item.name,
      normalizedName: this.normalizeQuery(item.name),
      description: item.description,
      brand: item.brand,
      referenceServingSize: item.referenceServingSize,
      referenceServingUnit: item.referenceServingUnit,
      caloriesPer100g: item.per100gNutrients.calories,
      proteinGramsPer100g: item.per100gNutrients.proteinGrams,
      carbsGramsPer100g: item.per100gNutrients.carbsGrams,
      fatGramsPer100g: item.per100gNutrients.fatGrams,
      fiberGramsPer100g: item.per100gNutrients.fiberGrams,
      sugarGramsPer100g: item.per100gNutrients.sugarGrams,
      sodiumMilligramsPer100g: item.per100gNutrients.sodiumMilligrams,
    };
  }

  // Chooses the outward-facing source label that explains which path produced
  // the final response payload.
  // Used by searchFoods when building the final response.
  private resolveSourceUsed(input: {
    cachedFoods: Food[];
    usdaFoods: Food[];
    openFoodFactsFoods: Food[];
  }) {
    if (input.openFoodFactsFoods.length > 0) {
      return 'OPEN_FOOD_FACTS';
    }

    if (input.usdaFoods.length > 0) {
      return 'USDA';
    }

    if (input.cachedFoods.length > 0) {
      return 'DATABASE';
    }

    return 'NONE';
  }
}
