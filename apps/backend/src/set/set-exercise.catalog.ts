import {
  SetExerciseCategory,
  SetExerciseDefinition,
  SetFormulaId,
} from './set.types';

export const SET_EXERCISE_CATALOG: SetExerciseDefinition[] = [
  {
    id: 'back-squat',
    name: 'Back Squat',
    category: SetExerciseCategory.LOWER_BODY_COMPOUND,
    formula: SetFormulaId.BRZYCKI,
    description:
      'Lower-body compound lift that responds well to a steadier linear fatigue curve.',
    repCap: 10,
    requiredMetrics: ['weightKg', 'reps', 'rir'],
  },
  {
    id: 'deadlift',
    name: 'Deadlift',
    category: SetExerciseCategory.LOWER_BODY_COMPOUND,
    formula: SetFormulaId.BRZYCKI,
    description:
      'Heavy posterior-chain compound movement where a bounded linear model stays practical.',
    repCap: 10,
    requiredMetrics: ['weightKg', 'reps', 'rir'],
  },
  {
    id: 'front-squat',
    name: 'Front Squat',
    category: SetExerciseCategory.LOWER_BODY_COMPOUND,
    formula: SetFormulaId.BRZYCKI,
    description:
      'Quad-dominant lower-body compound with predictable fatigue compared with highly technical lifts.',
    repCap: 10,
    requiredMetrics: ['weightKg', 'reps', 'rir'],
  },
  {
    id: 'bench-press',
    name: 'Bench Press',
    category: SetExerciseCategory.UPPER_BODY_TECHNICAL,
    formula: SetFormulaId.WATHAN,
    description:
      'Upper-body press with a sharper fatigue wall, better modeled by an exponential curve.',
    repCap: 12,
    requiredMetrics: ['weightKg', 'reps', 'rir'],
  },
  {
    id: 'overhead-press',
    name: 'Overhead Press',
    category: SetExerciseCategory.UPPER_BODY_TECHNICAL,
    formula: SetFormulaId.WATHAN,
    description:
      'Technical upper-body press where abrupt failure is common once stabilizers give out.',
    repCap: 12,
    requiredMetrics: ['weightKg', 'reps', 'rir'],
  },
  {
    id: 'snatch',
    name: 'Snatch',
    category: SetExerciseCategory.UPPER_BODY_TECHNICAL,
    formula: SetFormulaId.WATHAN,
    description:
      'Olympic lift with technical cliff-edge fatigue, so exponential modeling is safer than linear guessing.',
    repCap: 8,
    requiredMetrics: ['weightKg', 'reps', 'rir'],
  },
  {
    id: 'assault-bike',
    name: 'Assault Bike Sprint',
    category: SetExerciseCategory.METABOLIC_CARDIO,
    formula: SetFormulaId.CARDIO_LOAD,
    description:
      'Short conditioning bursts scored by duration, density, and perceived effort.',
    repCap: null,
    requiredMetrics: ['durationMinutes', 'rpe'],
  },
  {
    id: 'heavy-bag-round',
    name: 'Heavy Bag Round',
    category: SetExerciseCategory.METABOLIC_CARDIO,
    formula: SetFormulaId.CARDIO_LOAD,
    description:
      'Round-based conditioning where internal load matters more than pretending there is a 1RM.',
    repCap: null,
    requiredMetrics: ['durationMinutes', 'rpe'],
  },
  {
    id: 'rowing-interval',
    name: 'Rowing Interval',
    category: SetExerciseCategory.METABOLIC_CARDIO,
    formula: SetFormulaId.CARDIO_LOAD,
    description:
      'Cardio interval that benefits from combining duration, distance, and effort into a density score.',
    repCap: null,
    requiredMetrics: ['durationMinutes', 'distanceMeters', 'rpe'],
  },
];
