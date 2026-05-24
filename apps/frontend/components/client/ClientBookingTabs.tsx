"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  ShieldAlert,
  Clock,
  CalendarClock,
  CircleSlash,
  Star,
  CheckCircle2,
  ClockIcon,
  History,
  Zap,
} from "lucide-react";
import { StatusBadge } from "@/components/relive/StatusBadge";
import { updateBookingStatusAction } from "@/lib/actions/marketplace";
import { formatDateTime, formatIDR, formatUSDC } from "@/lib/format";
import { lamportsToTokenUnits } from "@/lib/marketplace";
import type { BookingRecord } from "@/lib/marketplace";
import { ReviewButton } from "@/components/relive/ReviewButton";

// ─── Types ────────────────────────────────────────────────────────────────────
export type RescheduleRequest = {
  id: number;
  bookingId: number;
  proposedById: number;
  proposedStart: string;
  proposedEnd: string;
  status: string;
};

export type CancellationRequest = {
  id: number;
  bookingId: number;
  proposedById: number;
  reason?: string;
  status: string;
};

interface ClientBookingTabsProps {
  bookings: BookingRecord[];
  rescheduleRequests: RescheduleRequest[];
  cancellationRequests: CancellationRequest[];
}

type Tab = "active" | "history";

// ─── Classification Logic ─────────────────────────────────────────────────────
const ACTIVE_STATUSES = new Set(["PENDING", "ACTIVE", "DISPUTED"]);
const HISTORY_STATUSES = new Set(["COMPLETED", "CANCELLED", "REJECTED"]);

function classifyBooking(
  booking: BookingRecord,
  rescheduleRequests: RescheduleRequest[],
  cancellationRequests: CancellationRequest[]
): "active" | "history" {
  // Always active if primary status is actionable
  if (ACTIVE_STATUSES.has(booking.status)) return "active";

  // If "history" status, check for pending sub-requests that override to active
  if (HISTORY_STATUSES.has(booking.status)) {
    const hasPendingReschedule = rescheduleRequests.some(
      (r) => r.bookingId === booking.id && r.status === "PENDING"
    );
    if (hasPendingReschedule) return "active";

    const hasPendingCancellation = cancellationRequests.some(
      (r) => r.bookingId === booking.id && r.status === "PENDING"
    );
    if (hasPendingCancellation) return "active";

    return "history";
  }

  // Unknown statuses default to active so they're visible
  return "active";
}

// ─── Tab Button ───────────────────────────────────────────────────────────────
function TabButton({
  active,
  onClick,
  children,
  count,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  count: number;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        relative inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-all duration-200
        ${
          active
            ? "text-primary-deep"
            : "text-muted-foreground hover:text-foreground"
        }
      `}
    >
      {icon}
      {children}
      {count > 0 && (
        <span
          className={`
            inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold transition-colors
            ${
              active
                ? "bg-[#4a5d3e] text-white"
                : "bg-muted text-muted-foreground"
            }
          `}
        >
          {count}
        </span>
      )}
      {/* Underline indicator */}
      {active && (
        <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#4a5d3e]" />
      )}
    </button>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ tab }: { tab: Tab }) {
  if (tab === "active") {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(74,93,62,0.08)]">
          <CheckCircle2 className="h-5 w-5 text-[#4a5d3e]" />
        </div>
        <p className="font-semibold text-primary-deep">No active bookings</p>
        <p className="mt-1 text-sm text-muted-foreground">
          You have no pending or active sessions right now.
        </p>
        <Link
          href="/client/trainers"
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#4a5d3e] px-5 py-2 text-xs font-semibold text-white hover:bg-[#3d4f32] transition-colors"
        >
          Browse Trainers
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <History className="h-5 w-5 text-muted-foreground" />
      </div>
      <p className="font-semibold text-primary-deep">No booking history yet</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Completed, cancelled, and rejected sessions will appear here.
      </p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function ClientBookingTabs({
  bookings,
  rescheduleRequests,
  cancellationRequests,
}: ClientBookingTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("active");

  // Split bookings into two classified lists
  const activeBookings = bookings.filter(
    (b) => classifyBooking(b, rescheduleRequests, cancellationRequests) === "active"
  );
  const historyBookings = bookings.filter(
    (b) => classifyBooking(b, rescheduleRequests, cancellationRequests) === "history"
  );

  const displayedBookings =
    activeTab === "active" ? activeBookings : historyBookings;

  return (
    <div>
      {/* ── Tab Header ── */}
      <div className="mb-6 flex items-center gap-1 border-b border-border">
        <TabButton
          active={activeTab === "active"}
          onClick={() => setActiveTab("active")}
          count={activeBookings.length}
          icon={<Zap className="h-3.5 w-3.5" />}
        >
          Active Bookings
        </TabButton>
        <TabButton
          active={activeTab === "history"}
          onClick={() => setActiveTab("history")}
          count={historyBookings.length}
          icon={<History className="h-3.5 w-3.5" />}
        >
          History
        </TabButton>
      </div>

      {/* ── Booking List ── */}
      {displayedBookings.length === 0 ? (
        <EmptyState tab={activeTab} />
      ) : (
        <div className="space-y-4">
          {displayedBookings.map((booking) => {
            const service = booking.service;
            const trainer = booking.trainer?.user;
            const isFiat = booking.paymentType === "FIAT";
            const displayAmount = isFiat
              ? formatIDR(booking.fiatAmount ?? booking.servicePriceIdr ?? 0)
              : formatUSDC(lamportsToTokenUnits(service?.priceInLamports));

            const pendingReschedule = rescheduleRequests.find(
              (r) => r.bookingId === booking.id && r.status === "PENDING"
            );
            const pendingCancellation = cancellationRequests.find(
              (r) => r.bookingId === booking.id && r.status === "PENDING"
            );

            const isHistory = activeTab === "history";

            return (
              <article
                key={booking.id}
                className={`rounded-2xl border bg-card p-5 shadow-[var(--shadow-card)] transition-opacity ${
                  isHistory
                    ? "border-border/60 opacity-80"
                    : "border-border"
                }`}
              >
                {/* ── Card Header ── */}
                <div className="flex flex-wrap items-start gap-4">
                  {trainer?.avatar ? (
                    <img
                      src={trainer.avatar}
                      alt={trainer.name}
                      className={`h-14 w-14 rounded-full object-cover ${isHistory ? "grayscale-[30%]" : ""}`}
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-lg font-bold text-primary-deep">
                      {trainer?.name?.slice(0, 1) ?? "T"}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-base font-bold text-primary-deep">
                      {trainer?.name ?? "Trainer"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {service?.title ?? "Service"}
                    </p>
                    <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      Created {formatDateTime(booking.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex justify-end gap-2">
                      {booking.paymentType && (
                        <StatusBadge status={booking.paymentType} />
                      )}
                      <StatusBadge status={booking.status} />
                    </div>
                    <p className="mt-2 font-display text-base font-bold text-primary">
                      {displayAmount}
                    </p>
                  </div>
                </div>

                {/* ── Schedule Details ── */}
                {booking.scheduledStart && (
                  <div className="mt-4 rounded-xl bg-muted/40 border border-border/50 p-4 flex items-start gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <p className="font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                        Session Schedule
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {formatDateTime(booking.scheduledStart)}
                        {booking.scheduledEnd
                          ? ` → ${formatDateTime(booking.scheduledEnd)}`
                          : ""}
                      </p>
                      {booking.timezone && (
                        <p className="text-muted-foreground mt-0.5">
                          Timezone: {booking.timezone}
                        </p>
                      )}
                      {booking.meetingLink && (
                        <a
                          href={booking.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-primary hover:underline font-semibold"
                        >
                          Join Meeting Link →
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* ── Reschedule Request Alert ── */}
                {pendingReschedule && (
                  <div className="mt-3 rounded-xl border border-amber-500/25 bg-amber-500/8 p-3 text-xs flex items-start gap-2">
                    <CalendarClock className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-amber-800 dark:text-amber-300">
                        Reschedule Proposal Pending
                      </p>
                      <p className="text-foreground mt-0.5 font-medium">
                        Proposed: {formatDateTime(pendingReschedule.proposedStart)}
                      </p>
                      <p className="text-muted-foreground mt-1 font-medium">
                        {pendingReschedule.proposedById === booking.clientId
                          ? "Waiting for the trainer to accept or decline."
                          : "The trainer proposed a new time. Go to Reschedule page to accept or decline."}
                      </p>
                    </div>
                  </div>
                )}

                {/* ── Cancellation Request Alert ── */}
                {pendingCancellation && (
                  <div className="mt-3 rounded-xl border border-destructive/25 bg-destructive/8 p-3 text-xs flex items-start gap-2">
                    <CircleSlash className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-destructive px-0.5">
                        Cancellation Request Pending
                      </p>
                      {pendingCancellation.reason && (
                        <p className="italic text-muted-foreground mt-0.5">
                          Reason: &ldquo;{pendingCancellation.reason}&rdquo;
                        </p>
                      )}
                      <p className="text-muted-foreground mt-1 font-medium">
                        {pendingCancellation.proposedById === booking.clientId
                          ? "Waiting for the trainer to agree or reject."
                          : "The trainer requested mutual cancellation. Go to Cancel page to resolve."}
                      </p>
                    </div>
                  </div>
                )}

                {/* ── Footer: Meta + Actions ── */}
                <div className="mt-4 grid gap-3 border-t border-border pt-4 md:grid-cols-[1fr_auto] md:items-center">
                  <div className="space-y-1 text-xs text-muted-foreground">
                    {booking.gatewayPaymentMethod && (
                      <p>Gateway: {booking.gatewayPaymentMethod}</p>
                    )}
                    {booking.txHash && <p>Tx Hash: {booking.txHash}</p>}
                    {booking.escrowAddress && (
                      <p>Escrow: {booking.escrowAddress}</p>
                    )}
                    {booking.disputeReason && (
                      <p>Dispute: {booking.disputeReason}</p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 md:justify-end">
                    {/* COMPLETED: review or already-reviewed star badge */}
                    {booking.status === "COMPLETED" &&
                      (booking.review ? (
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/25 bg-amber-400/8 px-3 py-1.5 text-xs text-amber-500">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`h-3 w-3 ${
                                s <= booking.review!.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "fill-transparent text-white/20"
                              }`}
                            />
                          ))}
                          <span className="ml-1 font-semibold">Reviewed</span>
                        </div>
                      ) : (
                        <ReviewButton
                          bookingId={booking.id}
                          trainerName={booking.trainer?.user?.name ?? "Trainer"}
                          serviceName={booking.service?.title ?? "Session"}
                        />
                      ))}

                    {/* ACTIVE: reschedule / cancel / dispute */}
                    {booking.status === "ACTIVE" && (
                      <>
                        <Link
                          href="/client/bookings/reschedule"
                          className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 px-4 py-2 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors"
                        >
                          Reschedule
                        </Link>
                        <Link
                          href="/client/bookings/cancel"
                          className="inline-flex items-center gap-1.5 rounded-full border border-destructive/30 px-4 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          Cancel Session
                        </Link>
                        <form action={updateBookingStatusAction}>
                          <input type="hidden" name="bookingId" value={booking.id} />
                          <input type="hidden" name="status" value="DISPUTED" />
                          <input
                            type="hidden"
                            name="disputeReason"
                            value="Raised from the client dashboard during seeded-data review."
                          />
                          <input
                            type="hidden"
                            name="redirectTo"
                            value="/client/dashboard"
                          />
                          <button
                            type="submit"
                            className="inline-flex items-center gap-1.5 rounded-full border border-destructive/30 px-4 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10"
                          >
                            <ShieldAlert className="h-3.5 w-3.5" />
                            Raise dispute
                          </button>
                        </form>
                      </>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
