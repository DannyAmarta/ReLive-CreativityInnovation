"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  CheckCircle2,
  Send,
  X,
  CalendarClock,
  CircleSlash,
  Calendar,
  Clock,
  AlertTriangle,
  ShieldAlert,
  Plus,
  Trash2,
  ExternalLink,
  UploadCloud,
} from "lucide-react";
import { StatusBadge } from "@/components/trainer/StatusBadge";
import {
  updateBookingStatusAction,
  proposeRescheduleAction,
  resolveRescheduleAction,
  requestCancellationAction,
  resolveCancellationAction,
} from "@/lib/actions/marketplace";
import { formatDateTime, formatIDR, formatUSDC } from "@/lib/format";
import { lamportsToTokenUnits } from "@/lib/marketplace";
import { useCryptoEscrow } from "@/hooks/features/marketplace/useCryptoEscrow";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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

interface TrainerBookingsTableProps {
  bookings: any[];
  rescheduleRequests: any[];
  cancellationRequests: any[];
}

export function TrainerBookingsTable({
  bookings,
  rescheduleRequests,
  cancellationRequests,
}: TrainerBookingsTableProps) {
  const router = useRouter();
  const { execute: executeCrypto, isLoading: isCryptoLoading, error: cryptoError } = useCryptoEscrow();
  const [mounted, setMounted] = useState(false);
  const [disputeBooking, setDisputeBooking] = useState<any | null>(null);
  const [disputeWhatHappened, setDisputeWhatHappened] = useState("");
  const [disputeCause, setDisputeCause] = useState("");
  const [evidenceUrlInput, setEvidenceUrlInput] = useState("");
  const [evidenceUrls, setEvidenceUrls] = useState<string[]>([]);
  const [isSubmittingDispute, setIsSubmittingDispute] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const openDisputeModal = (booking: any) => {
    setDisputeBooking(booking);
    
    // Prefill with existing trainer claim if it already exists
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
  };

  return (
    <div className="glass-card-elevated overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
            <th className="px-5 py-3 font-medium">Client</th>
            <th className="px-5 py-3 font-medium">Service</th>
            <th className="px-5 py-3 font-medium">Created</th>
            <th className="px-5 py-3 font-medium">Schedule</th>
            <th className="px-5 py-3 font-medium">Payment</th>
            <th className="px-5 py-3 font-medium">Amount</th>
            <th className="px-5 py-3 font-medium">Status</th>
            <th className="px-5 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {bookings.map((booking) => {
            const pendingReschedule = rescheduleRequests.find(
              (r) => r.bookingId === booking.id && r.status === "PENDING"
            );
            const pendingCancellation = cancellationRequests.find(
              (r) => r.bookingId === booking.id && r.status === "PENDING"
            );

            return (
              <React.Fragment key={booking.id}>
                <tr className="hover:bg-muted/30 transition-colors align-top">
                  <td className="px-5 py-4">
                    <p className="font-medium">{booking.client?.name ?? "Client"}</p>
                    <p className="text-[10px] text-muted-foreground">{booking.client?.email ?? "No email available"}</p>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{booking.service?.title ?? "Service"}</td>
                  <td className="px-5 py-4 text-muted-foreground whitespace-nowrap">{formatDateTime(booking.createdAt)}</td>
                  <td className="px-5 py-4">
                    {booking.scheduledStart ? (
                      <div className="text-xs space-y-0.5">
                        <p className="font-medium text-foreground">{formatDateTime(booking.scheduledStart)}</p>
                        {booking.scheduledEnd && <p className="text-muted-foreground text-[10px]">to {formatDateTime(booking.scheduledEnd)}</p>}
                        {booking.timezone && <p className="text-[10px] text-muted-foreground">({booking.timezone})</p>}
                        {booking.meetingLink && (
                          <a
                            href={booking.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline font-semibold block text-[10px] mt-1"
                          >
                            Join Meeting →
                          </a>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Not scheduled</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={booking.paymentType ?? "PENDING"} />
                  </td>
                  <td className="px-5 py-4 font-mono tabular-nums">
                    {booking.paymentType === "FIAT"
                      ? formatIDR(booking.fiatAmount ?? booking.servicePriceIdr ?? 0)
                      : formatUSDC(lamportsToTokenUnits(booking.service?.priceInLamports))}
                  </td>
                  <td className="px-5 py-4">
                    <div className="space-y-2">
                      <StatusBadge status={booking.status} />
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      {booking.status === "PENDING" && (
                        <>
                          <ActionForm bookingId={booking.id} status="ACTIVE" redirectTo="/trainer/bookings">
                            Approve
                          </ActionForm>
                          <ActionForm bookingId={booking.id} status="CANCELLED" redirectTo="/trainer/bookings" variant="destructive">
                            <X className="size-3 mr-1.5" /> Cancel
                          </ActionForm>
                        </>
                      )}
                       {booking.status === "ACTIVE" && (
                        <>
                          <ActionForm bookingId={booking.id} status="PENDING_RELEASE" redirectTo="/trainer/bookings">
                            {booking.paymentType === "CRYPTO" ? (
                              <>
                                <Send className="size-3 mr-1.5" /> Request release
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="size-3 mr-1.5" /> Mark Complete & Request Payment
                              </>
                            )}
                          </ActionForm>
                          <button
                            type="button"
                            onClick={() => openDisputeModal(booking)}
                            className="inline-flex h-8 items-center rounded-full border border-destructive/30 px-3 text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <ShieldAlert className="size-3 mr-1.5" /> Raise dispute
                          </button>
                        </>
                      )}
                      {booking.status === "COMPLETED" && booking.paymentType === "CRYPTO" && booking.txHash && (
                        <button
                          type="button"
                          disabled={isCryptoLoading}
                          onClick={async () => {
                            const signature = await executeCrypto(booking.id, "release");
                            if (signature) {
                              toast.success("Successfully claimed USDC from escrow! Signature: " + signature);
                              router.refresh();
                            } else {
                              toast.error(cryptoError || "Transaction failed");
                            }
                          }}
                          className="inline-flex h-8 items-center rounded-full bg-[#4a5d3e] px-3 text-xs font-semibold text-[#f8f6ef] hover:bg-[#3d4f32] transition-colors disabled:opacity-50"
                        >
                          {isCryptoLoading ? "Processing..." : "Claim USDC Escrow"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>

                {/* Sub-row for Reschedule/Cancellation requests & Actions */}
                {(pendingReschedule || pendingCancellation || booking.status === "ACTIVE" || booking.status === "DISPUTED") && (
                  <tr className="bg-muted/10 border-b border-border/50">
                    <td colSpan={8} className="px-5 py-3 text-xs">
                      <div className="space-y-3">
                        {/* Reschedule Request Status Alert */}
                        {pendingReschedule && (
                          <div className="rounded-xl border border-amber-500/25 bg-amber-500/8 p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
                            <div className="space-y-1">
                              <p className="font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1.5 text-sm">
                                <CalendarClock className="h-4 w-4 text-amber-600 shrink-0" /> Reschedule Proposal Pending
                              </p>
                              <p className="text-foreground text-xs leading-normal">
                                Client wants to reschedule the <span className="font-bold text-amber-900 dark:text-amber-200">{booking.service?.title ?? "session"}</span> originally scheduled for <span className="font-bold text-primary">{booking.scheduledStart ? formatDateTime(booking.scheduledStart) : "Not scheduled"}</span>.
                              </p>
                              <div className="mt-2 p-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5 max-w-lg space-y-1">
                                <p className="text-xs text-foreground/90 font-medium">
                                  Proposed New Time: <span className="font-semibold text-amber-800 dark:text-amber-300">{formatDateTime(pendingReschedule.proposedStart)}</span>
                                  {pendingReschedule.proposedEnd && <span> to <span className="font-semibold text-amber-800 dark:text-amber-300">{formatDateTime(pendingReschedule.proposedEnd)}</span></span>}
                                </p>
                                {pendingReschedule.timezone && (
                                  <p className="text-[10px] text-muted-foreground">Timezone: {pendingReschedule.timezone}</p>
                                )}
                              </div>
                              <p className="text-[10px] text-muted-foreground italic">
                                {pendingReschedule.proposedById === booking.clientId
                                  ? "Proposed by Client. Please accept or decline."
                                  : "Waiting for Client to respond to your proposal."}
                              </p>
                            </div>
                            {pendingReschedule.proposedById === booking.clientId && (
                              <div className="flex gap-2">
                                <form action={resolveRescheduleAction}>
                                  <input type="hidden" name="requestId" value={pendingReschedule.id} />
                                  <input type="hidden" name="action" value="ACCEPT" />
                                  <input type="hidden" name="redirectTo" value="/trainer/bookings" />
                                  <button
                                    type="submit"
                                    className="bg-emerald-600 text-white rounded-lg px-3 py-1 hover:bg-emerald-700 font-semibold"
                                  >
                                    Accept
                                  </button>
                                </form>
                                <form action={resolveRescheduleAction}>
                                  <input type="hidden" name="requestId" value={pendingReschedule.id} />
                                  <input type="hidden" name="action" value="REJECT" />
                                  <input type="hidden" name="redirectTo" value="/trainer/bookings" />
                                  <button
                                    type="submit"
                                    className="bg-muted border border-border text-foreground rounded-lg px-3 py-1 hover:bg-destructive hover:text-white font-semibold"
                                  >
                                    Decline
                                  </button>
                                </form>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Cancellation Request Status Alert */}
                        {pendingCancellation && (
                          <div className="rounded-xl border border-destructive/25 bg-destructive/8 p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
                            <div className="space-y-1">
                              <p className="font-semibold text-destructive flex items-center gap-1.5 text-sm">
                                <CircleSlash className="h-4 w-4 text-red-500 shrink-0" /> Cancellation Request Pending
                              </p>
                              <p className="text-foreground text-xs leading-normal">
                                Client requested mutual cancellation for the <span className="font-bold text-red-950 dark:text-red-200">{booking.service?.title ?? "session"}</span> scheduled for <span className="font-bold text-destructive">{booking.scheduledStart ? formatDateTime(booking.scheduledStart) : "Not scheduled"}</span>.
                              </p>
                              {pendingCancellation.reason && (
                                <div className="mt-2 p-2.5 rounded-lg border border-destructive/10 bg-destructive/5 max-w-lg">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 dark:text-red-400 block mb-1">
                                    Client Reason
                                  </span>
                                  <p className="italic text-foreground/95 font-medium">&ldquo;{pendingCancellation.reason}&rdquo;</p>
                                </div>
                              )}
                              <p className="text-[10px] text-muted-foreground italic mt-1">
                                {pendingCancellation.proposedById === booking.clientId
                                  ? "Proposed by Client. Agreeing to cancel will refund the client."
                                  : "Waiting for Client to respond to your cancellation request."}
                              </p>
                            </div>
                            {pendingCancellation.proposedById === booking.clientId && (
                              <div className="flex gap-2">
                                <form action={resolveCancellationAction}>
                                  <input type="hidden" name="requestId" value={pendingCancellation.id} />
                                  <input type="hidden" name="action" value="ACCEPT" />
                                  <input type="hidden" name="redirectTo" value="/trainer/bookings" />
                                  <button
                                    type="submit"
                                    className="bg-destructive text-white rounded-lg px-3 py-1 hover:bg-destructive/90 font-semibold"
                                  >
                                    Agree to Cancel
                                  </button>
                                </form>
                                <form action={resolveCancellationAction}>
                                  <input type="hidden" name="requestId" value={pendingCancellation.id} />
                                  <input type="hidden" name="action" value="REJECT" />
                                  <input type="hidden" name="redirectTo" value="/trainer/bookings" />
                                  <button
                                    type="submit"
                                    className="bg-muted border border-border text-foreground rounded-lg px-3 py-1 hover:bg-foreground hover:text-background font-semibold"
                                  >
                                    Keep Booking
                                  </button>
                                </form>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Active Dispute Status Alert */}
                        {booking.status === "DISPUTED" && (
                          <div className="rounded-xl border border-red-500/25 bg-red-500/5 p-4 space-y-3">
                            <div className="flex items-center gap-2 text-red-700 font-semibold text-sm">
                              <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 animate-pulse" />
                              <span>Dispute In Progress</span>
                            </div>
                            
                            {(() => {
                              const parsed = parseDisputeReason(booking.disputeReason);
                              if (!parsed) return <p className="text-xs text-muted-foreground">Dispute details unavailable.</p>;
                              
                              return (
                                <div className="space-y-4 text-xs">
                                  <p className="font-semibold text-foreground/80">
                                    Dispute Initiator: <span className="font-bold text-red-700">{parsed.initiator}</span>
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

                                  {/* If client initiated, and trainer hasn't responded yet, let the trainer counter-claim */}
                                  {parsed.initiator === "CLIENT" && !parsed.trainerDispute && (
                                    <div className="pt-2 border-t border-border/40">
                                      <button
                                        type="button"
                                        onClick={() => openDisputeModal(booking)}
                                        className="inline-flex items-center gap-1.5 rounded-full border border-red-600/45 bg-red-600/10 px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-600/20 transition-colors"
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

                        {/* Propose Action Buttons for ACTIVE bookings when no pending requests */}
                        {booking.status === "ACTIVE" && (
                          <div className="flex flex-wrap gap-4 pt-1">
                            {!pendingReschedule && (
                              <details className="group">
                                <summary className="cursor-pointer list-none select-none text-primary hover:underline font-semibold flex items-center gap-1">
                                  + Propose Reschedule
                                </summary>
                                <form action={proposeRescheduleAction} className="mt-2 p-3 border border-border rounded-xl bg-background/50 max-w-md space-y-3">
                                  <input type="hidden" name="bookingId" value={booking.id} />
                                  <input type="hidden" name="timezone" value={booking.timezone ?? "Asia/Jakarta"} />
                                  <input type="hidden" name="redirectTo" value="/trainer/bookings" />
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <label className="block text-[10px] font-semibold text-muted-foreground uppercase mb-1">New Start</label>
                                      <input type="datetime-local" name="proposedStart" required className="w-full text-xs rounded border border-border bg-background px-2 py-1" />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] font-semibold text-muted-foreground uppercase mb-1">New End</label>
                                      <input type="datetime-local" name="proposedEnd" required className="w-full text-xs rounded border border-border bg-background px-2 py-1" />
                                    </div>
                                  </div>
                                  <button type="submit" className="bg-primary text-primary-foreground text-xs rounded px-3 py-1 hover:bg-primary/95 font-semibold">
                                    Send Proposal
                                  </button>
                                </form>
                              </details>
                            )}

                            {!pendingCancellation && (
                              <details className="group">
                                <summary className="cursor-pointer list-none select-none text-destructive hover:underline font-semibold flex items-center gap-1">
                                  + Request Cancellation
                                </summary>
                                <form action={requestCancellationAction} className="mt-2 p-3 border border-border rounded-xl bg-background/50 max-w-md space-y-3">
                                  <input type="hidden" name="bookingId" value={booking.id} />
                                  <input type="hidden" name="redirectTo" value="/trainer/bookings" />
                                  <div>
                                    <label className="block text-[10px] font-semibold text-muted-foreground uppercase mb-1">Reason</label>
                                    <textarea name="reason" rows={2} placeholder="Optional reason..." className="w-full text-xs rounded border border-border bg-background px-2 py-1" />
                                  </div>
                                  <button type="submit" className="bg-destructive text-destructive-foreground text-xs rounded px-3 py-1 hover:bg-destructive/95 font-semibold">
                                    Send Request
                                  </button>
                                </form>
                              </details>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>

      {/* Warning & Form Modal */}
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
                {disputeBooking.status === "DISPUTED" ? "Submit Dispute Counter-Claim" : "File a Dispute"}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Booking #{disputeBooking.id} • {disputeBooking.service?.title}
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
              onSubmit={() => setIsSubmittingDispute(true)}
              className="px-6 py-5 space-y-4"
            >
              <input type="hidden" name="bookingId" value={disputeBooking.id} />
              <input type="hidden" name="status" value="DISPUTED" />
              <input type="hidden" name="redirectTo" value="/trainer/bookings" />
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

              {/* Reference claim if client-initiated */}
              {disputeBooking.status === "DISPUTED" && (() => {
                const parsed = parseDisputeReason(disputeBooking.disputeReason);
                if (parsed?.clientDispute) {
                  return (
                    <div className="p-3 rounded-xl bg-muted/40 border border-border text-xs text-muted-foreground space-y-1 max-h-32 overflow-y-auto">
                      <p className="font-bold text-foreground">Client's Argument Reference:</p>
                      <p><span className="font-medium text-muted-foreground/80">What Happened:</span> {parsed.clientDispute.whatHappened}</p>
                      <p><span className="font-medium text-muted-foreground/80">The Cause:</span> {parsed.clientDispute.cause}</p>
                    </div>
                  );
                }
                return null;
              })()}

              {/* What Happened */}
              <div>
                <label htmlFor="dispute-what-happened" className="mb-1 block text-xs font-semibold text-muted-foreground">
                  What Happened <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="dispute-what-happened"
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
                <label htmlFor="dispute-cause" className="mb-1 block text-xs font-semibold text-muted-foreground">
                  The Cause / Context <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="dispute-cause"
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
                  {isSubmittingDispute ? "Submitting..." : (disputeBooking.status === "DISPUTED" ? "Submit Counter-Claim" : "File Dispute")}
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

function ActionForm({
  bookingId,
  status,
  redirectTo,
  children,
  variant = "primary",
}: {
  bookingId: number;
  status: string;
  redirectTo: string;
  children: React.ReactNode;
  variant?: "primary" | "destructive";
}) {
  const className =
    variant === "destructive"
      ? "inline-flex h-8 items-center rounded-full border border-destructive/30 px-3 text-xs font-semibold text-destructive hover:bg-destructive/10"
      : "inline-flex h-8 items-center rounded-full bg-primary px-3 text-xs font-semibold text-primary-foreground hover:opacity-90";

  return (
    <form action={updateBookingStatusAction}>
      <input type="hidden" name="bookingId" value={bookingId} />
      <input type="hidden" name="status" value={status} />
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <button type="submit" className={className}>
        {children}
      </button>
    </form>
  );
}
