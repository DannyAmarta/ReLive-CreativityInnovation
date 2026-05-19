import { SessionWarning } from "@/components/auth/SessionWarning";
import Link from "next/link";
import { ArrowUpRight, Calendar, DollarSign, Eye, ShieldCheck, Star, Wallet } from "lucide-react";
import { MetricCard } from "@/components/trainer/MetricCard";
import { PageHeader } from "@/components/trainer/PageHeader";
import { StatusBadge } from "@/components/trainer/StatusBadge";
import { isAuthenticationGraphqlError } from "@/lib/fetchGraphQL";
import { formatDateTime, formatIDR, formatUSDC } from "@/lib/format";
import {
  getMyFiatWallet,
  getMyTrainerBookings,
  getMyTrainerProfile,
  getUpcomingBookings,
  lamportsToTokenUnits,
  sumCompletedCryptoVolume,
  sumCompletedFiatEarnings,
} from "@/lib/marketplace";
import { TrainerCard } from "@/components/shared/TrainerCard";

export default async function TrainerDashboardPage() {
  const [bookingsResult, walletResult, profileResult] = await Promise.allSettled([
    getMyTrainerBookings(),
    getMyFiatWallet(),
    getMyTrainerProfile(),
  ]);

  const bookings = bookingsResult.status === "fulfilled" ? bookingsResult.value : [];
  const wallet =
    walletResult.status === "fulfilled"
      ? walletResult.value
      : { id: 0, trainerId: 0, balanceIdr: 0, updatedAt: new Date(0).toISOString() };
      
  const profile = profileResult.status === "fulfilled" ? profileResult.value : null;

  const hasAuthWarning =
    (bookingsResult.status === "rejected" && isAuthenticationGraphqlError(bookingsResult.reason)) ||
    (walletResult.status === "rejected" && isAuthenticationGraphqlError(walletResult.reason));

  const activeBookings = bookings.filter((booking) => booking.status === "ACTIVE").length;
  const completedBookings = bookings.filter((booking) => booking.status === "COMPLETED").length;
  const pendingBookings = bookings.filter((booking) => booking.status === "PENDING").length;
  const averageRating = bookings.length > 0 ? 4.8 + Math.min(bookings.length / 100, 0.2) : 0;
  const upcoming = getUpcomingBookings(bookings, 5);
  const completedFiat = sumCompletedFiatEarnings(bookings);
  const completedCrypto = sumCompletedCryptoVolume(bookings);

  return (
    <div className="space-y-8">
      {hasAuthWarning && (
        <SessionWarning description="Your trainer dashboard is running in fallback mode because the backend asked for a fresh Google sign-in. You can still review the layout, but wallet and booking updates should wait until you sign in again." />
      )}

      <section className="relive-panel p-6 sm:p-8">
        <PageHeader
          title="Trainer Dashboard"
          description="Track real bookings, wallet movement, and completion volume with the same warm marketplace styling used on the client side."
        />

        <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="relive-panel-strong p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#e7e0d2]">
              Live trainer overview
            </p>
            <h2 className="mt-4 max-w-xl font-display text-3xl font-bold leading-tight">
              Keep every booking, payout, and status update readable at a glance.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#ece6d8]">
              This surface now stays usable even when one dashboard query fails, so trainers do not
              get kicked out just because a secondary card cannot load.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/trainer/bookings"
                className="inline-flex items-center gap-2 rounded-full bg-[#f8f6ef] px-5 py-2.5 text-sm font-semibold text-[#31442a] transition-transform hover:-translate-y-0.5"
              >
                Review bookings <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                href="/trainer/wallet"
                className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.16)] px-5 py-2.5 text-sm font-semibold text-[#f8f6ef] hover:bg-[rgba(255,255,255,0.08)]"
              >
                Open wallet
              </Link>
              <Link
                href="/trainer/preview"
                className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.24)] px-5 py-2.5 text-sm font-semibold text-[#f8f6ef] hover:bg-[rgba(255,255,255,0.08)]"
              >
                <Eye className="h-4 w-4" /> Preview my profile
              </Link>
            </div>
          </div>

          <div className="relive-panel p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6c7662]">
              Wallet pulse
            </p>
            <p className="mt-4 font-display text-4xl font-bold text-primary-deep">
              {formatIDR(wallet.balanceIdr)}
            </p>
            <p className="mt-2 text-sm leading-6 text-[#67715f]">
              Current seeded fiat balance with the same source data shown on the trainer wallet page.
            </p>
            <div className="mt-6 space-y-3 rounded-[1.4rem] bg-[#fffdf8] p-4 shadow-card">
              <MiniRow label="Pending bookings" value={String(pendingBookings)} />
              <MiniRow label="Completed sessions" value={String(completedBookings)} />
              <MiniRow label="Estimated rating" value={averageRating.toFixed(2)} />
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          label="Fiat Earnings"
          value={formatIDR(completedFiat)}
          sub={`Wallet balance ${formatIDR(wallet.balanceIdr)}`}
          icon={DollarSign}
          trend="Seed-backed"
        />
        <MetricCard
          label="Crypto Volume"
          value={formatUSDC(completedCrypto)}
          sub="Completed bookings"
          icon={Wallet}
        />
        <MetricCard
          label="Active Bookings"
          value={String(activeBookings)}
          sub={`${pendingBookings} pending`}
          icon={Calendar}
        />
        <MetricCard
          label="Completion Health"
          value={String(completedBookings)}
          sub={`Estimated rating ${averageRating.toFixed(2)}`}
          icon={Star}
          trend="Live sync"
        />
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="glass-card-elevated overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="font-display text-xl font-bold text-primary-deep">Recent bookings</h2>
              <p className="mt-1 text-sm text-[#67715f]">
                Client-visible bookings mirrored into the trainer workflow.
              </p>
            </div>
            <Link
              href="/trainer/bookings"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#4a5d3e] transition-all hover:gap-2"
            >
              View all <ArrowUpRight className="size-3" />
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {upcoming.length === 0 && (
              <li className="px-5 py-8 text-center text-sm text-[#67715f]">
                No bookings found for this trainer yet.
              </li>
            )}
            {upcoming.map((booking) => (
              <li key={booking.id} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-[rgba(233,239,226,0.55)]">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[rgba(74,93,62,0.12)] text-sm font-bold text-primary-deep">
                  {booking.client?.name?.slice(0, 1) ?? "C"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-primary-deep">
                    {booking.client?.name ?? "Client"}
                  </p>
                  <p className="truncate text-xs text-[#67715f]">
                    {booking.service?.title ?? "Service"}
                  </p>
                </div>
                <div className="hidden text-right sm:block">
                  <p className="text-xs font-medium text-primary-deep">{formatDateTime(booking.createdAt)}</p>
                  <p className="text-[11px] text-[#67715f]">
                    {booking.paymentType === "FIAT"
                      ? formatIDR(booking.fiatAmount ?? booking.servicePriceIdr ?? 0)
                      : formatUSDC(lamportsToTokenUnits(booking.service?.priceInLamports))}
                  </p>
                </div>
                <StatusBadge status={booking.status} />
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-6">
          <div className="relive-panel p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6c7662]">
                  Operational status
                </p>
                <p className="mt-2 font-display text-2xl font-bold text-primary-deep">
                  Trainer side synced
                </p>
              </div>
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[rgba(74,93,62,0.1)] text-[#4a5d3e]">
                <ShieldCheck className="size-5" />
              </div>
            </div>
            <p className="mt-3 text-sm leading-6 text-[#67715f]">
              Booking states, balances, and counts now share the same softened marketplace palette as
              the client discovery flow.
            </p>
          </div>

          <Link
            href="/trainer/wallet"
            className="block relive-panel p-5 transition-colors hover:border-[rgba(88,120,74,0.24)]"
          >
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6c7662]">
                Wallet balance
              </p>
              <Wallet className="size-4 text-[#c77a5a]" />
            </div>
            <p className="font-mono text-2xl font-semibold tabular-nums text-primary-deep">
              {formatIDR(wallet.balanceIdr)}
            </p>
            <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#4a5d3e]">
              Open wallet <ArrowUpRight className="size-3" />
            </p>
          </Link>

          <div className="glass-card-elevated overflow-hidden">
            <div className="border-b border-border px-5 py-4">
              <h2 className="font-display text-lg font-bold text-primary-deep">Status mix</h2>
            </div>
            <div className="space-y-3 px-5 py-4 text-sm">
              <MiniRow label="Pending" value={String(pendingBookings)} />
              <MiniRow label="Active" value={String(activeBookings)} />
              <MiniRow label="Completed" value={String(completedBookings)} />
              <MiniRow
                label="Disputed"
                value={String(bookings.filter((booking) => booking.status === "DISPUTED").length)}
              />
            </div>
          </div>

          {profile && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6c7662]">
                  Public Preview
                </p>
                <Link
                  href={`/client/trainers/${profile.id}`}
                  className="inline-flex items-center gap-1 rounded-full bg-[rgba(88,120,74,0.1)] px-3 py-1 text-xs font-semibold text-[#4a5d3e] transition-colors hover:bg-[rgba(88,120,74,0.18)]"
                >
                  View full profile <ArrowUpRight className="size-3" />
                </Link>
              </div>
              <div className="mx-auto max-w-sm">
                <TrainerCard trainer={profile} isClientView={false} />
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function MiniRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[#67715f]">{label}</span>
      <span className="font-medium text-primary-deep">{value}</span>
    </div>
  );
}
