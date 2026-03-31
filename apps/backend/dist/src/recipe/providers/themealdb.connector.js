"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TheMealDbConnector = void 0;
const common_1 = require("@nestjs/common");
const recipe_mapper_1 = require("./recipe-mapper");
let TheMealDbConnector = class TheMealDbConnector {
    async searchRecipes(args) {
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(args.query)}`, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error(`TheMealDB request failed with status ${response.status}`);
        }
        const payload = (await response.json());
        const startIndex = (args.page - 1) * args.pageSize;
        const items = (payload.meals ?? [])
            .slice(startIndex, startIndex + args.pageSize)
            .map((recipe) => this.mapRecipe(recipe));
        return {
            query: args.query,
            sourceUsed: items.length > 0 ? 'THE_MEAL_DB' : 'NONE',
            cacheHit: false,
            fallbackUsed: true,
            page: args.page,
            pageSize: args.pageSize,
            totalReturned: items.length,
            items,
        };
    }
    mapRecipe(recipe) {
        return {
            id: (0, recipe_mapper_1.createRecipeId)('THE_MEAL_DB', recipe.idMeal),
            source: 'THE_MEAL_DB',
            sourceId: recipe.idMeal,
            title: recipe.strMeal,
            image: recipe.strMealThumb,
            calories: null,
            protein: null,
            cookTime: null,
            ingredients: this.extractIngredients(recipe),
            instructions: (0, recipe_mapper_1.normalizeInstructions)(recipe.strInstructions),
            sourceUrl: recipe.strSource ?? null,
            dietTags: (0, recipe_mapper_1.normalizeIngredients)([recipe.strCategory, recipe.strArea]),
        };
    }
    extractIngredients(recipe) {
        return (0, recipe_mapper_1.normalizeIngredients)(Array.from({ length: 20 }, (_, index) => {
            const ingredient = recipe[`strIngredient${index + 1}`];
            const measure = recipe[`strMeasure${index + 1}`];
            return [measure, ingredient].filter(Boolean).join(' ');
        }));
    }
};
exports.TheMealDbConnector = TheMealDbConnector;
exports.TheMealDbConnector = TheMealDbConnector = __decorate([
    (0, common_1.Injectable)()
], TheMealDbConnector);
//# sourceMappingURL=themealdb.connector.js.map