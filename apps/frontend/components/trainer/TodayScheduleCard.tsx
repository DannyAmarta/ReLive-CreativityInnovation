import Link from "next/link";
import { CalendarDays, ArrowRight, Clock3 } from "lucide-react";
import { StatusBadge } from "@/components/trainer/StatusBadge";
import type { BookingRecord } from "@/lib/marketplace";

function formatTimeSlot(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function isToday(date: Date) {
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function isNextUp(booking: BookingRecord) {
  if (!booking.scheduledStart) return false;
  const start = new Date(booking.scheduledStart);
  const now = new Date();
  const diffMs = start.getTime() - now.getTime();
  // within 2 hours ahead
  return diffMs >= -5 * 60 * 1000 && diffMs <= 2 * 60 * 60 * 1000;
}

interface TodayScheduleCardProps {
  bookings: BookingRecord[];
}

export function TodayScheduleCard({ bookings }: TodayScheduleCardProps) {
  const todaySchedule = [...bookings]
    .filter((b) => b.scheduledStart && isToday(new Date(b.scheduledStart)))
    .sort(
      (a, b) =>
        new Date(a.scheduledStart!).getTime() - new Date(b.scheduledStart!).getTime(),
    );

  return (
    <div className="glass-card-elevated overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-[rgba(88,120,74,0.12)]">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-xl bg-[rgba(74,93,62,0.1)] flex items-center justify-center text-[#4a5d3e]">
            <Clock3 className="size-4" />
          </div>
          <div>
            <h2 className="font-display font-bold text-primary-deep text-base leading-none">
              Today&apos;s Schedule
            </h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
        <Link
          href="/trainer/calendar"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#55633e] hover:text-primary-deep transition-colors"
        >
          <CalendarDays className="size-3.5" />
          View Calendar
          <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* List */}
      {todaySchedule.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-12 px-6 text-center">
          <div className="size-12 rounded-2xl bg-[rgba(74,93,62,0.07)] flex items-center justify-center">
            <CalendarDays className="size-6 text-[#8A9A6B]" />
          </div>
          <p className="text-sm text-muted-foreground">Nothing scheduled for today</p>
          <Link
            href="/trainer/calendar"
            className="text-xs font-semibold text-[#55633e] hover:underline"
          >
            Manage availability →
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-[rgba(88,120,74,0.08)]">
          {todaySchedule.map((booking) => {
            const nextUp = isNextUp(booking);
            return (
              <Link
                key={booking.id}
                href="/trainer/calendar"
                className={`flex items-center gap-4 px-6 py-4 transition-colors group ${
                  nextUp
                    ? "bg-[rgba(74,93,62,0.06)] border-l-[3px] border-l-[#4a5d3e]"
                    : "hover:bg-[rgba(74,93,62,0.03)] border-l-[3px] border-l-transparent"
                }`}
              >
                {/* Time */}
                <div className="w-20 shrink-0 text-right">
                  <span
                    className={`font-mono text-sm tabular-nums ${
                      nextUp ? "text-primary-deep font-semibold" : "text-muted-foreground"
                    }`}
                  >
                    {booking.scheduledStart
                      ? formatTimeSlot(booking.scheduledStart)
                      : "—"}
                  </span>
                </div>

                {/* Divider */}
                <div
                  className={`w-px self-stretch shrink-0 ${
                    nextUp ? "bg-[#4a5d3e]/40" : "bg-[rgba(88,120,74,0.15)]"
                  }`}
                />

                {/* Details */}
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm font-semibold truncate ${
                      nextUp ? "text-primary-deep" : "text-foreground"
                    }`}
                  >
                    {booking.service?.title ?? "Session"}
                    {nextUp && (
                      <span className="ml-2 inline-flex items-center rounded-full bg-[#d7b870]/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#7b4d12]">
                        Soon
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {booking.client?.name ? `Client: ${booking.client.name}` : "Client TBD"}
                  </p>
                </div>

                {/* Status */}
                <StatusBadge status={booking.status} dot={false} />
              </Link>
            );
          })}
        </ul>
      )}
    </div>
  );
}
