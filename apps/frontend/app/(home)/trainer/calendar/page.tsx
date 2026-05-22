import { getMyTrainerBookings } from "@/lib/marketplace";
import { TrainerCalendarView } from "@/components/trainer/TrainerCalendarView";
import { CalendarDays, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function TrainerCalendarPage() {
  const bookings = await getMyTrainerBookings().catch(() => []);

  return (
    <div className="space-y-6">
      <Link
        href="/trainer"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to Dashboard
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary-deep">Session Calendar</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Accept or reject pending bookings. Click any session to view details.
          </p>
        </div>
        <Link
          href="/trainer/availability"
          className="inline-flex items-center gap-2 rounded-full border border-[rgba(74,93,62,0.3)] bg-[rgba(74,93,62,0.06)] px-4 py-2 text-sm font-semibold text-[#4a5d3e] hover:bg-[rgba(74,93,62,0.12)] transition-colors"
        >
          <CalendarDays className="size-4" /> Manage Availability
        </Link>
      </div>

      <TrainerCalendarView initialBookings={bookings} />
    </div>
  );
}
