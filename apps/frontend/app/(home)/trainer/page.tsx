import { SessionWarning } from "@/components/auth/SessionWarning";
import { HeroSessionBanner } from "@/components/trainer/HeroSessionBanner";
import { TodayScheduleCard } from "@/components/trainer/TodayScheduleCard";
import { BalanceWidget } from "@/components/trainer/BalanceWidget";
import { ActiveServicesStrip } from "@/components/trainer/ActiveServicesStrip";
import { PageHeader } from "@/components/trainer/PageHeader";
import { HealthGuidebookWidget } from "@/components/trainer/HealthGuidebookWidget";
import { ScheduleAdjustmentsCard } from "@/components/trainer/ScheduleAdjustmentsCard";
import { PastSessionsDecisionCard } from "@/components/trainer/PastSessionsDecisionCard";
import { BookingsPreviewCard } from "@/components/trainer/BookingsPreviewCard";
import { DisputesCard } from "@/components/trainer/DisputesCard";
import { authFetchGraphql, isAuthenticationGraphqlError, isThrottledGraphqlError } from "@/lib/fetchGraphQL";
import { MY_RESCHEDULE_REQUESTS_QUERY, MY_CANCELLATION_REQUESTS_QUERY } from "@/lib/gqlQueries";
import { print } from "graphql";
import { Eye, AlertTriangle } from "lucide-react";
import Link from "next/link";
import {
  getMyFiatWallet,
  getMyTrainerBookings,
  getMyTrainerProfile,
} from "@/lib/marketplace";
import MessagesWidget from "@/components/trainer/MessagesWidget";
import { getTrainerAvailabilityRules } from "@/lib/actions/availability";

function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function minutesToLabel(minutes: number): string {
  const h = Math.floor(minutes / 60).toString().padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

function getHourlySlots(startTime: string, endTime: string): { start: string; end: string }[] {
  const startM = toMinutes(startTime);
  const endM = toMinutes(endTime);
  const slots: { start: string; end: string }[] = [];
  for (let t = startM; t + 60 <= endM; t += 60) {
    slots.push({
      start: minutesToLabel(t),
      end: minutesToLabel(t + 60),
    });
  }
  return slots;
}

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

export default async function TrainerDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = searchParams ? await searchParams : {};
  const error = typeof params?.error === "string" ? params.error : undefined;

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

  const isThrottled = [
    bookingsResult,
    walletResult,
    profileResult,
    rescheduleResult,
    cancellationResult,
  ].some((res) => res.status === "rejected" && isThrottledGraphqlError(res.reason));

  const hasAuthWarning =
    (bookingsResult.status === "rejected" &&
      isAuthenticationGraphqlError(bookingsResult.reason)) ||
    (walletResult.status === "rejected" &&
      isAuthenticationGraphqlError(walletResult.reason));

  const trainerName = profile?.user?.name ?? null;
  const services = profile?.services ?? [];

  const availabilityRules = profile ? await getTrainerAvailabilityRules(profile.id).catch(() => []) : [];
  
  // Check if there is at least one weekly available slot that is not blocked (green)
  let hasGreenSlots = false;
  if (profileResult.status === "fulfilled" && availabilityRules.length > 0) {
    for (let i = 0; i < 7; i++) {
      const mainRule = availabilityRules.find(r => r.dayOfWeek === i && !r.specificDate && r.isAvailable);
      if (mainRule) {
        const slots = getHourlySlots(mainRule.startTime, mainRule.endTime);
        const blockedRules = availabilityRules.filter(r => r.dayOfWeek === i && !r.specificDate && !r.isAvailable);
        
        const hasUnblockedSlot = slots.some(slot => {
          const slotStart = toMinutes(slot.start);
          const slotEnd = toMinutes(slot.end);
          return !blockedRules.some(br => {
            const brStart = toMinutes(br.startTime);
            const brEnd = toMinutes(br.endTime);
            return slotStart >= brStart && slotEnd <= brEnd;
          });
        });
        
        if (hasUnblockedSlot) {
          hasGreenSlots = true;
          break;
        }
      }
    }
  }

  const hasNoAvailability = profileResult.status === "fulfilled" && !hasGreenSlots;
  const hasNoActiveServices = profileResult.status === "fulfilled" && (services.filter(s => s.isActive).length === 0);

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive font-medium">
          <AlertTriangle className="size-4.5 text-destructive shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {hasAuthWarning && (
        <SessionWarning description="Your trainer dashboard is running in fallback mode because the backend asked for a fresh Google sign-in. You can still review the layout, but wallet and booking updates should wait until you sign in again." />
      )}

      {isThrottled && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-300/40 bg-amber-50/50 dark:bg-amber-900/20 px-4 py-3 text-sm text-amber-700 dark:text-amber-400 animate-in fade-in duration-300">
          <AlertTriangle className="size-4.5 text-amber-600 shrink-0 mt-0.5" />
          <p>
            <strong>Connection Rate Limited:</strong> The server is experiencing high traffic and request rate limits have been temporarily exceeded. Please try refreshing the page in a moment.
          </p>
        </div>
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

      {hasNoAvailability && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-300/40 bg-amber-50/50 dark:bg-amber-900/20 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
          <AlertTriangle className="size-4.5 text-amber-600 shrink-0 mt-0.5" />
          <p>
            <strong>No availability set:</strong> You haven&apos;t configured your weekly
            availability yet. Clients will not be able to book sessions with you until you set your
            working hours.{" "}
            <Link
              href="/trainer/availability"
              className="font-semibold underline hover:text-amber-900 dark:hover:text-amber-200 transition-colors"
            >
              Set Working Hours
            </Link>
          </p>
        </div>
      )}

      {hasNoActiveServices && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-300/40 bg-amber-50/50 dark:bg-amber-900/20 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
          <AlertTriangle className="size-4.5 text-amber-600 shrink-0 mt-0.5" />
          <p>
            <strong>No active services:</strong> You haven&apos;t configured any active services yet.
            Clients will not be able to book sessions with you until you set up your services.{" "}
            <Link
              href="/trainer/services"
              className="font-semibold underline hover:text-amber-900 dark:hover:text-amber-200 transition-colors"
            >
              Manage Services
            </Link>
          </p>
        </div>
      )}

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.45fr_1fr] gap-6 items-start">
        {/* ── Left column ── */}
        <div className="flex flex-col gap-6">
          <HeroSessionBanner bookings={bookings} trainerName={trainerName} />
          <PastSessionsDecisionCard bookings={bookings} />
          <TodayScheduleCard bookings={bookings} />
          <ScheduleAdjustmentsCard
            bookings={bookings}
            rescheduleRequests={rescheduleRequests}
            cancellationRequests={cancellationRequests}
          />
          <DisputesCard bookings={bookings} />
          <HealthGuidebookWidget />
        </div>

        {/* ── Right column ── */}
        <div className="flex flex-col gap-5">
          <BalanceWidget wallet={wallet} bookings={bookings} />
          <MessagesWidget />
          <BookingsPreviewCard bookings={bookings} />
          <ActiveServicesStrip services={services} />
        </div>
      </div>
    </div>
  );
}
