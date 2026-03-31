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
exports.FoodNutrients = void 0;
const graphql_1 = require("@nestjs/graphql");
let FoodNutrients = class FoodNutrients {
    calories;
    proteinGrams;
    carbsGrams;
    fatGrams;
    fiberGrams;
    sugarGrams;
    sodiumMilligrams;
};
exports.FoodNutrients = FoodNutrients;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Object)
], FoodNutrients.prototype, "calories", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Object)
], FoodNutrients.prototype, "proteinGrams", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Object)
], FoodNutrients.prototype, "carbsGrams", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Object)
], FoodNutrients.prototype, "fatGrams", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Object)
], FoodNutrients.prototype, "fiberGrams", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Object)
], FoodNutrients.prototype, "sugarGrams", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Object)
], FoodNutrients.prototype, "sodiumMilligrams", void 0);
exports.FoodNutrients = FoodNutrients = __decorate([
    (0, graphql_1.ObjectType)()
], FoodNutrients);
//# sourceMappingURL=food-nutrients.entity.js.map