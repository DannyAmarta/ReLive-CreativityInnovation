"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFoodNutrients = createFoodNutrients;
exports.isUsefulFood = isUsefulFood;
exports.toNullableNumber = toNullableNumber;
exports.roundToTwoDecimals = roundToTwoDecimals;
exports.scaleNutrientsForServing = scaleNutrientsForServing;
function createFoodNutrients(values) {
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
function isUsefulFood(food) {
    if (!food.name?.trim()) {
        return false;
    }
    return Object.values(food.nutrients).some((value) => value !== null);
}
function toNullableNumber(value) {
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
function roundToTwoDecimals(value) {
    if (value === null) {
        return null;
    }
    return Number(value.toFixed(2));
}
function scaleNutrientsForServing(nutrients, servingSize) {
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
function scaleValue(value, factor) {
    if (value === null || value === undefined) {
        return null;
    }
    return roundToTwoDecimals(value * factor);
}
//# sourceMappingURL=food-mapper.js.map