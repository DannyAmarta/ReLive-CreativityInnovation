import { SetService } from './set.service';
import { CalculateSetInput } from './dto/calculate-set.input';
export declare class SetController {
    private readonly setService;
    constructor(setService: SetService);
    getExercises(): import("./set.types").SetExerciseDefinition[];
    calculate(input: CalculateSetInput): import("./set.types").SetCalculationResultShape;
}
