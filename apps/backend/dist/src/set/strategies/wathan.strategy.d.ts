import { SetCalculationResultShape, SetFormulaId } from '../set.types';
import { SetCalculationPayload, SetCalculationStrategy } from './set-calculation.strategy';
export declare class WathanStrategy implements SetCalculationStrategy {
    readonly formula = SetFormulaId.WATHAN;
    calculate(payload: SetCalculationPayload): SetCalculationResultShape;
    private buildWarnings;
    private buildConfidenceScore;
    private buildRecommendedLoads;
    private roundToTenth;
}
