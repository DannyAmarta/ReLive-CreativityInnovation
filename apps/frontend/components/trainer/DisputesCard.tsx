"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ShieldAlert, ArrowRight, Calendar, MessageSquare, AlertTriangle, UploadCloud, X } from "lucide-react";
import { updateBookingStatusAction } from "@/lib/actions/marketplace";
import type { BookingRecord } from "@/lib/marketplace";
import { formatDateTime, formatIDR, formatUSDC } from "@/lib/format";
import { lamportsToTokenUnits } from "@/lib/marketplace";
import { compressImage, isImageUrl } from "./TrainerBookingsTable";

// ─── Dispute Helpers & Types ───────────────────────────────────────────────
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

interface DisputesCardProps {
  bookings: BookingRecord[];
}

export function DisputesCard({ bookings }: DisputesCardProps) {
  // Modal target state
  const [disputeBooking, setDisputeBooking] = useState<BookingRecord | null>(null);
  
  // Mounted state for portal rendering
  const [mounted, setMounted] = useState(false);

  // Form states (populated when a booking is selected)
  const [disputeWhatHappened, setDisputeWhatHappened] = useState("");
  const [disputeCause, setDisputeCause] = useState("");
  const [evidenceUrls, setEvidenceUrls] = useState<string[]>([]);
  const [evidenceUrlInput, setEvidenceUrlInput] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmittingDispute, setIsSubmittingDispute] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Set mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Paste handler for screenshots
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

  const disputed = bookings.filter((b) => b.status === "DISPUTED");

  if (disputed.length === 0) return null;

  return (
    <div className="glass-card-elevated overflow-hidden flex flex-col border border-red-500/20 bg-gradient-to-br from-[rgba(239,68,68,0.02)] to-[rgba(239,68,68,0.05)] shadow-red-500/5">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-[rgba(239,68,68,0.12)]">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-xl bg-red-500/10 flex items-center justify-center text-red-600 animate-pulse">
            <ShieldAlert className="size-4.5" />
          </div>
          <div>
            <h2 className="font-display font-bold text-primary-deep text-base leading-none">
              Active Disputes
            </h2>
            <p className="text-[11px] text-red-700 dark:text-red-400/80 font-medium mt-0.5">
              {disputed.length} booking{disputed.length !== 1 ? "s" : ""} require your attention
            </p>
          </div>
        </div>
        <Link
          href="/trainer/bookings"
          className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 dark:text-red-400 hover:underline transition-colors"
        >
          Manage All
          <ArrowRight className="size-3" />
        </Link>
      </div>

      {/* Dispute list */}
      <div className="divide-y divide-[rgba(239,68,68,0.08)]">
        {disputed.map((booking) => {
          const initials =
            booking.client?.name
              ?.split(" ")
              .map((p) => p[0])
              .join("")
              .slice(0, 2)
              .toUpperCase() ?? "?";

          const parsedDispute = parseDisputeReason(booking.disputeReason);
          const hasCounterArgument = !!parsedDispute?.trainerDispute;
          const clientReason = parsedDispute?.clientDispute?.whatHappened || booking.disputeReason;
          const trainerReason = parsedDispute?.trainerDispute?.whatHappened;

          return (
            <div
              key={booking.id}
              className="p-6 space-y-4 hover:bg-[rgba(239,68,68,0.02)] transition-colors"
            >
              {/* Header row */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3">
                  <div className="size-10 rounded-full bg-red-500/15 flex items-center justify-center font-bold text-sm text-red-700 select-none shrink-0 border border-red-500/20">
                    {initials}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-primary-deep leading-snug">
                      &ldquo;{booking.service?.title ?? "Session"}&rdquo;
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Client:{" "}
                      <span className="font-medium text-foreground">
                        {booking.client?.name ?? "Client"}
                      </span>
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/10 text-red-700 border border-red-500/20 shrink-0">
                  <ShieldAlert className="size-3" /> Disputed
                </span>
              </div>

              {/* Dispute reason (Normal state viewer) */}
              {clientReason && (
                <div className="space-y-2.5">
                  <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-3.5 text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 block mb-1">
                      Dispute Reason
                    </span>
                    <p className="italic text-foreground/90 font-medium flex items-start gap-1.5">
                      <MessageSquare className="size-3.5 shrink-0 mt-0.5 text-red-400" />
                      &ldquo;{clientReason}&rdquo;
                    </p>
                  </div>

                  {trainerReason && (
                    <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3.5 text-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block mb-1">
                        Your Counter Argument
                      </span>
                      <p className="italic text-foreground/90 font-medium flex items-start gap-1.5">
                        <MessageSquare className="size-3.5 shrink-0 mt-0.5 text-emerald-400" />
                        &ldquo;{trainerReason}&rdquo;
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Session time */}
              {booking.scheduledStart && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="size-3.5 shrink-0" />
                  <span>
                    Session:{" "}
                    <span className="font-medium text-foreground">
                      {formatDateTime(booking.scheduledStart)}
                    </span>
                  </span>
                </div>
              )}

              {/* Actions row */}
              <div className="flex items-center justify-between gap-4 pt-1 w-full">
                <span className="text-[10px] text-muted-foreground italic">
                  Updated: {formatDateTime(booking.updatedAt)}
                </span>
                <div className="flex gap-2">
                  {hasCounterArgument ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 select-none">
                      ✓ Countered
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setDisputeBooking(booking);
                        
                        // Initialize with any existing counter claim data if available
                        const parsed = parseDisputeReason(booking.disputeReason);
                        if (parsed && parsed.trainerDispute) {
                          setDisputeWhatHappened(parsed.trainerDispute.whatHappened || "");
                          setDisputeCause(parsed.trainerDispute.cause || "");
                          setEvidenceUrls(parsed.trainerDispute.evidenceUrls || []);
                        } else {
                          setDisputeWhatHappened("");
                          setDisputeCause("");
                          setEvidenceUrls([]);
                        }
                        setEvidenceUrlInput("");
                        setIsSubmittingDispute(false);
                      }}
                      className="inline-flex items-center justify-center gap-1 rounded-full bg-red-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-red-700 shadow-md shadow-red-600/10 transition-colors"
                    >
                      Submit Counter Argument
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Warning & Form Modal Portal overlay */}
      {mounted && disputeBooking && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
          style={{
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
          }}
        >
          <div
            className="relative w-full max-w-lg rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh] my-8 [&::-webkit-scrollbar]:hidden"
            style={{
              background: "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(250, 250, 250, 0.98) 100%)",
              border: "1px solid rgba(0, 0, 0, 0.08)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              msOverflowStyle: "none",
              scrollbarWidth: "none",
            }}
          >
            {/* Ambient glow top-right */}
            <div
              className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full opacity-15"
              style={{
                background: "radial-gradient(circle, rgba(239, 68, 68, 0.2) 0%, transparent 70%)",
              }}
            />

            {/* Header */}
            <div className="relative px-6 pt-6 pb-4">
              <button
                onClick={() => setDisputeBooking(null)}
                className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-black/5"
                aria-label="Close"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
              <p className="text-xs font-semibold uppercase tracking-widest text-red-600">
                Dispute Resolution
              </p>
              <h2 className="mt-1 font-display text-xl font-bold text-foreground">
                Submit Dispute Counter-Claim
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Booking #{disputeBooking.id} • {disputeBooking.client?.email ?? "No email"}
              </p>
            </div>

            {/* Warning Box */}
            <div className="mx-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-red-950">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
                Escrow Fund Warning
              </p>
              <p>
                Disputing this booking will freeze the escrow funds ({disputeBooking.paymentType === "FIAT" ? formatIDR(disputeBooking.fiatAmount ?? disputeBooking.servicePriceIdr ?? 0) : formatUSDC(lamportsToTokenUnits(disputeBooking.service?.priceInLamports))}).
              </p>
              <p className="text-red-700 font-medium">
                The funds will remain locked in escrow until the dispute is resolved by a ReLive Administrator.
              </p>
            </div>

            {/* Form */}
            <form
              action={updateBookingStatusAction}
              onSubmit={() => {
                setIsSubmittingDispute(true);
                setTimeout(() => setDisputeBooking(null), 100);
              }}
              className="px-6 py-5 space-y-4"
            >
              <input type="hidden" name="bookingId" value={disputeBooking.id} />
              <input type="hidden" name="status" value="DISPUTED" />
              <input type="hidden" name="redirectTo" value="/trainer" />
              <input
                type="hidden"
                name="disputeReason"
                value={JSON.stringify({
                  trainerDispute: {
                    whatHappened: disputeWhatHappened,
                    cause: disputeCause,
                    evidenceUrls,
                  },
                })}
              />

              {/* Client's Argument Reference */}
              {(() => {
                const parsed = parseDisputeReason(disputeBooking.disputeReason);
                const clientReason = parsed?.clientDispute?.whatHappened || disputeBooking.disputeReason;
                const clientCause = parsed?.clientDispute?.cause;

                if (clientReason) {
                  return (
                    <div className="p-3 rounded-xl bg-muted/40 border border-border text-xs text-muted-foreground space-y-1 max-h-32 overflow-y-auto">
                      <p className="font-bold text-foreground">Client's Argument Reference:</p>
                      <p><span className="font-medium text-muted-foreground/80">What Happened:</span> {clientReason}</p>
                      {clientCause && (
                        <p><span className="font-medium text-muted-foreground/80">The Cause:</span> {clientCause}</p>
                      )}
                    </div>
                  );
                }
                return null;
              })()}

              {/* What Happened */}
              <div>
                <label htmlFor={`modal-dispute-what-happened-${disputeBooking.id}`} className="mb-1 block text-xs font-semibold text-muted-foreground">
                  What Happened <span className="text-red-500">*</span>
                </label>
                <textarea
                  id={`modal-dispute-what-happened-${disputeBooking.id}`}
                  value={disputeWhatHappened}
                  onChange={(e) => setDisputeWhatHappened(e.target.value)}
                  rows={2}
                  required
                  placeholder="Provide a clear statement of the issue (e.g. Client missed the session or was uncooperative)..."
                  className="w-full rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/40 resize-none focus:outline-none focus:ring-1 focus:ring-red-500/50 transition-all bg-background/50 border border-border"
                />
              </div>

              {/* Cause */}
              <div>
                <label htmlFor={`modal-dispute-cause-${disputeBooking.id}`} className="mb-1 block text-xs font-semibold text-muted-foreground">
                  The Cause / Context <span className="text-red-500">*</span>
                </label>
                <textarea
                  id={`modal-dispute-cause-${disputeBooking.id}`}
                  value={disputeCause}
                  onChange={(e) => setDisputeCause(e.target.value)}
                  rows={2}
                  required
                  placeholder="Explain the background, timeline, or context behind the issue..."
                  className="w-full rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/40 resize-none focus:outline-none focus:ring-1 focus:ring-red-500/50 transition-all bg-background/50 border border-border"
                />
              </div>

              {/* Evidence URLs */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                  Evidence Links & Screenshots
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={evidenceUrlInput}
                    onChange={(e) => setEvidenceUrlInput(e.target.value)}
                    placeholder="Paste link to screenshot, image, or doc..."
                    className="flex-1 rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-red-500/50 transition-all bg-background/50 border border-border"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (evidenceUrlInput.trim()) {
                        setEvidenceUrls([...evidenceUrls, evidenceUrlInput.trim()]);
                        setEvidenceUrlInput("");
                      }
                    }}
                    className="px-3 rounded-xl bg-muted hover:bg-muted/80 text-xs text-foreground font-semibold transition-colors border border-border"
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
                      : "border-border hover:border-red-500/50 hover:bg-red-500/5"
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
                    <UploadCloud className="h-5 w-5 text-muted-foreground/60" />
                    <p className="text-[10px] text-muted-foreground font-medium">
                      Drag & drop images here, paste with Ctrl+V, or click to upload
                    </p>
                    <p className="text-[9px] text-muted-foreground/40">PNG, JPG, WEBP (auto-compressed)</p>
                  </div>
                </div>

                {/* Evidence Urls List */}
                {evidenceUrls.length > 0 && (
                  <div className="mt-2 space-y-1.5 max-h-24 overflow-y-auto pr-1">
                    {evidenceUrls.map((url, idx) => (
                      <div key={idx} className="flex items-center justify-between rounded-lg bg-muted/50 border border-border px-2.5 py-1 text-xs">
                        <div className="flex items-center gap-2 truncate">
                          {isImageUrl(url) ? (
                            <img src={url} alt={`Evidence ${idx + 1}`} className="h-5 w-5 rounded object-cover border border-border shrink-0" />
                          ) : (
                            <span className="text-[10px] bg-muted px-1 rounded text-muted-foreground shrink-0">URL</span>
                          )}
                          <span className="truncate text-muted-foreground text-[11px]">{url}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setEvidenceUrls(evidenceUrls.filter((_, i) => i !== idx));
                          }}
                          className="text-red-600 hover:text-red-700 font-semibold px-1"
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
                  className="flex-1 rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingDispute || !disputeWhatHappened || !disputeCause}
                  className="flex-1 rounded-xl px-4 py-2 text-xs font-bold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-md shadow-red-500/10"
                >
                  {isSubmittingDispute ? "Submitting..." : "Submit Counter-Claim"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
