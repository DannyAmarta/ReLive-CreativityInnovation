import { Recipe } from '../recipe.types';

// This helper normalizes repeated instruction text coming from recipe providers.
// It is used by both provider connectors so the frontend always receives one readable instruction string.
export function normalizeInstructions(value: string | null | undefined) {
  if (!value) {
    return 'Instructions are not available for this recipe yet.';
  }

  return value.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

// This helper removes empty ingredient values and trims the final list.
// It is used by both provider connectors before unified recipe objects are returned.
export function normalizeIngredients(values: Array<string | null | undefined>) {
  return values.map((value) => value?.trim() ?? '').filter(Boolean);
}

// This helper prevents provider nutrition values from sending `NaN` into the shared recipe model.
// It is used when Spoonacular calories/protein values are extracted from nutrient arrays.
export function normalizeNumericValue(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return null;
  }

  return value;
}

// This helper creates the stable frontend-facing recipe id from source + sourceId.
// It is used by provider connectors and cache rehydration.
export function createRecipeId(source: Recipe['source'], sourceId: string) {
  return `${source.toLowerCase()}:${sourceId}`;
}
