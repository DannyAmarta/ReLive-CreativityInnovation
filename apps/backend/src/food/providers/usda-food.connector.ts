import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FoodProviderResult, FoodSearchParams } from '../types/food.types';
import { Food } from '../entities/food.entity';
import {
  createFoodNutrients,
  isUsefulFood,
  roundToTwoDecimals,
  toNullableNumber,
} from './food-mapper';

type UsdaFoodNutrient = {
  nutrientName?: string;
  value?: number;
  unitName?: string;
  nutrientNumber?: string;
};

type UsdaFoodItem = {
  fdcId: number;
  description?: string;
  brandOwner?: string;
  brandName?: string;
  servingSize?: number;
  servingSizeUnit?: string;
  foodNutrients?: UsdaFoodNutrient[];
};

type UsdaSearchResponse = {
  foods?: UsdaFoodItem[];
};

@Injectable()
export class UsdaFoodConnector {
  constructor(private readonly configService: ConfigService) {}

  // Queries USDA FoodData Central and returns normalized food objects.
  // Used by FoodService.tryUsda as the primary external provider.
  async searchFoods(params: FoodSearchParams): Promise<FoodProviderResult> {
    const apiKey = this.configService.get<string>('USDA_API_KEY');

    if (!apiKey) {
      return { items: [] };
    }

    const response = await fetch(
      `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: params.query,
          pageNumber: params.page,
          pageSize: params.pageSize,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`USDA request failed with ${response.status}`);
    }

    const payload = (await response.json()) as UsdaSearchResponse;
    const items = (payload.foods ?? [])
      .map((food) => this.mapFood(food))
      .filter(isUsefulFood);

    return { items };
  }

  // Maps a single USDA search result into the unified food shape used everywhere else.
  // Used by searchFoods when transforming USDA API payloads.
  private mapFood(food: UsdaFoodItem): Food {
    const per100gNutrients = this.mapPer100gNutrients(food.foodNutrients);

    return {
      id: `usda:${food.fdcId}`,
      source: 'USDA',
      sourceId: String(food.fdcId),
      name: food.description?.trim() || 'Unknown food',
      description: food.description?.trim() || null,
      brand: food.brandOwner?.trim() || food.brandName?.trim() || null,
      referenceServingSize: toNullableNumber(food.servingSize),
      referenceServingUnit: food.servingSizeUnit ?? null,
      servingSize: 100,
      servingUnit: 'g',
      per100gNutrients,
      nutrients: per100gNutrients,
    };
  }

  // USDA nutrient naming varies between datasets, so we match by either the
  // numeric code or the human-readable name.
  // Used by mapFood to build the canonical per-100g nutrient object.
  private mapPer100gNutrients(nutrients: UsdaFoodNutrient[] | undefined) {
    return createFoodNutrients({
      calories: this.resolveNutrient(nutrients, ['energy'], ['1008', '208']),
      proteinGrams: this.resolveNutrient(
        nutrients,
        ['protein'],
        ['1003', '203'],
      ),
      carbsGrams: this.resolveNutrient(
        nutrients,
        ['carbohydrate', 'carbohydrates'],
        ['1005', '205'],
      ),
      fatGrams: this.resolveNutrient(
        nutrients,
        ['total lipid', 'fat'],
        ['1004', '204'],
      ),
      fiberGrams: this.resolveNutrient(
        nutrients,
        ['fiber', 'dietary'],
        ['1079', '291'],
      ),
      sugarGrams: this.resolveNutrient(
        nutrients,
        ['sugar', 'sugars'],
        ['2000', '269'],
      ),
      sodiumMilligrams: this.resolveNutrient(
        nutrients,
        ['sodium'],
        ['1093', '307'],
      ),
    });
  }

  // Resolves a single nutrient value from USDA's mixed naming/code formats.
  // Used by mapPer100gNutrients for each nutrient field we care about.
  private resolveNutrient(
    nutrients: UsdaFoodNutrient[] | undefined,
    nameMatches: string[],
    nutrientNumbers: string[],
  ) {
    const nutrient = (nutrients ?? []).find((item) => {
      const nutrientName = item.nutrientName?.toLowerCase() ?? '';
      const nutrientNumber = item.nutrientNumber ?? '';

      return (
        nutrientNumbers.includes(nutrientNumber) ||
        nameMatches.some((value) => nutrientName.includes(value))
      );
    });

    const value = roundToTwoDecimals(toNullableNumber(nutrient?.value));
    if (value === null) {
      return null;
    }

    if (
      (nutrient?.unitName ?? '').toUpperCase() === 'G' &&
      nameMatches.includes('sodium')
    ) {
      return roundToTwoDecimals(value * 1000);
    }

    return value;
  }
}
