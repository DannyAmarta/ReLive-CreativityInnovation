import { Injectable } from '@nestjs/common';
import { FoodProviderResult, FoodSearchParams } from '../types/food.types';
import { Food } from '../entities/food.entity';
import {
  createFoodNutrients,
  isUsefulFood,
  roundToTwoDecimals,
  toNullableNumber,
} from './food-mapper';

type OpenFoodFactsProduct = {
  code?: string;
  product_name?: string;
  generic_name?: string;
  brands?: string;
  serving_quantity?: number | string;
  serving_quantity_unit?: string;
  serving_size?: string;
  nutriments?: Record<string, unknown>;
};

type OpenFoodFactsSearchResponse = {
  products?: OpenFoodFactsProduct[];
};

@Injectable()
export class OpenFoodFactsConnector {
  // Queries Open Food Facts and returns normalized food objects.
  // Used by FoodService.tryOpenFoodFacts as the fallback external provider.
  async searchFoods(params: FoodSearchParams): Promise<FoodProviderResult> {
    const searchParams = new URLSearchParams({
      search_terms: params.query,
      search_simple: '1',
      action: 'process',
      json: '1',
      page: String(params.page),
      page_size: String(params.pageSize),
    });

    const response = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?${searchParams.toString()}`,
    );

    if (!response.ok) {
      throw new Error(`Open Food Facts request failed with ${response.status}`);
    }

    const payload = (await response.json()) as OpenFoodFactsSearchResponse;
    const items = (payload.products ?? [])
      .map((product) => this.mapProduct(product))
      .filter(isUsefulFood);

    return { items };
  }

  // Maps a single Open Food Facts product into the unified food shape.
  // Used by searchFoods when transforming Open Food Facts API payloads.
  private mapProduct(product: OpenFoodFactsProduct): Food {
    const nutriments = product.nutriments ?? {};
    const per100gNutrients = this.mapPer100gNutrients(nutriments);

    return {
      id: `open-food-facts:${product.code ?? product.product_name ?? 'unknown'}`,
      source: 'OPEN_FOOD_FACTS',
      sourceId: product.code ?? product.product_name ?? 'unknown',
      name:
        product.product_name?.trim() ||
        product.generic_name?.trim() ||
        'Unknown food',
      description: product.generic_name?.trim() || null,
      brand: product.brands?.trim() || null,
      referenceServingSize: toNullableNumber(product.serving_quantity),
      referenceServingUnit:
        product.serving_quantity_unit ?? product.serving_size ?? null,
      servingSize: 100,
      servingUnit: 'g',
      per100gNutrients,
      nutrients: per100gNutrients,
    };
  }

  // Open Food Facts usually gives per-100g values already, but sodium may be
  // provided as salt. In that case we convert salt to sodium for our unified
  // model so the UI never needs source-specific rules.
  // Used by mapProduct to build the canonical nutrient payload.
  private mapPer100gNutrients(source: Record<string, unknown>) {
    const sodiumGrams = this.resolveValue(
      source,
      'sodium_100g',
      'sodium',
      'sodium_value',
    );
    const saltGrams = this.resolveValue(
      source,
      'salt_100g',
      'salt',
      'salt_value',
    );

    return createFoodNutrients({
      calories: roundToTwoDecimals(
        this.resolveValue(
          source,
          'energy-kcal_100g',
          'energy-kcal',
          'energy-kcal_value',
        ),
      ),
      proteinGrams: roundToTwoDecimals(
        this.resolveValue(
          source,
          'proteins_100g',
          'proteins',
          'proteins_value',
        ),
      ),
      carbsGrams: roundToTwoDecimals(
        this.resolveValue(
          source,
          'carbohydrates_100g',
          'carbohydrates',
          'carbohydrates_value',
        ),
      ),
      fatGrams: roundToTwoDecimals(
        this.resolveValue(source, 'fat_100g', 'fat', 'fat_value'),
      ),
      fiberGrams: roundToTwoDecimals(
        this.resolveValue(source, 'fiber_100g', 'fiber', 'fiber_value'),
      ),
      sugarGrams: roundToTwoDecimals(
        this.resolveValue(source, 'sugars_100g', 'sugars', 'sugars_value'),
      ),
      sodiumMilligrams: roundToTwoDecimals(
        sodiumGrams !== null
          ? sodiumGrams * 1000
          : saltGrams !== null
            ? (saltGrams / 2.5) * 1000
            : null,
      ),
    });
  }

  // Tries a sequence of known Open Food Facts nutriment keys until one resolves.
  // Used by mapPer100gNutrients because OFF key naming is not always consistent.
  private resolveValue(
    source: Record<string, unknown>,
    ...keys: string[]
  ): number | null {
    for (const key of keys) {
      const value = toNullableNumber(source[key]);
      if (value !== null) {
        return value;
      }
    }

    return null;
  }
}
