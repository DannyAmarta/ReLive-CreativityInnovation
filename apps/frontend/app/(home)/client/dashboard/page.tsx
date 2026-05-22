import { SessionWarning } from "@/components/auth/SessionWarning";
import Link from "next/link";
import { Calendar, ShieldAlert, ArrowLeft, Clock, CalendarClock, CircleSlash } from "lucide-react";
import { StatusBadge } from "@/components/relive/StatusBadge";
import { authFetchGraphql, isAuthenticationGraphqlError } from "@/lib/fetchGraphQL";
import { updateBookingStatusAction } from "@/lib/actions/marketplace";
import { formatDateTime, formatIDR, formatUSDC } from "@/lib/format";
import { getMyClientBookings, lamportsToTokenUnits } from "@/lib/marketplace";
import { print } from "graphql";
import { MY_RESCHEDULE_REQUESTS_QUERY, MY_CANCELLATION_REQUESTS_QUERY } from "@/lib/gqlQueries";

type RescheduleRequest = {
  id: number;
  bookingId: number;
  proposedById: number;
  proposedStart: string;
  proposedEnd: string;
  status: string;
};

type CancellationRequest = {
  id: number;
  bookingId: number;
  proposedById: number;
  reason?: string;
  status: string;
};

type RescheduleRequestsResponse = { myRescheduleRequests: RescheduleRequest[] };
type CancellationRequestsResponse = { myCancellationRequests: CancellationRequest[] };

export default async function ClientDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const bookingsResult = await Promise.allSettled([getMyClientBookings()]);
  const bookings = bookingsResult[0].status === "fulfilled" ? bookingsResult[0].value : [];
  
  let rescheduleRequests: RescheduleRequest[] = [];
  let cancellationRequests: CancellationRequest[] = [];
  try {
    const [rescheduleData, cancellationData] = await Promise.all([
      authFetchGraphql<RescheduleRequestsResponse>(print(MY_RESCHEDULE_REQUESTS_QUERY)),
      authFetchGraphql<CancellationRequestsResponse>(print(MY_CANCELLATION_REQUESTS_QUERY)),
    ]);
    rescheduleRequests = rescheduleData.myRescheduleRequests ?? [];
    cancellationRequests = cancellationData.myCancellationRequests ?? [];
  } catch (error) {
    // If it's auth failure, it will be handled or displayed via soft warning
  }

  const params = searchParams ? await searchParams : {};
  const payment = typeof params?.payment === "string" ? params.payment : undefined;
  const bookingId = typeof params?.booking === "string" ? params.booking : undefined;
  const resultCode = typeof params?.resultCode === "string" ? params.resultCode : undefined;
  const sessionExpired = params?.session === "expired";
  const softAuthWarning =
    sessionExpired ||
    (bookingsResult[0].status === "rejected" &&
      isAuthenticationGraphqlError(bookingsResult[0].reason));

  return (
    <div>
      <main className="mx-auto max-w-5xl px-4 py-10 md:px-6 md:py-14">
        <Link href="/client" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="size-4" /> Back to Dashboard
        </Link>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-primary-deep md:text-4xl">
              Your bookings
            </h1>
            <p className="mt-1 text-muted-foreground">
              Real booking records for the current account, aligned with the trainer dashboard.
            </p>
          </div>
          <Link
            href="/client/trainers"
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Find a trainer
          </Link>
        </div>

        {softAuthWarning && (
          <SessionWarning description="Your booking data could not be refreshed because the backend wants a new Google sign-in. The page is still available, but booking actions should wait until you sign in again." />
        )}

        {payment === "crypto-pending" && bookingId && (
          <div className="mb-6 rounded-2xl border border-warning/30 bg-warning/10 p-4 text-sm text-warning-foreground">
            Crypto booking #{bookingId} has been created. The on-chain escrow signing step is the next implementation pass.
          </div>
        )}
        {payment === "fiat-pending" && bookingId && (
          <>
            {resultCode === "00" ? (
              <div className="mb-6 rounded-2xl border border-success/20 bg-success/10 p-4 text-sm text-success">
                <p className="font-semibold">Booking #{bookingId} — Payment Successful!</p>
                <p className="mt-1 text-muted-foreground">
                  Your payment has been successfully processed and your booking is now active.
                </p>
              </div>
            ) : resultCode === "01" ? (
              <div className="mb-6 rounded-2xl border border-warning/20 bg-warning/10 p-4 text-sm text-warning">
                <p className="font-semibold">Booking #{bookingId} — Payment Cancelled</p>
                <p className="mt-1 text-muted-foreground">
                  The payment session was cancelled. You can try booking again from the trainer profile.
                </p>
              </div>
            ) : resultCode ? (
              <div className="mb-6 rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
                <p className="font-semibold">Booking #{bookingId} — Payment Failed</p>
                <p className="mt-1 text-muted-foreground">
                  The payment transaction was not successful (Result Code: {resultCode}). Please try again.
                </p>
              </div>
            ) : (
              <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/10 p-4 text-sm text-primary-deep">
                <p className="font-semibold">Booking #{bookingId} — Payment Pending</p>
                <p className="mt-1 text-muted-foreground">
                  Your booking was created but the Duitku payment session could not be started automatically.{" "}
                  <a href="/client/trainers" className="font-medium underline">
                    Go back and click "Book with IDR"
                  </a>{" "}
                  again to retry the payment.
                </p>
              </div>
            )}
          </>
        )}

        {bookings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <p className="font-medium text-primary-deep">No bookings yet.</p>
            <Link href="/client/trainers" className="mt-2 inline-block text-sm text-primary underline">
              Browse trainers
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const service = booking.service;
              const trainer = booking.trainer?.user;
              const isFiat = booking.paymentType === "FIAT";
              const displayAmount = isFiat
                ? formatIDR(booking.fiatAmount ?? booking.servicePriceIdr ?? 0)
                : formatUSDC(lamportsToTokenUnits(service?.priceInLamports));

              const pendingReschedule = rescheduleRequests.find(
                (r) => r.bookingId === booking.id && r.status === "PENDING"
              );
              const pendingCancellation = cancellationRequests.find(
                (r) => r.bookingId === booking.id && r.status === "PENDING"
              );

              return (
                <article
                  key={booking.id}
                  className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]"
                >
                  <div className="flex flex-wrap items-start gap-4">
                    {trainer?.avatar ? (
                      <img
                        src={trainer.avatar}
                        alt={trainer.name}
                        className="h-14 w-14 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-lg font-bold text-primary-deep">
                        {trainer?.name?.slice(0, 1) ?? "T"}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-base font-bold text-primary-deep">
                        {trainer?.name ?? "Trainer"}
                      </h3>
                      <p className="text-sm text-muted-foreground">{service?.title ?? "Service"}</p>
                      <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        Created {formatDateTime(booking.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex justify-end gap-2">
                        {booking.paymentType && <StatusBadge status={booking.paymentType} />}
                        <StatusBadge status={booking.status} />
                      </div>
                      <p className="mt-2 font-display text-base font-bold text-primary">{displayAmount}</p>
                    </div>
                  </div>

                  {/* Schedule Details */}
                  {booking.scheduledStart && (
                    <div className="mt-4 rounded-xl bg-muted/40 border border-border/50 p-4 flex items-start gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <p className="font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                          Session Schedule
                        </p>
                        <p className="text-sm font-medium text-foreground">
                          {formatDateTime(booking.scheduledStart)}
                          {booking.scheduledEnd ? ` → ${formatDateTime(booking.scheduledEnd)}` : ""}
                        </p>
                        {booking.timezone && (
                          <p className="text-muted-foreground mt-0.5">Timezone: {booking.timezone}</p>
                        )}
                        {booking.meetingLink && (
                          <a
                            href={booking.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex items-center gap-1 text-primary hover:underline font-semibold"
                          >
                            Join Meeting Link →
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Reschedule Request Status Alert */}
                  {pendingReschedule && (
                    <div className="mt-3 rounded-xl border border-amber-500/25 bg-amber-500/8 p-3 text-xs flex items-start gap-2">
                      <CalendarClock className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-amber-800 dark:text-amber-300">
                          Reschedule Proposal Pending
                        </p>
                        <p className="text-foreground mt-0.5 font-medium">
                          Proposed: {formatDateTime(pendingReschedule.proposedStart)}
                        </p>
                        <p className="text-muted-foreground mt-1 font-medium">
                          {pendingReschedule.proposedById === booking.clientId
                            ? "Waiting for the trainer to accept or decline."
                            : "The trainer proposed a new time. Go to Reschedule page to accept or decline."}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Cancellation Request Status Alert */}
                  {pendingCancellation && (
                    <div className="mt-3 rounded-xl border border-destructive/25 bg-destructive/8 p-3 text-xs flex items-start gap-2">
                      <CircleSlash className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-destructive px-0.5">
                          Cancellation Request Pending
                        </p>
                        {pendingCancellation.reason && (
                          <p className="italic text-muted-foreground mt-0.5">
                            Reason: "{pendingCancellation.reason}"
                          </p>
                        )}
                        <p className="text-muted-foreground mt-1 font-medium">
                          {pendingCancellation.proposedById === booking.clientId
                            ? "Waiting for the trainer to agree or reject."
                            : "The trainer requested mutual cancellation. Go to Cancel page to resolve."}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 grid gap-3 border-t border-border pt-4 md:grid-cols-[1fr_auto] md:items-center">
                    <div className="space-y-1 text-xs text-muted-foreground">
                      {booking.gatewayPaymentMethod && <p>Gateway: {booking.gatewayPaymentMethod}</p>}
                      {booking.txHash && <p>Tx Hash: {booking.txHash}</p>}
                      {booking.escrowAddress && <p>Escrow: {booking.escrowAddress}</p>}
                      {booking.disputeReason && <p>Dispute: {booking.disputeReason}</p>}
                    </div>
                    <div className="flex flex-wrap gap-2 md:justify-end">
                      {booking.status === "ACTIVE" && (
                        <>
                          <Link
                            href="/client/bookings/reschedule"
                            className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 px-4 py-2 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors"
                          >
                            Reschedule
                          </Link>
                          <Link
                            href="/client/bookings/cancel"
                            className="inline-flex items-center gap-1.5 rounded-full border border-destructive/30 px-4 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            Cancel Session
                          </Link>
                          <form action={updateBookingStatusAction}>
                            <input type="hidden" name="bookingId" value={booking.id} />
                            <input type="hidden" name="status" value="DISPUTED" />
                            <input
                              type="hidden"
                              name="disputeReason"
                              value="Raised from the client dashboard during seeded-data review."
                            />
                            <input type="hidden" name="redirectTo" value="/client/dashboard" />
                            <button
                              type="submit"
                              className="inline-flex items-center gap-1.5 rounded-full border border-destructive/30 px-4 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10"
                            >
                              <ShieldAlert className="h-3.5 w-3.5" />
                              Raise dispute
                            </button>
                          </form>
                        </>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

