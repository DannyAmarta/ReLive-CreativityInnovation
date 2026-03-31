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

export function OpenRouterConnectionCard({
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
    <div className="rounded-2xl border border-white/8 bg-white/5 p-5">
      <div className="flex items-center gap-2.5 mb-2">
        <Cpu className="h-4 w-4 text-violet-400" />
        <span className="text-xs font-semibold uppercase tracking-widest text-white/40">
          OpenRouter Fallback
        </span>
      </div>
      <p className="text-sm leading-relaxed text-white/65">
        Connect your OpenRouter account so `/set` can retry recommendation generation
        with your own limit when the shared server key gets rate-limited.
      </p>

      <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-white/65">
        <p>
          Status:{" "}
          <span className="font-semibold text-white">
            {isConnected ? "Connected" : "Not connected"}
          </span>
        </p>
        {keyLabel ? (
          <p className="mt-1">Key label: <span className="text-cyan-300">{keyLabel}</span></p>
        ) : null}
        {connectedAt ? (
          <p className="mt-1">
            Connected at:{" "}
            <span className="text-white/80">{connectedAt.toLocaleString()}</span>
          </p>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        {isConnected ? (
          <button
            type="button"
            onClick={disconnect}
            disabled={isWorking}
            className="inline-flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/15 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Unplug className="h-4 w-4" />
            Disconnect OpenRouter
          </button>
        ) : (
          <button
            type="button"
            onClick={connect}
            disabled={isWorking}
            className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/15 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Link2 className="h-4 w-4" />
            Connect OpenRouter
          </button>
        )}
      </div>
    </div>
  );
}
