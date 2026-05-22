import { SessionWarning } from "@/components/auth/SessionWarning";
import { TrendingDown, Wallet, BarChart3, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { isAuthenticationGraphqlError } from "@/lib/fetchGraphQL";
import { formatIDR } from "@/lib/format";
import {
  computeClientFiatMetrics,
  getMyClientFiatBookings,
} from "@/lib/marketplace";
import { ClientWalletLedger } from "@/components/client/ClientWalletLedger";

export default async function ClientWalletPage() {
  const bookingsResult = await Promise.allSettled([getMyClientFiatBookings()]);
  const bookings = bookingsResult[0].status === "fulfilled" ? bookingsResult[0].value : [];
  const showSessionWarning =
    bookingsResult[0].status === "rejected" &&
    isAuthenticationGraphqlError(bookingsResult[0].reason);

  const { lifetimeSpent, activeInvested, avgSessionCost, completedCount } =
    computeClientFiatMetrics(bookings);

  return (
    <div>
      <Link href="/client" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft className="size-4" /> Back to Dashboard
      </Link>
      {/* Page title */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight text-primary-deep md:text-4xl">
          Wallet &amp; Transactions
        </h1>
        <p className="mt-1 text-muted-foreground">
          Track your fiat payments and fitness investments.
        </p>
      </div>

      {showSessionWarning && (
        <SessionWarning description="Wallet data could not be fully refreshed with the current session. Your spending history may be incomplete." />
      )}

      {/* ── Analytics Row ── */}
      <section className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-3">
        {/* Hero: Lifetime Spent */}
        <div className="md:col-span-2 rounded-2xl border border-border bg-gradient-primary text-primary-foreground p-6 shadow-elevated">
          <div className="flex items-center gap-2 mb-3">
            <Wallet className="size-4" />
            <p className="text-xs uppercase tracking-wider opacity-80">Lifetime Fiat Spent</p>
          </div>
          <p className="text-4xl sm:text-5xl font-semibold font-mono tabular-nums">
            {formatIDR(lifetimeSpent)}
          </p>
          <p className="mt-3 text-sm opacity-75">
            Total investment across {completedCount} completed{" "}
            {completedCount === 1 ? "session" : "sessions"}.
          </p>
        </div>

        {/* Secondary cards */}
        <div className="flex flex-col gap-4">
          <div className="glass-card-elevated flex-1 p-5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="size-4 text-warning" />
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Active Investments
              </p>
            </div>
            <p className="text-2xl font-semibold font-mono tabular-nums">
              {formatIDR(activeInvested)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Funds committed to pending &amp; active sessions.
            </p>
          </div>

          <div className="glass-card-elevated flex-1 p-5">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="size-4 text-primary" />
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Avg Session Cost
              </p>
            </div>
            <p className="text-2xl font-semibold font-mono tabular-nums">
              {avgSessionCost > 0 ? formatIDR(avgSessionCost) : "—"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Your typical per-session spend.
            </p>
          </div>
        </div>
      </section>

      {/* ── Spending History Ledger ── */}
      <ClientWalletLedger bookings={bookings} />
    </div>
  );
}
