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
exports.SetExercise = void 0;
const graphql_1 = require("@nestjs/graphql");
const set_types_1 = require("../set.types");
(0, graphql_1.registerEnumType)(set_types_1.SetExerciseCategory, {
    name: 'SetExerciseCategory',
});
(0, graphql_1.registerEnumType)(set_types_1.SetFormulaId, {
    name: 'SetFormulaId',
});
let SetExercise = class SetExercise {
    id;
    name;
    category;
    formula;
    description;
    repCap;
    requiredMetrics;
};
exports.SetExercise = SetExercise;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], SetExercise.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], SetExercise.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(() => set_types_1.SetExerciseCategory),
    __metadata("design:type", String)
], SetExercise.prototype, "category", void 0);
__decorate([
    (0, graphql_1.Field)(() => set_types_1.SetFormulaId),
    __metadata("design:type", String)
], SetExercise.prototype, "formula", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], SetExercise.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Object)
], SetExercise.prototype, "repCap", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String]),
    __metadata("design:type", Array)
], SetExercise.prototype, "requiredMetrics", void 0);
exports.SetExercise = SetExercise = __decorate([
    (0, graphql_1.ObjectType)()
], SetExercise);
//# sourceMappingURL=set-exercise.entity.js.map