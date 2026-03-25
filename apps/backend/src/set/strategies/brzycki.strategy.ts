import { Injectable } from '@nestjs/common';
import {
  SetCalculationResultShape,
  SetFormulaId,
  SetRecommendedLoad,
  StrengthCalculationInput,
} from '../set.types';
import {
  SetCalculationPayload,
  SetCalculationStrategy,
} from './set-calculation.strategy';

@Injectable()
export class BrzyckiStrategy implements SetCalculationStrategy {
  readonly formula = SetFormulaId.BRZYCKI;

  calculate(payload: SetCalculationPayload): SetCalculationResultShape {
    if (payload.kind !== 'strength') {
      throw new Error('Brzycki strategy can only calculate strength inputs.');
    }

    const input = payload.input;
    const effectiveReps = input.reps + input.rir;
    const repCap = input.exercise.repCap ?? 10;
    const boundedEffectiveReps = Math.min(repCap, effectiveReps);
    const estimatedOneRepMaxKg = this.roundToTenth(
      input.weightKg * (36 / (37 - boundedEffectiveReps)),
    );
    const trainingMaxKg = this.roundToTenth(estimatedOneRepMaxKg * 0.9);
    const relativeIntensityPercent = this.roundToTenth(
      (input.weightKg / estimatedOneRepMaxKg) * 100,
    );
    const volumeLoadKg = this.roundToTenth(input.weightKg * input.reps);
    const warnings = this.buildWarnings(input, effectiveReps, boundedEffectiveReps);
    const confidenceScore = this.buildConfidenceScore(
      input.reps,
      input.rir,
      effectiveReps !== boundedEffectiveReps,
    );
    const recommendedLoads = this.buildRecommendedLoads(estimatedOneRepMaxKg);

    return {
      exerciseId: input.exercise.id,
      exerciseName: input.exercise.name,
      category: input.exercise.category,
      formulaUsed: this.formula,
      actualReps: input.reps,
      rir: input.rir,
      effectiveReps,
      boundedEffectiveReps,
      boundedByRepCap: effectiveReps !== boundedEffectiveReps,
      repCap,
      weightKg: input.weightKg,
      estimatedOneRepMaxKg,
      trainingMaxKg,
      relativeIntensityPercent,
      volumeLoadKg,
      durationMinutes: null,
      distanceMeters: null,
      pacePerKilometerMinutes: null,
      cardioLoadScore: null,
      estimatedCalories: null,
      confidenceScore,
      primaryEnergySystem:
        boundedEffectiveReps <= 5 ? 'ATP-PC / maximal strength' : 'Glycolytic / heavy volume',
      insightSummary:
        boundedEffectiveReps <= 5
          ? 'Linear fatigue modeling is strongest here. This estimate is best suited for heavy lower-body work near true strength efforts.'
          : 'This estimate is still useful, but rep-driven endurance starts adding more noise as sets drift away from pure phosphagen work.',
      warnings,
      recommendedLoads,
    };
  }

  private buildWarnings(
    input: StrengthCalculationInput,
    effectiveReps: number,
    boundedEffectiveReps: number,
  ) {
    const warnings: string[] = [];

    if (effectiveReps !== boundedEffectiveReps) {
      warnings.push(
        `Effective reps were capped at ${boundedEffectiveReps} because linear 1RM estimates lose meaning at higher rep counts.`,
      );
    }

    if (input.rir >= 3) {
      warnings.push(
        'A high RIR means this set was likely far from failure, so your estimate carries a wider uncertainty band.',
      );
    }

    if (input.reps === 1 && input.rir === 0) {
      warnings.push(
        'A true single is already close to a direct max test, so formula-based estimation adds less value here.',
      );
    }

    return warnings;
  }

  private buildConfidenceScore(reps: number, rir: number, bounded: boolean) {
    let score = 92;

    if (reps > 8) {
      score -= (reps - 8) * 3;
    }

    score -= rir * 4;

    if (bounded) {
      score -= 12;
    }

    return Math.max(40, Math.min(98, score));
  }

  private buildRecommendedLoads(oneRepMaxKg: number): SetRecommendedLoad[] {
    return [3, 5, 8].map((repTarget) => {
      const intensityPercent = this.roundToTenth(((37 - repTarget) / 36) * 100);
      return {
        repTarget,
        intensityPercent,
        weightKg: this.roundToTenth(oneRepMaxKg * ((37 - repTarget) / 36)),
      };
    });
  }

  private roundToTenth(value: number) {
    return Math.round(value * 10) / 10;
  }
}
