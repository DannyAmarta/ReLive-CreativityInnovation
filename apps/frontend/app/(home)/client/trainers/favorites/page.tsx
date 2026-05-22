import Link from "next/link";
import { Heart, MapPin, Star, ArrowLeft } from "lucide-react";
import { formatIDR } from "@/lib/format";
import { getMyFavoriteTrainers } from "@/lib/actions/favorites";
import { getTrainerLowestIdr } from "@/lib/marketplace";
import { FavoriteButton } from "@/components/client/FavoriteButton";

export default async function FavoriteTrainersPage() {
  const favorites = await getMyFavoriteTrainers();

  return (
    <div>
      <main className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
        {/* ── Header ── */}
        <div className="mb-8">
          <Link
            href="/client"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="size-4" />
            Back to Dashboard
          </Link>

          <div className="flex items-center gap-3 mt-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 border border-rose-100">
              <Heart className="h-5 w-5 fill-rose-400 text-rose-400" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight text-primary-deep">
                Favourite Trainers
              </h1>
              <p className="mt-0.5 text-sm text-[#67715f]">
                {favorites.length === 0
                  ? "You haven't saved any trainers yet."
                  : `${favorites.length} trainer${favorites.length === 1 ? "" : "s"} saved`}
              </p>
            </div>
          </div>
        </div>

        {/* ── Empty state ── */}
        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-rose-50 border border-rose-100">
              <Heart className="h-10 w-10 text-rose-200" />
            </div>
            <h2 className="text-xl font-semibold text-primary-deep mb-2">No favourites yet</h2>
            <p className="text-sm text-[#67715f] max-w-sm mb-6">
              Browse the trainer directory and click the ❤ button on any trainer card to save them here.
            </p>
            <Link
              href="/client/trainers"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 transition-colors"
            >
              Browse Trainers
            </Link>
          </div>
        ) : (
          /* ── Favourites grid ── */
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {favorites.map((fav) => {
              const trainer = fav.trainer;
              // Build a compatible record shape for getTrainerLowestIdr
              const lowestIdr = getTrainerLowestIdr({
                id: trainer.id,
                bio: trainer.bio,
                rating: trainer.rating,
                certifications: trainer.certifications,
                user: trainer.user,
                services: trainer.services.map((s) => ({
                  id: s.id,
                  title: s.title,
                  description: s.description,
                  priceInIdr: s.priceInIdr,
                  priceInLamports: s.priceInLamports ?? 0,
                  tokenMintAddress: "",
                  isActive: s.isActive,
                })),
              });
              const activeServices = trainer.services.filter((s) => s.isActive);

              return (
                <Link
                  key={fav.trainerProfileId}
                  href={`/client/trainers/${trainer.id}`}
                  className="group relative block overflow-hidden rounded-[1.7rem] border border-[rgba(88,120,74,0.14)] bg-[rgba(255,252,246,0.92)] shadow-card transition-all hover:-translate-y-1 hover:shadow-lift"
                >
                  {/* Heart button — starts as favorited */}
                  <div className="absolute right-3 top-3 z-10">
                    <FavoriteButton
                      trainerProfileId={trainer.id}
                      trainerName={trainer.user.name}
                      initialFavorited={true}
                      size="sm"
                    />
                  </div>

                  <div className="aspect-[4/5] overflow-hidden bg-[#edf2e6]">
                    {trainer.user.avatar ? (
                      <img
                        src={trainer.user.avatar}
                        alt={trainer.user.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-4xl font-bold text-primary-deep">
                        {trainer.user.name.slice(0, 1)}
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-display text-lg font-bold text-primary-deep">
                      {trainer.user.name}
                    </h3>
                    <p className="line-clamp-2 text-sm leading-6 text-[#67715f]">
                      {trainer.bio || trainer.user.bio || "No bio available."}
                    </p>
                    <div className="mt-3 flex items-center gap-3 text-xs text-[#67715f]">
                      <span className="inline-flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                        <span className="font-semibold text-primary-deep">
                          {trainer.rating.toFixed(1)}
                        </span>
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {activeServices.length} active services
                      </span>
                    </div>
                    <div className="mt-4 space-y-1">
                      {lowestIdr ? (
                        <p className="font-display text-base font-bold text-[#4a5d3e]">
                          {formatIDR(lowestIdr)}
                          <span className="text-xs font-normal text-[#67715f]"> / starting IDR</span>
                        </p>
                      ) : (
                        <p className="text-sm text-[#67715f]">Price on request</p>
                      )}
                    </div>
                    <span className="mt-4 inline-flex rounded-full border border-[rgba(74,93,62,0.2)] px-3 py-1 text-xs font-semibold text-[#4a5d3e] group-hover:bg-[#4a5d3e] group-hover:text-[#f8f6ef]">
                      View profile
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
