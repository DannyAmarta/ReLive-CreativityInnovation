"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  ShieldAlert,
  Clock,
  CalendarClock,
  CircleSlash,
  Star,
  CheckCircle2,
  ClockIcon,
  History,
  Zap,
  X,
  AlertTriangle,
  ExternalLink,
  UploadCloud,
} from "lucide-react";
import { StatusBadge } from "@/components/relive/StatusBadge";
import { updateBookingStatusAction } from "@/lib/actions/marketplace";
import { formatDateTime, formatIDR, formatUSDC } from "@/lib/format";
import { lamportsToTokenUnits } from "@/lib/marketplace";
import type { BookingRecord } from "@/lib/marketplace";
import { ReviewButton } from "@/components/relive/ReviewButton";
import { useCryptoEscrow } from "@/hooks/features/marketplace/useCryptoEscrow";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────
export type RescheduleRequest = {
  id: number;
  bookingId: number;
  proposedById: number;
  proposedStart: string;
  proposedEnd: string;
  status: string;
};

export type CancellationRequest = {
  id: number;
  bookingId: number;
  proposedById: number;
  reason?: string;
  status: string;
};

export interface DisputeDetail {
  whatHappened: string;
  cause: string;
  evidenceUrls: string[];
}

export interface DisputeData {
  initiator: "CLIENT" | "TRAINER" | "USER";
  clientDispute?: DisputeDetail | null;
  trainerDispute?: DisputeDetail | null;
}

export function parseDisputeReason(reason?: string | null): DisputeData | null {
  if (!reason) return null;
  try {
    const parsed = JSON.parse(reason);
    if (parsed && (parsed.clientDispute || parsed.trainerDispute || parsed.initiator)) {
      return {
        initiator: parsed.initiator,
        clientDispute: parsed.clientDispute || null,
        trainerDispute: parsed.trainerDispute || null,
      };
    }
  } catch (e) {
    // Treat legacy string as client dispute
  }
  return {
    initiator: "CLIENT",
    clientDispute: {
      whatHappened: reason,
      cause: "",
      evidenceUrls: [],
    },
    trainerDispute: null,
  };
}

export function isImageUrl(url: string): boolean {
  if (!url) return false;
  return /\.(jpeg|jpg|gif|png|webp)($|\?)/i.test(url) || url.startsWith("data:image/");
}

export function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const MAX_WIDTH = 1000;
        const MAX_HEIGHT = 1000;
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

interface ClientBookingTabsProps {
  bookings: BookingRecord[];
  rescheduleRequests: RescheduleRequest[];
  cancellationRequests: CancellationRequest[];
}

type Tab = "active" | "history";

// ─── Classification Logic ─────────────────────────────────────────────────────
const ACTIVE_STATUSES = new Set(["PENDING", "ACTIVE", "PENDING_RELEASE", "DISPUTED"]);
const HISTORY_STATUSES = new Set(["COMPLETED", "CANCELLED", "REJECTED"]);

function classifyBooking(
  booking: BookingRecord,
  rescheduleRequests: RescheduleRequest[],
  cancellationRequests: CancellationRequest[]
): "active" | "history" {
  // Always active if primary status is actionable
  if (ACTIVE_STATUSES.has(booking.status)) return "active";

  // If "history" status, check for pending sub-requests that override to active
  if (HISTORY_STATUSES.has(booking.status)) {
    const hasPendingReschedule = rescheduleRequests.some(
      (r) => r.bookingId === booking.id && r.status === "PENDING"
    );
    if (hasPendingReschedule) return "active";

    const hasPendingCancellation = cancellationRequests.some(
      (r) => r.bookingId === booking.id && r.status === "PENDING"
    );
    if (hasPendingCancellation) return "active";

    return "history";
  }

  // Unknown statuses default to active so they're visible
  return "active";
}

// ─── Tab Button ───────────────────────────────────────────────────────────────
function TabButton({
  active,
  onClick,
  children,
  count,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  count: number;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        relative inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-all duration-200
        ${
          active
            ? "text-primary-deep"
            : "text-muted-foreground hover:text-foreground"
        }
      `}
    >
      {icon}
      {children}
      {count > 0 && (
        <span
          className={`
            inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold transition-colors
            ${
              active
                ? "bg-[#4a5d3e] text-white"
                : "bg-muted text-muted-foreground"
            }
          `}
        >
          {count}
        </span>
      )}
      {/* Underline indicator */}
      {active && (
        <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#4a5d3e]" />
      )}
    </button>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ tab }: { tab: Tab }) {
  if (tab === "active") {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(74,93,62,0.08)]">
          <CheckCircle2 className="h-5 w-5 text-[#4a5d3e]" />
        </div>
        <p className="font-semibold text-primary-deep">No active bookings</p>
        <p className="mt-1 text-sm text-muted-foreground">
          You have no pending or active sessions right now.
        </p>
        <Link
          href="/client/trainers"
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#4a5d3e] px-5 py-2 text-xs font-semibold text-white hover:bg-[#3d4f32] transition-colors"
        >
          Browse Trainers
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <History className="h-5 w-5 text-muted-foreground" />
      </div>
      <p className="font-semibold text-primary-deep">No booking history yet</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Completed, cancelled, and rejected sessions will appear here.
      </p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function ClientBookingTabs({
  bookings,
  rescheduleRequests,
  cancellationRequests,
}: ClientBookingTabsProps) {
  const router = useRouter();
  const { execute: executeCrypto, isLoading: isCryptoLoading, error: cryptoError } = useCryptoEscrow();
  const [activeTab, setActiveTab] = useState<Tab>("active");
  const [disputeBooking, setDisputeBooking] = useState<BookingRecord | null>(null);
  const [disputeWhatHappened, setDisputeWhatHappened] = useState("");
  const [disputeCause, setDisputeCause] = useState("");
  const [evidenceUrlInput, setEvidenceUrlInput] = useState("");
  const [evidenceUrls, setEvidenceUrls] = useState<string[]>([]);
  const [isSubmittingDispute, setIsSubmittingDispute] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!disputeBooking) return;
    
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            try {
              const compressed = await compressImage(file);
              setEvidenceUrls((prev) => [...prev, compressed]);
            } catch (err) {
              console.error("Paste compression error:", err);
            }
          }
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [disputeBooking]);

  const openDisputeModal = (booking: BookingRecord) => {
    setDisputeBooking(booking);
    
    // Prefill with existing client claim if it already exists
    const parsed = parseDisputeReason(booking.disputeReason);
    if (parsed && parsed.clientDispute) {
      setDisputeWhatHappened(parsed.clientDispute.whatHappened || "");
      setDisputeCause(parsed.clientDispute.cause || "");
      setEvidenceUrls(parsed.clientDispute.evidenceUrls || []);
    } else {
      setDisputeWhatHappened("");
      setDisputeCause("");
      setEvidenceUrls([]);
    }
    
    setEvidenceUrlInput("");
    setIsSubmittingDispute(false);
  };

  // Split bookings into two classified lists
  const activeBookings = bookings.filter(
    (b) => classifyBooking(b, rescheduleRequests, cancellationRequests) === "active"
  );
  const historyBookings = bookings.filter(
    (b) => classifyBooking(b, rescheduleRequests, cancellationRequests) === "history"
  );

  const displayedBookings =
    activeTab === "active" ? activeBookings : historyBookings;

  return (
    <div>
      {/* ── Tab Header ── */}
      <div className="mb-6 flex items-center gap-1 border-b border-border">
        <TabButton
          active={activeTab === "active"}
          onClick={() => setActiveTab("active")}
          count={activeBookings.length}
          icon={<Zap className="h-3.5 w-3.5" />}
        >
          Active Bookings
        </TabButton>
        <TabButton
          active={activeTab === "history"}
          onClick={() => setActiveTab("history")}
          count={historyBookings.length}
          icon={<History className="h-3.5 w-3.5" />}
        >
          History
        </TabButton>
      </div>

      {/* ── Booking List ── */}
      {displayedBookings.length === 0 ? (
        <EmptyState tab={activeTab} />
      ) : (
        <div className="space-y-4">
          {displayedBookings.map((booking) => {
            const service = booking.service;
            const trainer = booking.trainer?.user;
            const isFiat = booking.paymentType === "FIAT";
            const displayAmount = isFiat
              ? formatIDR(booking.fiatAmount ?? booking.servicePriceIdr ?? 0)
              : formatUSDC(lamportsToTokenUnits(service?.priceInLamports));

            const pendingReschedule = rescheduleRequests.find(
              (r) => r.bookingId === booking.id && r.status === "PENDING"
            );
            const pendingCancellation = cancellationRequests.find(
              (r) => r.bookingId === booking.id && r.status === "PENDING"
            );

            const displayStatus = (pendingReschedule || pendingCancellation) ? "PENDING" : booking.status;

            const isHistory = activeTab === "history";

            return (
              <article
                key={booking.id}
                className={`rounded-2xl border bg-card p-5 shadow-[var(--shadow-card)] transition-opacity ${
                  isHistory
                    ? "border-border/60 opacity-80"
                    : "border-border"
                }`}
              >
                {/* ── Card Header ── */}
                <div className="flex flex-wrap items-start gap-4">
                  {trainer?.avatar ? (
                    <img
                      src={trainer.avatar}
                      alt={trainer.name}
                      className={`h-14 w-14 rounded-full object-cover ${isHistory ? "grayscale-[30%]" : ""}`}
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-lg font-bold text-primary-deep">
                      {trainer?.name?.slice(0, 1) ?? "T"}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-base font-bold text-primary-deep">
                      {trainer?.name ?? "Trainer"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {service?.title ?? "Service"}
                    </p>
                    <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      Created {formatDateTime(booking.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex justify-end gap-2">
                      {booking.paymentType && (
                        <StatusBadge status={booking.paymentType} />
                      )}
                      <StatusBadge status={displayStatus} />
                    </div>
                    <p className="mt-2 font-display text-base font-bold text-primary">
                      {displayAmount}
                    </p>
                  </div>
                </div>

                {/* ── Schedule Details ── */}
                {booking.scheduledStart && (
                  <div className="mt-4 rounded-xl bg-muted/40 border border-border/50 p-4 flex items-start gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <p className="font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                        Session Schedule
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {formatDateTime(booking.scheduledStart)}
                        {booking.scheduledEnd
                          ? ` → ${formatDateTime(booking.scheduledEnd)}`
                          : ""}
                      </p>
                      {booking.timezone && (
                        <p className="text-muted-foreground mt-0.5">
                          Timezone: {booking.timezone}
                        </p>
                      )}
                      {booking.meetingLink && (
                        <a
                          href={booking.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-primary hover:underline font-semibold"
                        >
                          Join Meeting Link →
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* ── Reschedule Request Alert ── */}
                {pendingReschedule && (
                  <div className="mt-3 rounded-xl border border-amber-500/25 bg-amber-500/8 p-3 text-xs flex items-start gap-2">
                    <CalendarClock className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-amber-800 dark:text-amber-300">
                        Reschedule Proposal Pending
                      </p>
                      <p className="text-foreground mt-0.5 font-medium">
                        Proposed: {formatDateTime(pendingReschedule.proposedStart)}
                      </p>
                      <p className="text-muted-foreground mt-1 font-medium">
                        {pendingReschedule.proposedById === booking.clientId
                          ? "Waiting for the trainer to accept or decline."
                          : "The trainer proposed a new time. Go to Reschedule page to accept or decline."}
                      </p>
                    </div>
                  </div>
                )}

                {/* ── Cancellation Request Alert ── */}
                {pendingCancellation && (
                  <div className="mt-3 rounded-xl border border-destructive/25 bg-destructive/8 p-3 text-xs flex items-start gap-2">
                    <CircleSlash className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-destructive px-0.5">
                        Cancellation Request Pending
                      </p>
                      {pendingCancellation.reason && (
                        <p className="italic text-muted-foreground mt-0.5">
                          Reason: &ldquo;{pendingCancellation.reason}&rdquo;
                        </p>
                      )}
                      <p className="text-muted-foreground mt-1 font-medium">
                        {pendingCancellation.proposedById === booking.clientId
                          ? "Waiting for the trainer to agree or reject."
                          : "The trainer requested mutual cancellation. Go to Cancel page to resolve."}
                      </p>
                    </div>
                  </div>
                )}

                {/* ── Dispute Panel ── */}
                {booking.status === "DISPUTED" && (
                  <div className="mt-3 rounded-xl border border-amber-500/25 bg-amber-500/5 p-4 space-y-3">
                    <div className="flex items-center gap-2 text-amber-700 font-semibold text-sm">
                      <ShieldAlert className="h-4 w-4" />
                      <span>Dispute In Progress</span>
                    </div>
                    
                    {(() => {
                      const parsed = parseDisputeReason(booking.disputeReason);
                      if (!parsed) return <p className="text-xs text-muted-foreground">Dispute details unavailable.</p>;
                      
                      return (
                        <div className="space-y-4 text-xs">
                          <p className="font-semibold text-foreground/80">
                            Dispute Initiator: <span className="font-bold text-amber-700">{parsed.initiator}</span>
                          </p>
                          
                          <div className="grid md:grid-cols-2 gap-4">
                            {/* Client Claim */}
                            <div className="p-3 rounded-lg bg-background/50 border border-border/50 space-y-2">
                              <p className="font-bold text-foreground">Client Claim</p>
                              {parsed.clientDispute ? (
                                <div className="space-y-1.5">
                                  <p><span className="text-muted-foreground font-medium">What Happened:</span> {parsed.clientDispute.whatHappened || <span className="italic text-muted-foreground">None</span>}</p>
                                  <p><span className="text-muted-foreground font-medium">The Cause:</span> {parsed.clientDispute.cause || <span className="italic text-muted-foreground">None</span>}</p>
                                  {parsed.clientDispute.evidenceUrls && parsed.clientDispute.evidenceUrls.length > 0 && (
                                    <div className="space-y-1 mt-2">
                                      <p className="text-muted-foreground font-medium">Evidence:</p>
                                      <div className="flex flex-wrap gap-2">
                                        {parsed.clientDispute.evidenceUrls.map((url, idx) => (
                                          <div key={idx} className="flex flex-col gap-1">
                                            {isImageUrl(url) ? (
                                              <a href={url} target="_blank" rel="noopener noreferrer" className="relative group block border border-border rounded overflow-hidden h-16 w-16 bg-muted hover:opacity-90 transition-opacity">
                                                <img src={url} alt={`Client evidence ${idx + 1}`} className="h-full w-full object-cover" />
                                              </a>
                                            ) : (
                                              <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline font-semibold bg-muted px-2 py-1 rounded">
                                                <ExternalLink className="h-3 w-3" />
                                                Link {idx + 1}
                                              </a>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <p className="italic text-muted-foreground">No claim submitted yet</p>
                              )}
                            </div>
                            
                            {/* Trainer Claim */}
                            <div className="p-3 rounded-lg bg-background/50 border border-border/50 space-y-2">
                              <p className="font-bold text-foreground">Trainer Claim</p>
                              {parsed.trainerDispute ? (
                                <div className="space-y-1.5">
                                  <p><span className="text-muted-foreground font-medium">What Happened:</span> {parsed.trainerDispute.whatHappened || <span className="italic text-muted-foreground">None</span>}</p>
                                  <p><span className="text-muted-foreground font-medium">The Cause:</span> {parsed.trainerDispute.cause || <span className="italic text-muted-foreground">None</span>}</p>
                                  {parsed.trainerDispute.evidenceUrls && parsed.trainerDispute.evidenceUrls.length > 0 && (
                                    <div className="space-y-1 mt-2">
                                      <p className="text-muted-foreground font-medium">Evidence:</p>
                                      <div className="flex flex-wrap gap-2">
                                        {parsed.trainerDispute.evidenceUrls.map((url, idx) => (
                                          <div key={idx} className="flex flex-col gap-1">
                                            {isImageUrl(url) ? (
                                              <a href={url} target="_blank" rel="noopener noreferrer" className="relative group block border border-border rounded overflow-hidden h-16 w-16 bg-muted hover:opacity-90 transition-opacity">
                                                <img src={url} alt={`Trainer evidence ${idx + 1}`} className="h-full w-full object-cover" />
                                              </a>
                                            ) : (
                                              <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline font-semibold bg-muted px-2 py-1 rounded">
                                                <ExternalLink className="h-3 w-3" />
                                                Link {idx + 1}
                                              </a>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <p className="italic text-muted-foreground">No counter-claim submitted yet</p>
                                  <p className="text-muted-foreground text-[10px]">
                                    Waiting for the trainer to provide their argument.
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* If trainer initiated, and client hasn't responded yet, let the client counter-claim */}
                          {parsed.initiator === "TRAINER" && !parsed.clientDispute && (
                            <div className="pt-2 border-t border-border/40">
                              <button
                                type="button"
                                onClick={() => openDisputeModal(booking)}
                                className="inline-flex items-center gap-1.5 rounded-full border border-amber-600/40 bg-amber-600/10 px-4 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-600/20 transition-colors"
                              >
                                <ShieldAlert className="h-3.5 w-3.5" />
                                Submit Counter-Argument
                              </button>
                            </div>
                          )}

                          {parsed.clientDispute && parsed.trainerDispute && (
                            <p className="text-[10px] text-muted-foreground italic pt-1 text-center">
                              The ReLive administrative team is actively reviewing this claim. No actions are required from your end at this time.
                            </p>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* ── Footer: Meta + Actions ── */}
                <div className="mt-4 grid gap-3 border-t border-border pt-4 md:grid-cols-[1fr_auto] md:items-center">
                  <div className="space-y-1 text-xs text-muted-foreground">
                    {booking.gatewayPaymentMethod && (
                      <p>Gateway: {booking.gatewayPaymentMethod}</p>
                    )}
                    {booking.txHash && <p>Tx Hash: {booking.txHash}</p>}
                    {booking.escrowAddress && (
                      <p>Escrow: {booking.escrowAddress}</p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 md:justify-end">
                    {/* COMPLETED: review or already-reviewed star badge */}
                    {booking.status === "COMPLETED" &&
                      (booking.review ? (
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/25 bg-amber-400/8 px-3 py-1.5 text-xs text-amber-500">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`h-3 w-3 ${
                                s <= booking.review!.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "fill-transparent text-white/20"
                              }`}
                            />
                          ))}
                          <span className="ml-1 font-semibold">Reviewed</span>
                        </div>
                      ) : (
                        <ReviewButton
                          bookingId={booking.id}
                          trainerName={booking.trainer?.user?.name ?? "Trainer"}
                          serviceName={booking.service?.title ?? "Session"}
                        />
                      ))}

                    {/* PENDING CRYPTO DEPOSIT */}
                    {booking.status === "PENDING" && booking.paymentType === "CRYPTO" && !booking.txHash && (
                      <button
                        type="button"
                        disabled={isCryptoLoading}
                        onClick={async () => {
                          const signature = await executeCrypto(booking.id, "deposit");
                          if (signature) {
                            toast.success("Deposit successful! Transaction signature: " + signature);
                            router.refresh();
                          } else {
                            toast.error(cryptoError || "Transaction failed");
                          }
                        }}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#4a5d3e] px-4 py-2 text-xs font-semibold text-[#f8f6ef] shadow-[0_12px_24px_rgba(74,93,62,0.16)] transition-all hover:opacity-90 disabled:opacity-50"
                      >
                        {isCryptoLoading ? "Processing..." : "Pay Crypto Deposit"}
                      </button>
                    )}

                    {/* ACTIVE: reschedule / cancel / dispute */}
                    {booking.status === "ACTIVE" && (
                      <>
                        <Link
                          href="/client/bookings/reschedule"
                          className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 px-4 py-2 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors"
                        >
                          Reschedule
                        </Link>
                        <Link
                          href="/client/bookings/cancel"
                          className="inline-flex items-center gap-1.5 rounded-full border border-destructive/30 px-4 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          Cancel Session
                        </Link>
                        <button
                          type="button"
                          onClick={() => openDisputeModal(booking)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-destructive/30 px-4 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <ShieldAlert className="h-3.5 w-3.5" />
                          Raise dispute
                        </button>
                      </>
                    )}

                    {/* PENDING RELEASE: Approve or Dispute */}
                    {booking.status === "PENDING_RELEASE" && (
                      <>
                        <form action={updateBookingStatusAction}>
                          <input type="hidden" name="bookingId" value={booking.id} />
                          <input type="hidden" name="status" value="COMPLETED" />
                          <input type="hidden" name="redirectTo" value="/client/dashboard" />
                          <button
                            type="submit"
                            className="inline-flex items-center gap-1.5 rounded-full bg-[#4a5d3e] px-4 py-2 text-xs font-semibold text-[#f8f6ef] hover:bg-[#3d4f32] transition-colors"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {booking.paymentType === "CRYPTO" ? "Approve & Release Escrow" : "Approve & Release Payment"}
                          </button>
                        </form>
                        <button
                          type="button"
                          onClick={() => openDisputeModal(booking)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-destructive/30 px-4 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <ShieldAlert className="h-3.5 w-3.5" />
                          Raise dispute
                        </button>
                      </>
                    )}

                    {/* CANCELLED CRYPTO REFUND */}
                    {booking.status === "CANCELLED" && booking.paymentType === "CRYPTO" && booking.txHash && (
                      <button
                        type="button"
                        disabled={isCryptoLoading}
                        onClick={async () => {
                          const signature = await executeCrypto(booking.id, "refund");
                          if (signature) {
                            toast.success("Refund claimed successfully! Signature: " + signature);
                            router.refresh();
                          } else {
                            toast.error(cryptoError || "Transaction failed");
                          }
                        }}
                        className="inline-flex items-center gap-1.5 rounded-full bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-700 transition-colors disabled:opacity-50"
                      >
                        {isCryptoLoading ? "Processing..." : "Claim Refund"}
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Warning & Form Modal */}
      {disputeBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
          }}
        >
          <div
            className="relative w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl"
            style={{
              background: "linear-gradient(135deg, rgba(30,30,30,0.95) 0%, rgba(20,20,20,0.95) 100%)",
              border: "1px solid rgba(255,255,255,0.12)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
            }}
          >
            {/* Ambient glow top-right */}
            <div
              className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full opacity-20"
              style={{
                background: "radial-gradient(circle, hsl(0,80%,50%) 0%, transparent 70%)",
              }}
            />

            {/* Header */}
            <div className="relative px-6 pt-6 pb-4">
              <button
                onClick={() => setDisputeBooking(null)}
                className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-white/10"
                aria-label="Close"
              >
                <X className="h-4 w-4 text-white/60" />
              </button>
              <p className="text-xs font-semibold uppercase tracking-widest text-red-400">
                Dispute Resolution
              </p>
              <h2 className="mt-1 font-display text-xl font-bold text-white">
                {disputeBooking.status === "DISPUTED" ? "Submit Dispute Counter-Claim" : "File a Dispute"}
              </h2>
              <p className="text-xs text-white/50">
                Booking #{disputeBooking.id} • {disputeBooking.service?.title}
              </p>
            </div>

            {/* Warning Box */}
            <div className="mx-6 p-4 rounded-2xl bg-red-950/45 border border-red-500/30 text-xs text-red-200 space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-red-300">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
                Escrow Fund Warning
              </p>
              <p>
                Disputing this booking will freeze the escrow funds ({disputeBooking.paymentType === "FIAT" ? formatIDR(disputeBooking.fiatAmount ?? disputeBooking.servicePriceIdr ?? 0) : formatUSDC(lamportsToTokenUnits(disputeBooking.service?.priceInLamports))}).
              </p>
              <p className="text-red-400 font-medium">
                The funds will remain locked in escrow until the dispute is resolved by a ReLive Administrator.
              </p>
            </div>

            {/* Form */}
            <form
              action={updateBookingStatusAction}
              onSubmit={() => setIsSubmittingDispute(true)}
              className="px-6 py-5 space-y-4"
            >
              <input type="hidden" name="bookingId" value={disputeBooking.id} />
              <input type="hidden" name="status" value="DISPUTED" />
              <input type="hidden" name="redirectTo" value="/client/dashboard" />
              <input
                type="hidden"
                name="disputeReason"
                value={JSON.stringify({
                  clientDispute: {
                    whatHappened: disputeWhatHappened,
                    cause: disputeCause,
                    evidenceUrls,
                  },
                })}
              />

              {/* Reference claim if trainer-initiated */}
              {disputeBooking.status === "DISPUTED" && (() => {
                const parsed = parseDisputeReason(disputeBooking.disputeReason);
                if (parsed?.trainerDispute) {
                  return (
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white/70 space-y-1 max-h-32 overflow-y-auto">
                      <p className="font-bold text-white/95">Trainer's Argument Reference:</p>
                      <p><span className="font-medium text-white/50">What Happened:</span> {parsed.trainerDispute.whatHappened}</p>
                      <p><span className="font-medium text-white/50">The Cause:</span> {parsed.trainerDispute.cause}</p>
                    </div>
                  );
                }
                return null;
              })()}

              {/* What Happened */}
              <div>
                <label htmlFor="dispute-what-happened" className="mb-1 block text-xs font-semibold text-white/70">
                  What Happened <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="dispute-what-happened"
                  value={disputeWhatHappened}
                  onChange={(e) => setDisputeWhatHappened(e.target.value)}
                  rows={2}
                  required
                  placeholder="Provide a clear statement of the issue (e.g. Trainer did not attend the scheduled session)..."
                  className="w-full rounded-xl px-3 py-2 text-xs text-white placeholder:text-white/20 resize-none focus:outline-none focus:ring-1 focus:ring-red-500/50 transition-all bg-white/5 border border-white/10"
                />
              </div>

              {/* Cause */}
              <div>
                <label htmlFor="dispute-cause" className="mb-1 block text-xs font-semibold text-white/70">
                  The Cause / Context <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="dispute-cause"
                  value={disputeCause}
                  onChange={(e) => setDisputeCause(e.target.value)}
                  rows={2}
                  required
                  placeholder="Explain the background, timeline, or context behind the issue..."
                  className="w-full rounded-xl px-3 py-2 text-xs text-white placeholder:text-white/20 resize-none focus:outline-none focus:ring-1 focus:ring-red-500/50 transition-all bg-white/5 border border-white/10"
                />
              </div>

              {/* Evidence URLs */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-white/70">
                  Evidence Links & Screenshots
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={evidenceUrlInput}
                    onChange={(e) => setEvidenceUrlInput(e.target.value)}
                    placeholder="Paste link to screenshot, image, or doc..."
                    className="flex-1 rounded-xl px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-red-500/50 transition-all bg-white/5 border border-white/10"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (evidenceUrlInput.trim()) {
                        setEvidenceUrls([...evidenceUrls, evidenceUrlInput.trim()]);
                        setEvidenceUrlInput("");
                      }
                    }}
                    className="px-3 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-white font-semibold transition-colors border border-white/10"
                  >
                    Add Link
                  </button>
                </div>

                {/* Drag and Drop Zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={async (e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const files = Array.from(e.dataTransfer.files);
                    for (const file of files) {
                      if (file.type.startsWith("image/")) {
                        try {
                          const compressed = await compressImage(file);
                          setEvidenceUrls((prev) => [...prev, compressed]);
                        } catch (err) {
                          console.error("Drop compression error:", err);
                        }
                      }
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`mt-2 border border-dashed rounded-xl p-3 text-center cursor-pointer transition-all duration-200 ${
                    isDragging
                      ? "border-red-500 bg-red-500/10"
                      : "border-white/10 hover:border-white/20 hover:bg-white/5"
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={async (e) => {
                      const files = Array.from(e.target.files || []);
                      for (const file of files) {
                        if (file.type.startsWith("image/")) {
                          try {
                            const compressed = await compressImage(file);
                            setEvidenceUrls((prev) => [...prev, compressed]);
                          } catch (err) {
                            console.error("File select compression error:", err);
                          }
                        }
                      }
                    }}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />
                  <div className="flex flex-col items-center gap-1.5">
                    <UploadCloud className="h-5 w-5 text-white/40" />
                    <p className="text-[10px] text-white/70 font-medium">
                      Drag & drop images here, paste with Ctrl+V, or click to upload
                    </p>
                    <p className="text-[9px] text-white/30">PNG, JPG, WEBP (auto-compressed)</p>
                  </div>
                </div>

                {/* Evidence Urls List */}
                {evidenceUrls.length > 0 && (
                  <div className="mt-2 space-y-1.5 max-h-24 overflow-y-auto pr-1">
                    {evidenceUrls.map((url, idx) => (
                      <div key={idx} className="flex items-center justify-between rounded-lg bg-white/5 border border-white/10 px-2.5 py-1 text-xs">
                        <div className="flex items-center gap-2 truncate">
                          {isImageUrl(url) ? (
                            <img src={url} alt={`Evidence ${idx + 1}`} className="h-5 w-5 rounded object-cover border border-white/10 shrink-0" />
                          ) : (
                            <span className="text-[10px] bg-white/10 px-1 rounded text-white/50 shrink-0">URL</span>
                          )}
                          <span className="truncate text-white/70 text-[11px]">{url}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setEvidenceUrls(evidenceUrls.filter((_, i) => i !== idx));
                          }}
                          className="text-red-400 hover:text-red-300 font-semibold px-1"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDisputeBooking(null)}
                  className="flex-1 rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-white/60 transition-colors hover:bg-white/5 hover:text-white/80"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingDispute || !disputeWhatHappened || !disputeCause}
                  className="flex-1 rounded-xl px-4 py-2 text-xs font-bold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-md shadow-red-950/20"
                >
                  {isSubmittingDispute ? "Submitting..." : (disputeBooking.status === "DISPUTED" ? "Submit Counter-Claim" : "File Dispute")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
