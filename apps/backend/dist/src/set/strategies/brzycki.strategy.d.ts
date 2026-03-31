import { SetCalculationResultShape, SetFormulaId } from '../set.types';
import { SetCalculationPayload, SetCalculationStrategy } from './set-calculation.strategy';
export declare class BrzyckiStrategy implements SetCalculationStrategy {
    readonly formula = SetFormulaId.BRZYCKI;
    calculate(payload: SetCalculationPayload): SetCalculationResultShape;
    private buildWarnings;
    private buildConfidenceScore;
    private buildRecommendedLoads;
    private roundToTenth;
}
