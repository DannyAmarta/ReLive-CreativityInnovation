"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { ReviewModal } from "./ReviewModal";

interface ReviewButtonProps {
  bookingId: number;
  trainerName: string;
  serviceName: string;
}

export function ReviewButton({ bookingId, trainerName, serviceName }: ReviewButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 px-4 py-2 text-xs font-semibold text-amber-400 hover:bg-amber-400/20 transition-colors"
      >
        <Star className="h-3.5 w-3.5 fill-amber-400" />
        Leave a Review
      </button>

      {open && (
        <ReviewModal
          bookingId={bookingId}
          trainerName={trainerName}
          serviceName={serviceName}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
