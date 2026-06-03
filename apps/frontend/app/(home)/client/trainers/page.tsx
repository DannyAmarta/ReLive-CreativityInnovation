import { getTrainerProfiles } from "@/lib/marketplace";
import { getMyFavoriteTrainers } from "@/lib/actions/favorites";
import { TrainersPageClient } from "@/components/client/TrainersPageClient";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function TrainersPage() {
  const [trainers, favorites] = await Promise.all([
    getTrainerProfiles(),
    getMyFavoriteTrainers(),
  ]);

  const favoriteIds = favorites.map((f) => f.trainerProfileId);
  const favoriteTrainerNames = favorites.map((f) => ({
    id: f.trainerProfileId,
    name: f.trainer.user.name,
  }));

  return (
    <div>
      <main className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
        {/* <Link href="/client" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="size-4" /> Back to Dashboard
        </Link> */}
        <div className="mb-8 max-w-3xl">
          <h1 className="font-display text-3xl font-bold tracking-tight text-primary-deep md:text-4xl">
            Find your trainer
          </h1>
          <p className="mt-2 text-[#67715f]">
            Search by name, specialty, or set a maximum budget to find the right trainer for you.
          </p>
        </div>

        <TrainersPageClient
          trainers={trainers}
          favoriteIds={favoriteIds}
          favoriteTrainerNames={favoriteTrainerNames}
        />
      </main>
    </div>
  );
}
