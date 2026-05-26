import { SessionWarning } from "@/components/auth/SessionWarning";
import { EyeOff, Zap, ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/trainer/PageHeader";
import { CreateServiceForm, EditServiceForm } from "@/components/trainer/ServiceForms";
import { toggleTrainerServiceAction } from "@/lib/actions/marketplace";
import { isAuthenticationGraphqlError } from "@/lib/fetchGraphQL";
import { formatIDR, formatUSDC } from "@/lib/format";
import { getMyTrainerProfile, lamportsToTokenUnits } from "@/lib/marketplace";
import Link from "next/link";
import { TrainerNavigationHeader } from "@/components/trainer/TrainerNavigationHeader";

export default async function TrainerServicesPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const trainerProfileResult = await Promise.allSettled([getMyTrainerProfile()]);
  const trainerProfile =
    trainerProfileResult[0].status === "fulfilled"
      ? trainerProfileResult[0].value
      : { services: [] };
  const services = trainerProfile.services ?? [];
  const params = searchParams ? await searchParams : {};
  const showSessionWarning =
    params?.session === "expired" ||
    (trainerProfileResult[0].status === "rejected" &&
      isAuthenticationGraphqlError(trainerProfileResult[0].reason));

  return (
    <div className="space-y-6">
      <Link
        href="/trainer"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to Dashboard
      </Link>

      <TrainerNavigationHeader activeTab="services" />

      <PageHeader
        title="Services"
        description="Manage trainer services directly from the real service rows used by the client marketplace."
      />

      {showSessionWarning && (
        <SessionWarning description="Your trainer services could not be refreshed with the current Google session. The page stays open, but create and edit actions should wait until you sign in again." />
      )}

      <CreateServiceForm />

      {services.length === 0 ? (
        <div className="glass-card-elevated p-10 text-center">
          <Zap className="mx-auto size-8 text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">
            No services found for this trainer yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {services.map((service) => (
            <article key={service.id} className="glass-card-elevated p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold tracking-tight">{service.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{service.description}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${service.isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                  {service.isActive ? "ACTIVE" : "INACTIVE"}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                {service.priceInLamports ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 font-mono font-semibold text-primary">
                    🔗 {formatUSDC(lamportsToTokenUnits(service.priceInLamports))}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                    🔗 Crypto not offered
                  </span>
                )}
                {service.priceInIdr ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 font-mono font-semibold text-emerald-600">
                    💰 {formatIDR(service.priceInIdr)}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                    💰 IDR not offered
                  </span>
                )}
              </div>

              <details className="mt-4 rounded-2xl border border-border bg-background p-4">
                <summary className="cursor-pointer text-sm font-medium text-primary-deep">Edit service</summary>
                <EditServiceForm service={service} />
              </details>

              <form action={toggleTrainerServiceAction} className="mt-4">
                <input type="hidden" name="serviceId" value={service.id} />
                <input type="hidden" name="isActive" value={service.isActive ? "true" : "false"} />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:border-primary/40 hover:text-primary-deep"
                >
                  <EyeOff className="size-3.5" />
                  {service.isActive ? "Archive service" : "Reactivate service"}
                </button>
              </form>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
