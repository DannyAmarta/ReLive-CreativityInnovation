"use server";

import { print } from "graphql";
import { revalidatePath } from "next/cache";
import { authFetchGraphql } from "@/lib/fetchGraphQL";
import { REGISTER_TRAINER_FIAT_MUTATION } from "@/lib/gqlQueries";

export type RegisterTrainerFiatData = {
  bio: string;
  certifications: string[];
};

export type RegisterTrainerFiatResult =
  | { success: true }
  | { success: false; error: string };

export async function registerTrainerFiatAction(
  data: RegisterTrainerFiatData,
): Promise<RegisterTrainerFiatResult> {
  try {
    await authFetchGraphql(print(REGISTER_TRAINER_FIAT_MUTATION), {
      input: {
        bio: data.bio,
        certifications: data.certifications,
      },
    });

    // Revalidate the whole trainer/client zone so the nav reflects the new role
    revalidatePath("/client", "layout");
    revalidatePath("/trainer", "layout");

    return { success: true };
  } catch (err) {
    const message =
      (err as any)?.message ?? "Registration failed. Please try again.";
    return { success: false, error: message };
  }
}
