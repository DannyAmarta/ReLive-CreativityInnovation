import { z } from "zod";

const HighRepMessage =
  "High-rep sets degrade 1RM calculation accuracy. Please log sets of 15 reps or fewer.";

const optionalCoercedNumber = (schema: z.ZodTypeAny) =>
  z.preprocess((value) => {
    if (value === "" || value === null || typeof value === "undefined") {
      return undefined;
    }

    return value;
  }, schema.optional());

export const SetRecommendationSchema = z.object({
  exerciseId: z.string().min(1, "Choose an exercise."),
  phaseGoal: z.enum([
    "BASELINE_TESTING",
    "HYPERTROPHY",
    "STRENGTH",
    "POWER",
    "RECOVERY",
  ]),
  days: z.coerce.number().int().min(7).max(28),
  trainingDaysPerWeek: z.coerce.number().int().min(1).max(6),
  targetSets: optionalCoercedNumber(z.coerce.number().int().min(1).max(6)),
  targetReps: optionalCoercedNumber(
    z.coerce.number().int().min(1).max(15, HighRepMessage),
  ),
  notes: z.string().trim().max(400).optional().or(z.literal("")),
});
