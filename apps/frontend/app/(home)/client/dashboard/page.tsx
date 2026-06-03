import { SessionWarning } from "@/components/auth/SessionWarning";
import Link from "next/link";
import { ArrowLeft, Star, AlertTriangle, AlertCircle, XCircle, Info, Clock } from "lucide-react";
import { authFetchGraphql, isAuthenticationGraphqlError } from "@/lib/fetchGraphQL";
import { getMyClientBookings } from "@/lib/marketplace";
import { print } from "graphql";
import { MY_RESCHEDULE_REQUESTS_QUERY, MY_CANCELLATION_REQUESTS_QUERY, UPDATE_BOOKING_STATUS_MUTATION } from "@/lib/gqlQueries";
import { ClientCalendarView } from "@/components/client/ClientCalendarView";
import { ClientBookingTabs } from "@/components/client/ClientBookingTabs";
import type { RescheduleRequest, CancellationRequest } from "@/components/client/ClientBookingTabs";
import { PaymentVerification } from "@/components/client/PaymentVerification";

type RescheduleRequestsResponse = { myRescheduleRequests: RescheduleRequest[] };
type CancellationRequestsResponse = { myCancellationRequests: CancellationRequest[] };

export default async function ClientDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = searchParams ? await searchParams : {};
  const payment = typeof params?.payment === "string" ? params.payment : undefined;
  const bookingId = typeof params?.booking === "string" ? params.booking : undefined;
  const resultCode = typeof params?.resultCode === "string" ? params.resultCode : undefined;
  const sessionExpired = params?.session === "expired";

  const bookingsResult = await Promise.allSettled([getMyClientBookings()]);
  let bookings = bookingsResult[0].status === "fulfilled" ? bookingsResult[0].value : [];

  // Auto-cancel only if the failed fiat booking is still pending.
  // This keeps the dashboard idempotent when another path already cancelled it.
  if (payment === "fiat-pending" && bookingId && resultCode && resultCode !== "00") {
    const targetBookingId = parseInt(bookingId, 10);
    const targetBooking = bookings.find((booking) => booking.id === targetBookingId);

    if (targetBooking?.status === "PENDING") {
      try {
        await authFetchGraphql(print(UPDATE_BOOKING_STATUS_MUTATION), {
          input: { bookingId: targetBookingId, status: "CANCELLED" },
        });

        bookings = bookings.map((booking) =>
          booking.id === targetBookingId
            ? {
                ...booking,
                status: "CANCELLED",
              }
            : booking,
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (!message.includes("CANCELLED to CANCELLED")) {
          console.error("Failed to auto-cancel failed/cancelled payment booking:", error);
        }
      }
    }
  }

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

  const softAuthWarning =
    sessionExpired ||
    (bookingsResult[0].status === "rejected" &&
      isAuthenticationGraphqlError(bookingsResult[0].reason));

  return (
    <div>
      <main className="mx-auto max-w-5xl px-4 py-10 md:px-6 md:py-14">
        {/* <Link
          href="/client"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="size-4" /> Back to Dashboard
        </Link> */}

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

        {/* Auth warning */}
        {softAuthWarning && (
          <SessionWarning description="Your booking data could not be refreshed because the backend wants a new Google sign-in. The page is still available, but booking actions should wait until you sign in again." />
        )}

        {/* Payment result banners */}
        {payment === "crypto-pending" && bookingId && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/60 p-4 text-sm text-amber-900 flex items-start gap-3 shadow-sm backdrop-blur-sm dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-200">
            <Clock className="size-5 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <p className="font-semibold">Crypto booking #{bookingId} pending</p>
              <p className="mt-1 text-amber-800/90 dark:text-amber-300/90">
                Booking has been created. The on-chain escrow signing step is the next implementation pass.
              </p>
            </div>
          </div>
        )}
        {payment === "fiat-pending" && bookingId && (
          <>
            {resultCode === "00" ? (
              <PaymentVerification bookingId={parseInt(bookingId, 10)} />
            ) : resultCode === "01" ? (
              <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/60 p-4 text-sm text-amber-900 flex items-start gap-3 shadow-sm backdrop-blur-sm dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-200">
                <AlertTriangle className="size-5 shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-semibold">Booking #{bookingId} — Payment Cancelled</p>
                  <p className="mt-1 text-amber-800/90 dark:text-amber-300/90">
                    The payment session was cancelled. You can try booking again from the trainer profile.
                  </p>
                </div>
              </div>
            ) : resultCode ? (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50/60 p-4 text-sm text-red-900 flex items-start gap-3 shadow-sm backdrop-blur-sm dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-200">
                <XCircle className="size-5 shrink-0 text-red-600 mt-0.5" />
                <div>
                  <p className="font-semibold">Booking #{bookingId} — Payment Failed</p>
                  <p className="mt-1 text-red-800/90 dark:text-red-300/90">
                    The payment transaction was not successful (Result Code: {resultCode}). Please try again.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50/60 p-4 text-sm text-blue-900 flex items-start gap-3 shadow-sm backdrop-blur-sm dark:border-blue-900/30 dark:bg-blue-950/20 dark:text-blue-200">
                <Info className="size-5 shrink-0 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-semibold">Booking #{bookingId} — Payment Pending</p>
                  <p className="mt-1 text-blue-800/90 dark:text-blue-300/90">
                    Your booking was created but the Duitku payment session could not be started automatically.{" "}
                    <a href="/client/trainers" className="font-medium underline hover:text-blue-700">
                      Go back and click &quot;Book with IDR&quot;
                    </a>{" "}
                    again to retry the payment.
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── Active / History Booking Tabs ── */}
        <ClientBookingTabs
          bookings={bookings}
          rescheduleRequests={rescheduleRequests}
          cancellationRequests={cancellationRequests}
        />

        {/* ── Session Calendar (merged from /client/calendar) ── */}
        <div className="mt-12 border-t border-border pt-10">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-bold text-primary-deep">
                Session Calendar
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                View your upcoming schedule. Click any session to view details and join calls.
              </p>
            </div>
            <Link
              href="/client/trainers"
              className="inline-flex items-center gap-2 rounded-full border border-[rgba(74,93,62,0.3)] bg-[rgba(74,93,62,0.06)] px-4 py-2 text-sm font-semibold text-[#4a5d3e] hover:bg-[rgba(74,93,62,0.12)] transition-colors"
            >
              <Star className="size-4" /> Book a Trainer
            </Link>
          </div>
          <ClientCalendarView
            initialBookings={bookings}
            rescheduleRequests={rescheduleRequests}
            cancellationRequests={cancellationRequests}
          />
        </div>
      </main>
    </div>
  );
}
