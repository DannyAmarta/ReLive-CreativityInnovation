import Link from "next/link";
import { ArrowRight, Inbox } from "lucide-react";
import { updateBookingStatusAction } from "@/lib/actions/marketplace";
import type { BookingRecord } from "@/lib/marketplace";

const MAX_SHOWN = 3;

interface PendingRequestsCardProps {
  bookings: BookingRecord[];
}

export function PendingRequestsCard({ bookings }: PendingRequestsCardProps) {
  const pending = bookings.filter((b) => b.status === "PENDING");
  const shown = pending.slice(0, MAX_SHOWN);
  const extra = pending.length - MAX_SHOWN;

  return (
    <div className="relive-panel overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(88,120,74,0.1)]">
        <div className="flex items-center gap-2">
          <h2 className="font-display font-bold text-primary-deep text-base">
            Pending Requests
          </h2>
          {pending.length > 0 && (
            <span className="inline-flex items-center justify-center size-5 rounded-full bg-[rgba(199,122,90,0.15)] text-[11px] font-bold text-terracotta-600">
              {pending.length}
            </span>
          )}
        </div>
      </div>

      {/* Items */}
      {shown.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10 px-5 text-center">
          <div className="size-10 rounded-2xl bg-[rgba(74,93,62,0.07)] flex items-center justify-center">
            <Inbox className="size-5 text-[#8A9A6B]" />
          </div>
          <p className="text-sm text-muted-foreground">No pending requests right now 🎉</p>
        </div>
      ) : (
        <ul className="divide-y divide-[rgba(88,120,74,0.08)]">
          {shown.map((booking) => {
            const initials =
              booking.client?.name
                ?.split(" ")
                .map((p) => p[0])
                .join("")
                .slice(0, 2)
                .toUpperCase() ?? "?";

            return (
              <li key={booking.id} className="flex items-center gap-3 px-5 py-4">
                {/* Avatar */}
                <div className="size-9 shrink-0 rounded-full bg-gradient-mint flex items-center justify-center font-bold text-sm text-[#f8f6ef] select-none">
                  {initials}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-primary-deep truncate">
                    {booking.client?.name ?? "Client"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {booking.service?.title ?? "Service"}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <form action={updateBookingStatusAction}>
                    <input type="hidden" name="bookingId" value={booking.id} />
                    <input type="hidden" name="status" value="ACTIVE" />
                    <input type="hidden" name="redirectTo" value="/trainer" />
                    <button
                      type="submit"
                      className="rounded-full bg-[#4a5d3e] px-3.5 py-1.5 text-xs font-semibold text-[#f8f6ef] hover:bg-[#31442a] transition-colors"
                    >
                      Accept
                    </button>
                  </form>
                  <form action={updateBookingStatusAction}>
                    <input type="hidden" name="bookingId" value={booking.id} />
                    <input type="hidden" name="status" value="CANCELLED" />
                    <input type="hidden" name="redirectTo" value="/trainer" />
                    <button
                      type="submit"
                      className="rounded-full border border-[rgba(88,120,74,0.2)] px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:border-destructive/40 hover:text-destructive transition-colors"
                    >
                      Decline
                    </button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Footer */}
      {extra > 0 && (
        <div className="px-5 py-3 border-t border-[rgba(88,120,74,0.1)]">
          <Link
            href="/trainer/bookings"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#55633e] hover:text-primary-deep transition-colors"
          >
            See all {pending.length} requests
            <ArrowRight className="size-3" />
          </Link>
        </div>
      )}
    </div>
  );
}
