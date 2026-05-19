import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import { formatIDR } from "@/lib/format";
import { getTrainerLowestIdr, lamportsToTokenUnits, type TrainerProfileRecord } from "@/lib/marketplace";
import { FavoriteButton } from "@/components/client/FavoriteButton";

interface TrainerCardProps {
  trainer: TrainerProfileRecord;
  isFavorite?: boolean;
  /** Whether the card is being viewed on the client side (enables routing & favoriting) */
  isClientView?: boolean;
}

export function TrainerCard({ trainer, isFavorite = false, isClientView = true }: TrainerCardProps) {
  const lowestIdr = getTrainerLowestIdr(trainer);
  const activeServices = trainer.services.filter((s) => s.isActive);

  const cardContent = (
    <>
      {isClientView && (
        <div className="absolute right-3 top-3 z-10">
          <FavoriteButton
            trainerProfileId={trainer.id}
            trainerName={trainer.user.name}
            initialFavorited={isFavorite}
            size="sm"
          />
        </div>
      )}

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
        <h3 className="font-display text-lg font-bold text-primary-deep">{trainer.user.name}</h3>
        <p className="line-clamp-2 text-sm leading-6 text-[#67715f]">
          {trainer.bio || trainer.user.bio || "Seeded trainer profile ready for frontend integration."}
        </p>
        <div className="mt-3 flex items-center gap-3 text-xs text-[#67715f]">
          <span className="inline-flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-warning text-warning" />
            <span className="font-semibold text-primary-deep">{trainer.rating.toFixed(1)}</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            Seeded profile
          </span>
        </div>
        <div className="mt-4 space-y-1">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Active services</p>
          <p className="text-sm font-medium text-primary-deep">{activeServices.length}</p>
          {lowestIdr ? (
            <p className="font-display text-base font-bold text-[#4a5d3e]">
              {formatIDR(lowestIdr)}
              <span className="text-xs font-normal text-[#67715f]"> / starting IDR</span>
            </p>
          ) : (
            <p className="text-sm text-[#67715f]">
              From {lamportsToTokenUnits(activeServices[0]?.priceInLamports)} token units
            </p>
          )}
        </div>
        
        {isClientView && (
          <span className="mt-4 inline-flex rounded-full border border-[rgba(74,93,62,0.2)] px-3 py-1 text-xs font-semibold text-[#4a5d3e] group-hover:bg-[#4a5d3e] group-hover:text-[#f8f6ef]">
            View profile
          </span>
        )}
      </div>
    </>
  );

  const className =
    "group relative block overflow-hidden rounded-[1.7rem] border border-[rgba(88,120,74,0.14)] bg-[rgba(255,252,246,0.92)] shadow-card transition-all hover:-translate-y-1 hover:shadow-lift";

  if (isClientView) {
    return (
      <Link href={`/client/trainers/${trainer.id}`} className={className}>
        {cardContent}
      </Link>
    );
  }

  // Preview mode (no link wrapper)
  return <div className={className}>{cardContent}</div>;
}
