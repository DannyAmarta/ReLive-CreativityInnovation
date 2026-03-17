import type {
  Food,
  FoodNutrients,
  MealFoodItem,
  SavedFoodReference,
} from "@/types/food";

export function calculateNutrientsForServing(
  nutrients: FoodNutrients,
  servingSize: number,
): FoodNutrients {
  // The API keeps canonical values per 100g. The UI uses this helper anywhere
  // we need instant serving-size changes without another network request.
  const factor = servingSize / 100;

  return {
    calories: scaleValue(nutrients.calories, factor),
    proteinGrams: scaleValue(nutrients.proteinGrams, factor),
    carbsGrams: scaleValue(nutrients.carbsGrams, factor),
    fatGrams: scaleValue(nutrients.fatGrams, factor),
    fiberGrams: scaleValue(nutrients.fiberGrams, factor),
    sugarGrams: scaleValue(nutrients.sugarGrams, factor),
    sodiumMilligrams: scaleValue(nutrients.sodiumMilligrams, factor),
  };
}

export function withServingSize(food: Food, servingSize: number): Food {
  return {
    ...food,
    servingSize,
    servingUnit: "g",
    nutrients: calculateNutrientsForServing(food.per100gNutrients, servingSize),
  };
}

export function formatNutrientValue(value: number | null) {
  if (value === null) {
    return "--";
  }

  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function summarizeMealNutrition(items: MealFoodItem[]): FoodNutrients {
  return items.reduce<FoodNutrients>(
    (totals, item) => ({
      calories: addValues(totals.calories, item.nutrients.calories),
      proteinGrams: addValues(totals.proteinGrams, item.nutrients.proteinGrams),
      carbsGrams: addValues(totals.carbsGrams, item.nutrients.carbsGrams),
      fatGrams: addValues(totals.fatGrams, item.nutrients.fatGrams),
      fiberGrams: addValues(totals.fiberGrams, item.nutrients.fiberGrams),
      sugarGrams: addValues(totals.sugarGrams, item.nutrients.sugarGrams),
      sodiumMilligrams: addValues(
        totals.sodiumMilligrams,
        item.nutrients.sodiumMilligrams,
      ),
    }),
    {
      calories: 0,
      proteinGrams: 0,
      carbsGrams: 0,
      fatGrams: 0,
      fiberGrams: 0,
      sugarGrams: 0,
      sodiumMilligrams: 0,
    },
  );
}

export function createMealItem(
  food: Food,
  servingSize: number,
  existingId?: string,
): MealFoodItem {
  const normalizedFood = withServingSize(food, servingSize);

  return {
    id: existingId ?? `${food.id}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    foodId: food.id,
    name: food.name,
    brand: food.brand,
    source: food.source,
    servingSize,
    per100gNutrients: food.per100gNutrients,
    nutrients: normalizedFood.nutrients,
  };
}

export function updateMealItemServing(item: MealFoodItem, servingSize: number): MealFoodItem {
  return {
    ...item,
    servingSize,
    nutrients: calculateNutrientsForServing(item.per100gNutrients, servingSize),
  };
}

export function rememberRecentValue(current: string[], nextValue: string, maxItems = 6) {
  return [
    nextValue,
    ...current.filter((item) => item.toLowerCase() !== nextValue.toLowerCase()),
  ].slice(0, maxItems);
}

export function toggleFavoriteFood(
  current: SavedFoodReference[],
  food: Food,
  maxItems = 8,
) {
  const exists = current.some((item) => item.id === food.id);
  if (exists) {
    return current.filter((item) => item.id !== food.id);
  }

  return [
    {
      id: food.id,
      name: food.name,
      brand: food.brand,
      source: food.source,
    },
    ...current,
  ].slice(0, maxItems);
}

function scaleValue(value: number | null, factor: number) {
  if (value === null) {
    return null;
  }

  return Number((value * factor).toFixed(1));
}

function addValues(left: number | null, right: number | null) {
  return Number(((left ?? 0) + (right ?? 0)).toFixed(1));
}
