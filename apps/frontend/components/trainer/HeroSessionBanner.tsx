import Link from "next/link";
import { Clock3, ArrowRight, CalendarDays, BookOpen } from "lucide-react";
import type { BookingRecord } from "@/lib/marketplace";

function formatSessionTime(iso: string) {
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

interface HeroSessionBannerProps {
  bookings: BookingRecord[];
  trainerName?: string | null;
}

export function HeroSessionBanner({ bookings, trainerName }: HeroSessionBannerProps) {
  const nextSession = [...bookings]
    .filter(
      (b) =>
        (b.status === "ACTIVE" || b.status === "PENDING") &&
        b.scheduledStart &&
        new Date(b.scheduledStart) >= new Date(Date.now() - 60 * 60 * 1000),
    )
    .sort(
      (a, b) =>
        new Date(a.scheduledStart!).getTime() - new Date(b.scheduledStart!).getTime(),
    )[0];

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  })();

  const displayName = trainerName?.split(" ")[0] ?? "Coach";

  return (
    <div className="relive-panel-strong p-7 flex flex-col gap-5 min-h-[200px]">
      {/* Top row */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[rgba(255,255,255,0.55)]">
            {greeting}, {displayName} 👋
          </p>
          {nextSession ? (
            <>
              <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.15)] bg-[rgba(255,255,255,0.08)] px-3 py-1">
                <span className="size-1.5 rounded-full bg-[#d7b870] animate-pulse-soft" />
                <span className="text-[11px] font-semibold uppercase tracking-widest text-[#d7b870]">
                  Upcoming Session
                </span>
              </div>
              <h1 className="font-display text-2xl font-bold text-[#f8f6ef] leading-tight mt-2">
                {nextSession.service?.title ?? "Session"}
              </h1>
              <div className="flex items-center gap-2 text-[#ece6d8] text-sm">
                <Clock3 className="size-3.5 shrink-0 opacity-70" />
                <span>
                  {formatSessionTime(nextSession.scheduledStart!)}
                  {nextSession.scheduledEnd &&
                    ` – ${formatSessionTime(nextSession.scheduledEnd)}`}
                </span>
                {nextSession.client?.name && (
                  <>
                    <span className="opacity-40">·</span>
                    <span className="font-medium">{nextSession.client.name}</span>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <h1 className="font-display text-2xl font-bold text-[#f8f6ef] leading-tight mt-1">
                You&apos;re all clear today
              </h1>
              <p className="text-sm text-[#c5d4b8] leading-relaxed">
                No upcoming sessions right now — enjoy the downtime ☀️
              </p>
            </>
          )}
        </div>
      </div>

      {/* CTA row */}
      <div className="flex flex-wrap items-center gap-3 mt-auto">
        <Link
          href="/trainer/calendar"
          className="inline-flex items-center gap-2 rounded-full bg-[#f8f6ef] px-5 py-2.5 text-sm font-semibold text-[#31442a] transition-all hover:-translate-y-0.5 hover:shadow-lift"
        >
          <CalendarDays className="size-3.5" />
          Go to Calendar
          <ArrowRight className="size-3.5" />
        </Link>
        <Link
          href="/trainer/bookings"
          className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.18)] px-5 py-2.5 text-sm font-semibold text-[#f8f6ef] transition-colors hover:bg-[rgba(255,255,255,0.08)]"
        >
          <BookOpen className="size-3.5" />
          View Bookings
        </Link>
      </div>
    </div>
  );
}
