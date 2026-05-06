import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, MapPin, Star, Wallet } from "lucide-react";
import { Header } from "@/components/relive/Header";
import { TRAINERS, type Service } from "@/lib/mock-data";
import { formatIDR, formatUSDC } from "@/lib/format";
import { FiatBookingModal } from "@/components/relive/FiatBookingModal";
import { CryptoBookingModal } from "@/components/relive/CryptoBookingModal";

export const Route = createFileRoute("/trainers/$trainerId")({
  loader: ({ params }) => {
    const trainer = TRAINERS.find((t) => t.id === params.trainerId);
    if (!trainer) throw notFound();
    return { trainer };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.trainer.name} — ReLive` },
          { name: "description", content: loaderData.trainer.headline },
          { property: "og:title", content: `${loaderData.trainer.name} — ReLive` },
          { property: "og:description", content: loaderData.trainer.headline },
          { property: "og:image", content: loaderData.trainer.photo },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center px-4 text-center">
      <div>
        <h1 className="font-display text-3xl font-bold text-primary-deep">Trainer not found</h1>
        <Link to="/trainers" className="mt-4 inline-block text-primary underline">Back to trainers</Link>
      </div>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="grid min-h-screen place-items-center px-4 text-center text-destructive">
      {error.message}
    </div>
  ),
  component: TrainerProfile,
});

function TrainerProfile() {
  const { trainer } = Route.useLoaderData();
  const [bookingService, setBookingService] = useState<Service | null>(null);
  const [cryptoService, setCryptoService] = useState<Service | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto grid max-w-6xl gap-10 px-4 py-10 md:grid-cols-[1.05fr_1fr] md:px-6 md:py-14">
        <div>
          <div className="overflow-hidden rounded-3xl border border-border bg-card">
            <img
              src={trainer.photo}
              alt={trainer.name}
              className="aspect-square w-full object-cover"
            />
          </div>
          <div className="mt-6">
            <h1 className="font-display text-3xl font-bold text-primary-deep md:text-4xl">
              {trainer.name}
            </h1>
            <p className="mt-1 text-muted-foreground">{trainer.headline}</p>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
              <span className="inline-flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-warning text-warning" />
                <span className="font-semibold">{trainer.rating}</span>
                <span className="text-muted-foreground">({trainer.reviewCount})</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {trainer.city}
              </span>
            </div>
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{trainer.bio}</p>

            <div className="mt-6 flex flex-wrap gap-2">
              {trainer.specialties.map((s) => (
                <span key={s} className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                  {s}
                </span>
              ))}
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Certifications
              </h3>
              <ul className="mt-3 space-y-2">
                {trainer.certifications.map((c) => (
                  <li key={c} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div>
          <h2 className="font-display text-2xl font-bold text-primary-deep">Services</h2>
          <p className="mt-1 text-sm text-muted-foreground">Book in IDR or pay with USDC.</p>
          <div className="mt-5 space-y-4">
            {trainer.services.map((s) => (
              <div
                key={s.id}
                className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-display text-lg font-bold text-primary-deep">{s.title}</h3>
                    {s.durationMin && (
                      <p className="text-xs text-muted-foreground">{s.durationMin} min</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{formatUSDC(s.priceUsdc)}</p>
                    <p className="font-display text-lg font-bold text-primary">
                      {formatIDR(s.priceIdr)}
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setCryptoService(s)}
                    className="rounded-full border border-border bg-background px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary-deep"
                  >
                    Book with Crypto
                  </button>
                  <button
                    onClick={() => setBookingService(s)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
                  >
                    <Wallet className="h-4 w-4" />
                    Book with IDR
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {bookingService && (
        <FiatBookingModal
          service={bookingService}
          trainer={trainer}
          onClose={() => setBookingService(null)}
        />
      )}

      {cryptoService && (
        <CryptoBookingModal
          service={cryptoService}
          trainer={trainer}
          onClose={() => setCryptoService(null)}
        />
      )}
    </div>
  );
}