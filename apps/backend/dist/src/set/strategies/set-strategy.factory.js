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
exports.SetStrategyFactory = void 0;
const common_1 = require("@nestjs/common");
const set_types_1 = require("../set.types");
const brzycki_strategy_1 = require("./brzycki.strategy");
const cardio_load_strategy_1 = require("./cardio-load.strategy");
const wathan_strategy_1 = require("./wathan.strategy");
let SetStrategyFactory = class SetStrategyFactory {
    brzyckiStrategy;
    wathanStrategy;
    cardioLoadStrategy;
    constructor(brzyckiStrategy, wathanStrategy, cardioLoadStrategy) {
        this.brzyckiStrategy = brzyckiStrategy;
        this.wathanStrategy = wathanStrategy;
        this.cardioLoadStrategy = cardioLoadStrategy;
    }
    getStrategy(formula) {
        switch (formula) {
            case set_types_1.SetFormulaId.BRZYCKI:
                return this.brzyckiStrategy;
            case set_types_1.SetFormulaId.WATHAN:
                return this.wathanStrategy;
            case set_types_1.SetFormulaId.CARDIO_LOAD:
                return this.cardioLoadStrategy;
            default:
                throw new Error(`No calculation strategy registered for ${formula}`);
        }
    }
};
exports.SetStrategyFactory = SetStrategyFactory;
exports.SetStrategyFactory = SetStrategyFactory = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [brzycki_strategy_1.BrzyckiStrategy,
        wathan_strategy_1.WathanStrategy,
        cardio_load_strategy_1.CardioLoadStrategy])
], SetStrategyFactory);
//# sourceMappingURL=set-strategy.factory.js.map