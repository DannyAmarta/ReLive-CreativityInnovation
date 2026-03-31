"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeInstructions = normalizeInstructions;
exports.normalizeIngredients = normalizeIngredients;
exports.normalizeNumericValue = normalizeNumericValue;
exports.createRecipeId = createRecipeId;
function normalizeInstructions(value) {
    if (!value) {
        return 'Instructions are not available for this recipe yet.';
    }
    return value
        .replace(/\r\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}
function normalizeIngredients(values) {
    return values.map((value) => value?.trim() ?? '').filter(Boolean);
}
function normalizeNumericValue(value) {
    if (value === null || value === undefined || Number.isNaN(value)) {
        return null;
    }
    return value;
}
function createRecipeId(source, sourceId) {
    return `${source.toLowerCase()}:${sourceId}`;
}
//# sourceMappingURL=recipe-mapper.js.map