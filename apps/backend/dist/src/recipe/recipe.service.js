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
var RecipeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecipeService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const spoonacular_connector_1 = require("./providers/spoonacular.connector");
const themealdb_connector_1 = require("./providers/themealdb.connector");
const recipe_mapper_1 = require("./providers/recipe-mapper");
let RecipeService = RecipeService_1 = class RecipeService {
    prisma;
    spoonacularConnector;
    theMealDbConnector;
    logger = new common_1.Logger(RecipeService_1.name);
    responseCache = new Map();
    responseCacheTtlMs = 60_000;
    constructor(prisma, spoonacularConnector, theMealDbConnector) {
        this.prisma = prisma;
        this.spoonacularConnector = spoonacularConnector;
        this.theMealDbConnector = theMealDbConnector;
    }
    async searchRecipes(args) {
        const normalizedArgs = this.normalizeArgs(args);
        const cacheKey = this.createResponseCacheKey(normalizedArgs);
        const inMemoryHit = this.getCachedResponse(cacheKey);
        if (inMemoryHit) {
            return inMemoryHit;
        }
        const cachedRecipes = await this.findCachedRecipes(normalizedArgs);
        if (this.hasUsefulResults(cachedRecipes)) {
            const response = this.buildResponse({
                args: normalizedArgs,
                items: cachedRecipes,
                sourceUsed: 'DATABASE',
                cacheHit: true,
                fallbackUsed: false,
            });
            this.storeResponseCache(cacheKey, response);
            return response;
        }
        const spoonacularRecipes = await this.trySpoonacular(normalizedArgs);
        if (spoonacularRecipes.length > 0) {
            await this.upsertRecipes(spoonacularRecipes);
        }
        const mergedCachedAndPrimary = this.mergeRecipes(cachedRecipes, spoonacularRecipes, normalizedArgs.pageSize);
        if (this.hasUsefulResults(mergedCachedAndPrimary)) {
            const response = this.buildResponse({
                args: normalizedArgs,
                items: mergedCachedAndPrimary,
                sourceUsed: 'SPOONACULAR',
                cacheHit: cachedRecipes.length > 0,
                fallbackUsed: false,
            });
            this.storeResponseCache(cacheKey, response);
            return response;
        }
        const fallbackRecipes = await this.tryTheMealDb(normalizedArgs);
        if (fallbackRecipes.length > 0) {
            await this.upsertRecipes(fallbackRecipes);
        }
        const finalItems = this.mergeRecipes(mergedCachedAndPrimary, fallbackRecipes, normalizedArgs.pageSize);
        const response = this.buildResponse({
            args: normalizedArgs,
            items: finalItems,
            sourceUsed: this.resolveSourceUsed({
                cachedRecipes,
                spoonacularRecipes,
                fallbackRecipes,
            }),
            cacheHit: cachedRecipes.length > 0,
            fallbackUsed: fallbackRecipes.length > 0,
        });
        this.storeResponseCache(cacheKey, response);
        return response;
    }
    normalizeArgs(args) {
        return {
            query: args.query.trim(),
            page: Math.max(1, Math.trunc(args.page || 1)),
            pageSize: Math.min(20, Math.max(1, Math.trunc(args.pageSize || 10))),
        };
    }
    createResponseCacheKey(args) {
        return `${this.normalizeQuery(args.query)}:${args.page}:${args.pageSize}`;
    }
    getCachedResponse(cacheKey) {
        const cachedValue = this.responseCache.get(cacheKey);
        if (!cachedValue) {
            return null;
        }
        if (cachedValue.expiresAt < Date.now()) {
            this.responseCache.delete(cacheKey);
            return null;
        }
        return cachedValue.value;
    }
    storeResponseCache(cacheKey, value) {
        this.responseCache.set(cacheKey, {
            expiresAt: Date.now() + this.responseCacheTtlMs,
            value,
        });
    }
    async findCachedRecipes(args) {
        const normalizedQuery = this.normalizeQuery(args.query);
        const recipeCacheModel = this.getRecipeCacheModel();
        if (!recipeCacheModel) {
            return [];
        }
        const records = await recipeCacheModel.findMany({
            where: {
                OR: [
                    {
                        normalizedTitle: {
                            contains: normalizedQuery,
                            mode: 'insensitive',
                        },
                    },
                    {
                        title: {
                            contains: args.query,
                            mode: 'insensitive',
                        },
                    },
                ],
            },
            orderBy: [{ normalizedTitle: 'asc' }, { createdAt: 'desc' }],
            take: args.pageSize,
            skip: (args.page - 1) * args.pageSize,
        });
        return records.map((record) => this.mapCachedRecipeToResponse(record));
    }
    mapCachedRecipeToResponse(record) {
        return {
            id: (0, recipe_mapper_1.createRecipeId)(record.source, record.sourceId),
            source: record.source,
            sourceId: record.sourceId,
            title: record.title,
            image: record.image,
            calories: record.calories,
            protein: record.protein,
            cookTime: record.cookTime,
            ingredients: record.ingredients,
            instructions: record.instructions,
            sourceUrl: record.sourceUrl,
            dietTags: record.dietTags,
        };
    }
    hasUsefulResults(items) {
        return items.length > 0;
    }
    mergeRecipes(primary, secondary, limit) {
        const mergedRecipes = new Map();
        for (const item of [...primary, ...secondary]) {
            mergedRecipes.set(`${item.source}:${item.sourceId}`, item);
        }
        return Array.from(mergedRecipes.values()).slice(0, limit);
    }
    buildResponse(input) {
        return {
            query: input.args.query,
            sourceUsed: input.sourceUsed,
            cacheHit: input.cacheHit,
            fallbackUsed: input.fallbackUsed,
            page: input.args.page,
            pageSize: input.args.pageSize,
            totalReturned: input.items.length,
            items: input.items,
        };
    }
    async trySpoonacular(args) {
        try {
            const result = await this.spoonacularConnector.searchRecipes(args);
            return result.items;
        }
        catch (error) {
            if (error instanceof spoonacular_connector_1.SpoonacularQuotaExceededError) {
                this.logger.warn(`Spoonacular quota reached for "${args.query}". Falling back to TheMealDB.`);
                return [];
            }
            const message = error instanceof Error ? error.message : 'Unknown Spoonacular error';
            this.logger.warn(`Spoonacular search failed for "${args.query}": ${message}`);
            return [];
        }
    }
    async tryTheMealDb(args) {
        try {
            const result = await this.theMealDbConnector.searchRecipes(args);
            return result.items;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown TheMealDB error';
            this.logger.warn(`TheMealDB search failed for "${args.query}": ${message}`);
            return [];
        }
    }
    async upsertRecipes(items) {
        const recipeCacheModel = this.getRecipeCacheModel();
        if (!recipeCacheModel) {
            return;
        }
        for (const item of items) {
            const data = this.createRecipeCacheRecord(item);
            await recipeCacheModel.upsert({
                where: {
                    source_sourceId: {
                        source: item.source,
                        sourceId: item.sourceId,
                    },
                },
                update: data,
                create: data,
            });
        }
    }
    normalizeQuery(value) {
        return value.trim().toLowerCase().replace(/\s+/g, ' ');
    }
    getRecipeCacheModel() {
        return this.prisma.recipeCache;
    }
    createRecipeCacheRecord(item) {
        return {
            source: item.source,
            sourceId: item.sourceId,
            title: item.title,
            normalizedTitle: this.normalizeQuery(item.title),
            image: item.image,
            calories: item.calories,
            protein: item.protein,
            cookTime: item.cookTime,
            ingredients: item.ingredients,
            instructions: item.instructions,
            sourceUrl: item.sourceUrl,
            dietTags: item.dietTags,
        };
    }
    resolveSourceUsed(input) {
        if (input.fallbackRecipes.length > 0) {
            return 'THE_MEAL_DB';
        }
        if (input.spoonacularRecipes.length > 0) {
            return 'SPOONACULAR';
        }
        if (input.cachedRecipes.length > 0) {
            return 'DATABASE';
        }
        return 'NONE';
    }
};
exports.RecipeService = RecipeService;
exports.RecipeService = RecipeService = RecipeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        spoonacular_connector_1.SpoonacularConnector,
        themealdb_connector_1.TheMealDbConnector])
], RecipeService);
//# sourceMappingURL=recipe.service.js.map