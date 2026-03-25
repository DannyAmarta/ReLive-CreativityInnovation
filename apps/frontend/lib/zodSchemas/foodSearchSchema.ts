import { z } from "zod";

export const FoodSearchSchema = z.object({
  query: z.string().trim(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(20).default(8),
  servingSize: z.coerce.number().int().min(1).max(5000).default(100),
});

export const RecipeSearchSchema = z.object({
  query: z.string().trim(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(20).default(10),
});
