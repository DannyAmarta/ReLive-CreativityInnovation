import { getMyClientBookings } from "@/lib/marketplace";
import { ClientCalendarView } from "@/components/client/ClientCalendarView";
import { Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function ClientCalendarPage() {
  const bookings = await getMyClientBookings().catch(() => []);

  return (
    <div className="space-y-6">
      <Link
        href="/client"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to Dashboard
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary-deep">Session Calendar</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View your upcoming schedule. Click any session to view details and join calls.
          </p>
        </div>
        <Link
          href="/client/trainers"
          className="inline-flex items-center gap-2 rounded-full border border-[rgba(74,93,62,0.3)] bg-[rgba(74,93,62,0.06)] px-4 py-2 text-sm font-semibold text-[#4a5d3e] hover:bg-[rgba(74,93,62,0.12)] transition-colors"
        >
          <Sparkles className="size-4" /> Book a Trainer
        </Link>
      </div>

      <ClientCalendarView initialBookings={bookings} />
    </div>
  );
}
