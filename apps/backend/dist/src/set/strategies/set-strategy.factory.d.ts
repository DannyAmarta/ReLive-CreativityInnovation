import { SetFormulaId } from '../set.types';
import { BrzyckiStrategy } from './brzycki.strategy';
import { CardioLoadStrategy } from './cardio-load.strategy';
import { SetCalculationStrategy } from './set-calculation.strategy';
import { WathanStrategy } from './wathan.strategy';
export declare class SetStrategyFactory {
    private readonly brzyckiStrategy;
    private readonly wathanStrategy;
    private readonly cardioLoadStrategy;
    constructor(brzyckiStrategy: BrzyckiStrategy, wathanStrategy: WathanStrategy, cardioLoadStrategy: CardioLoadStrategy);
    getStrategy(formula: SetFormulaId): SetCalculationStrategy;
}
