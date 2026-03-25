import { z } from "zod";

const BaseSetSchema = z.object({
  exerciseId: z.string().min(1, "Choose an exercise."),
  category: z.enum([
    "LOWER_BODY_COMPOUND",
    "UPPER_BODY_TECHNICAL",
    "METABOLIC_CARDIO",
  ]),
  notes: z.string().trim().max(400).optional().or(z.literal("")),
});

const StrengthFields = {
  weightKg: z.coerce.number().min(0.5).max(1000),
  reps: z.coerce
    .number()
    .int()
    .min(1)
    .max(
      15,
      "High-rep sets degrade 1RM calculation accuracy. Please log sets of 15 reps or fewer.",
    ),
  rir: z.coerce.number().int().min(0).max(6).default(0),
};

const LowerBodyStrengthSetSchema = BaseSetSchema.extend({
  category: z.literal("LOWER_BODY_COMPOUND"),
  ...StrengthFields,
});

const UpperBodyStrengthSetSchema = BaseSetSchema.extend({
  category: z.literal("UPPER_BODY_TECHNICAL"),
  ...StrengthFields,
});

const CardioSetSchema = BaseSetSchema.extend({
  category: z.literal("METABOLIC_CARDIO"),
  durationMinutes: z.coerce.number().min(0.25).max(240),
  distanceMeters: z.union([z.literal(""), z.coerce.number().min(0).max(100000)]).optional(),
  rpe: z.coerce.number().min(1).max(10),
});

export const SetCalculatorSchema = z.discriminatedUnion("category", [
  LowerBodyStrengthSetSchema,
  UpperBodyStrengthSetSchema,
  CardioSetSchema,
]);
