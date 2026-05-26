import Link from "next/link";
import { BookOpen, ArrowRight, Clock3, CheckCircle2, CircleSlash, AlertTriangle, Hourglass } from "lucide-react";
import type { BookingRecord } from "@/lib/marketplace";
import { formatDateTime } from "@/lib/format";

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; pill: string }> = {
  PENDING: {
    label: "Pending",
    icon: <Hourglass className="size-3" />,
    pill: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  },
  ACTIVE: {
    label: "Active",
    icon: <Clock3 className="size-3" />,
    pill: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  },
  COMPLETED: {
    label: "Completed",
    icon: <CheckCircle2 className="size-3" />,
    pill: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: <CircleSlash className="size-3" />,
    pill: "bg-muted/60 text-muted-foreground border-muted-foreground/20",
  },
  DISPUTED: {
    label: "Disputed",
    icon: <AlertTriangle className="size-3" />,
    pill: "bg-red-500/10 text-red-700 border-red-500/20",
  },
};

const MAX_SHOWN = 3;

interface BookingsPreviewCardProps {
  bookings: BookingRecord[];
}

export function BookingsPreviewCard({ bookings }: BookingsPreviewCardProps) {
  // Latest 3 by createdAt descending
  const shown = [...bookings]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, MAX_SHOWN);

  const total = bookings.length;

  return (
    <div className="glass-card-elevated overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(88,120,74,0.1)]">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-lg bg-[rgba(74,93,62,0.1)] flex items-center justify-center">
            <BookOpen className="size-3.5 text-[#4a5d3e]" />
          </div>
          <h2 className="font-display font-bold text-primary-deep text-base">Bookings</h2>
          {total > 0 && (
            <span className="text-[10px] font-semibold text-muted-foreground bg-muted/50 rounded-full px-2 py-0.5">
              {total}
            </span>
          )}
        </div>
        <Link
          href="/trainer/bookings"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#55633e] hover:text-primary-deep transition-colors"
        >
          View All
          <ArrowRight className="size-3" />
        </Link>
      </div>

      {/* List */}
      {shown.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 px-5 text-center">
          <p className="text-sm text-muted-foreground">No bookings yet.</p>
        </div>
      ) : (
        <ul className="divide-y divide-[rgba(88,120,74,0.07)]">
          {shown.map((booking) => {
            const cfg = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.PENDING;
            const initials =
              booking.client?.name
                ?.split(" ")
                .map((p) => p[0])
                .join("")
                .slice(0, 2)
                .toUpperCase() ?? "?";

            return (
              <li
                key={booking.id}
                className="flex items-center gap-3 px-5 py-3 hover:bg-[rgba(74,93,62,0.03)] transition-colors"
              >
                {/* Avatar */}
                <div className="size-8 rounded-full bg-gradient-mint flex items-center justify-center font-bold text-xs text-[#f8f6ef] select-none shrink-0 border border-white/40">
                  {initials}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-primary-deep truncate">
                    {booking.service?.title ?? "Session"}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {booking.client?.name ?? "Client"}
                    {booking.scheduledStart && (
                      <> · {formatDateTime(booking.scheduledStart)}</>
                    )}
                  </p>
                </div>

                {/* Status pill */}
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 ${cfg.pill}`}
                >
                  {cfg.icon}
                  {cfg.label}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
