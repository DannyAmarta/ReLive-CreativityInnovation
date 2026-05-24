import { SessionWarning } from "@/components/auth/SessionWarning";
import { isAuthenticationGraphqlError, authFetchGraphql } from "@/lib/fetchGraphQL";
import {
  getMyClientBookings,
  getTrainerProfiles,
  getMyClientFiatBookings,
  computeClientFiatMetrics,
} from "@/lib/marketplace";
import InteractiveOrganicTree from "@/components/client/InteractiveOrganicTree";
import { print } from "graphql";
import { MY_RESCHEDULE_REQUESTS_QUERY, MY_CANCELLATION_REQUESTS_QUERY } from "@/lib/gqlQueries";

import { getSession } from "@/lib/session.server";
import prisma from "@/lib/prisma";

export default async function ClientHomePage() {
  const session = await getSession();
  const token = session?.accessToken || "";
  const userId = session?.user?.id ? Number(session.user.id) : null;

  let unreadCount = 0;
  if (userId) {
    unreadCount = await prisma.chatMessage.count({
      where: {
        conversation: {
          OR: [
            { trainerUserId: userId },
            { clientUserId: userId }
          ]
        },
        senderId: { not: userId },
        isRead: false
      }
    });
  }

  const [trainersResult, bookingsResult, fiatBookingsResult, rescheduleResult, cancellationResult] = await Promise.allSettled([
    getTrainerProfiles(),
    getMyClientBookings(),
    getMyClientFiatBookings(),
    authFetchGraphql<{ myRescheduleRequests: any[] }>(print(MY_RESCHEDULE_REQUESTS_QUERY)),
    authFetchGraphql<{ myCancellationRequests: any[] }>(print(MY_CANCELLATION_REQUESTS_QUERY)),
  ]);

  const trainers = trainersResult.status === "fulfilled" ? trainersResult.value : [];
  const bookings = bookingsResult.status === "fulfilled" ? bookingsResult.value : [];
  const fiatBookings = fiatBookingsResult.status === "fulfilled" ? fiatBookingsResult.value : [];
  
  const reschedules = rescheduleResult.status === "fulfilled" ? rescheduleResult.value?.myRescheduleRequests ?? [] : [];
  const cancellations = cancellationResult.status === "fulfilled" ? cancellationResult.value?.myCancellationRequests ?? [] : [];

  const pendingRescheduleCount = reschedules.filter(r => r.status === "PENDING").length;
  const pendingCancellationCount = cancellations.filter(r => r.status === "PENDING").length;

  const showSessionWarning =
    bookingsResult.status === "rejected" && isAuthenticationGraphqlError(bookingsResult.reason);

  const servicesCount = trainers.reduce((total, trainer) => total + trainer.services.length, 0);
  const averageRating =
    trainers.length > 0
      ? trainers.reduce((total, trainer) => total + trainer.rating, 0) / trainers.length
      : 0;

  const { lifetimeSpent } = computeClientFiatMetrics(fiatBookings);
  const trainerAvatars = trainers.slice(0, 3).map((t) => t.user.avatar || null);

  return (
    <div>
      <main className="relive-grid">
        {showSessionWarning && (
          <div className="mx-auto mt-6 w-full max-w-[1380px] px-4 md:px-6">
            <SessionWarning description="Your Google session needs to be refreshed, so personal booking stats are temporarily falling back while trainer discovery stays available." />
          </div>
        )}

        <InteractiveOrganicTree
          trainersCount={trainers.length}
          servicesCount={servicesCount}
          averageRating={averageRating}
          bookingsCount={bookings.length}
          lifetimeSpent={lifetimeSpent}
          recentBookings={bookings}
          trainerAvatars={trainerAvatars}
          pendingRescheduleCount={pendingRescheduleCount}
          pendingCancellationCount={pendingCancellationCount}
        />

      </main>
    </div>
  );
}



