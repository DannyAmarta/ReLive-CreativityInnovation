"use client";

import { useState, useRef, useEffect } from "react";
import { Star, X, Send, Eye, EyeOff } from "lucide-react";
import { createReviewAction } from "@/lib/actions/marketplace";

interface ReviewModalProps {
  bookingId: number;
  trainerName: string;
  serviceName: string;
  onClose: () => void;
}

export function ReviewModal({
  bookingId,
  trainerName,
  serviceName,
  onClose,
}: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Close on backdrop click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (e.target === backdropRef.current) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const starLabels = ["", "Poor", "Fair", "Good", "Great", "Excellent"];
  const displayRating = hoveredRating || rating;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData();
    formData.set("bookingId", String(bookingId));
    formData.set("rating", String(rating));
    formData.set("comment", comment);
    formData.set("isAnonymous", String(isAnonymous));
    formData.set("redirectTo", "/client/dashboard");

    try {
      await createReviewAction(formData);
    } catch {
      // redirect() throws a special error, which is expected behavior
    }
  }

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      }}
    >
      <div
        className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
        style={{
          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(250, 250, 250, 0.98) 100%)",
          border: "1px solid rgba(0, 0, 0, 0.08)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        {/* Ambient glow top-right */}
        <div
          className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full opacity-15"
          style={{
            background: "radial-gradient(circle, rgba(74, 93, 62, 0.15) 0%, transparent 70%)",
          }}
        />

        {/* Header */}
        <div className="relative px-6 pt-6 pb-5">
          <button
            onClick={onClose}
            className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-black/5"
            aria-label="Close"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#4a5d3e]">
            Leave a Review
          </p>
          <h2 className="mt-1 font-display text-xl font-bold text-foreground">
            {trainerName}
          </h2>
          <p className="text-sm text-muted-foreground">{serviceName}</p>
        </div>

        {/* Divider */}
        <div className="h-px bg-border mx-6" />

        {/* Form */}
        <form ref={formRef} onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Star Rating */}
          <div>
            <p className="mb-3 text-sm font-semibold text-foreground/80">
              How would you rate this session?
            </p>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="group relative transition-transform hover:scale-110 active:scale-95"
                  aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                >
                  <Star
                    className={`h-9 w-9 transition-all duration-150 ${
                      star <= displayRating
                        ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                        : "fill-transparent text-muted-foreground/30 group-hover:text-amber-300/50"
                    }`}
                  />
                </button>
              ))}
              {displayRating > 0 && (
                <span className="ml-2 text-sm font-semibold text-amber-500 transition-all">
                  {starLabels[displayRating]}
                </span>
              )}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label
              htmlFor="review-comment"
              className="mb-2 block text-sm font-semibold text-foreground/80"
            >
              Comment{" "}
              <span className="font-normal text-muted-foreground">(optional)</span>
            </label>
            <textarea
              id="review-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="Share your experience with this trainer…"
              className="w-full rounded-2xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:ring-2 focus:ring-[#4a5d3e]/50 transition-all"
              style={{
                background: "rgba(0, 0, 0, 0.02)",
                border: "1px solid rgba(0, 0, 0, 0.08)",
              }}
            />
          </div>

          {/* Anonymity toggle */}
          <div className="flex items-center justify-between rounded-2xl px-4 py-3" style={{ background: "rgba(0, 0, 0, 0.02)", border: "1px solid rgba(0, 0, 0, 0.05)" }}>
            <div className="flex items-center gap-3">
              {isAnonymous ? (
                <EyeOff className="h-4 w-4 text-[#4a5d3e]" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
              <div>
                <p className="text-sm font-semibold text-foreground/90">
                  {isAnonymous ? "Posting anonymously" : "Posting as yourself"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isAnonymous
                    ? "Your name will be hidden from this review"
                    : "Your name and avatar will be visible"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsAnonymous(!isAnonymous)}
              className={`relative h-6 w-11 rounded-full transition-colors duration-200 focus:outline-none ${
                isAnonymous ? "bg-[#4a5d3e]" : "bg-black/15"
              }`}
              aria-checked={isAnonymous}
              role="switch"
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  isAnonymous ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Error */}
          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600 border border-red-200">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-2xl border border-border px-4 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || rating === 0}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#4a5d3e] px-4 py-2.5 text-sm font-bold text-[#f8f6ef] shadow-[0_12px_24px_rgba(74,93,62,0.16)] transition-all hover:bg-[#3d4f32] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? "Submitting…" : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
