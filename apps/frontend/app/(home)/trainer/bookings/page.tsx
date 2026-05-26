import { SessionWarning } from "@/components/auth/SessionWarning";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/trainer/PageHeader";
import { TrainerBookingsTable } from "@/components/trainer/TrainerBookingsTable";
import { authFetchGraphql, isAuthenticationGraphqlError } from "@/lib/fetchGraphQL";
import { getMyTrainerBookings } from "@/lib/marketplace";
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
  const error = typeof params?.error === "string" ? params.error : undefined;
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

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive flex items-center gap-2 font-medium">
          <AlertTriangle className="size-4 shrink-0 text-destructive" />
          <span>{error}</span>
        </div>
      )}

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
        <TrainerBookingsTable
          bookings={bookings}
          rescheduleRequests={rescheduleRequests}
          cancellationRequests={cancellationRequests}
        />
      )}
    </div>
  );
}
