"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const prisma_module_1 = require("../prisma/prisma.module");
const set_resolver_1 = require("./set.resolver");
const set_service_1 = require("./set.service");
const performance_analytics_service_1 = require("./performance-analytics.service");
const statistical_aggregator_service_1 = require("./statistical-aggregator.service");
const brzycki_strategy_1 = require("./strategies/brzycki.strategy");
const wathan_strategy_1 = require("./strategies/wathan.strategy");
const cardio_load_strategy_1 = require("./strategies/cardio-load.strategy");
const set_strategy_factory_1 = require("./strategies/set-strategy.factory");
let SetModule = class SetModule {
};
exports.SetModule = SetModule;
exports.SetModule = SetModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            config_1.ConfigModule,
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    secret: configService.getOrThrow('JWT_SECRET'),
                    signOptions: {
                        expiresIn: configService.getOrThrow('JWT_EXPIRES_IN'),
                    },
                }),
            }),
        ],
        controllers: [],
        providers: [
            set_service_1.SetService,
            set_resolver_1.SetResolver,
            performance_analytics_service_1.PerformanceAnalyticsService,
            statistical_aggregator_service_1.StatisticalAggregatorService,
            brzycki_strategy_1.BrzyckiStrategy,
            wathan_strategy_1.WathanStrategy,
            cardio_load_strategy_1.CardioLoadStrategy,
            set_strategy_factory_1.SetStrategyFactory,
        ],
        exports: [set_service_1.SetService, performance_analytics_service_1.PerformanceAnalyticsService, statistical_aggregator_service_1.StatisticalAggregatorService],
    })
], SetModule);
//# sourceMappingURL=set.module.js.map