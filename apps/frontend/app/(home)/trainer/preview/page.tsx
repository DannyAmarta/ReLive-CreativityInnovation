import { CheckCircle2, Eye, Star, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { formatIDR, formatUSDC } from "@/lib/format";
import { getTrainerAvailabilityRules } from "@/lib/actions/availability";
import { AvailabilityWidget } from "@/components/trainer/AvailabilityWidget";
import { getMyTrainerProfile, lamportsToTokenUnits } from "@/lib/marketplace";
import { TrainerCard } from "@/components/shared/TrainerCard";

export default async function TrainerPreviewPage() {
  const profile = await getMyTrainerProfile().catch(() => null);
  const availabilityRules = profile ? await getTrainerAvailabilityRules(profile.id).catch(() => []) : [];

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md p-8 rounded-3xl border border-border bg-card">
          <div className="size-16 rounded-2xl bg-muted flex items-center justify-center mx-auto">
            <Eye className="size-8 text-muted-foreground" />
          </div>
          <h1 className="font-display text-2xl font-bold text-primary-deep">No profile yet</h1>
          <p className="text-sm text-muted-foreground leading-6">
            You haven't set up a trainer profile yet. Create one to see how you'll appear to clients.
          </p>
          <Link
            href="/trainer/settings"
            className="inline-flex items-center gap-2 rounded-full bg-[#4a5d3e] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Set up profile
          </Link>
        </div>
      </div>
    );
  }

  const activeServices = profile.services.filter((s) => s.isActive);

  return (
    <div className="space-y-8">
      {/* ── Back + Banner ── */}
      <div className="space-y-4">
        <Link
          href="/trainer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to Dashboard
        </Link>

        {/* Preview Banner */}
        <div className="flex items-center gap-3 rounded-2xl border border-[rgba(88,120,74,0.3)] bg-[rgba(88,120,74,0.08)] px-5 py-4">
          <div className="size-9 rounded-xl bg-[rgba(88,120,74,0.15)] flex items-center justify-center shrink-0">
            <Eye className="size-4 text-[#4a5d3e]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#4a5d3e]">Public Profile Preview</p>
            <p className="text-xs text-[#67715f] mt-0.5">
              This is exactly how clients see you in the marketplace. Booking buttons are disabled in preview mode.
            </p>
          </div>
          <Link
            href={`/client/trainers/${profile.id}`}
            className="ml-auto shrink-0 inline-flex items-center gap-1.5 rounded-full bg-[#4a5d3e] px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
          >
            Live page ↗
          </Link>
        </div>
      </div>

      {/* ── Section 1: Card Preview ── */}
      <section className="space-y-4">
        <div>
          <h2 className="font-display text-xl font-bold text-primary-deep">Marketplace Card</h2>
          <p className="text-sm text-muted-foreground mt-1">
            This is the card clients see when browsing the trainer directory.
          </p>
        </div>
        <div className="max-w-xs">
          <TrainerCard trainer={profile} isClientView={false} />
        </div>
      </section>

      {/* ── Section 2: Full Profile ── */}
      <section className="space-y-4">
        <div>
          <h2 className="font-display text-xl font-bold text-primary-deep">Full Profile Page</h2>
          <p className="text-sm text-muted-foreground mt-1">
            This is the full detail page a client sees when they click your card.
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card overflow-hidden">
          {/* Inner layout mirrors client profile page */}
          <div className="grid md:grid-cols-[1.05fr_1fr] gap-10 p-8">
            {/* Left column: photo + bio */}
            <div>
              <div className="overflow-hidden rounded-3xl border border-border bg-card/60">
                {profile.user.avatar ? (
                  <img
                    src={profile.user.avatar}
                    alt={profile.user.name}
                    className="aspect-square w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-square items-center justify-center text-7xl font-bold text-primary-deep bg-[#edf2e6]">
                    {profile.user.name.slice(0, 1)}
                  </div>
                )}
              </div>
              <div className="mt-6">
                <h1 className="font-display text-3xl font-bold text-primary-deep">
                  {profile.user.name}
                </h1>
                <p className="mt-2 text-muted-foreground">
                  {profile.bio || profile.user.bio || "Your bio will appear here. Set it in Settings."}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                  <span className="inline-flex items-center gap-1.5">
                    <Star className="h-4 w-4 fill-warning text-warning" />
                    <span className="font-semibold">{profile.rating.toFixed(1)}</span>
                  </span>
                  <span className="text-muted-foreground">
                    {activeServices.length} active services
                  </span>
                </div>

                <div className="mt-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Certifications
                  </h3>
                  {profile.certifications.length > 0 ? (
                    <ul className="mt-3 space-y-2">
                      {profile.certifications.map((cert) => (
                        <li key={cert} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                          {cert}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground italic">
                      No certifications added yet.
                    </p>
                  )}
                </div>

                <div className="mt-8 pt-8 border-t border-border/60">
                  <AvailabilityWidget rules={availabilityRules} isEditable={false} />
                </div>
              </div>
            </div>

            {/* Right column: services */}
            <div>
              <h2 className="font-display text-2xl font-bold text-primary-deep">Services</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                These are the services clients can book from your profile.
              </p>
              {activeServices.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-border p-8 text-center space-y-2">
                  <p className="text-sm text-muted-foreground">No active services yet.</p>
                  <Link
                    href="/trainer/services"
                    className="inline-flex text-xs font-semibold text-[#4a5d3e] hover:underline"
                  >
                    Add a service →
                  </Link>
                </div>
              ) : (
                <div className="mt-5 space-y-4">
                  {activeServices.map((service) => {
                    const tokenUnits = lamportsToTokenUnits(service.priceInLamports);
                    return (
                      <div
                        key={service.id}
                        className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-display text-lg font-bold text-primary-deep">
                              {service.title}
                            </h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                              {service.description}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            {tokenUnits > 0 && (
                              <p className="text-xs text-muted-foreground">{formatUSDC(tokenUnits)}</p>
                            )}
                            <p className="font-display text-lg font-bold text-primary">
                              {service.priceInIdr ? formatIDR(service.priceInIdr) : "IDR not set"}
                            </p>
                          </div>
                        </div>

                        {/* Disabled booking buttons (preview mode) */}
                        <div className="mt-4 flex flex-col gap-2">
                          {service.priceInLamports ? (
                            <button
                              disabled
                              className="w-full rounded-full border border-border py-2.5 text-sm font-semibold text-muted-foreground bg-muted cursor-not-allowed opacity-60"
                            >
                              Book with Crypto (preview)
                            </button>
                          ) : null}
                          {service.priceInIdr ? (
                            <button
                              disabled
                              className="w-full rounded-full bg-[rgba(74,93,62,0.12)] py-2.5 text-sm font-semibold text-[#4a5d3e] cursor-not-allowed opacity-60"
                            >
                              Book with IDR (preview)
                            </button>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
