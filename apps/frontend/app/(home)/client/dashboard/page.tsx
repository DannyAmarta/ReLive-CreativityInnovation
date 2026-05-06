"use client";

import { useMemo, useState } from "react";
import { Calendar, RefreshCw } from "lucide-react";
import { Header } from "@/components/relive/Header";
import { StatusBadge } from "@/components/relive/StatusBadge";
import { useStore, actions } from "@/lib/store";
import { formatDateTime, formatIDR, formatUSDC } from "@/lib/format";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import Link from "next/link";
const TABS = ["All", "Active", "Past"] as const;
type Tab = (typeof TABS)[number];

export default function DashboardPage() {
  const bookings = useStore((s) => s.bookings);
  const [tab, setTab] = useState<Tab>("All");

  const filtered = useMemo(() => {
    if (tab === "Active") return bookings.filter((b) => b.status === "ACTIVE" || b.status === "PENDING");
    if (tab === "Past") return bookings.filter((b) => b.status === "COMPLETED" || b.status === "CANCELLED");
    return bookings;
  }, [bookings, tab]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-10 md:px-6 md:py-14">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-primary-deep md:text-4xl">
              Your bookings
            </h1>
            <p className="mt-1 text-muted-foreground">Sessions you've booked with trainers.</p>
          </div>
            <Link
              href="/client/trainers"
              className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Find a trainer
            </Link>
          </div>
  
          <div className="mb-6 flex gap-2">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  tab === t
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:text-primary-deep",
                )}
              >
                {t}
              </button>
            ))}
          </div>
  
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
              <p className="font-medium text-primary-deep">No bookings here yet.</p>
              <Link href="/client/trainers" className="mt-2 inline-block text-sm text-primary underline">
                Browse trainers
              </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((b) => (
              <article
                key={b.id}
                className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]"
              >
                <div className="flex flex-wrap items-start gap-4">
                  <img
                    src={b.trainerPhoto}
                    alt={b.trainerName}
                    className="h-14 w-14 rounded-full object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-base font-bold text-primary-deep">
                      {b.trainerName}
                    </h3>
                    <p className="text-sm text-muted-foreground">{b.serviceTitle}</p>
                    <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDateTime(b.scheduledAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={cn(
                        "inline-block rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
                        b.paymentType === "FIAT"
                          ? "bg-accent-mint text-primary-foreground"
                          : "bg-primary text-primary-foreground",
                      )}
                    >
                      {b.paymentType}
                    </span>
                    <p className="mt-2 font-display text-base font-bold text-primary">
                      {b.paymentType === "FIAT"
                        ? formatIDR(b.amountIdr ?? 0)
                        : formatUSDC(b.amountUsdc ?? 0)}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                  <StatusBadge status={b.status} />
                  <div className="flex gap-2">
                    {b.paymentType === "FIAT" && b.status === "PENDING" && (
                      <button
                        onClick={() => toast.info("Re-opening Duitku payment…")}
                        className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 px-4 py-2 text-xs font-semibold text-primary hover:bg-primary/5"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Retry payment
                      </button>
                    )}
                    {b.paymentType === "FIAT" && b.status === "ACTIVE" && (
                      <button
                        onClick={() => {
                          actions.completeSession(b.id);
                          toast.success("Session marked complete", {
                            description: "Your trainer's wallet has been credited.",
                          });
                        }}
                        className="inline-flex items-center rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
                      >
                        Mark session complete
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
