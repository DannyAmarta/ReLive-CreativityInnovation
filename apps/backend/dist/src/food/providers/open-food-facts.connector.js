"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenFoodFactsConnector = void 0;
const common_1 = require("@nestjs/common");
const food_mapper_1 = require("./food-mapper");
let OpenFoodFactsConnector = class OpenFoodFactsConnector {
    async searchFoods(params) {
        const searchParams = new URLSearchParams({
            search_terms: params.query,
            search_simple: '1',
            action: 'process',
            json: '1',
            page: String(params.page),
            page_size: String(params.pageSize),
        });
        const response = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?${searchParams.toString()}`);
        if (!response.ok) {
            throw new Error(`Open Food Facts request failed with ${response.status}`);
        }
        const payload = (await response.json());
        const items = (payload.products ?? [])
            .map((product) => this.mapProduct(product))
            .filter(food_mapper_1.isUsefulFood);
        return { items };
    }
    mapProduct(product) {
        const nutriments = product.nutriments ?? {};
        const per100gNutrients = this.mapPer100gNutrients(nutriments);
        return {
            id: `open-food-facts:${product.code ?? product.product_name ?? 'unknown'}`,
            source: 'OPEN_FOOD_FACTS',
            sourceId: product.code ?? product.product_name ?? 'unknown',
            name: product.product_name?.trim() ||
                product.generic_name?.trim() ||
                'Unknown food',
            description: product.generic_name?.trim() || null,
            brand: product.brands?.trim() || null,
            referenceServingSize: (0, food_mapper_1.toNullableNumber)(product.serving_quantity),
            referenceServingUnit: product.serving_quantity_unit ?? product.serving_size ?? null,
            servingSize: 100,
            servingUnit: 'g',
            per100gNutrients,
            nutrients: per100gNutrients,
        };
    }
    mapPer100gNutrients(source) {
        const sodiumGrams = this.resolveValue(source, 'sodium_100g', 'sodium', 'sodium_value');
        const saltGrams = this.resolveValue(source, 'salt_100g', 'salt', 'salt_value');
        return (0, food_mapper_1.createFoodNutrients)({
            calories: (0, food_mapper_1.roundToTwoDecimals)(this.resolveValue(source, 'energy-kcal_100g', 'energy-kcal', 'energy-kcal_value')),
            proteinGrams: (0, food_mapper_1.roundToTwoDecimals)(this.resolveValue(source, 'proteins_100g', 'proteins', 'proteins_value')),
            carbsGrams: (0, food_mapper_1.roundToTwoDecimals)(this.resolveValue(source, 'carbohydrates_100g', 'carbohydrates', 'carbohydrates_value')),
            fatGrams: (0, food_mapper_1.roundToTwoDecimals)(this.resolveValue(source, 'fat_100g', 'fat', 'fat_value')),
            fiberGrams: (0, food_mapper_1.roundToTwoDecimals)(this.resolveValue(source, 'fiber_100g', 'fiber', 'fiber_value')),
            sugarGrams: (0, food_mapper_1.roundToTwoDecimals)(this.resolveValue(source, 'sugars_100g', 'sugars', 'sugars_value')),
            sodiumMilligrams: (0, food_mapper_1.roundToTwoDecimals)(sodiumGrams !== null
                ? sodiumGrams * 1000
                : saltGrams !== null
                    ? (saltGrams / 2.5) * 1000
                    : null),
        });
    }
    resolveValue(source, ...keys) {
        for (const key of keys) {
            const value = (0, food_mapper_1.toNullableNumber)(source[key]);
            if (value !== null) {
                return value;
            }
        }
        return null;
    }
};
exports.OpenFoodFactsConnector = OpenFoodFactsConnector;
exports.OpenFoodFactsConnector = OpenFoodFactsConnector = __decorate([
    (0, common_1.Injectable)()
], OpenFoodFactsConnector);
//# sourceMappingURL=open-food-facts.connector.js.map