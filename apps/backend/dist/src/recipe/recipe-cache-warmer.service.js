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
var RecipeCacheWarmerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecipeCacheWarmerService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const recipe_service_1 = require("./recipe.service");
let RecipeCacheWarmerService = RecipeCacheWarmerService_1 = class RecipeCacheWarmerService {
    recipeService;
    logger = new common_1.Logger(RecipeCacheWarmerService_1.name);
    searchKeywords = [
        'chicken', 'beef', 'vegan', 'pasta', 'salad', 'keto',
        'breakfast', 'dinner', 'dessert', 'soup', 'healthy',
        'fast', 'smoothie', 'fish', 'rice', 'low carb'
    ];
    constructor(recipeService) {
        this.recipeService = recipeService;
    }
    async handleDailyCacheWarming() {
        this.logger.log('🚀 Starting daily Recipe Cache Warming job...');
        const shuffled = [...this.searchKeywords].sort(() => 0.5 - Math.random());
        const keywordsForToday = shuffled.slice(0, 3);
        for (const keyword of keywordsForToday) {
            this.logger.log(`Warming cache for keyword: "${keyword}"`);
            try {
                await this.recipeService.searchRecipes({
                    query: keyword,
                    page: 1,
                    pageSize: 20,
                });
                this.logger.log(`✅ Successfully warmed cache for "${keyword}"`);
                await new Promise((resolve) => setTimeout(resolve, 2000));
            }
            catch (error) {
                this.logger.error(`❌ Failed to warm cache for "${keyword}"`, error?.stack);
            }
        }
        this.logger.log('🏁 Daily Recipe Cache Warming job completed.');
    }
};
exports.RecipeCacheWarmerService = RecipeCacheWarmerService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_3AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RecipeCacheWarmerService.prototype, "handleDailyCacheWarming", null);
exports.RecipeCacheWarmerService = RecipeCacheWarmerService = RecipeCacheWarmerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [recipe_service_1.RecipeService])
], RecipeCacheWarmerService);
//# sourceMappingURL=recipe-cache-warmer.service.js.map