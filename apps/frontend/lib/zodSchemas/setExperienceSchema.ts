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

export const SetExperienceSchema = z
  .object({
    exerciseId: z.string().min(1, "Choose an exercise."),
    category: z.enum([
      "LOWER_BODY_COMPOUND",
      "UPPER_BODY_TECHNICAL",
      "METABOLIC_CARDIO",
    ]),
    weightKg: optionalCoercedNumber(
      z.coerce.number().min(0.5, "Enter a load above 0 kg.").max(1000),
    ),
    reps: optionalCoercedNumber(
      z
        .coerce
        .number()
        .int()
        .min(1, "Enter at least 1 rep.")
        .max(15, HighRepMessage),
    ),
    rir: optionalCoercedNumber(z.coerce.number().int().min(0).max(6)),
    durationMinutes: optionalCoercedNumber(
      z.coerce.number().min(0.25, "Add a duration longer than 0.").max(240),
    ),
    distanceMeters: optionalCoercedNumber(
      z.coerce.number().min(0).max(100000),
    ),
    rpe: optionalCoercedNumber(z.coerce.number().min(1).max(10)),
    notes: z.string().trim().max(400).optional().or(z.literal("")),
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
  })
  .superRefine((value, ctx) => {
    if (value.category === "METABOLIC_CARDIO") {
      if (typeof value.durationMinutes !== "number") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Enter the session duration.",
          path: ["durationMinutes"],
        });
      }

      if (typeof value.rpe !== "number") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Enter the effort score.",
          path: ["rpe"],
        });
      }

      return;
    }

    if (typeof value.weightKg !== "number") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter the working weight.",
        path: ["weightKg"],
      });
    }

    if (typeof value.reps !== "number") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter the completed reps.",
        path: ["reps"],
      });
    }

    if (typeof value.rir !== "number") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter the reps in reserve.",
        path: ["rir"],
      });
    }
  });
