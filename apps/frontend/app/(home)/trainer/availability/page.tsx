import { getTrainerAvailabilityRules } from "@/lib/actions/availability";
import { getSession } from "@/lib/session.server";
import { AvailabilityManager } from "@/components/trainer/AvailabilityManager";
import { authFetchGraphql } from "@/lib/fetchGraphQL";
import { print } from "graphql";
import { GET_MY_TRAINER_PROFILE_QUERY } from "@/lib/gqlQueries";
import Link from "next/link";
import { CalendarDays, ArrowLeft } from "lucide-react";
import { getMyTrainerBookings } from "@/lib/marketplace";
import { TrainerNavigationHeader } from "@/components/trainer/TrainerNavigationHeader";

export default async function TrainerAvailabilityPage() {
  const session = await getSession();

  // Get the trainer's profile id so we can fetch their rules
  let trainerId: number | null = null;
  try {
    const data = await authFetchGraphql<{ myTrainerProfile: { id: number } }>(
      print(GET_MY_TRAINER_PROFILE_QUERY)
    );
    trainerId = data.myTrainerProfile?.id ?? null;
  } catch { /* not a trainer yet */ }

  const [rules, bookings] = await Promise.all([
    trainerId ? getTrainerAvailabilityRules(trainerId) : Promise.resolve([]),
    trainerId ? getMyTrainerBookings() : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-6">
      <Link
        href="/trainer"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to Dashboard
      </Link>

      <TrainerNavigationHeader activeTab="availability" />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary-deep">My Availability</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Set when clients can book sessions with you. Date overrides always take priority over your weekly schedule.
          </p>
        </div>
        <Link
          href="/trainer/calendar"
          className="inline-flex items-center gap-2 rounded-full border border-[rgba(74,93,62,0.3)] bg-[rgba(74,93,62,0.06)] px-4 py-2 text-sm font-semibold text-[#4a5d3e] hover:bg-[rgba(74,93,62,0.12)] transition-colors"
        >
          <CalendarDays className="size-4" /> View Calendar
        </Link>
      </div>

      <div className="rounded-2xl border border-[rgba(74,93,62,0.15)] bg-[rgba(74,93,62,0.03)] p-4 text-sm text-[#67715f] space-y-2">
        <div>
          <strong className="text-[#4a5d3e]">How it works:</strong> Enable days and set working hours in the weekly schedule.
          For exceptions (vacations, conferences, one-off open days), use Date Overrides — they take priority over the weekly default for that specific date.
        </div>
        <div className="text-xs font-medium text-[#4a5d3e] flex items-center gap-1.5 pt-1 border-t border-[rgba(74,93,62,0.1)]">
          <span>💡</span>
          <span><strong>Note on session duration:</strong> All client bookings are fixed to exactly 1-hour sessions. Ensure your daily working hours cover complete 1-hour increments.</span>
        </div>
      </div>

      <AvailabilityManager initialRules={rules} bookings={bookings} />
    </div>
  );
}
