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
exports.LoggedWorkoutSet = void 0;
const graphql_1 = require("@nestjs/graphql");
const set_types_1 = require("../set.types");
let LoggedWorkoutSet = class LoggedWorkoutSet {
    id;
    userId;
    exerciseId;
    exerciseName;
    formulaUsed;
    weightLifted;
    actualReps;
    rirLogged;
    calculated1Rm;
    isCnsFatigue;
    durationMinutes;
    distanceMeters;
    rpeLogged;
    notes;
    createdAt;
};
exports.LoggedWorkoutSet = LoggedWorkoutSet;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], LoggedWorkoutSet.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], LoggedWorkoutSet.prototype, "userId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], LoggedWorkoutSet.prototype, "exerciseId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], LoggedWorkoutSet.prototype, "exerciseName", void 0);
__decorate([
    (0, graphql_1.Field)(() => set_types_1.SetFormulaId),
    __metadata("design:type", String)
], LoggedWorkoutSet.prototype, "formulaUsed", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Object)
], LoggedWorkoutSet.prototype, "weightLifted", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Object)
], LoggedWorkoutSet.prototype, "actualReps", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Object)
], LoggedWorkoutSet.prototype, "rirLogged", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Object)
], LoggedWorkoutSet.prototype, "calculated1Rm", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], LoggedWorkoutSet.prototype, "isCnsFatigue", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Object)
], LoggedWorkoutSet.prototype, "durationMinutes", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Object)
], LoggedWorkoutSet.prototype, "distanceMeters", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Object)
], LoggedWorkoutSet.prototype, "rpeLogged", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], LoggedWorkoutSet.prototype, "notes", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime),
    __metadata("design:type", Date)
], LoggedWorkoutSet.prototype, "createdAt", void 0);
exports.LoggedWorkoutSet = LoggedWorkoutSet = __decorate([
    (0, graphql_1.ObjectType)()
], LoggedWorkoutSet);
//# sourceMappingURL=logged-workout-set.entity.js.map