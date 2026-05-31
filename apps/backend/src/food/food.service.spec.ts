import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { FoodService } from './food.service';
import { OpenFoodFactsConnector } from './providers/open-food-facts.connector';
import { UsdaFoodConnector } from './providers/usda-food.connector';
import { RedisService } from '../core/redis.service';

describe('FoodService', () => {
  let service: FoodService;
  let prismaService: { foodCache: { findMany: jest.Mock; upsert: jest.Mock } };
  let usdaConnector: { searchFoods: jest.Mock };
  let openFoodFactsConnector: { searchFoods: jest.Mock };
  let redisService: { get: jest.Mock; set: jest.Mock };

  beforeEach(async () => {
    prismaService = {
      foodCache: {
        findMany: jest.fn(),
        upsert: jest.fn(),
      },
    };
    usdaConnector = { searchFoods: jest.fn() };
    openFoodFactsConnector = { searchFoods: jest.fn() };
    redisService = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(undefined),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        FoodService,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
        {
          provide: UsdaFoodConnector,
          useValue: usdaConnector,
        },
        {
          provide: OpenFoodFactsConnector,
          useValue: openFoodFactsConnector,
        },
        {
          provide: RedisService,
          useValue: redisService,
        },
      ],
    }).compile();

    service = moduleRef.get(FoodService);
  });

  it('uses USDA results when useful items are returned', async () => {
    prismaService.foodCache.findMany.mockResolvedValue([]);
    usdaConnector.searchFoods.mockResolvedValue({
      items: Array.from({ length: 3 }).map((_, index) => ({
        id: `usda:${index + 1}`,
        source: 'USDA',
        sourceId: String(index + 1),
        name: `Apple ${index + 1}`,
        description: 'Apple',
        brand: null,
        referenceServingSize: null,
        referenceServingUnit: null,
        servingSize: 100,
        servingUnit: 'g',
        per100gNutrients: {
          calories: 52,
          proteinGrams: null,
          carbsGrams: null,
          fatGrams: null,
          fiberGrams: null,
          sugarGrams: null,
          sodiumMilligrams: null,
        },
        nutrients: {
          calories: 52,
          proteinGrams: null,
          carbsGrams: null,
          fatGrams: null,
          fiberGrams: null,
          sugarGrams: null,
          sodiumMilligrams: null,
        },
      })),
    });

    const result = await service.searchFoods({
      query: 'apple',
      page: 1,
      pageSize: 10,
      servingSize: 150,
    });

    expect(result.sourceUsed).toBe('USDA');
    expect(result.cacheHit).toBe(false);
    expect(result.fallbackUsed).toBe(false);
    expect(result.items).toHaveLength(3);
    expect(result.items[0].servingSize).toBe(150);
    expect(result.items[0].nutrients.calories).toBe(78);
    expect(prismaService.foodCache.upsert).toHaveBeenCalled();
    expect(openFoodFactsConnector.searchFoods).not.toHaveBeenCalled();
  });

  it('returns cached foods before calling external sources', async () => {
    prismaService.foodCache.findMany.mockResolvedValue([
      {
        source: 'SEED',
        sourceId: 'banana',
        name: 'Banana',
        normalizedName: 'banana',
        description: null,
        brand: null,
        referenceServingSize: 100,
        referenceServingUnit: 'g',
        caloriesPer100g: 89,
        proteinGramsPer100g: 1.1,
        carbsGramsPer100g: 22.8,
        fatGramsPer100g: 0.3,
        fiberGramsPer100g: 2.6,
        sugarGramsPer100g: 12.2,
        sodiumMilligramsPer100g: 1,
      },
      {
        source: 'SEED',
        sourceId: 'banana-2',
        name: 'Banana Slices',
        normalizedName: 'banana slices',
        description: null,
        brand: null,
        referenceServingSize: 100,
        referenceServingUnit: 'g',
        caloriesPer100g: 89,
        proteinGramsPer100g: 1.1,
        carbsGramsPer100g: 22.8,
        fatGramsPer100g: 0.3,
        fiberGramsPer100g: 2.6,
        sugarGramsPer100g: 12.2,
        sodiumMilligramsPer100g: 1,
      },
      {
        source: 'SEED',
        sourceId: 'banana-3',
        name: 'Banana Bowl',
        normalizedName: 'banana bowl',
        description: null,
        brand: null,
        referenceServingSize: 100,
        referenceServingUnit: 'g',
        caloriesPer100g: 89,
        proteinGramsPer100g: 1.1,
        carbsGramsPer100g: 22.8,
        fatGramsPer100g: 0.3,
        fiberGramsPer100g: 2.6,
        sugarGramsPer100g: 12.2,
        sodiumMilligramsPer100g: 1,
      },
    ]);

    const result = await service.searchFoods({
      query: 'banana',
      page: 1,
      pageSize: 10,
      servingSize: 120,
    });

    expect(result.sourceUsed).toBe('DATABASE');
    expect(result.cacheHit).toBe(true);
    expect(result.items[0].nutrients.calories).toBe(106.8);
    expect(usdaConnector.searchFoods).not.toHaveBeenCalled();
    expect(openFoodFactsConnector.searchFoods).not.toHaveBeenCalled();
  });

  it('falls back to Open Food Facts when USDA is empty', async () => {
    prismaService.foodCache.findMany.mockResolvedValue([]);
    usdaConnector.searchFoods.mockResolvedValue({ items: [] });
    openFoodFactsConnector.searchFoods.mockResolvedValue({
      items: Array.from({ length: 3 }).map((_, index) => ({
        id: `open-food-facts:${index + 2}`,
        source: 'OPEN_FOOD_FACTS',
        sourceId: String(index + 2),
        name: `Granola Bar ${index + 1}`,
        description: null,
        brand: 'Acme',
        referenceServingSize: 40,
        referenceServingUnit: 'g',
        servingSize: 100,
        servingUnit: 'g',
        per100gNutrients: {
          calories: 190,
          proteinGrams: 3,
          carbsGrams: 24,
          fatGrams: 9,
          fiberGrams: 2,
          sugarGrams: 10,
          sodiumMilligrams: 140,
        },
        nutrients: {
          calories: 190,
          proteinGrams: 3,
          carbsGrams: 24,
          fatGrams: 9,
          fiberGrams: 2,
          sugarGrams: 10,
          sodiumMilligrams: 140,
        },
      })),
    });

    const result = await service.searchFoods({
      query: 'granola',
      page: 1,
      pageSize: 10,
      servingSize: 50,
    });

    expect(result.sourceUsed).toBe('OPEN_FOOD_FACTS');
    expect(result.cacheHit).toBe(false);
    expect(result.fallbackUsed).toBe(true);
    expect(result.items).toHaveLength(3);
    expect(result.items[0].nutrients.calories).toBe(95);
    expect(openFoodFactsConnector.searchFoods).toHaveBeenCalled();
  });

  it('returns embedded staple foods when cache and providers cannot serve a common query', async () => {
    prismaService.foodCache.findMany.mockResolvedValue([]);
    usdaConnector.searchFoods.mockResolvedValue({ items: [] });
    openFoodFactsConnector.searchFoods.mockRejectedValue(
      new Error('Open Food Facts request failed with 503'),
    );

    const result = await service.searchFoods({
      query: 'Chicken breast',
      page: 1,
      pageSize: 10,
      servingSize: 150,
    });

    expect(result.sourceUsed).toBe('SEED');
    expect(result.cacheHit).toBe(false);
    expect(result.fallbackUsed).toBe(true);
    expect(result.items).toHaveLength(1);
    expect(result.items[0].source).toBe('SEED');
    expect(result.items[0].name).toBe('Chicken Breast');
    expect(result.items[0].nutrients.calories).toBe(247.5);
    expect(result.items[0].nutrients.proteinGrams).toBe(46.5);
  });
});
