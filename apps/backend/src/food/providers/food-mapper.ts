import { Food } from '../entities/food.entity';
import { FoodNutrients } from '../entities/food-nutrients.entity';

// Creates a stable nutrient object with explicit nulls for missing values.
// Used by both provider connectors and any serving-size recalculation helpers.
export function createFoodNutrients(
  values: Partial<FoodNutrients>,
): FoodNutrients {
  return {
    calories: values.calories ?? null,
    proteinGrams: values.proteinGrams ?? null,
    carbsGrams: values.carbsGrams ?? null,
    fatGrams: values.fatGrams ?? null,
    fiberGrams: values.fiberGrams ?? null,
    sugarGrams: values.sugarGrams ?? null,
    sodiumMilligrams: values.sodiumMilligrams ?? null,
  };
}

// Filters out placeholder provider hits that have no useful nutrition information.
// Used by both USDA and Open Food Facts connectors after mapping.
export function isUsefulFood(food: Food) {
  if (!food.name?.trim()) {
    return false;
  }

  // Some provider hits are effectively placeholders with no nutrition data.
  return Object.values(food.nutrients).some((value) => value !== null);
}

// Safely converts loose provider values into numbers or null.
// Used anywhere external API data may arrive as string, number, or missing.
export function toNullableNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsedValue = Number(value);
    if (Number.isFinite(parsedValue)) {
      return parsedValue;
    }
  }

  return null;
}

// Keeps nutrient values stable and compact before they are cached or returned.
// Used by the provider connectors and serving-size scaling.
export function roundToTwoDecimals(value: number | null) {
  if (value === null) {
    return null;
  }

  return Number(value.toFixed(2));
}

// Scales the canonical per-100g nutrient values to a caller-provided serving size.
// Used by the backend service before returning results and by the frontend for local math.
export function scaleNutrientsForServing(
  nutrients: FoodNutrients,
  servingSize: number,
): FoodNutrients {
  const factor = servingSize / 100;

  return createFoodNutrients({
    calories: scaleValue(nutrients.calories, factor),
    proteinGrams: scaleValue(nutrients.proteinGrams, factor),
    carbsGrams: scaleValue(nutrients.carbsGrams, factor),
    fatGrams: scaleValue(nutrients.fatGrams, factor),
    fiberGrams: scaleValue(nutrients.fiberGrams, factor),
    sugarGrams: scaleValue(nutrients.sugarGrams, factor),
    sodiumMilligrams: scaleValue(nutrients.sodiumMilligrams, factor),
  });
}

// Small internal helper for scaling individual nutrient fields.
// Used only by scaleNutrientsForServing.
function scaleValue(value: number | null | undefined, factor: number) {
  if (value === null || value === undefined) {
    return null;
  }

  return roundToTwoDecimals(value * factor);
}
