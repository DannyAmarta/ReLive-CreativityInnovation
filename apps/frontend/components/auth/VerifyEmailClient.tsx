"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2, Shield } from "lucide-react";
import { print } from "graphql";
import { VERIFY_EMAIL_CHANGE_MUTATION } from "@/lib/gqlQueries";
import { BACKEND_URL } from "@/lib/constants";

type VerifyState = "loading" | "success" | "error";

async function runVerifyEmailChange(token: string): Promise<string> {
  const res = await fetch(`${BACKEND_URL}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: print(VERIFY_EMAIL_CHANGE_MUTATION),
      variables: { token },
    }),
  });

  const json = await res.json();

  if (json?.errors?.length) {
    throw new Error(json.errors[0]?.message ?? "Verification failed");
  }

  return (
    json?.data?.verifyEmailChange?.message ?? "Email updated successfully."
  );
}

export function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [state, setState] = useState<VerifyState>("loading");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (!token) {
      setState("error");
      setMessage("No verification token found in the URL.");
      return;
    }

    runVerifyEmailChange(token)
      .then((msg) => {
        setState("success");
        setMessage(msg);
      })
      .catch((err: Error) => {
        setState("error");
        setMessage(err.message ?? "An unexpected error occurred.");
      });
  }, [token]);

  return (
    <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        background: "linear-gradient(160deg, #04040b 0%, #060412 50%, #04040b 100%)",
        fontFamily: "'Nunito', sans-serif",
      }}
    >
      {/* Background orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div
          className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(88,28,135,0.45) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute -bottom-20 -right-20 h-[400px] w-[400px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(6,182,212,0.2) 0%, transparent 70%)",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md mx-auto px-4"
      >
        <div
          className="rounded-3xl border border-white/10 bg-white/[0.04] p-10 backdrop-blur-2xl text-center"
          style={{
            boxShadow:
              "0 0 0 1px rgba(255,255,255,0.05), 0 40px 80px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          {/* Icon */}
          <AnimatePresence mode="wait">
            {state === "loading" && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center mb-6"
              >
                <div className="relative">
                  <div
                    className="h-20 w-20 rounded-full flex items-center justify-center"
                    style={{
                      background:
                        "radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)",
                    }}
                  >
                    <Loader2 className="h-10 w-10 text-violet-400 animate-spin" />
                  </div>
                </div>
              </motion.div>
            )}
            {state === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="flex justify-center mb-6"
              >
                <div
                  className="h-20 w-20 rounded-full flex items-center justify-center"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 70%)",
                  }}
                >
                  <CheckCircle className="h-10 w-10 text-emerald-400" />
                </div>
              </motion.div>
            )}
            {state === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="flex justify-center mb-6"
              >
                <div
                  className="h-20 w-20 rounded-full flex items-center justify-center"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(239,68,68,0.2) 0%, transparent 70%)",
                  }}
                >
                  <XCircle className="h-10 w-10 text-red-400" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Badge */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-3.5 w-3.5 text-violet-400" />
            <span
              className="text-xs font-bold uppercase tracking-widest text-white/40"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              Email Verification
            </span>
          </div>

          {/* Title */}
          <AnimatePresence mode="wait">
            <motion.h1
              key={state}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-2xl font-bold text-white mb-3"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              {state === "loading" && "Verifying your email…"}
              {state === "success" && "Email address updated!"}
              {state === "error" && "Verification failed"}
            </motion.h1>
          </AnimatePresence>

          {/* Message */}
          <AnimatePresence mode="wait">
            <motion.p
              key={state + "-msg"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-sm text-white/50 leading-relaxed mb-8"
            >
              {state === "loading"
                ? "Please wait while we securely verify your request…"
                : message}
            </motion.p>
          </AnimatePresence>

          {/* Action */}
          {state !== "loading" && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="flex flex-col gap-3"
            >
              {state === "success" ? (
                <Link href="/auth/login">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-bold text-sm text-center cursor-pointer"
                    style={{ fontFamily: "'Sora', sans-serif" }}
                  >
                    Sign In with New Email
                  </motion.div>
                </Link>
              ) : (
                <Link href="/profile">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-pink-500 text-white font-bold text-sm text-center cursor-pointer"
                    style={{ fontFamily: "'Sora', sans-serif" }}
                  >
                    Back to Profile
                  </motion.div>
                </Link>
              )}
              <Link href="/">
                <span className="text-xs text-white/30 hover:text-white/60 transition-colors cursor-pointer">
                  Return to home
                </span>
              </Link>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
