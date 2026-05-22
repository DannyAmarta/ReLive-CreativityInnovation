import { SessionWarning } from "@/components/auth/SessionWarning";
import { CheckCircle2, Send, X, ArrowLeft, CalendarClock, CircleSlash, Calendar, Clock, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/trainer/PageHeader";
import { StatusBadge } from "@/components/trainer/StatusBadge";
import {
  updateBookingStatusAction,
  proposeRescheduleAction,
  resolveRescheduleAction,
  requestCancellationAction,
  resolveCancellationAction,
} from "@/lib/actions/marketplace";
import { authFetchGraphql, isAuthenticationGraphqlError } from "@/lib/fetchGraphQL";
import { formatDateTime, formatIDR, formatUSDC } from "@/lib/format";
import { getMyTrainerBookings, lamportsToTokenUnits } from "@/lib/marketplace";
import Link from "next/link";
import React from "react";
import { print } from "graphql";
import { MY_RESCHEDULE_REQUESTS_QUERY, MY_CANCELLATION_REQUESTS_QUERY } from "@/lib/gqlQueries";

type RescheduleRequest = {
  id: number;
  bookingId: number;
  proposedById: number;
  originalStart?: string;
  originalEnd?: string;
  proposedStart: string;
  proposedEnd: string;
  timezone: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type CancellationRequest = {
  id: number;
  bookingId: number;
  proposedById: number;
  reason?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type RescheduleRequestsResponse = { myRescheduleRequests: RescheduleRequest[] };
type CancellationRequestsResponse = { myCancellationRequests: CancellationRequest[] };

export default async function TrainerBookingsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const bookingsResult = await Promise.allSettled([getMyTrainerBookings()]);
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
    // Soft error handled or ignored for demo purposes
  }

  const params = searchParams ? await searchParams : {};
  const showSessionWarning =
    params?.session === "expired" ||
    (bookingsResult[0].status === "rejected" &&
      isAuthenticationGraphqlError(bookingsResult[0].reason));

  const statusMsgReschedule = params?.reschedule as string | undefined;
  const statusMsgCancellation = params?.cancellation as string | undefined;

  return (
    <div className="space-y-6">
      <Link
        href="/trainer"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to Dashboard
      </Link>

      <PageHeader
        title="Bookings"
        description="Manage real trainer bookings from the seeded database. Actions below now follow the backend booking state machine."
      />

      {showSessionWarning && (
        <SessionWarning description="Trainer booking data could not be refreshed with the current Google session. You can still review the page, but sign in again before approving, cancelling, or completing anything." />
      )}

      {statusMsgReschedule === "proposed" && (
        <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-700 dark:text-blue-300">
          Reschedule proposal sent successfully!
        </div>
      )}
      {statusMsgReschedule === "resolved" && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
          Reschedule request resolved successfully.
        </div>
      )}
      {statusMsgCancellation === "requested" && (
        <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-700 dark:text-blue-300">
          Cancellation request sent successfully!
        </div>
      )}
      {statusMsgCancellation === "resolved" && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
          Cancellation request resolved successfully.
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="glass-card-elevated p-10 text-center text-sm text-muted-foreground">
          No bookings found for this trainer profile.
        </div>
      ) : (
        <div className="glass-card-elevated overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="px-5 py-3 font-medium">Client</th>
                <th className="px-5 py-3 font-medium">Service</th>
                <th className="px-5 py-3 font-medium">Created</th>
                <th className="px-5 py-3 font-medium">Schedule</th>
                <th className="px-5 py-3 font-medium">Payment</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {bookings.map((booking) => {
                const pendingReschedule = rescheduleRequests.find(
                  (r) => r.bookingId === booking.id && r.status === "PENDING"
                );
                const pendingCancellation = cancellationRequests.find(
                  (r) => r.bookingId === booking.id && r.status === "PENDING"
                );

                return (
                  <React.Fragment key={booking.id}>
                    <tr className="hover:bg-muted/30 transition-colors align-top">
                      <td className="px-5 py-4">
                        <p className="font-medium">{booking.client?.name ?? "Client"}</p>
                        <p className="text-[10px] text-muted-foreground">{booking.client?.email ?? "No email available"}</p>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">{booking.service?.title ?? "Service"}</td>
                      <td className="px-5 py-4 text-muted-foreground whitespace-nowrap">{formatDateTime(booking.createdAt)}</td>
                      <td className="px-5 py-4">
                        {booking.scheduledStart ? (
                          <div className="text-xs space-y-0.5">
                            <p className="font-medium text-foreground">{formatDateTime(booking.scheduledStart)}</p>
                            {booking.scheduledEnd && <p className="text-muted-foreground text-[10px]">to {formatDateTime(booking.scheduledEnd)}</p>}
                            {booking.timezone && <p className="text-[10px] text-muted-foreground">({booking.timezone})</p>}
                            {booking.meetingLink && (
                              <a
                                href={booking.meetingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline font-semibold block text-[10px] mt-1"
                              >
                                Join Meeting →
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Not scheduled</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={booking.paymentType ?? "PENDING"} />
                      </td>
                      <td className="px-5 py-4 font-mono tabular-nums">
                        {booking.paymentType === "FIAT"
                          ? formatIDR(booking.fiatAmount ?? booking.servicePriceIdr ?? 0)
                          : formatUSDC(lamportsToTokenUnits(booking.service?.priceInLamports))}
                      </td>
                      <td className="px-5 py-4">
                        <div className="space-y-2">
                          <StatusBadge status={booking.status} />
                          {booking.disputeReason && (
                            <p className="max-w-xs text-[11px] text-destructive">{booking.disputeReason}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                          {booking.status === "PENDING" && (
                            <>
                              <ActionForm bookingId={booking.id} status="ACTIVE" redirectTo="/trainer/bookings">
                                Approve
                              </ActionForm>
                              <ActionForm bookingId={booking.id} status="CANCELLED" redirectTo="/trainer/bookings" variant="destructive">
                                <X className="size-3 mr-1.5" /> Cancel
                              </ActionForm>
                            </>
                          )}
                          {booking.status === "ACTIVE" && (
                            <ActionForm bookingId={booking.id} status="COMPLETED" redirectTo="/trainer/bookings">
                              {booking.paymentType === "CRYPTO" ? (
                                <>
                                  <Send className="size-3 mr-1.5" /> Mark complete
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="size-3 mr-1.5" /> Complete
                                </>
                              )}
                            </ActionForm>
                          )}
                          {booking.status === "COMPLETED" && booking.paymentType === "CRYPTO" && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 px-3 py-1 text-[11px] text-primary">
                              Release step next
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Sub-row for Reschedule/Cancellation requests & Actions */}
                    {(pendingReschedule || pendingCancellation || booking.status === "ACTIVE" || booking.status === "DISPUTED") && (
                      <tr className="bg-muted/10 border-b border-border/50">
                        <td colSpan={8} className="px-5 py-3 text-xs">
                          <div className="space-y-3">
                            {/* Reschedule Request Status Alert */}
                            {pendingReschedule && (
                              <div className="rounded-xl border border-amber-500/25 bg-amber-500/8 p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
                                <div className="space-y-1">
                                  <p className="font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1.5 text-sm">
                                    <CalendarClock className="h-4 w-4 text-amber-600 shrink-0" /> Reschedule Proposal Pending
                                  </p>
                                  <p className="text-foreground text-xs leading-normal">
                                    Client wants to reschedule the <span className="font-bold text-amber-900 dark:text-amber-200">{booking.service?.title ?? "session"}</span> originally scheduled for <span className="font-bold text-primary">{booking.scheduledStart ? formatDateTime(booking.scheduledStart) : "Not scheduled"}</span>.
                                  </p>
                                  <div className="mt-2 p-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5 max-w-lg space-y-1">
                                    <p className="text-xs text-foreground/90 font-medium">
                                      Proposed New Time: <span className="font-semibold text-amber-800 dark:text-amber-300">{formatDateTime(pendingReschedule.proposedStart)}</span>
                                      {pendingReschedule.proposedEnd && <span> to <span className="font-semibold text-amber-800 dark:text-amber-300">{formatDateTime(pendingReschedule.proposedEnd)}</span></span>}
                                    </p>
                                    {pendingReschedule.timezone && (
                                      <p className="text-[10px] text-muted-foreground">Timezone: {pendingReschedule.timezone}</p>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-muted-foreground italic">
                                    {pendingReschedule.proposedById === booking.clientId
                                      ? "Proposed by Client. Please accept or decline."
                                      : "Waiting for Client to respond to your proposal."}
                                  </p>
                                </div>
                                {pendingReschedule.proposedById === booking.clientId && (
                                  <div className="flex gap-2">
                                    <form action={resolveRescheduleAction}>
                                      <input type="hidden" name="requestId" value={pendingReschedule.id} />
                                      <input type="hidden" name="action" value="ACCEPT" />
                                      <input type="hidden" name="redirectTo" value="/trainer/bookings" />
                                      <button
                                        type="submit"
                                        className="bg-emerald-600 text-white rounded-lg px-3 py-1 hover:bg-emerald-700 font-semibold"
                                      >
                                        Accept
                                      </button>
                                    </form>
                                    <form action={resolveRescheduleAction}>
                                      <input type="hidden" name="requestId" value={pendingReschedule.id} />
                                      <input type="hidden" name="action" value="REJECT" />
                                      <input type="hidden" name="redirectTo" value="/trainer/bookings" />
                                      <button
                                        type="submit"
                                        className="bg-muted border border-border text-foreground rounded-lg px-3 py-1 hover:bg-destructive hover:text-white font-semibold"
                                      >
                                        Decline
                                      </button>
                                    </form>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Cancellation Request Status Alert */}
                            {pendingCancellation && (
                              <div className="rounded-xl border border-destructive/25 bg-destructive/8 p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
                                <div className="space-y-1">
                                  <p className="font-semibold text-destructive flex items-center gap-1.5 text-sm">
                                    <CircleSlash className="h-4 w-4 text-red-500 shrink-0" /> Cancellation Request Pending
                                  </p>
                                  <p className="text-foreground text-xs leading-normal">
                                    Client requested mutual cancellation for the <span className="font-bold text-red-950 dark:text-red-200">{booking.service?.title ?? "session"}</span> scheduled for <span className="font-bold text-destructive">{booking.scheduledStart ? formatDateTime(booking.scheduledStart) : "Not scheduled"}</span>.
                                  </p>
                                  {pendingCancellation.reason && (
                                    <div className="mt-2 p-2.5 rounded-lg border border-destructive/10 bg-destructive/5 max-w-lg">
                                      <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 dark:text-red-400 block mb-1">
                                        Client Reason
                                      </span>
                                      <p className="italic text-foreground/95 font-medium">&ldquo;{pendingCancellation.reason}&rdquo;</p>
                                    </div>
                                  )}
                                  <p className="text-[10px] text-muted-foreground italic mt-1">
                                    {pendingCancellation.proposedById === booking.clientId
                                      ? "Proposed by Client. Agreeing to cancel will refund the client."
                                      : "Waiting for Client to respond to your cancellation request."}
                                  </p>
                                </div>
                                {pendingCancellation.proposedById === booking.clientId && (
                                  <div className="flex gap-2">
                                    <form action={resolveCancellationAction}>
                                      <input type="hidden" name="requestId" value={pendingCancellation.id} />
                                      <input type="hidden" name="action" value="ACCEPT" />
                                      <input type="hidden" name="redirectTo" value="/trainer/bookings" />
                                      <button
                                        type="submit"
                                        className="bg-destructive text-white rounded-lg px-3 py-1 hover:bg-destructive/90 font-semibold"
                                      >
                                        Agree to Cancel
                                      </button>
                                    </form>
                                    <form action={resolveCancellationAction}>
                                      <input type="hidden" name="requestId" value={pendingCancellation.id} />
                                      <input type="hidden" name="action" value="REJECT" />
                                      <input type="hidden" name="redirectTo" value="/trainer/bookings" />
                                      <button
                                        type="submit"
                                        className="bg-muted border border-border text-foreground rounded-lg px-3 py-1 hover:bg-foreground hover:text-background font-semibold"
                                      >
                                        Keep Booking
                                      </button>
                                    </form>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Active Dispute Status Alert */}
                            {booking.status === "DISPUTED" && (
                              <div className="rounded-xl border border-red-500/30 bg-red-500/8 p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
                                <div className="space-y-1">
                                  <p className="font-semibold text-red-700 dark:text-red-400 flex items-center gap-1.5 text-sm">
                                    <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 animate-pulse" /> Active Dispute Claim
                                  </p>
                                  <p className="text-foreground text-xs leading-normal">
                                    Client has raised a dispute for the <span className="font-bold text-red-950 dark:text-red-200">{booking.service?.title ?? "session"}</span> scheduled for <span className="font-bold text-red-700 dark:text-red-400">{booking.scheduledStart ? formatDateTime(booking.scheduledStart) : "Not scheduled"}</span>.
                                  </p>
                                  {booking.disputeReason && (
                                    <div className="mt-2 p-2.5 rounded-lg border border-red-500/10 bg-red-500/5 max-w-lg">
                                      <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 dark:text-red-400 block mb-1">
                                        Disputed Reason
                                      </span>
                                      <p className="italic text-foreground/95 font-medium">&ldquo;{booking.disputeReason}&rdquo;</p>
                                    </div>
                                  )}
                                  <p className="text-[10px] text-muted-foreground italic mt-2">
                                    The ReLive administrative team is actively reviewing this claim. No actions are required from your end at this time.
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Propose Action Buttons for ACTIVE bookings when no pending requests */}
                            {booking.status === "ACTIVE" && (
                              <div className="flex flex-wrap gap-4 pt-1">
                                {!pendingReschedule && (
                                  <details className="group">
                                    <summary className="cursor-pointer list-none select-none text-primary hover:underline font-semibold flex items-center gap-1">
                                      + Propose Reschedule
                                    </summary>
                                    <form action={proposeRescheduleAction} className="mt-2 p-3 border border-border rounded-xl bg-background/50 max-w-md space-y-3">
                                      <input type="hidden" name="bookingId" value={booking.id} />
                                      <input type="hidden" name="timezone" value={booking.timezone ?? "Asia/Jakarta"} />
                                      <input type="hidden" name="redirectTo" value="/trainer/bookings" />
                                      <div className="grid grid-cols-2 gap-2">
                                        <div>
                                          <label className="block text-[10px] font-semibold text-muted-foreground uppercase mb-1">New Start</label>
                                          <input type="datetime-local" name="proposedStart" required className="w-full text-xs rounded border border-border bg-background px-2 py-1" />
                                        </div>
                                        <div>
                                          <label className="block text-[10px] font-semibold text-muted-foreground uppercase mb-1">New End</label>
                                          <input type="datetime-local" name="proposedEnd" required className="w-full text-xs rounded border border-border bg-background px-2 py-1" />
                                        </div>
                                      </div>
                                      <button type="submit" className="bg-primary text-primary-foreground text-xs rounded px-3 py-1 hover:bg-primary/95 font-semibold">
                                        Send Proposal
                                      </button>
                                    </form>
                                  </details>
                                )}

                                {!pendingCancellation && (
                                  <details className="group">
                                    <summary className="cursor-pointer list-none select-none text-destructive hover:underline font-semibold flex items-center gap-1">
                                      + Request Cancellation
                                    </summary>
                                    <form action={requestCancellationAction} className="mt-2 p-3 border border-border rounded-xl bg-background/50 max-w-md space-y-3">
                                      <input type="hidden" name="bookingId" value={booking.id} />
                                      <input type="hidden" name="redirectTo" value="/trainer/bookings" />
                                      <div>
                                        <label className="block text-[10px] font-semibold text-muted-foreground uppercase mb-1">Reason</label>
                                        <textarea name="reason" rows={2} placeholder="Optional reason..." className="w-full text-xs rounded border border-border bg-background px-2 py-1" />
                                      </div>
                                      <button type="submit" className="bg-destructive text-destructive-foreground text-xs rounded px-3 py-1 hover:bg-destructive/95 font-semibold">
                                        Send Request
                                      </button>
                                    </form>
                                  </details>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ActionForm({
  bookingId,
  status,
  redirectTo,
  children,
  variant = "primary",
}: {
  bookingId: number;
  status: string;
  redirectTo: string;
  children: React.ReactNode;
  variant?: "primary" | "destructive";
}) {
  const className =
    variant === "destructive"
      ? "inline-flex h-8 items-center rounded-full border border-destructive/30 px-3 text-xs font-semibold text-destructive hover:bg-destructive/10"
      : "inline-flex h-8 items-center rounded-full bg-primary px-3 text-xs font-semibold text-primary-foreground hover:opacity-90";

  return (
    <form action={updateBookingStatusAction}>
      <input type="hidden" name="bookingId" value={bookingId} />
      <input type="hidden" name="status" value={status} />
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <button type="submit" className={className}>
        {children}
      </button>
    </form>
  );
}

