"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  clearOpenRouterVerifier,
  readOpenRouterState,
  readOpenRouterVerifier,
} from "@/lib/openrouter";

export function OpenRouterCallbackClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState("Connecting your OpenRouter account...");

  useEffect(() => {
    async function exchangeCode() {
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const error = searchParams.get("error");
      const verifier = readOpenRouterVerifier();
      const expectedState = readOpenRouterState();

      if (error) {
        clearOpenRouterVerifier();
        setStatus("OpenRouter authorization was cancelled or denied.");
        return;
      }

      if (!state || !expectedState || state !== expectedState) {
        clearOpenRouterVerifier();
        setStatus("OpenRouter callback state did not match. Please try again.");
        return;
      }

      if (!code || !verifier) {
        clearOpenRouterVerifier();
        setStatus("Missing OpenRouter authorization data. Please try again.");
        return;
      }

      try {
        const response = await fetch("/api/openrouter/exchange", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code, verifier }),
        });
        const payload = (await response.json()) as { message?: string; error?: string };

        if (!response.ok) {
          throw new Error(payload.error ?? "Unable to connect your OpenRouter account.");
        }

        clearOpenRouterVerifier();
        setStatus(payload.message ?? "OpenRouter connected successfully.");
        window.setTimeout(() => {
          router.replace("/profile");
          router.refresh();
        }, 1200);
      } catch (error) {
        clearOpenRouterVerifier();
        setStatus(
          error instanceof Error
            ? error.message
            : "Unable to connect your OpenRouter account.",
        );
      }
    }

    void exchangeCode();
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050510] px-6 text-center text-white">
      <div className="max-w-lg rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/35">
          OpenRouter
        </p>
        <h1 className="mt-4 text-2xl font-semibold">Finishing account connection</h1>
        <p className="mt-4 text-sm leading-7 text-white/65">{status}</p>
      </div>
    </div>
  );
}
