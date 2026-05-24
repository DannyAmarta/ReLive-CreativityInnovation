import { SessionWarning } from "@/components/auth/SessionWarning";
import { CheckCircle2, Star, ArrowLeft, MessageSquare, User, Award, Video, Dumbbell } from "lucide-react";
import { InlineBookingCard } from "@/components/client/InlineBookingCard";
import Link from "next/link";
import { getTrainerProfile } from "@/lib/marketplace";
import { notFound } from "next/navigation";
import type { ReviewRecord } from "@/lib/marketplace";
import { getTrainerAvailabilityRules } from "@/lib/actions/availability";
import { AvailabilityWidget } from "@/components/trainer/AvailabilityWidget";

function StarDisplay({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" | "lg" }) {
  const sizeClass = size === "lg" ? "h-5 w-5" : size === "md" ? "h-4.5 w-4.5" : "h-4 w-4";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`${sizeClass} ${
            s <= rating ? "fill-amber-400 text-amber-400" : "fill-transparent text-muted-foreground/15"
          }`}
        />
      ))}
    </div>
  );
}

function RatingSummaryBar({ reviews }: { reviews: ReviewRecord[] }) {
  const counts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));
  const total = reviews.length;

  return (
    <div className="space-y-1.5 flex-1">
      {counts.map(({ star, count }) => (
        <div key={star} className="flex items-center gap-3 text-xs">
          <span className="w-3 text-right text-muted-foreground font-semibold">{star}</span>
          <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />
          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-amber-400 transition-all"
              style={{ width: total > 0 ? `${(count / total) * 100}%` : "0%" }}
            />
          </div>
          <span className="w-5 text-right text-muted-foreground text-[10px] font-medium">{count}</span>
        </div>
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: ReviewRecord }) {
  const clientName = review.isAnonymous ? "Anonymous Client" : (review.client?.name ?? "Client");
  const clientAvatar = review.isAnonymous ? null : review.client?.avatar;
  const formattedDate = new Date(review.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="rounded-2xl border border-[#58784a]/12 bg-white/40 backdrop-blur-md p-5 shadow-sm transition-all hover:shadow-card hover:bg-white/60">
      <div className="flex items-start gap-3.5">
        {clientAvatar ? (
          <img
            src={clientAvatar}
            alt={clientName}
            className="h-10 w-10 rounded-xl object-cover shrink-0 border border-border/80"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted shrink-0 text-[#4a5d3e] font-semibold border border-border/80">
            <User className="h-5 w-5 text-[#4a5d3e]" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
            <p className="font-bold text-sm text-primary-deep">{clientName}</p>
            <span className="text-[10px] text-muted-foreground font-medium">{formattedDate}</span>
          </div>
          <div className="mt-1">
            <StarDisplay rating={review.rating} />
          </div>
          {review.comment && (
            <p className="mt-2.5 text-xs text-muted-foreground leading-relaxed italic">
              &ldquo;{review.comment}&rdquo;
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default async function TrainerProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ trainerId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { trainerId } = await params;
  const query = searchParams ? await searchParams : {};
  const numericTrainerId = Number(trainerId);

  if (!Number.isInteger(numericTrainerId)) {
    notFound();
  }

  const [trainer, availabilityRules] = await Promise.all([
    getTrainerProfile(numericTrainerId).catch(() => null),
    getTrainerAvailabilityRules(numericTrainerId).catch(() => []),
  ]);

  if (!trainer) {
    notFound();
  }

  const activeServices = trainer.services.filter((service) => service.isActive);
  const reviews = trainer.reviews ?? [];
  const totalReviews = reviews.length;

  return (
    <div className="min-h-screen bg-gradient-surface relive-grid">
      <main className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14 space-y-6">
        <Link
          href="/client/trainers"
          className="relive-outline-chip hover:bg-[#4a5d3e]/10 transition-all font-semibold text-xs active:scale-[0.98]"
        >
          <ArrowLeft className="size-4 text-[#4a5d3e]" /> Back to trainers
        </Link>

        {query?.session === "expired" && (
          <div className="mb-6 animate-in fade-in duration-300">
            <SessionWarning description="Your Google session needs a refresh before a booking can be created. Trainer details are still visible, but please sign in again before reserving this service." />
          </div>
        )}

        <div className="grid gap-8 md:grid-cols-[1.15fr_1fr] items-start">
          {/* Left Column: Trainer Sidebar Card & Reviews */}
          <div className="space-y-8">
            {/* Trainer Profile Card */}
            <div className="glass-card-elevated p-8 flex flex-col gap-6 transition-all duration-300">
              <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
                <div className="overflow-hidden rounded-3xl border-2 border-[#4a5d3e]/20 p-1 bg-white shrink-0 shadow-sm w-36 h-36">
                  {trainer.user.avatar ? (
                    <img
                      src={trainer.user.avatar}
                      alt={trainer.user.name}
                      className="rounded-2xl w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex w-full h-full items-center justify-center text-5xl font-bold text-[#4a5d3e] bg-[#4a5d3e]/5 rounded-2xl">
                      {trainer.user.name.slice(0, 1)}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <h1 className="font-display text-2xl font-bold text-primary-deep leading-tight">
                      {trainer.user.name}
                    </h1>
                    <p className="mt-2.5 text-sm text-muted-foreground leading-relaxed">
                      {trainer.bio || trainer.user.bio || "Certified trainer on the ReLive marketplace."}
                    </p>
                  </div>
                  
                  {/* Quick Info Badges */}
                  <div className="flex flex-wrap gap-2 pt-1 justify-center sm:justify-start">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-700 border border-amber-500/15">
                      <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                      {trainer.rating.toFixed(1)} ({totalReviews} {totalReviews === 1 ? "review" : "reviews"})
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#4a5d3e]/10 px-3 py-1 text-xs font-semibold text-[#4a5d3e] border border-[#4a5d3e]/15">
                      <Dumbbell className="h-3.5 w-3.5" />
                      {activeServices.length} {activeServices.length === 1 ? "Service" : "Services"}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-500/15">
                      <Video className="h-3.5 w-3.5" />
                      Remote / Online
                    </span>
                  </div>
                </div>
              </div>

              {/* Certifications List */}
              {trainer.certifications.length > 0 && (
                <div className="border-t border-border/60 pt-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-primary-soft flex items-center gap-1.5 mb-3.5">
                    <Award className="h-4 w-4 text-[#4a5d3e]" /> Certifications
                  </h3>
                  <ul className="grid gap-2.5 sm:grid-cols-2">
                    {trainer.certifications.map((certification) => (
                      <li key={certification} className="flex items-start gap-2.5 text-xs text-foreground/80 leading-snug">
                        <CheckCircle2 className="h-4 w-4 text-[#4a5d3e] shrink-0 mt-0.5" />
                        <span>{certification}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Weekly Availability Widget */}
            <AvailabilityWidget rules={availabilityRules} isEditable={false} />

            {/* Reviews & Feedback Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-[#4a5d3e]/10 text-[#4a5d3e]">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-primary-deep">
                    Reviews &amp; Feedback
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {totalReviews === 0
                      ? "No reviews yet. Be the first to review this trainer!"
                      : `${totalReviews} verified ${totalReviews === 1 ? "review" : "reviews"} from clients`}
                  </p>
                </div>
              </div>

              {totalReviews > 0 && (
                <div className="space-y-4">
                  {/* Rating summary card */}
                  <div className="glass-card-elevated p-6 flex flex-col sm:flex-row items-center gap-6">
                    <div className="text-center sm:border-r sm:border-border/60 sm:pr-8 shrink-0">
                      <p className="font-display text-4xl font-extrabold text-primary-deep leading-none">
                        {trainer.rating.toFixed(1)}
                      </p>
                      <div className="flex justify-center mt-2.5">
                        <StarDisplay rating={Math.round(trainer.rating)} size="md" />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1.5 font-semibold uppercase tracking-wider">
                        out of 5 rating
                      </p>
                    </div>
                    <RatingSummaryBar reviews={reviews} />
                  </div>

                  {/* Reviews list */}
                  <div className="space-y-3.5">
                    {reviews.map((review) => (
                      <ReviewCard key={review.id} review={review} />
                    ))}
                  </div>
                </div>
              )}

              {totalReviews === 0 && (
                <div className="rounded-3xl border border-dashed border-[#58784a]/20 bg-white/30 backdrop-blur-sm p-8 text-center space-y-2">
                  <Star className="h-8 w-8 text-muted-foreground/30 mx-auto" />
                  <p className="text-muted-foreground text-xs max-w-sm mx-auto leading-relaxed">
                    No reviews yet. Complete a workout session with this trainer to leave the first review!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Unified Sticky Booking Widget */}
          <div className="md:sticky md:top-6 h-fit">
            <InlineBookingCard
              services={activeServices}
              trainerId={trainer.id}
              trainerName={trainer.user.name}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

