import { print } from "graphql";
import Link from "next/link";
import { authFetchGraphql, isAuthenticationGraphqlError } from "@/lib/fetchGraphQL";
import {
  GET_MY_CLIENT_BOOKINGS_QUERY,
  MY_CANCELLATION_REQUESTS_QUERY,
  MY_RESCHEDULE_REQUESTS_QUERY,
} from "@/lib/gqlQueries";
import {
  requestCancellationAction,
  resolveCancellationAction,
} from "@/lib/actions/marketplace";
import { formatDateTime } from "@/lib/format";
import { CircleSlash, ArrowLeft, Check, X, Clock, AlertTriangle, CalendarClock } from "lucide-react";

type Booking = {
  id: number;
  status: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  timezone?: string;
  service?: { id: number; title: string };
  trainer?: { id: number; user: { id: number; name: string; avatar?: string } };
  paymentType?: string;
  createdAt: string;
};

type CancellationRequest = {
  id: number;
  bookingId: number;
  proposedById: number;
  reason?: string;
  status: string;
  createdAt: string;
};

type ClientBookingsResponse = { myClientBookings: Booking[] };
type CancellationRequestsResponse = { myCancellationRequests: CancellationRequest[] };

export default async function CancelPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = searchParams ? await searchParams : {};
  const statusMsg = params?.cancellation as string | undefined;

  let bookings: Booking[] = [];
  let cancellationRequests: CancellationRequest[] = [];
  let rescheduleRequests: any[] = [];
  const cancellationsByBooking = new Map<number, CancellationRequest>();
  const reschedulesByBooking = new Map<number, any>();

  try {
    const [bookingsData, cancellationsData, reschedulesData] = await Promise.all([
      authFetchGraphql<ClientBookingsResponse>(print(GET_MY_CLIENT_BOOKINGS_QUERY)),
      authFetchGraphql<CancellationRequestsResponse>(print(MY_CANCELLATION_REQUESTS_QUERY)),
      authFetchGraphql<{ myRescheduleRequests: any[] }>(print(MY_RESCHEDULE_REQUESTS_QUERY)),
    ]);
    
    cancellationRequests = cancellationsData.myCancellationRequests ?? [];
    rescheduleRequests = reschedulesData.myRescheduleRequests ?? [];
    
    // Map pending cancellation requests by bookingId
    for (const r of cancellationRequests) {
      if (!cancellationsByBooking.has(r.bookingId)) cancellationsByBooking.set(r.bookingId, r);
    }

    // Map pending reschedule requests by bookingId
    for (const r of rescheduleRequests) {
      if (!reschedulesByBooking.has(r.bookingId)) reschedulesByBooking.set(r.bookingId, r);
    }

    bookings = (bookingsData.myClientBookings ?? []).filter((b) => 
      b.status === "ACTIVE" || b.status === "PENDING" || cancellationsByBooking.has(b.id) || reschedulesByBooking.has(b.id)
    );
  } catch (error) {
    if (!isAuthenticationGraphqlError(error)) throw error;
  }

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/client"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <CircleSlash className="h-8 w-8 text-destructive" />
          Cancel Sessions
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Cancel your active sessions. Refunds will be processed immediately.
        </p>
      </div>

      {/* Status Banner */}
      {statusMsg === "requested" && (
        <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
          <Check className="h-4 w-4 shrink-0" />
          Cancellation processed! Refunds will be issued shortly.
        </div>
      )}
      {statusMsg === "resolved" && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
          <Check className="h-4 w-4 shrink-0" />
          Cancellation request resolved successfully.
        </div>
      )}

      {/* Booking Cards */}
      {bookings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <CircleSlash className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">No active bookings to cancel.</p>
          <Link href="/client/trainers" className="mt-4 inline-block text-sm text-primary hover:underline">
            Browse trainers →
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {bookings.map((booking) => {
            const pendingCancellation = cancellationsByBooking.get(booking.id);
            const pendingReschedule = reschedulesByBooking.get(booking.id);
            const hasPendingRequest = !!(pendingCancellation || pendingReschedule);
            const isMyPendingCancellation = pendingCancellation?.proposedById !== undefined;

            return (
              <div
                key={booking.id}
                className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4"
              >
                {/* Booking Header */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Booking #{booking.id}
                    </span>
                    <h3 className="text-lg font-semibold text-foreground">
                      {booking.service?.title ?? "Session"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Trainer: {booking.trainer?.user?.name ?? "Unknown"}
                    </p>
                  </div>
                  {booking.status === "CANCELLED" ? (
                    <span className="inline-flex items-center rounded-full bg-red-500/10 border border-red-500/20 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                      Cancelled
                    </span>
                  ) : hasPendingRequest ? (
                    <span className="inline-flex items-center rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                      Pending Request
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                      Active
                    </span>
                  )}
                </div>

                {/* Current Schedule */}
                <div className="rounded-xl bg-muted/40 border border-border/50 p-4 flex items-start gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      Current Schedule
                    </p>
                    {booking.scheduledStart ? (
                      <p className="text-sm text-foreground font-medium">
                        {formatDateTime(booking.scheduledStart)}
                        {booking.scheduledEnd ? ` → ${formatDateTime(booking.scheduledEnd)}` : ""}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No schedule set yet.</p>
                    )}
                    {booking.timezone && (
                      <p className="text-xs text-muted-foreground mt-0.5">{booking.timezone}</p>
                    )}
                  </div>
                </div>

                {/* Pending Reschedule Request Alert */}
                {pendingReschedule && (
                  <div className="rounded-xl border border-amber-500/25 bg-amber-500/8 p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <CalendarClock className="h-4 w-4 text-amber-600" />
                      <span className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                        Reschedule Proposal Pending
                      </span>
                    </div>
                    <div className="text-sm text-foreground">
                      <span className="text-muted-foreground">Proposed new time: </span>
                      <span className="font-semibold">
                        {formatDateTime(pendingReschedule.proposedStart)}
                        {" → "}
                        {formatDateTime(pendingReschedule.proposedEnd)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground italic">
                      A reschedule request is active. You can manage this from the Reschedule page.
                    </p>
                  </div>
                )}

                {/* Pending Cancellation Request Alert */}
                {pendingCancellation && (
                  <div className="rounded-xl border border-amber-500/25 bg-amber-500/8 p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <span className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                        Cancellation Request Sent
                      </span>
                    </div>
                    {pendingCancellation.reason && (
                      <div className="text-sm text-foreground">
                        <span className="text-muted-foreground">Reason: </span>
                        <span className="italic">"{pendingCancellation.reason}"</span>
                      </div>
                    )}

                    {isMyPendingCancellation ? (
                      <p className="text-xs text-muted-foreground italic">
                        Your session has been cancelled. This notification is waiting for the trainer to acknowledge it.
                      </p>
                    ) : (
                      <div className="flex gap-3 pt-1">
                        <form action={resolveCancellationAction}>
                          <input type="hidden" name="requestId" value={pendingCancellation.id} />
                          <input type="hidden" name="action" value="ACCEPT" />
                          <input type="hidden" name="redirectTo" value="/client/bookings/cancel" />
                          <button
                            type="submit"
                            className="inline-flex items-center gap-2 rounded-xl bg-destructive/10 hover:bg-destructive hover:text-white border border-destructive/30 text-destructive px-4 py-2 text-sm font-semibold transition-all duration-200 active:scale-[0.98]"
                          >
                            <Check className="h-4 w-4" />
                            Agree to Cancel
                          </button>
                        </form>
                        <form action={resolveCancellationAction}>
                          <input type="hidden" name="requestId" value={pendingCancellation.id} />
                          <input type="hidden" name="action" value="REJECT" />
                          <input type="hidden" name="redirectTo" value="/client/bookings/cancel" />
                          <button
                            type="submit"
                            className="inline-flex items-center gap-2 rounded-xl bg-muted hover:bg-foreground hover:text-background border border-border text-muted-foreground px-4 py-2 text-sm font-semibold transition-all duration-200 active:scale-[0.98]"
                          >
                            <X className="h-4 w-4" />
                            Keep Booking
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                )}

                {/* Propose Form — only when no pending cancellation request exists */}
                {!pendingCancellation && (
                  <details className="group">
                    <summary className="cursor-pointer list-none">
                      <div className="inline-flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 hover:bg-destructive/10 px-4 py-2.5 text-sm font-semibold text-destructive transition-all duration-200 select-none">
                        <CircleSlash className="h-4 w-4" />
                        Request Cancellation
                      </div>
                    </summary>
                    <form action={requestCancellationAction} className="mt-4 space-y-4 rounded-xl border border-border bg-muted/30 p-5">
                      <input type="hidden" name="bookingId" value={booking.id} />
                      <input type="hidden" name="redirectTo" value="/client/bookings/cancel" />

                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                          Reason for Cancellation
                        </label>
                        <textarea
                          name="reason"
                          placeholder="Optional reason for cancellation..."
                          rows={3}
                          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-destructive/40"
                        />
                      </div>

                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 rounded-xl bg-destructive px-5 py-2.5 text-sm font-semibold text-destructive-foreground hover:bg-destructive/90 transition-all duration-200 active:scale-[0.98]"
                      >
                        <CircleSlash className="h-4 w-4" />
                        Cancel Session
                      </button>
                    </form>
                  </details>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
