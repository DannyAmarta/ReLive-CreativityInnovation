"use client";

import { useRouter } from "next/navigation";
import { Cpu, Link2, Unplug } from "lucide-react";
import { useState } from "react";
import { beginOpenRouterConnection } from "@/lib/openrouter";

type OpenRouterConnectionCardProps = {
  isConnected: boolean;
  connectedAt: Date | null;
  keyLabel: string | null;
  onToast: (message: string, kind: "success" | "error" | "info") => void;
};

export function IntegrationOpenRouter({
  isConnected,
  connectedAt,
  keyLabel,
  onToast,
}: OpenRouterConnectionCardProps) {
  const router = useRouter();
  const [isWorking, setIsWorking] = useState(false);

  async function connect() {
    try {
      setIsWorking(true);
      onToast("Redirecting to OpenRouter...", "info");
      await beginOpenRouterConnection();
    } catch (error) {
      setIsWorking(false);
      onToast(
        error instanceof Error
          ? error.message
          : "Unable to start the OpenRouter connection flow.",
        "error",
      );
    }
  }

  async function disconnect() {
    try {
      setIsWorking(true);
      const response = await fetch("/api/openrouter/disconnect", {
        method: "POST",
      });
      const payload = (await response.json()) as { message?: string; error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to remove the OpenRouter connection.");
      }

      onToast(payload.message ?? "OpenRouter connection removed.", "success");
      router.refresh();
    } catch (error) {
      onToast(
        error instanceof Error
          ? error.message
          : "Unable to remove the OpenRouter connection.",
        "error",
      );
    } finally {
      setIsWorking(false);
    }
  }

  return (
    <div className="rounded-2xl border border-[#DDE1DF]/40 bg-white/50 p-6 shadow-sm">
      {/* Header Area */}
      <div className="flex items-center gap-2.5 mb-3">
        <Cpu className="h-4 w-4 text-[#2D5A27]" />
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#2C2E2C]/40">
          OpenRouter Fallback
        </span>
      </div>
      
      <p className="text-sm leading-relaxed text-[#2C2E2C]/70">
        Connect your OpenRouter account so `/set` can retry recommendation generation
        with your own limit when the shared server key gets rate-limited.
      </p>

      {/* Status Box: Light Sage variant */}
      <div className="mt-5 rounded-xl border border-[#DDE1DF]/60 bg-[#F7F9F7] p-5 text-sm">
        <p className="text-[#2C2E2C]/60 font-medium">
          Status:{" "}
          <span className={`font-bold ${isConnected ? "text-[#2D5A27]" : "text-rose-600"}`}>
            {isConnected ? "Connected" : "Not connected"}
          </span>
        </p>
        
        {keyLabel ? (
          <p className="mt-2 text-[#2C2E2C]/60 font-medium">
            Key label: <span className="text-[#2D5A27]">{keyLabel}</span>
          </p>
        ) : null}
        
        {connectedAt ? (
          <p className="mt-2 text-[11px] font-bold uppercase tracking-wider text-[#2C2E2C]/30">
            Connected at:{" "}
            <span className="text-[#2C2E2C]/60">{connectedAt.toLocaleString()}</span>
          </p>
        ) : null}
      </div>

      {/* Action Buttons */}
      <div className="mt-5 flex flex-wrap gap-3">
        {isConnected ? (
          <button
            type="button"
            onClick={disconnect}
            disabled={isWorking}
            className="inline-flex items-center gap-2 rounded-full border border-rose-100 bg-rose-50 px-5 py-2 text-xs font-bold text-rose-700 transition-all hover:bg-rose-100 disabled:opacity-50"
          >
            <Unplug className="h-3.5 w-3.5" />
            Disconnect OpenRouter
          </button>
        ) : (
          <button
            type="button"
            onClick={connect}
            disabled={isWorking}
            // Matches "View All Badges" exactly
            className="inline-flex items-center gap-2 rounded-full bg-[#153011] px-5 py-2 text-xs font-bold text-white transition-all hover:bg-[#2D5A27] shadow-md active:scale-95 disabled:opacity-50"
          >
            <Link2 className="h-3.5 w-3.5" />
            Connect OpenRouter
          </button>
        )}
      </div>
    </div>
  );
}
