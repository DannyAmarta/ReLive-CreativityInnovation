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
exports.SpoonacularConnector = exports.SpoonacularQuotaExceededError = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const recipe_mapper_1 = require("./recipe-mapper");
class SpoonacularQuotaExceededError extends Error {
    constructor(message = 'Spoonacular quota exceeded') {
        super(message);
        this.name = 'SpoonacularQuotaExceededError';
    }
}
exports.SpoonacularQuotaExceededError = SpoonacularQuotaExceededError;
let SpoonacularConnector = class SpoonacularConnector {
    configService;
    constructor(configService) {
        this.configService = configService;
    }
    async searchRecipes(args) {
        const apiKey = this.configService.get('SPOONACULAR_API_KEY');
        if (!apiKey) {
            return this.emptyResponse(args.query, args.page, args.pageSize);
        }
        const offset = (args.page - 1) * args.pageSize;
        const searchParams = new URLSearchParams({
            query: args.query,
            number: String(args.pageSize),
            offset: String(offset),
            addRecipeInformation: 'true',
            addRecipeNutrition: 'true',
            fillIngredients: 'true',
            instructionsRequired: 'true',
            apiKey,
        });
        const response = await fetch(`https://api.spoonacular.com/recipes/complexSearch?${searchParams.toString()}`, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
            },
        });
        if (!response.ok) {
            if (response.status === 402 || response.status === 429) {
                throw new SpoonacularQuotaExceededError(`Spoonacular quota or rate limit reached with status ${response.status}`);
            }
            throw new Error(`Spoonacular request failed with status ${response.status}`);
        }
        const payload = (await response.json());
        const items = (payload.results ?? []).map((recipe) => this.mapRecipe(recipe));
        return {
            query: args.query,
            sourceUsed: items.length > 0 ? 'SPOONACULAR' : 'NONE',
            cacheHit: false,
            fallbackUsed: false,
            page: args.page,
            pageSize: args.pageSize,
            totalReturned: items.length,
            items,
        };
    }
    mapRecipe(recipe) {
        const nutrients = recipe.nutrition?.nutrients ?? [];
        const calories = this.resolveNutrientAmount(nutrients, 'Calories');
        const protein = this.resolveNutrientAmount(nutrients, 'Protein');
        const analyzedSteps = recipe.analyzedInstructions?.[0]?.steps
            ?.map((step) => step.step?.trim() ?? '')
            .filter(Boolean)
            .join('\n\n') ?? '';
        const ingredients = (0, recipe_mapper_1.normalizeIngredients)((recipe.extendedIngredients ?? []).map((ingredient) => {
            if (ingredient.original) {
                return ingredient.original;
            }
            return [ingredient.amount, ingredient.unit, ingredient.name]
                .filter((part) => part !== undefined && part !== null && `${part}`.trim())
                .join(' ');
        }));
        return {
            id: (0, recipe_mapper_1.createRecipeId)('SPOONACULAR', String(recipe.id)),
            source: 'SPOONACULAR',
            sourceId: String(recipe.id),
            title: recipe.title,
            image: recipe.image,
            calories,
            protein,
            cookTime: (0, recipe_mapper_1.normalizeNumericValue)(recipe.readyInMinutes),
            ingredients,
            instructions: (0, recipe_mapper_1.normalizeInstructions)(recipe.instructions || analyzedSteps),
            sourceUrl: recipe.sourceUrl ?? null,
            dietTags: (0, recipe_mapper_1.normalizeIngredients)(recipe.diets ?? []),
        };
    }
    resolveNutrientAmount(nutrients, nutrientName) {
        const match = nutrients?.find((nutrient) => nutrient.name?.toLowerCase() === nutrientName.toLowerCase());
        return (0, recipe_mapper_1.normalizeNumericValue)(match?.amount);
    }
    emptyResponse(query, page, pageSize) {
        return {
            query,
            sourceUsed: 'NONE',
            cacheHit: false,
            fallbackUsed: false,
            page,
            pageSize,
            totalReturned: 0,
            items: [],
        };
    }
};
exports.SpoonacularConnector = SpoonacularConnector;
exports.SpoonacularConnector = SpoonacularConnector = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SpoonacularConnector);
//# sourceMappingURL=spoonacular.connector.js.map