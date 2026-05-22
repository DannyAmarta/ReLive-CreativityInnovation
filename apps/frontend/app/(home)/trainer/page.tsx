import { SessionWarning } from "@/components/auth/SessionWarning";
import { HeroSessionBanner } from "@/components/trainer/HeroSessionBanner";
import { TodayScheduleCard } from "@/components/trainer/TodayScheduleCard";
import { BalanceWidget } from "@/components/trainer/BalanceWidget";
import { PendingRequestsCard } from "@/components/trainer/PendingRequestsCard";
import { ActiveServicesStrip } from "@/components/trainer/ActiveServicesStrip";
import { SetCalculatorWidget } from "@/components/trainer/SetCalculatorWidget";
import { PageHeader } from "@/components/trainer/PageHeader";
import { ScheduleAdjustmentsCard } from "@/components/trainer/ScheduleAdjustmentsCard";
import { authFetchGraphql, isAuthenticationGraphqlError } from "@/lib/fetchGraphQL";
import { MY_RESCHEDULE_REQUESTS_QUERY, MY_CANCELLATION_REQUESTS_QUERY } from "@/lib/gqlQueries";
import { print } from "graphql";
import { Eye } from "lucide-react";
import Link from "next/link";
import {
  getMyFiatWallet,
  getMyTrainerBookings,
  getMyTrainerProfile,
} from "@/lib/marketplace";

type RescheduleRequest = {
  id: number;
  bookingId: number;
  proposedById: number;
  proposedStart: string;
  proposedEnd: string;
  originalStart?: string;
  originalEnd?: string;
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

export default async function TrainerDashboardPage() {
  const [
    bookingsResult,
    walletResult,
    profileResult,
    rescheduleResult,
    cancellationResult,
  ] = await Promise.allSettled([
    getMyTrainerBookings(),
    getMyFiatWallet(),
    getMyTrainerProfile(),
    authFetchGraphql<RescheduleRequestsResponse>(print(MY_RESCHEDULE_REQUESTS_QUERY)),
    authFetchGraphql<CancellationRequestsResponse>(print(MY_CANCELLATION_REQUESTS_QUERY)),
  ]);

  const bookings = bookingsResult.status === "fulfilled" ? bookingsResult.value : [];
  const wallet =
    walletResult.status === "fulfilled"
      ? walletResult.value
      : { id: 0, trainerId: 0, balanceIdr: 0, updatedAt: new Date(0).toISOString() };
  const profile = profileResult.status === "fulfilled" ? profileResult.value : null;

  const rescheduleRequests =
    rescheduleResult.status === "fulfilled" ? rescheduleResult.value.myRescheduleRequests ?? [] : [];
  const cancellationRequests =
    cancellationResult.status === "fulfilled" ? cancellationResult.value.myCancellationRequests ?? [] : [];

  const hasAuthWarning =
    (bookingsResult.status === "rejected" &&
      isAuthenticationGraphqlError(bookingsResult.reason)) ||
    (walletResult.status === "rejected" &&
      isAuthenticationGraphqlError(walletResult.reason));

  const trainerName = profile?.user?.name ?? null;
  const services = profile?.services ?? [];

  return (
    <div className="space-y-6">
      {hasAuthWarning && (
        <SessionWarning description="Your trainer dashboard is running in fallback mode because the backend asked for a fresh Google sign-in. You can still review the layout, but wallet and booking updates should wait until you sign in again." />
      )}

      <PageHeader
        title="Trainer Dashboard"
        description="Manage your schedule, availability, services, and wallet."
        action={
          <Link
            href="/trainer/preview"
            className="inline-flex items-center gap-2 rounded-full border border-[rgba(74,93,62,0.3)] bg-[rgba(74,93,62,0.06)] px-4 py-2 text-sm font-semibold text-[#4a5d3e] hover:bg-[rgba(74,93,62,0.12)] transition-colors"
          >
            <Eye className="size-4" /> Preview Public Profile
          </Link>
        }
      />

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.45fr_1fr] gap-6 items-start">
        {/* ── Left column ── */}
        <div className="flex flex-col gap-6">
          <HeroSessionBanner bookings={bookings} trainerName={trainerName} />
          <TodayScheduleCard bookings={bookings} />
          <ScheduleAdjustmentsCard
            bookings={bookings}
            rescheduleRequests={rescheduleRequests}
            cancellationRequests={cancellationRequests}
          />
        </div>

        {/* ── Right column ── */}
        <div className="flex flex-col gap-5">
          <BalanceWidget wallet={wallet} bookings={bookings} />
          <PendingRequestsCard bookings={bookings} />
          <ActiveServicesStrip services={services} />
          <SetCalculatorWidget />
        </div>
      </div>
    </div>
  );
}
