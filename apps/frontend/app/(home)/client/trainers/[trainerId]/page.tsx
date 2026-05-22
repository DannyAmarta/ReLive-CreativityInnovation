import { SessionWarning } from "@/components/auth/SessionWarning";
import { CheckCircle2, Star, ArrowLeft } from "lucide-react";
import { ServiceBookingFlow } from "@/components/relive/ServiceBookingFlow";
import Link from "next/link";
import { getTrainerProfile } from "@/lib/marketplace";
import { notFound } from "next/navigation";

export default async function TrainerProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ trainerId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { trainerId } = await params;
  const query = searchParams ? await searchParams : {};
  const numericTrainerId = Number(trainerId);

  if (!Number.isInteger(numericTrainerId)) {
    notFound();
  }

  const trainer = await getTrainerProfile(numericTrainerId).catch(() => null);

  if (!trainer) {
    notFound();
  }

  const activeServices = trainer.services.filter((service) => service.isActive);

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
        <Link href="/client/trainers" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="size-4" /> Back to trainers
        </Link>

        {query?.session === "expired" && (
          <div className="mb-6">
            <SessionWarning description="Your Google session needs a refresh before a booking can be created. Trainer details are still visible, but please sign in again before reserving this service." />
          </div>
        )}

        <div className="grid gap-10 md:grid-cols-[1.05fr_1fr]">
          <div>
          <div className="overflow-hidden rounded-3xl border border-border bg-card">
            {trainer.user.avatar ? (
              <img
                src={trainer.user.avatar}
                alt={trainer.user.name}
                className="aspect-square w-full object-cover"
              />
            ) : (
              <div className="flex aspect-square items-center justify-center text-7xl font-bold text-primary-deep">
                {trainer.user.name.slice(0, 1)}
              </div>
            )}
          </div>
          <div className="mt-6">
            <h1 className="font-display text-3xl font-bold text-primary-deep md:text-4xl">
              {trainer.user.name}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {trainer.bio || trainer.user.bio || "Seeded trainer profile from the backend marketplace."}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
              <span className="inline-flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-warning text-warning" />
                <span className="font-semibold">{trainer.rating.toFixed(1)}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                {activeServices.length} active services
              </span>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Certifications
              </h3>
              <ul className="mt-3 space-y-2">
                {trainer.certifications.map((certification) => (
                  <li key={certification} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    {certification}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div>
          <h2 className="font-display text-2xl font-bold text-primary-deep">Services</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            These services come from the trainer&apos;s live seeded records. Fiat booking is wired now, while
            crypto escrow reservation is prepared for the next contract-focused step.
          </p>
          <div className="mt-5 space-y-4">
            {activeServices.map((service) => (
              <ServiceBookingFlow
                key={service.id}
                service={service}
                trainerId={trainer.id}
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  </div>
);
}
