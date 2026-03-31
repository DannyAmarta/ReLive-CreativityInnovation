import { SetCalculationResultShape, SetFormulaId } from '../set.types';
import { SetCalculationPayload, SetCalculationStrategy } from './set-calculation.strategy';
export declare class CardioLoadStrategy implements SetCalculationStrategy {
    readonly formula = SetFormulaId.CARDIO_LOAD;
    calculate(payload: SetCalculationPayload): SetCalculationResultShape;
    private resolveEnergySystem;
    private roundToTenth;
    private roundToHundredth;
}
