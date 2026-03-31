"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsdaFoodConnector = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const food_mapper_1 = require("./food-mapper");
let UsdaFoodConnector = class UsdaFoodConnector {
    configService;
    constructor(configService) {
        this.configService = configService;
    }
    async searchFoods(params) {
        const apiKey = this.configService.get('USDA_API_KEY');
        if (!apiKey) {
            return { items: [] };
        }
        const response = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${encodeURIComponent(apiKey)}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: params.query,
                pageNumber: params.page,
                pageSize: params.pageSize,
            }),
        });
        if (!response.ok) {
            throw new Error(`USDA request failed with ${response.status}`);
        }
        const payload = (await response.json());
        const items = (payload.foods ?? [])
            .map((food) => this.mapFood(food))
            .filter(food_mapper_1.isUsefulFood);
        return { items };
    }
    mapFood(food) {
        const per100gNutrients = this.mapPer100gNutrients(food.foodNutrients);
        return {
            id: `usda:${food.fdcId}`,
            source: 'USDA',
            sourceId: String(food.fdcId),
            name: food.description?.trim() || 'Unknown food',
            description: food.description?.trim() || null,
            brand: food.brandOwner?.trim() || food.brandName?.trim() || null,
            referenceServingSize: (0, food_mapper_1.toNullableNumber)(food.servingSize),
            referenceServingUnit: food.servingSizeUnit ?? null,
            servingSize: 100,
            servingUnit: 'g',
            per100gNutrients,
            nutrients: per100gNutrients,
        };
    }
    mapPer100gNutrients(nutrients) {
        return (0, food_mapper_1.createFoodNutrients)({
            calories: this.resolveNutrient(nutrients, ['energy'], ['1008', '208']),
            proteinGrams: this.resolveNutrient(nutrients, ['protein'], ['1003', '203']),
            carbsGrams: this.resolveNutrient(nutrients, ['carbohydrate', 'carbohydrates'], ['1005', '205']),
            fatGrams: this.resolveNutrient(nutrients, ['total lipid', 'fat'], ['1004', '204']),
            fiberGrams: this.resolveNutrient(nutrients, ['fiber', 'dietary'], ['1079', '291']),
            sugarGrams: this.resolveNutrient(nutrients, ['sugar', 'sugars'], ['2000', '269']),
            sodiumMilligrams: this.resolveNutrient(nutrients, ['sodium'], ['1093', '307']),
        });
    }
    resolveNutrient(nutrients, nameMatches, nutrientNumbers) {
        const nutrient = (nutrients ?? []).find((item) => {
            const nutrientName = item.nutrientName?.toLowerCase() ?? '';
            const nutrientNumber = item.nutrientNumber ?? '';
            return (nutrientNumbers.includes(nutrientNumber) ||
                nameMatches.some((value) => nutrientName.includes(value)));
        });
        const value = (0, food_mapper_1.roundToTwoDecimals)((0, food_mapper_1.toNullableNumber)(nutrient?.value));
        if (value === null) {
            return null;
        }
        if ((nutrient?.unitName ?? '').toUpperCase() === 'G' &&
            nameMatches.includes('sodium')) {
            return (0, food_mapper_1.roundToTwoDecimals)(value * 1000);
        }
        return value;
    }
};
exports.UsdaFoodConnector = UsdaFoodConnector;
exports.UsdaFoodConnector = UsdaFoodConnector = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], UsdaFoodConnector);
//# sourceMappingURL=usda-food.connector.js.map