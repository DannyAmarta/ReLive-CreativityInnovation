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
var FoodService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FoodService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const embedded_foods_1 = require("./data/embedded-foods");
const open_food_facts_connector_1 = require("./providers/open-food-facts.connector");
const food_mapper_1 = require("./providers/food-mapper");
const usda_food_connector_1 = require("./providers/usda-food.connector");
let FoodService = FoodService_1 = class FoodService {
    prisma;
    usdaFoodConnector;
    openFoodFactsConnector;
    logger = new common_1.Logger(FoodService_1.name);
    responseCache = new Map();
    responseCacheTtlMs = 60_000;
    constructor(prisma, usdaFoodConnector, openFoodFactsConnector) {
        this.prisma = prisma;
        this.usdaFoodConnector = usdaFoodConnector;
        this.openFoodFactsConnector = openFoodFactsConnector;
    }
    async searchFoods(args) {
        const normalizedArgs = {
            query: args.query.trim(),
            page: Math.max(1, Math.trunc(args.page || 1)),
            pageSize: Math.min(20, Math.max(1, Math.trunc(args.pageSize || 10))),
            servingSize: Math.max(1, Math.trunc(args.servingSize || 100)),
        };
        const cacheKey = `${this.normalizeQuery(normalizedArgs.query)}:${normalizedArgs.page}:${normalizedArgs.pageSize}:${normalizedArgs.servingSize}`;
        const cached = this.responseCache.get(cacheKey);
        if (cached && cached.expiresAt > Date.now()) {
            return cached.value;
        }
        const cachedFoods = await this.findCachedFoods(normalizedArgs);
        if (this.hasUsefulResults(cachedFoods)) {
            const response = this.buildResponse({
                args: normalizedArgs,
                items: cachedFoods,
                sourceUsed: 'DATABASE',
                cacheHit: true,
                fallbackUsed: false,
            });
            this.storeResponseCache(cacheKey, response);
            return response;
        }
        const usdaFoods = await this.tryUsda(normalizedArgs);
        if (usdaFoods.length > 0) {
            await this.upsertFoods(usdaFoods);
        }
        const mergedCachedAndUsda = this.mergeFoods(cachedFoods, usdaFoods, normalizedArgs.pageSize);
        if (this.hasUsefulResults(mergedCachedAndUsda)) {
            const response = this.buildResponse({
                args: normalizedArgs,
                items: mergedCachedAndUsda,
                sourceUsed: 'USDA',
                cacheHit: cachedFoods.length > 0,
                fallbackUsed: false,
            });
            this.storeResponseCache(cacheKey, response);
            return response;
        }
        const openFoodFactsFoods = await this.tryOpenFoodFacts(normalizedArgs);
        if (openFoodFactsFoods.length > 0) {
            await this.upsertFoods(openFoodFactsFoods);
        }
        const finalItems = this.mergeFoods(mergedCachedAndUsda, openFoodFactsFoods, normalizedArgs.pageSize);
        const embeddedFoods = this.hasUsefulResults(finalItems)
            ? []
            : this.findEmbeddedFoods(normalizedArgs);
        const completedItems = this.mergeFoods(finalItems, embeddedFoods, normalizedArgs.pageSize);
        const response = this.buildResponse({
            args: normalizedArgs,
            items: completedItems,
            sourceUsed: this.resolveSourceUsed({
                cachedFoods,
                usdaFoods,
                openFoodFactsFoods,
                embeddedFoods,
            }),
            cacheHit: cachedFoods.length > 0,
            fallbackUsed: openFoodFactsFoods.length > 0 || embeddedFoods.length > 0,
        });
        this.storeResponseCache(cacheKey, response);
        return response;
    }
    storeResponseCache(cacheKey, value) {
        this.responseCache.set(cacheKey, {
            expiresAt: Date.now() + this.responseCacheTtlMs,
            value,
        });
    }
    async findCachedFoods(args) {
        const normalizedQuery = this.normalizeQuery(args.query);
        const foodCacheModel = this.getFoodCacheModel();
        if (!foodCacheModel) {
            return [];
        }
        const records = await foodCacheModel.findMany({
            where: {
                OR: [
                    {
                        normalizedName: {
                            contains: normalizedQuery,
                            mode: 'insensitive',
                        },
                    },
                    {
                        name: {
                            contains: args.query,
                            mode: 'insensitive',
                        },
                    },
                    {
                        brand: {
                            contains: args.query,
                            mode: 'insensitive',
                        },
                    },
                ],
            },
            orderBy: [{ normalizedName: 'asc' }, { createdAt: 'desc' }],
            take: args.pageSize,
            skip: (args.page - 1) * args.pageSize,
        });
        return records.map((record) => this.mapCachedFoodToResponse(record, args.servingSize));
    }
    mapCachedFoodToResponse(record, servingSize) {
        const per100gNutrients = this.buildPer100gNutrientsFromRecord(record);
        return {
            id: `${record.source.toLowerCase()}:${record.sourceId}`,
            source: record.source,
            sourceId: record.sourceId,
            name: record.name,
            description: record.description,
            brand: record.brand,
            referenceServingSize: record.referenceServingSize,
            referenceServingUnit: record.referenceServingUnit,
            servingSize,
            servingUnit: 'g',
            per100gNutrients,
            nutrients: (0, food_mapper_1.scaleNutrientsForServing)(per100gNutrients, servingSize),
        };
    }
    buildPer100gNutrientsFromRecord(record) {
        return {
            calories: record.caloriesPer100g,
            proteinGrams: record.proteinGramsPer100g,
            carbsGrams: record.carbsGramsPer100g,
            fatGrams: record.fatGramsPer100g,
            fiberGrams: record.fiberGramsPer100g,
            sugarGrams: record.sugarGramsPer100g,
            sodiumMilligrams: record.sodiumMilligramsPer100g,
        };
    }
    hasUsefulResults(items) {
        return items.length > 0;
    }
    findEmbeddedFoods(args) {
        const normalizedQuery = this.normalizeQuery(args.query);
        return embedded_foods_1.EMBEDDED_FOODS.filter((item) => {
            const haystacks = [
                this.normalizeQuery(item.name),
                this.normalizeQuery(item.description ?? ''),
                this.normalizeQuery(item.brand ?? ''),
            ].filter((value) => value.length > 0);
            return haystacks.some((value) => value.includes(normalizedQuery) || normalizedQuery.includes(value));
        })
            .slice((args.page - 1) * args.pageSize, args.page * args.pageSize)
            .map((item) => this.withServingSize(item, args.servingSize));
    }
    mergeFoods(primary, secondary, limit) {
        const mergedFoods = new Map();
        for (const item of [...primary, ...secondary]) {
            mergedFoods.set(`${item.source}:${item.sourceId}`, item);
        }
        return Array.from(mergedFoods.values()).slice(0, limit);
    }
    buildResponse(input) {
        return {
            query: input.args.query,
            sourceUsed: input.sourceUsed,
            cacheHit: input.cacheHit,
            fallbackUsed: input.fallbackUsed,
            page: input.args.page,
            pageSize: input.args.pageSize,
            servingSize: input.args.servingSize,
            totalReturned: input.items.length,
            items: input.items,
        };
    }
    async tryUsda(args) {
        try {
            const result = await this.usdaFoodConnector.searchFoods(args);
            return result.items.map((item) => this.withServingSize(item, args.servingSize));
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown USDA error';
            this.logger.warn(`USDA search failed for "${args.query}": ${message}`);
            return [];
        }
    }
    async tryOpenFoodFacts(args) {
        try {
            const result = await this.openFoodFactsConnector.searchFoods(args);
            return result.items.map((item) => this.withServingSize(item, args.servingSize));
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown Open Food Facts error';
            this.logger.warn(`Open Food Facts search failed for "${args.query}": ${message}`);
            return [];
        }
    }
    withServingSize(item, servingSize) {
        return {
            ...item,
            servingSize,
            servingUnit: 'g',
            nutrients: (0, food_mapper_1.scaleNutrientsForServing)(item.per100gNutrients, servingSize),
        };
    }
    async upsertFoods(items) {
        const foodCacheModel = this.getFoodCacheModel();
        if (!foodCacheModel) {
            return;
        }
        for (const item of items) {
            const data = this.createFoodCacheRecord(item);
            await foodCacheModel.upsert({
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
    getFoodCacheModel() {
        return this.prisma.foodCache;
    }
    createFoodCacheRecord(item) {
        return {
            source: item.source,
            sourceId: item.sourceId,
            name: item.name,
            normalizedName: this.normalizeQuery(item.name),
            description: item.description,
            brand: item.brand,
            referenceServingSize: item.referenceServingSize,
            referenceServingUnit: item.referenceServingUnit,
            caloriesPer100g: item.per100gNutrients.calories,
            proteinGramsPer100g: item.per100gNutrients.proteinGrams,
            carbsGramsPer100g: item.per100gNutrients.carbsGrams,
            fatGramsPer100g: item.per100gNutrients.fatGrams,
            fiberGramsPer100g: item.per100gNutrients.fiberGrams,
            sugarGramsPer100g: item.per100gNutrients.sugarGrams,
            sodiumMilligramsPer100g: item.per100gNutrients.sodiumMilligrams,
        };
    }
    resolveSourceUsed(input) {
        if (input.openFoodFactsFoods.length > 0) {
            return 'OPEN_FOOD_FACTS';
        }
        if (input.usdaFoods.length > 0) {
            return 'USDA';
        }
        if (input.cachedFoods.length > 0) {
            return 'DATABASE';
        }
        if (input.embeddedFoods.length > 0) {
            return 'SEED';
        }
        return 'NONE';
    }
};
exports.FoodService = FoodService;
exports.FoodService = FoodService = FoodService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        usda_food_connector_1.UsdaFoodConnector,
        open_food_facts_connector_1.OpenFoodFactsConnector])
], FoodService);
//# sourceMappingURL=food.service.js.map