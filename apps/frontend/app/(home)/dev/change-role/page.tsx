import { SessionWarning } from "@/components/auth/SessionWarning";
import { print } from "graphql";
import { authFetchGraphql, isAuthenticationGraphqlError } from "@/lib/fetchGraphQL";
import { GET_ME_QUERY, ADMIN_GET_DISPUTED_BOOKINGS_QUERY } from "@/lib/gqlQueries";
import { changeRoleAction } from "@/lib/actions/dev";
import { updateBookingStatusAction } from "@/lib/actions/marketplace";
import { formatIDR, formatUSDC, formatDateTime } from "@/lib/format";
import { Shield, User as UserIcon, Dumbbell, Calendar, Info, Check, X, AlertTriangle } from "lucide-react";

type MeResponse = {
  getMe: {
    id: number;
    name: string;
    email: string;
    role: "USER" | "TRAINER" | "ADMIN";
  };
};

type DisputedBookingsResponse = {
  adminGetDisputedBookings: Array<{
    id: number;
    clientId: number;
    client?: {
      id: number;
      name: string;
      email: string;
    };
    trainerId: number;
    trainer?: {
      id: number;
      user: {
        id: number;
        name: string;
        email: string;
      };
    };
    serviceId: number;
    service?: {
      id: number;
      title: string;
      description: string;
      priceInIdr: number;
    };
    status: string;
    paymentType?: string;
    fiatAmount?: number;
    servicePriceIdr?: number;
    processingFeeIdr?: number;
    gatewayPaymentMethod?: string;
    disputeReason?: string;
    scheduledStart?: string;
    scheduledEnd?: string;
    timezone?: string;
    createdAt: string;
    updatedAt: string;
  }>;
};

export default async function ChangeRolePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = searchParams ? await searchParams : {};
  let me: MeResponse["getMe"] | null = null;
  let showSessionWarning = params?.session === "expired";
  let disputedBookings: DisputedBookingsResponse["adminGetDisputedBookings"] = [];

  try {
    const data = await authFetchGraphql<MeResponse>(print(GET_ME_QUERY));
    me = data.getMe;

    if (me?.role === "ADMIN") {
      const disputesData = await authFetchGraphql<DisputedBookingsResponse>(
        print(ADMIN_GET_DISPUTED_BOOKINGS_QUERY)
      );
      disputedBookings = disputesData.adminGetDisputedBookings ?? [];
    }
  } catch (error) {
    if (isAuthenticationGraphqlError(error)) {
      showSessionWarning = true;
    } else {
      throw error;
    }
  }

  const roles: Array<"USER" | "TRAINER" | "ADMIN"> = ["USER", "TRAINER", "ADMIN"];

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-8">
      {/* Dev Header Panel */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              Dev Control Panel
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Switch roles on the fly and manage platform-wide administration tasks.
            </p>
          </div>

          {me && (
            <div className="flex flex-col gap-1 rounded-xl bg-muted/50 p-4 border border-border">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-semibold text-foreground">{me.name}</span>
              </div>
              <span className="text-xs text-muted-foreground">{me.email}</span>
              <div className="mt-2 flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Current Role:</span>
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {me.role}
                </span>
              </div>
            </div>
          )}
        </div>

        {showSessionWarning && (
          <div className="mt-6">
            <SessionWarning description="Role switching is disabled until you refresh your Google sign-in. The dev page stays open so you can recover without being kicked out." />
          </div>
        )}

        {me ? (
          <div className="mt-8 border-t border-border pt-6">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Switch User Role</h3>
            <div className="flex flex-wrap gap-3">
              {roles.map((role) => {
                const isCurrent = me?.role === role;
                return (
                  <form key={role} action={changeRoleAction}>
                    <input type="hidden" name="role" value={role} />
                    <button
                      type="submit"
                      disabled={isCurrent}
                      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border ${
                        isCurrent
                          ? "bg-primary text-primary-foreground border-primary shadow-sm cursor-default"
                          : "bg-background text-foreground border-border hover:bg-muted/50 hover:border-muted-foreground/30 active:scale-[0.98]"
                      }`}
                    >
                      {role === "USER" && <UserIcon className="h-4 w-4" />}
                      {role === "TRAINER" && <Dumbbell className="h-4 w-4" />}
                      {role === "ADMIN" && <Shield className="h-4 w-4" />}
                      {role}
                      {isCurrent && <span className="text-[10px] bg-primary-foreground/20 text-primary-foreground px-1.5 py-0.5 rounded ml-1 font-semibold">Active</span>}
                    </button>
                  </form>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="mt-6 text-sm text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Role data is temporarily unavailable until you sign in again.
          </p>
        )}
      </div>

      {/* Admin Dispute Panel */}
      {me?.role === "ADMIN" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-amber-500" />
                Active Dispute Resolution Hub
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Review and resolve claims raised by clients for active training sessions.
              </p>
            </div>
            <span className="inline-flex items-center rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-600">
              {disputedBookings.length} {disputedBookings.length === 1 ? "Dispute" : "Disputes"} Pending
            </span>
          </div>

          {disputedBookings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
                <Check className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">All clear!</h3>
              <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
                No active disputed bookings found in the system. Sit back and relax!
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {disputedBookings.map((booking) => {
                const formattedPrice = booking.paymentType === "FIAT" && booking.servicePriceIdr
                  ? formatIDR(booking.servicePriceIdr)
                  : booking.paymentType === "CRYPTO" && booking.service?.priceInIdr // fallback to service if needed
                  ? formatUSDC(booking.service.priceInIdr / 15000) // simple estimate if needed
                  : "N/A";

                return (
                  <div
                    key={booking.id}
                    className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4 mb-4 gap-4">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                            Booking #{booking.id}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                            Disputed
                          </span>
                          <span className="inline-flex items-center rounded-full bg-muted border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                            {booking.paymentType}
                          </span>
                        </div>
                        <h4 className="font-semibold text-foreground text-lg mt-1">
                          {booking.service?.title || "Workout Session"}
                        </h4>
                      </div>
                      <div className="text-left sm:text-right shrink-0">
                        <span className="text-sm text-muted-foreground block">Session Value</span>
                        <span className="text-lg font-extrabold text-foreground">{formattedPrice}</span>
                      </div>
                    </div>

                    {/* Details (Client, Trainer, Timing) */}
                    <div className="grid md:grid-cols-3 gap-6 text-sm">
                      {/* Client */}
                      <div className="space-y-2 rounded-xl bg-muted/30 p-4 border border-border/50">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                          <UserIcon className="h-3.5 w-3.5" />
                          Client Details
                        </span>
                        <div>
                          <p className="font-semibold text-foreground">{booking.client?.name || "Unknown Client"}</p>
                          <p className="text-xs text-muted-foreground">{booking.client?.email || "No Email"}</p>
                        </div>
                      </div>

                      {/* Trainer */}
                      <div className="space-y-2 rounded-xl bg-muted/30 p-4 border border-border/50">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                          <Dumbbell className="h-3.5 w-3.5" />
                          Trainer Details
                        </span>
                        <div>
                          <p className="font-semibold text-foreground">{booking.trainer?.user?.name || "Unknown Trainer"}</p>
                          <p className="text-xs text-muted-foreground">{booking.trainer?.user?.email || "No Email"}</p>
                        </div>
                      </div>

                      {/* Timeline */}
                      <div className="space-y-2 rounded-xl bg-muted/30 p-4 border border-border/50">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          Schedule Info
                        </span>
                        <div>
                          <p className="text-foreground font-medium">
                            {booking.scheduledStart ? formatDateTime(booking.scheduledStart) : "Not scheduled"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Timezone: {booking.timezone || "UTC"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Dispute Reason Banner */}
                    <div className="mt-4 rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 flex gap-3 items-start">
                      <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">Client Dispute Claim</span>
                        <p className="text-sm text-amber-900 dark:text-amber-200 italic font-medium leading-relaxed">
                          &ldquo;{booking.disputeReason || "No explanation provided."}&rdquo;
                        </p>
                      </div>
                    </div>

                    {/* Resolution Actions */}
                    <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 border-t border-border pt-4">
                      <span className="text-xs text-muted-foreground mr-auto">
                        Opened on {formatDateTime(booking.createdAt)}
                      </span>

                      {/* Action 1: Cancel Booking */}
                      <form action={updateBookingStatusAction}>
                        <input type="hidden" name="bookingId" value={booking.id} />
                        <input type="hidden" name="status" value="CANCELLED" />
                        <input type="hidden" name="redirectTo" value="/dev/change-role" />
                        <button
                          type="submit"
                          className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-destructive/10 hover:bg-destructive hover:text-destructive-foreground border border-destructive/20 hover:border-destructive text-destructive px-4 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-[0.98]"
                        >
                          <X className="h-4 w-4" />
                          Cancel & Refund Client
                        </button>
                      </form>

                      {/* Action 2: Complete Booking */}
                      <form action={updateBookingStatusAction}>
                        <input type="hidden" name="bookingId" value={booking.id} />
                        <input type="hidden" name="status" value="COMPLETED" />
                        <input type="hidden" name="redirectTo" value="/dev/change-role" />
                        <button
                          type="submit"
                          className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-600 hover:text-white border border-emerald-500/20 hover:border-emerald-600 text-emerald-600 px-4 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-[0.98]"
                        >
                          <Check className="h-4 w-4" />
                          Release Funds to Trainer
                        </button>
                      </form>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
