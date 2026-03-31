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
var FoodCacheWarmerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FoodCacheWarmerService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const food_service_1 = require("./food.service");
let FoodCacheWarmerService = FoodCacheWarmerService_1 = class FoodCacheWarmerService {
    foodService;
    logger = new common_1.Logger(FoodCacheWarmerService_1.name);
    searchKeywords = [
        'chicken breast', 'eggs', 'oats', 'whey protein', 'banana', 'rice',
        'broccoli', 'salmon', 'sweet potato', 'almonds', 'peanut butter',
        'spinach', 'greek yogurt', 'tuna', 'avocado', 'quinoa', 'cottage cheese',
        'beef', 'turkey', 'milk', 'protein bar', 'olive oil', 'chia seeds', 'apple'
    ];
    constructor(foodService) {
        this.foodService = foodService;
    }
    async handleDailyCacheWarming() {
        this.logger.log('🔥 Starting daily Food Cache Warming job...');
        const shuffled = [...this.searchKeywords].sort(() => 0.5 - Math.random());
        const keywordsForToday = shuffled.slice(0, 5);
        for (const keyword of keywordsForToday) {
            this.logger.log(`Warming food cache for keyword: "${keyword}"`);
            try {
                await this.foodService.searchFoods({
                    query: keyword,
                    page: 1,
                    pageSize: 20,
                    servingSize: 100,
                });
                this.logger.log(`✅ Successfully cached food results for "${keyword}"`);
                await new Promise((resolve) => setTimeout(resolve, 2000));
            }
            catch (error) {
                this.logger.error(`❌ Failed to warm food cache for "${keyword}"`, error?.stack);
            }
        }
        this.logger.log('🏁 Daily Food Cache Warming completed.');
    }
};
exports.FoodCacheWarmerService = FoodCacheWarmerService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_4AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FoodCacheWarmerService.prototype, "handleDailyCacheWarming", null);
exports.FoodCacheWarmerService = FoodCacheWarmerService = FoodCacheWarmerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [food_service_1.FoodService])
], FoodCacheWarmerService);
//# sourceMappingURL=food-cache-warmer.service.js.map