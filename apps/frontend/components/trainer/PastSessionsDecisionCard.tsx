import { AlertTriangle, Calendar, Check, History, X } from "lucide-react";
import { updateBookingStatusAction } from "@/lib/actions/marketplace";
import type { BookingRecord } from "@/lib/marketplace";
import { formatDateTime } from "@/lib/format";

interface PastSessionsDecisionCardProps {
  bookings: BookingRecord[];
}

export function PastSessionsDecisionCard({ bookings }: PastSessionsDecisionCardProps) {
  // Get today's start date (midnight) to check if the session day is strictly < today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Filter bookings in the past (before today) that are still PENDING or ACTIVE
  const pastBookings = bookings.filter((b) => {
    if (!b.scheduledStart) return false;
    const start = new Date(b.scheduledStart);
    return start < today && (b.status === "PENDING" || b.status === "ACTIVE");
  });

  if (pastBookings.length === 0) {
    return null; // Don't show anything if there are no past sessions requiring action
  }

  return (
    <div className="glass-card-elevated overflow-hidden flex flex-col border border-amber-500/20 bg-gradient-to-br from-[rgba(245,158,11,0.02)] to-[rgba(245,158,11,0.05)] shadow-amber-500/5">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-[rgba(245,158,11,0.12)]">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <History className="size-4.5" />
          </div>
          <div>
            <h2 className="font-display font-bold text-primary-deep text-base leading-none">
              Past Sessions Action Board
            </h2>
            <p className="text-[11px] text-amber-700 dark:text-amber-400/80 font-medium mt-0.5">
              Unresolved booking sessions from prior days
            </p>
          </div>
        </div>
        <span className="inline-flex items-center justify-center size-5 rounded-full bg-amber-500/10 text-[11px] font-bold text-amber-700 dark:text-amber-400 border border-amber-500/20">
          {pastBookings.length}
        </span>
      </div>

      {/* List */}
      <div className="divide-y divide-[rgba(245,158,11,0.08)] bg-white/40">
        {pastBookings.map((booking) => {
          const initials =
            booking.client?.name
              ?.split(" ")
              .map((p) => p[0])
              .join("")
              .slice(0, 2)
              .toUpperCase() ?? "?";

          return (
            <div
              key={booking.id}
              className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[rgba(245,158,11,0.02)] transition-colors"
            >
              <div className="flex gap-3 min-w-0">
                <div className="size-10 rounded-full bg-gradient-mint flex items-center justify-center font-bold text-sm text-[#f8f6ef] select-none shrink-0 shadow-sm border border-white/50">
                  {initials}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-primary-deep leading-snug">
                      {booking.service?.title ?? "Session"}
                    </h3>
                    {booking.status === "PENDING" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-700 border border-amber-500/20">
                        Needs Acceptance
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-700 border border-blue-500/20">
                        Needs Completion
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Client: <span className="font-medium text-foreground">{booking.client?.name ?? "Client"}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                    <Calendar className="size-3.5 text-muted-foreground shrink-0" />
                    <span>{booking.scheduledStart ? formatDateTime(booking.scheduledStart) : "No time set"}</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {booking.status === "PENDING" ? (
                  <>
                    <form action={updateBookingStatusAction}>
                      <input type="hidden" name="bookingId" value={booking.id} />
                      <input type="hidden" name="status" value="REJECTED" />
                      <input type="hidden" name="redirectTo" value="/trainer" />
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center gap-1 rounded-full border border-[rgba(88,120,74,0.2)] px-3.5 py-1.5 text-xs font-bold text-muted-foreground hover:border-destructive/40 hover:text-destructive transition-colors cursor-pointer bg-white"
                      >
                        <X className="size-3.5" /> Decline
                      </button>
                    </form>
                    <form action={updateBookingStatusAction}>
                      <input type="hidden" name="bookingId" value={booking.id} />
                      <input type="hidden" name="status" value="ACTIVE" />
                      <input type="hidden" name="redirectTo" value="/trainer" />
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center gap-1 rounded-full bg-[#4a5d3e] px-4 py-1.5 text-xs font-bold text-[#f8f6ef] hover:bg-[#31442a] shadow-md shadow-[#4a5d3e]/10 transition-colors cursor-pointer"
                      >
                        <Check className="size-3.5" /> Accept
                      </button>
                    </form>
                  </>
                ) : (
                  <form action={updateBookingStatusAction}>
                    <input type="hidden" name="bookingId" value={booking.id} />
                    <input type="hidden" name="status" value="COMPLETED" />
                    <input type="hidden" name="redirectTo" value="/trainer" />
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center gap-1.5 rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/10 transition-colors cursor-pointer"
                    >
                      <Check className="size-3.5" /> Mark Completed
                    </button>
                  </form>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
