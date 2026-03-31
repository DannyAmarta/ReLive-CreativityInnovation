import { CardioCalculationInput, SetCalculationResultShape, SetFormulaId, StrengthCalculationInput } from '../set.types';
export type SetCalculationPayload = {
    kind: 'strength';
    input: StrengthCalculationInput;
} | {
    kind: 'cardio';
    input: CardioCalculationInput;
};
export interface SetCalculationStrategy {
    readonly formula: SetFormulaId;
    calculate(payload: SetCalculationPayload): SetCalculationResultShape;
}
