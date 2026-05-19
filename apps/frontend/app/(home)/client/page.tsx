import { SessionWarning } from "@/components/auth/SessionWarning";
import Link from "next/link";
import { ArrowRight, Calendar, Compass, Shield, Wallet, Zap } from "lucide-react";
import { isAuthenticationGraphqlError } from "@/lib/fetchGraphQL";
import { getMyClientBookings, getTrainerProfiles } from "@/lib/marketplace";

export default async function ClientHomePage() {
  const [trainersResult, bookingsResult] = await Promise.allSettled([
    getTrainerProfiles(),
    getMyClientBookings(),
  ]);
  const trainers = trainersResult.status === "fulfilled" ? trainersResult.value : [];
  const bookings = bookingsResult.status === "fulfilled" ? bookingsResult.value : [];
  const showSessionWarning =
    bookingsResult.status === "rejected" && isAuthenticationGraphqlError(bookingsResult.reason);

  const servicesCount = trainers.reduce((total, trainer) => total + trainer.services.length, 0);
  const averageRating =
    trainers.length > 0
      ? trainers.reduce((total, trainer) => total + trainer.rating, 0) / trainers.length
      : 0;

  return (
    <div>
      <main className="relive-grid">
        {showSessionWarning && (
          <div className="mx-auto mt-6 w-full max-w-7xl px-4 md:px-6">
            <SessionWarning description="Your Google session needs to be refreshed, so personal booking stats are temporarily falling back while trainer discovery stays available." />
          </div>
        )}

        <section className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 md:grid-cols-[1.15fr_0.85fr] md:px-6 md:py-16">
          <div className="space-y-6">
            <h1 className="max-w-3xl font-display text-4xl font-bold leading-[1.02] tracking-tight text-primary-deep md:text-6xl">
              Find the right trainer in a calmer, clearer marketplace.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-[#67715f] md:text-lg">
              Browse live seeded trainer profiles, compare real services, and keep every booking in
              sync with the same backend data your trainer sees.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/client/trainers"
                className="inline-flex items-center gap-2 rounded-full bg-[#4a5d3e] px-6 py-3.5 text-sm font-semibold text-[#f8f6ef] shadow-[0_16px_34px_rgba(74,93,62,0.18)] transition-all hover:-translate-y-0.5"
              >
                Browse trainers <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/client/dashboard"
                className="inline-flex items-center gap-2 rounded-full border border-[rgba(88,120,74,0.16)] bg-[rgba(255,252,246,0.9)] px-6 py-3.5 text-sm font-semibold text-primary-deep transition-colors hover:bg-[rgba(237,242,229,0.92)]"
              >
                Your bookings
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4">
              <Stat label="Trainers" value={String(trainers.length)} />
              <Stat label="Services" value={String(servicesCount)} />
              <Stat label="Avg rating" value={averageRating.toFixed(1)} />
            </div>
          </div>

          <div className="grid gap-4">
            <div className="relive-panel p-6">
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6c7662]">
                  Your account state
                </p>
                <span className="relive-outline-chip text-xs font-semibold">
                  <Compass className="h-3.5 w-3.5" />
                  Live backend
                </span>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.4rem] bg-[#fffdf8] p-5 shadow-card">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#6c7662]">Active records</p>
                  <p className="mt-3 font-display text-4xl font-bold text-primary-deep">{bookings.length}</p>
                  <p className="mt-2 text-sm leading-6 text-[#67715f]">
                    Bookings attached to your current account without relying on browser mock state.
                  </p>
                </div>
                <div className="relive-panel-strong p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#e7e0d2]">Services ready</p>
                  <p className="mt-3 font-display text-4xl font-bold">{servicesCount}</p>
                  <p className="mt-2 text-sm leading-6 text-[#ece6d8]">
                    Trainers and services are now fed by the same source of truth as the trainer hub.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-20 md:px-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Feature
              icon={<Wallet className="h-5 w-5" />}
              title="Real trainer catalog"
              body="Trainer listings now come from seeded profiles and service records."
            />
            <Feature
              icon={<Shield className="h-5 w-5" />}
              title="Shared booking truth"
              body="Client and trainer pages resolve against the same backend booking states."
            />
            <Feature
              icon={<Zap className="h-5 w-5" />}
              title="Next step ready"
              body="This lays the groundwork for live fiat payment and contract actions in the next pass."
            />
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <Feature
              icon={<Calendar className="h-5 w-5" />}
              title="Seed-backed bookings"
              body="Your dashboard now reflects real seeded bookings instead of local browser state."
            />
            <Feature
              icon={<Wallet className="h-5 w-5" />}
              title="Trainer wallet sync"
              body="Trainer wallet balances and withdrawal history can now come from backend records."
            />
            <Feature
              icon={<Shield className="h-5 w-5" />}
              title="RBAC-aligned flows"
              body="Client and trainer actions now follow the backend booking state machine."
            />
          </div>
        </section>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.4rem] border border-[rgba(88,120,74,0.12)] bg-[rgba(255,252,246,0.72)] p-4 shadow-card">
      <p className="font-display text-2xl font-bold text-primary-deep">{value}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#6c7662]">{label}</p>
    </div>
  );
}

function Feature({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="relive-panel p-6">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-[rgba(74,93,62,0.1)] text-[#4a5d3e]">
        {icon}
      </span>
      <h3 className="mt-4 font-display text-lg font-bold text-primary-deep">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-[#67715f]">{body}</p>
    </div>
  );
}
