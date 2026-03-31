"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FoodModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../prisma/prisma.module");
const food_resolver_1 = require("./food.resolver");
const food_service_1 = require("./food.service");
const usda_food_connector_1 = require("./providers/usda-food.connector");
const open_food_facts_connector_1 = require("./providers/open-food-facts.connector");
const food_cache_warmer_service_1 = require("./food-cache-warmer.service");
let FoodModule = class FoodModule {
};
exports.FoodModule = FoodModule;
exports.FoodModule = FoodModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [],
        providers: [
            food_resolver_1.FoodResolver,
            food_service_1.FoodService,
            usda_food_connector_1.UsdaFoodConnector,
            open_food_facts_connector_1.OpenFoodFactsConnector,
            food_cache_warmer_service_1.FoodCacheWarmerService,
        ],
    })
], FoodModule);
//# sourceMappingURL=food.module.js.map