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
exports.RecipeSearchResponse = void 0;
const graphql_1 = require("@nestjs/graphql");
const recipe_entity_1 = require("./recipe.entity");
let RecipeSearchResponse = class RecipeSearchResponse {
    query;
    sourceUsed;
    cacheHit;
    fallbackUsed;
    page;
    pageSize;
    totalReturned;
    items;
};
exports.RecipeSearchResponse = RecipeSearchResponse;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], RecipeSearchResponse.prototype, "query", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], RecipeSearchResponse.prototype, "sourceUsed", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], RecipeSearchResponse.prototype, "cacheHit", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], RecipeSearchResponse.prototype, "fallbackUsed", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], RecipeSearchResponse.prototype, "page", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], RecipeSearchResponse.prototype, "pageSize", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], RecipeSearchResponse.prototype, "totalReturned", void 0);
__decorate([
    (0, graphql_1.Field)(() => [recipe_entity_1.Recipe]),
    __metadata("design:type", Array)
], RecipeSearchResponse.prototype, "items", void 0);
exports.RecipeSearchResponse = RecipeSearchResponse = __decorate([
    (0, graphql_1.ObjectType)()
], RecipeSearchResponse);
//# sourceMappingURL=recipe-search-response.entity.js.map