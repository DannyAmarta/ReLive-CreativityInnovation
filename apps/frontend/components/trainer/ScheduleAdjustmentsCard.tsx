import Link from "next/link";
import { CalendarClock, CircleSlash, ArrowRight, Check, X, User, AlertCircle, Clock } from "lucide-react";
import { resolveRescheduleAction, resolveCancellationAction } from "@/lib/actions/marketplace";
import type { BookingRecord } from "@/lib/marketplace";
import { formatDateTime } from "@/lib/format";

export type RescheduleRequest = {
  id: number;
  bookingId: number;
  proposedById: number;
  originalStart?: string;
  originalEnd?: string;
  proposedStart: string;
  proposedEnd: string;
  timezone: string;
  status: string;
  createdAt: string;
};

export type CancellationRequest = {
  id: number;
  bookingId: number;
  proposedById: number;
  reason?: string;
  status: string;
  createdAt: string;
};

interface ScheduleAdjustmentsCardProps {
  bookings: BookingRecord[];
  rescheduleRequests: RescheduleRequest[];
  cancellationRequests: CancellationRequest[];
}

export function ScheduleAdjustmentsCard({
  bookings,
  rescheduleRequests,
  cancellationRequests,
}: ScheduleAdjustmentsCardProps) {
  // Filter pending requests
  const pendingReschedules = rescheduleRequests.filter((r) => r.status === "PENDING");
  const pendingCancellations = cancellationRequests.filter((r) => r.status === "PENDING");

  if (pendingReschedules.length === 0 && pendingCancellations.length === 0) {
    return null; // Keep dashboard completely clean when there are no requests
  }

  // Helper to map booking info
  const getBookingDetails = (bookingId: number) => {
    return bookings.find((b) => b.id === bookingId);
  };

  return (
    <div className="glass-card-elevated overflow-hidden flex flex-col border border-amber-500/20 bg-gradient-to-br from-[rgba(253,230,138,0.03)] to-[rgba(253,230,138,0.06)] shadow-amber-500/5">
      {/* Card Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-[rgba(245,158,11,0.12)]">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 animate-pulse">
            <AlertCircle className="size-4.5" />
          </div>
          <div>
            <h2 className="font-display font-bold text-primary-deep text-base leading-none">
              Schedule Adjustments Needed
            </h2>
            <p className="text-[11px] text-amber-700 dark:text-amber-400/80 font-medium mt-0.5">
              Review and resolve pending reschedule and cancellation proposals
            </p>
          </div>
        </div>
        <Link
          href="/trainer/bookings"
          className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline transition-colors"
        >
          Manage All Bookings
          <ArrowRight className="size-3" />
        </Link>
      </div>

      {/* Requests List */}
      <div className="divide-y divide-[rgba(245,158,11,0.08)]">
        {/* Reschedule Proposals */}
        {pendingReschedules.map((req) => {
          const booking = getBookingDetails(req.bookingId);
          if (!booking) return null;

          const isProposedByClient = req.proposedById === booking.clientId;
          const clientInitials =
            booking.client?.name
              ?.split(" ")
              .map((p) => p[0])
              .join("")
              .slice(0, 2)
              .toUpperCase() ?? "?";

          return (
            <div key={`reschedule-${req.id}`} className="p-6 space-y-4 hover:bg-[rgba(245,158,11,0.02)] transition-colors">
              {/* Item Info Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3">
                  <div className="size-10 rounded-full bg-gradient-mint flex items-center justify-center font-bold text-sm text-[#f8f6ef] select-none shrink-0 shadow-sm border border-white/50">
                    {clientInitials}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-primary-deep leading-snug">
                      Reschedule Proposal for &ldquo;{booking.service?.title ?? "Session"}&rdquo;
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Client: <span className="font-medium text-foreground">{booking.client?.name ?? "Client"}</span>
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                  <CalendarClock className="size-3" /> Reschedule
                </span>
              </div>

              {/* Time Shift details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-[rgba(245,158,11,0.03)] border border-[rgba(245,158,11,0.1)] rounded-xl p-3.5 text-xs text-foreground/90">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Current Scheduled Time
                  </span>
                  <p className="font-medium">
                    {booking.scheduledStart ? formatDateTime(booking.scheduledStart) : "Not scheduled"}
                  </p>
                </div>
                <div className="space-y-1 md:border-l md:border-[rgba(245,158,11,0.1)] md:pl-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block">
                    Proposed New Time
                  </span>
                  <p className="font-semibold text-amber-800 dark:text-amber-300">
                    {formatDateTime(req.proposedStart)}
                  </p>
                  {req.timezone && (
                    <span className="text-[10px] text-muted-foreground block">({req.timezone})</span>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between gap-4 pt-1">
                <span className="text-[10px] text-muted-foreground italic">
                  Proposed: {formatDateTime(req.createdAt)}
                </span>

                {isProposedByClient ? (
                  <div className="flex gap-2">
                    <form action={resolveRescheduleAction}>
                      <input type="hidden" name="requestId" value={req.id} />
                      <input type="hidden" name="action" value="REJECT" />
                      <input type="hidden" name="redirectTo" value="/trainer" />
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center gap-1 rounded-full border border-amber-500/30 px-4 py-1.5 text-xs font-bold text-amber-800 dark:text-amber-300 hover:bg-amber-500/10 transition-colors"
                      >
                        <X className="size-3.5" /> Decline
                      </button>
                    </form>
                    <form action={resolveRescheduleAction}>
                      <input type="hidden" name="requestId" value={req.id} />
                      <input type="hidden" name="action" value="ACCEPT" />
                      <input type="hidden" name="redirectTo" value="/trainer" />
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center gap-1 rounded-full bg-amber-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-amber-700 shadow-md shadow-amber-600/10 transition-colors"
                      >
                        <Check className="size-3.5" /> Accept Proposal
                      </button>
                    </form>
                  </div>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
                    <Clock className="size-3" /> Waiting for client response
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* Cancellation Proposals */}
        {pendingCancellations.map((req) => {
          const booking = getBookingDetails(req.bookingId);
          if (!booking) return null;

          const isProposedByClient = req.proposedById === booking.clientId;
          const clientInitials =
            booking.client?.name
              ?.split(" ")
              .map((p) => p[0])
              .join("")
              .slice(0, 2)
              .toUpperCase() ?? "?";

          return (
            <div key={`cancel-${req.id}`} className="p-6 space-y-4 hover:bg-[rgba(239,68,68,0.02)] transition-colors">
              {/* Item Info Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3">
                  <div className="size-10 rounded-full bg-gradient-mint flex items-center justify-center font-bold text-sm text-[#f8f6ef] select-none shrink-0 shadow-sm border border-white/50">
                    {clientInitials}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-primary-deep leading-snug">
                      Cancellation Notification for &ldquo;{booking.service?.title ?? "Session"}&rdquo;
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Client: <span className="font-medium text-foreground">{booking.client?.name ?? "Client"}</span>
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20">
                  <CircleSlash className="size-3" /> Cancelled by Client
                </span>
              </div>

              {/* Reason card */}
              <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-3.5 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 dark:text-red-400 block mb-1">
                  Reason Provided by Client
                </span>
                <p className="italic text-foreground/90 font-medium">
                  &ldquo;{req.reason || "No reason provided"}&rdquo;
                </p>
                {booking.scheduledStart && (
                  <p className="text-[10px] text-muted-foreground mt-2 border-t border-red-500/10 pt-1.5">
                    Impacted Session: <span className="font-medium">{formatDateTime(booking.scheduledStart)}</span>
                  </p>
                )}
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between gap-4 pt-1">
                <span className="text-[10px] text-muted-foreground italic">
                  Requested: {formatDateTime(req.createdAt)}
                </span>

                {isProposedByClient ? (
                  <div className="flex gap-2">
                    <form action={resolveCancellationAction}>
                      <input type="hidden" name="requestId" value={req.id} />
                      <input type="hidden" name="action" value="ACCEPT" />
                      <input type="hidden" name="redirectTo" value="/trainer" />
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center gap-1 rounded-full bg-red-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-red-700 shadow-md shadow-red-600/10 transition-colors"
                      >
                        <Check className="size-3.5" /> I understand
                      </button>
                    </form>
                  </div>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
                    <Clock className="size-3" /> Waiting for client response
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
