import { print } from "graphql";
import Link from "next/link";
import { authFetchGraphql, isAuthenticationGraphqlError } from "@/lib/fetchGraphQL";
import {
  GET_MY_CLIENT_BOOKINGS_QUERY,
  MY_RESCHEDULE_REQUESTS_QUERY,
  MY_CANCELLATION_REQUESTS_QUERY,
} from "@/lib/gqlQueries";
import {
  resolveRescheduleAction,
} from "@/lib/actions/marketplace";
import { formatDateTime } from "@/lib/format";
import { CalendarClock, ArrowLeft, Check, X, Clock, CalendarPlus, CircleSlash } from "lucide-react";
import { ClientRescheduleForm } from "@/components/client/ClientRescheduleForm";

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
};

type ClientBookingsResponse = { myClientBookings: Booking[] };
type RescheduleRequestsResponse = { myRescheduleRequests: RescheduleRequest[] };

export default async function ReschedulePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = searchParams ? await searchParams : {};
  const statusMsg = params?.reschedule as string | undefined;

  let bookings: Booking[] = [];
  let rescheduleRequests: RescheduleRequest[] = [];
  let cancellationRequests: any[] = [];

  try {
    const [bookingsData, reschedulesData, cancellationsData] = await Promise.all([
      authFetchGraphql<ClientBookingsResponse>(print(GET_MY_CLIENT_BOOKINGS_QUERY)),
      authFetchGraphql<RescheduleRequestsResponse>(print(MY_RESCHEDULE_REQUESTS_QUERY)),
      authFetchGraphql<{ myCancellationRequests: any[] }>(print(MY_CANCELLATION_REQUESTS_QUERY)),
    ]);
    bookings = (bookingsData.myClientBookings ?? []).filter((b) => b.status === "ACTIVE");
    rescheduleRequests = reschedulesData.myRescheduleRequests ?? [];
    cancellationRequests = cancellationsData.myCancellationRequests ?? [];
  } catch (error) {
    if (!isAuthenticationGraphqlError(error)) throw error;
  }

  // Map pending reschedule requests by bookingId
  const reschedulesByBooking = new Map<number, RescheduleRequest>();
  for (const r of rescheduleRequests) {
    if (!reschedulesByBooking.has(r.bookingId)) reschedulesByBooking.set(r.bookingId, r);
  }

  // Map pending cancellation requests by bookingId
  const cancellationsByBooking = new Map<number, any>();
  for (const r of cancellationRequests) {
    if (!cancellationsByBooking.has(r.bookingId)) cancellationsByBooking.set(r.bookingId, r);
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
          <CalendarClock className="h-8 w-8 text-primary" />
          Reschedule Sessions
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Propose new times for your active sessions. The trainer must accept before any change takes effect.
        </p>
      </div>

      {/* Status Banner */}
      {statusMsg === "proposed" && (
        <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
          <Check className="h-4 w-4 shrink-0" />
          Reschedule proposal sent! Waiting for the trainer to respond.
        </div>
      )}
      {statusMsg === "resolved" && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
          <Check className="h-4 w-4 shrink-0" />
          Reschedule request resolved successfully.
        </div>
      )}

      {/* Booking Cards */}
      {bookings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <CalendarClock className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">No active bookings to reschedule.</p>
          <Link href="/client/trainers" className="mt-4 inline-block text-sm text-primary hover:underline">
            Browse trainers →
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {bookings.map((booking) => {
            const pendingReschedule = reschedulesByBooking.get(booking.id);
            const pendingCancellation = cancellationsByBooking.get(booking.id);
            const hasPendingRequest = !!(pendingReschedule || pendingCancellation);
            const isMyPendingReschedule = pendingReschedule?.proposedById !== undefined;

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
                  {hasPendingRequest ? (
                    <span className="inline-flex items-center rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                      Pending
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

                {/* Pending Reschedule Proposal Alert */}
                {pendingReschedule && (
                  <div className="rounded-xl border border-amber-500/25 bg-amber-500/8 p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <CalendarPlus className="h-4 w-4 text-amber-600" />
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

                    {isMyPendingReschedule ? (
                      <p className="text-xs text-muted-foreground italic">
                        Waiting for the trainer to respond to your proposal.
                      </p>
                    ) : (
                      <div className="flex gap-3 pt-1">
                        <form action={resolveRescheduleAction}>
                          <input type="hidden" name="requestId" value={pendingReschedule.id} />
                          <input type="hidden" name="action" value="ACCEPT" />
                          <input type="hidden" name="redirectTo" value="/client/bookings/reschedule" />
                          <button
                            type="submit"
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-600 hover:text-white border border-emerald-500/30 text-emerald-700 px-4 py-2 text-sm font-semibold transition-all duration-200 active:scale-[0.98]"
                          >
                            <Check className="h-4 w-4" />
                            Accept New Time
                          </button>
                        </form>
                        <form action={resolveRescheduleAction}>
                          <input type="hidden" name="requestId" value={pendingReschedule.id} />
                          <input type="hidden" name="action" value="REJECT" />
                          <input type="hidden" name="redirectTo" value="/client/bookings/reschedule" />
                          <button
                            type="submit"
                            className="inline-flex items-center gap-2 rounded-xl bg-muted hover:bg-destructive hover:text-white border border-border text-muted-foreground px-4 py-2 text-sm font-semibold transition-all duration-200 active:scale-[0.98]"
                          >
                            <X className="h-4 w-4" />
                            Decline
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                )}

                {/* Pending Cancellation Request Alert */}
                {pendingCancellation && (
                  <div className="rounded-xl border border-amber-500/25 bg-amber-500/8 p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <CircleSlash className="h-4 w-4 text-amber-600" />
                      <span className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                        Cancellation Request Pending
                      </span>
                    </div>
                    {pendingCancellation.reason && (
                      <div className="text-sm text-foreground">
                        <span className="text-muted-foreground">Reason: </span>
                        <span className="italic">"{pendingCancellation.reason}"</span>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground italic">
                      A cancellation request is active. You can manage this from the Cancel page.
                    </p>
                  </div>
                )}

                {/* Propose Form — only when no pending reschedule request exists */}
                {!pendingReschedule && (
                  <details className="group">
                    <summary className="cursor-pointer list-none">
                      <div className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary transition-all duration-200 select-none">
                        <CalendarPlus className="h-4 w-4" />
                        Propose New Time
                      </div>
                    </summary>
                    <ClientRescheduleForm
                      bookingId={booking.id}
                      timezone={booking.timezone ?? "Asia/Jakarta"}
                      redirectTo="/client/bookings/reschedule"
                    />
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
