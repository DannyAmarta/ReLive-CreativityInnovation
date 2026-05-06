import { MetricCard } from "@/components/trainer/MetricCard";
import { PageHeader } from "@/components/trainer/PageHeader";
import { Avatar } from "@/components/trainer/Avatar";
import { StatusBadge } from "@/components/trainer/StatusBadge";
import {
  bookings,
  fmtDateTime,
  fmtIdr,
  fmtRelative,
  fmtUsd,
  fmtUsdc,
  overviewStats,
  transactions,
} from "@/lib/mock-data";
import { ArrowUpRight, Calendar, CheckCircle2, DollarSign, Star, Wallet } from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const upcoming = bookings
    .filter((b) => new Date(b.scheduledAt) > new Date() && (b.status === "ACTIVE" || b.status === "PENDING"))
    .sort((a, b) => +new Date(a.scheduledAt) - +new Date(b.scheduledAt))
    .slice(0, 4);

  const recent = transactions.slice(0, 5);

  return (
    <div>
      <PageHeader title="Dashboard" description="Performance overview and what needs your attention today." />

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <MetricCard
          label="Total Earnings"
          value={fmtUsd(overviewStats.totalEarningsUsdc)}
          sub={`+ ${fmtIdr(overviewStats.totalEarningsIdr)}`}
          icon={DollarSign}
          trend="Live"
        />
        <MetricCard label="Active Bookings" value={String(overviewStats.activeBookings)} sub="In progress" icon={Calendar} />
        <MetricCard label="Completed (30d)" value={String(overviewStats.completed30d)} sub="Sessions delivered" icon={CheckCircle2} />
        <MetricCard
          label="Avg. Rating"
          value={overviewStats.rating.toFixed(2)}
          sub={`${overviewStats.ratingCount} reviews`}
          icon={Star}
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card-elevated overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold">Upcoming sessions</h2>
            <Link to="/trainer-hub/bookings" className="text-xs font-medium text-primary inline-flex items-center gap-1 hover:gap-2 transition-all">
              View all <ArrowUpRight className="size-3" />
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {upcoming.length === 0 && (
              <li className="px-5 py-8 text-sm text-muted-foreground text-center">No upcoming sessions in the next 7 days.</li>
            )}
            {upcoming.map((b) => (
              <li key={b.id} className="px-5 py-4 flex items-center gap-4 hover:bg-muted/40 transition-colors">
                <Avatar initials={b.client.avatar} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{b.client.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{b.serviceTitle}</p>
                </div>
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-medium">{fmtDateTime(b.scheduledAt)}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {b.paymentMethod === "CRYPTO" ? fmtUsdc(b.amountUsdc!) : fmtIdr(b.amountIdr!)}
                  </p>
                </div>
                <StatusBadge status={b.status} />
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-6">
          <Link
            to="/trainer-hub/wallet"
            className="block glass-card-elevated p-5 group hover:border-accent/40 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pending withdrawal</p>
              <Wallet className="size-4 text-accent" />
            </div>
            <p className="text-2xl font-semibold font-mono tabular-nums">{fmtIdr(overviewStats.pendingWithdrawalIdr)}</p>
            <p className="text-xs text-primary mt-2 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
              Open wallet <ArrowUpRight className="size-3" />
            </p>
          </Link>

          <div className="glass-card-elevated overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-sm font-semibold">Recent activity</h2>
            </div>
            <ul className="divide-y divide-border">
              {recent.map((t) => (
                <li key={t.id} className="px-5 py-3 flex items-center gap-3">
                  <span
                    className={`size-2 rounded-full shrink-0 ${
                      t.status === "COMPLETED" ? "bg-accent" : t.status === "PENDING" ? "bg-warning" : "bg-destructive"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate">{t.description}</p>
                    <p className="text-[10px] text-muted-foreground">{fmtRelative(t.createdAt)}</p>
                  </div>
                  <p className={`text-xs font-mono tabular-nums ${t.type === "CREDIT" ? "text-success" : "text-foreground"}`}>
                    {t.type === "CREDIT" ? "+" : "−"}
                    {fmtIdr(t.amountIdr).replace("IDR ", "")}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
