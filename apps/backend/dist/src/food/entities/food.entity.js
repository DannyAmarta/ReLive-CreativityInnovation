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
exports.Food = void 0;
const graphql_1 = require("@nestjs/graphql");
const food_nutrients_entity_1 = require("./food-nutrients.entity");
let Food = class Food {
    id;
    source;
    sourceId;
    name;
    description;
    brand;
    referenceServingSize;
    referenceServingUnit;
    servingSize;
    servingUnit;
    per100gNutrients;
    nutrients;
};
exports.Food = Food;
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], Food.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], Food.prototype, "source", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], Food.prototype, "sourceId", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], Food.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], Food.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], Food.prototype, "brand", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Object)
], Food.prototype, "referenceServingSize", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], Food.prototype, "referenceServingUnit", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], Food.prototype, "servingSize", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], Food.prototype, "servingUnit", void 0);
__decorate([
    (0, graphql_1.Field)(() => food_nutrients_entity_1.FoodNutrients),
    __metadata("design:type", food_nutrients_entity_1.FoodNutrients)
], Food.prototype, "per100gNutrients", void 0);
__decorate([
    (0, graphql_1.Field)(() => food_nutrients_entity_1.FoodNutrients),
    __metadata("design:type", food_nutrients_entity_1.FoodNutrients)
], Food.prototype, "nutrients", void 0);
exports.Food = Food = __decorate([
    (0, graphql_1.ObjectType)()
], Food);
//# sourceMappingURL=food.entity.js.map