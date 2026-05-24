"use server";

import { print } from "graphql";
import { revalidatePath } from "next/cache";
import { authFetchGraphql, fetchGraphql } from "@/lib/fetchGraphQL";
import {
  CREATE_AVAILABILITY_RULE_MUTATION,
  UPDATE_AVAILABILITY_RULE_MUTATION,
  DELETE_AVAILABILITY_RULE_MUTATION,
  GET_TRAINER_AVAILABILITY_RULES_QUERY,
  GET_AVAILABLE_SLOTS_QUERY,
} from "@/lib/gqlQueries";

export type AvailabilityRule = {
  id: number;
  trainerId: number;
  dayOfWeek?: number | null;
  specificDate?: string | null;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  title?: string | null;
  timezone: string;
  createdAt: string;
  updatedAt: string;
};

export type AvailableSlot = {
  start: string;
  end: string;
  label: string;
};

// ── Public queries (no auth) ─────────────────────────────────────────────────

export async function getTrainerAvailabilityRules(trainerId: number): Promise<AvailabilityRule[]> {
  try {
    const data = await fetchGraphql<{ getTrainerAvailabilityRules: AvailabilityRule[] }>(
      print(GET_TRAINER_AVAILABILITY_RULES_QUERY),
      { trainerId },
    );
    return data.getTrainerAvailabilityRules ?? [];
  } catch {
    return [];
  }
}

export async function getAvailableSlots(
  trainerId: number,
  startDate: string,
  endDate: string,
  slotDurationMinutes = 60,
): Promise<AvailableSlot[]> {
  try {
    const data = await fetchGraphql<{ getAvailableSlots: AvailableSlot[] }>(
      print(GET_AVAILABLE_SLOTS_QUERY),
      { trainerId, startDate, endDate, slotDurationMinutes },
    );
    return data.getAvailableSlots ?? [];
  } catch {
    return [];
  }
}

// ── Trainer-only mutations ───────────────────────────────────────────────────

export type CreateRuleInput = {
  dayOfWeek?: number;
  specificDate?: string;
  startTime: string;
  endTime: string;
  isAvailable?: boolean;
  title?: string;
  timezone?: string;
};

export async function createAvailabilityRuleAction(input: CreateRuleInput) {
  try {
    const data = await authFetchGraphql<{ createAvailabilityRule: AvailabilityRule }>(
      print(CREATE_AVAILABILITY_RULE_MUTATION),
      { input }
    );
    revalidatePath("/trainer/availability");
    revalidatePath("/trainer/calendar");
    return { success: true, rule: data.createAvailabilityRule };
  } catch (err) {
    return { success: false, error: (err as any)?.message ?? "Failed to create rule" };
  }
}

export async function updateAvailabilityRuleAction(input: {
  id: number;
  startTime?: string;
  endTime?: string;
  isAvailable?: boolean;
  title?: string;
}) {
  try {
    const data = await authFetchGraphql<{ updateAvailabilityRule: AvailabilityRule }>(
      print(UPDATE_AVAILABILITY_RULE_MUTATION),
      { input }
    );
    revalidatePath("/trainer/availability");
    revalidatePath("/trainer/calendar");
    return { success: true, rule: data.updateAvailabilityRule };
  } catch (err) {
    return { success: false, error: (err as any)?.message ?? "Failed to update rule" };
  }
}

export async function deleteAvailabilityRuleAction(ruleId: number) {
  try {
    await authFetchGraphql(print(DELETE_AVAILABILITY_RULE_MUTATION), { ruleId });
    revalidatePath("/trainer/availability");
    revalidatePath("/trainer/calendar");
    return { success: true };
  } catch (err) {
    return { success: false, error: (err as any)?.message ?? "Failed to delete rule" };
  }
}
