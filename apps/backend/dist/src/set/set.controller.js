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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetController = void 0;
const common_1 = require("@nestjs/common");
const set_service_1 = require("./set.service");
const calculate_set_input_1 = require("./dto/calculate-set.input");
let SetController = class SetController {
    setService;
    constructor(setService) {
        this.setService = setService;
    }
    getExercises() {
        return this.setService.getExercises();
    }
    calculate(input) {
        return this.setService.calculate(input);
    }
};
exports.SetController = SetController;
__decorate([
    (0, common_1.Get)('exercises'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SetController.prototype, "getExercises", null);
__decorate([
    (0, common_1.Post)('calculate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [calculate_set_input_1.CalculateSetInput]),
    __metadata("design:returntype", void 0)
], SetController.prototype, "calculate", null);
exports.SetController = SetController = __decorate([
    (0, common_1.Controller)('api/sets'),
    __metadata("design:paramtypes", [set_service_1.SetService])
], SetController);
//# sourceMappingURL=set.controller.js.map