import { Injectable } from '@nestjs/common';
import { SetFormulaId } from '../set.types';
import { BrzyckiStrategy } from './brzycki.strategy';
import { CardioLoadStrategy } from './cardio-load.strategy';
import { SetCalculationStrategy } from './set-calculation.strategy';
import { WathanStrategy } from './wathan.strategy';

@Injectable()
export class SetStrategyFactory {
  constructor(
    private readonly brzyckiStrategy: BrzyckiStrategy,
    private readonly wathanStrategy: WathanStrategy,
    private readonly cardioLoadStrategy: CardioLoadStrategy,
  ) {}

  getStrategy(formula: SetFormulaId): SetCalculationStrategy {
    switch (formula) {
      case SetFormulaId.BRZYCKI:
        return this.brzyckiStrategy;
      case SetFormulaId.WATHAN:
        return this.wathanStrategy;
      case SetFormulaId.CARDIO_LOAD:
        return this.cardioLoadStrategy;
      default:
        throw new Error(`No calculation strategy registered for ${formula}`);
    }
  }
}
