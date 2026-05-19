"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { toggleFavoriteTrainerAction } from "@/lib/actions/favorites";
import { cn } from "@/lib/utils";

type FavoriteButtonProps = {
  trainerProfileId: number;
  trainerName: string;
  initialFavorited: boolean;
  /** visual size variant */
  size?: "sm" | "md";
};

export function FavoriteButton({
  trainerProfileId,
  trainerName,
  initialFavorited,
  size = "md",
}: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [isPending, startTransition] = useTransition();

  function handleToggle(e: React.MouseEvent) {
    // Don't bubble up to the parent Link
    e.preventDefault();
    e.stopPropagation();

    startTransition(async () => {
      const result = await toggleFavoriteTrainerAction(trainerProfileId);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      setIsFavorited(result.isFavorited);

      if (result.isFavorited) {
        toast.success(`Added ${trainerName} to favourites ❤️`);
      } else {
        toast.info(`Removed ${trainerName} from favourites`);
      }
    });
  }

  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  const btnSize = size === "sm" ? "size-7" : "size-9";

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      aria-label={isFavorited ? `Remove ${trainerName} from favourites` : `Add ${trainerName} to favourites`}
      className={cn(
        btnSize,
        "flex items-center justify-center rounded-full transition-all duration-200",
        "border bg-white/70 backdrop-blur-sm shadow-sm",
        isFavorited
          ? "border-rose-200 bg-rose-50 text-rose-500 hover:bg-rose-100"
          : "border-[#D1E2C4]/60 text-[#6B8E23]/60 hover:text-rose-400 hover:border-rose-200 hover:bg-rose-50",
        isPending && "opacity-50 cursor-wait",
      )}
    >
      <Heart
        className={cn(
          iconSize,
          "transition-all duration-200",
          isFavorited && "fill-rose-500",
        )}
      />
    </button>
  );
}
