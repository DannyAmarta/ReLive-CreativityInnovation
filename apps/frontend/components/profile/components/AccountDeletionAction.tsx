"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Trash2, Shield, SendHorizonal, X, Check } from "lucide-react";
import { overlayVariants, modalVariants } from "../logic/profile.motions";
import {
  requestAccountDeletionCodeAction,
  confirmAccountDeletionAction,
  deleteSessionAction,
} from "@/lib/actions/profile";

export function AccountDeletionAction({
  onToast,
}: {
  onToast: (msg: string, kind: "success" | "error" | "info") => void;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [stage, setStage] = useState<"request" | "verify">("request");
  const [code, setCode] = useState("");
  const [verifyToken, setVerifyToken] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenModal = () => {
    setError(null);
    setCode("");
    setVerifyToken("");
    setStage("request");
    setModalOpen(true);
  };

  const handleCancel = () => {
    if (isSending) return;
    setModalOpen(false);
  };

  const handleRequestCode = async () => {
    setIsSending(true);
    setError(null);
    try {
      const res = await requestAccountDeletionCodeAction();
      if (res.success && res.verifyToken) {
        setVerifyToken(res.verifyToken);
        setStage("verify");
        onToast(res.message || "Verification code sent to your email.", "success");
      } else {
        setError(res.error || "Failed to request verification code.");
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
    } finally {
      setIsSending(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!code || code.length < 6) {
      setError("Please enter the 6-digit verification code.");
      return;
    }
    setIsSending(true);
    setError(null);
    try {
      const res = await confirmAccountDeletionAction(verifyToken, code);
      if (res.success) {
        onToast("Account deleted successfully. Logging out...", "success");
        // Wait briefly for toast to show, then clear session and redirect
        setTimeout(async () => {
          await deleteSessionAction();
          window.location.href = "/auth/login";
        }, 1500);
      } else {
        setError(res.error || "Failed to delete account. Please check the code.");
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      {/* Danger Zone Action Card */}
      <motion.div
        whileHover={{ scale: 1.01, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleOpenModal}
        className="relative w-full overflow-hidden rounded-2xl cursor-pointer"
      >
        {/* Border Glow for Danger Zone */}
        <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-red-500/20 via-rose-500/30 to-red-500/20 opacity-50" />

        {/* Button Body - Glassmorphic with Red/Rose Accent */}
        <div className="relative z-10 flex items-center justify-between gap-3 rounded-2xl border border-red-200/50 bg-rose-50/10 px-6 py-5 backdrop-blur-md transition-colors hover:bg-rose-50/20 group">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100/80 border border-rose-200/40 text-rose-600 transition-transform group-hover:scale-105">
              <Trash2 className="h-5 w-5" />
            </div>
            <div className="text-left">
              <span
                className="block text-sm font-bold text-rose-950"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                Delete Account Permanently
              </span>
              <span className="block text-[11px] font-medium text-rose-700/60 mt-0.5">
                This action is irreversible and deletes all your data.
              </span>
            </div>
          </div>
          <div className="flex h-8 items-center justify-center rounded-lg border border-red-200/60 bg-white/80 px-3 text-xs font-bold text-rose-600 shadow-sm transition-colors group-hover:bg-rose-600 group-hover:text-white">
            Delete
          </div>
        </div>
      </motion.div>

      {/* Account Deletion Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="show"
            exit="hidden"
            className="fixed inset-0 z-50 flex items-center justify-center px-4 backdrop-blur-md bg-black/40"
          >
            <motion.div
              variants={modalVariants}
              className="relative w-full max-w-md rounded-3xl border border-red-100 bg-white p-8 shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 border border-rose-100 text-rose-600">
                  <AlertTriangle className="h-6 w-6 animate-pulse" />
                </div>
                <div>
                  <h2
                    className="text-lg font-bold text-rose-950"
                    style={{ fontFamily: "'Sora', sans-serif" }}
                  >
                    Delete Account
                  </h2>
                  <span className="text-xs text-rose-600 font-bold uppercase tracking-wider">
                    Irreversible Action
                  </span>
                </div>
              </div>

              {/* Error Alert Panel */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700 font-medium leading-relaxed"
                >
                  {error}
                </motion.div>
              )}

              {stage === "request" ? (
                /* Stage 1: Warning & Send Verification Code */
                <>
                  <div className="mb-6 rounded-xl bg-rose-50/50 border border-rose-100 p-4">
                    <p className="text-sm text-rose-900/80 leading-relaxed">
                      Are you absolutely sure you want to delete your account? Proceeding will immediately erase:
                    </p>
                    <ul className="list-disc list-inside mt-2 text-xs text-rose-800/70 space-y-1 pl-1">
                      <li>Your personal profile settings</li>
                      <li>Active bookings and sessions</li>
                      <li>Workout histories and metrics</li>
                      <li>All secure chat conversations</li>
                    </ul>
                  </div>

                  <p className="text-xs text-[#2C2E2C]/50 mb-6 leading-relaxed">
                    To prevent accidental deletion, we must send a 6-digit confirmation code to your registered email address.
                  </p>

                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: isSending ? 1 : 1.02 }}
                      whileTap={{ scale: isSending ? 1 : 0.98 }}
                      onClick={handleRequestCode}
                      disabled={isSending}
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white py-3.5 text-sm font-bold shadow-lg shadow-rose-100 transition-colors disabled:opacity-50"
                    >
                      {isSending ? (
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      ) : (
                        <>
                          <SendHorizonal className="h-4 w-4" />
                          Send Verification Code
                        </>
                      )}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02, backgroundColor: "#F7F9F7" }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCancel}
                      disabled={isSending}
                      className="px-5 py-3.5 rounded-xl border border-[#DDE1DF] bg-white text-sm font-bold text-[#2C2E2C]/60 hover:text-[#2C2E2C] transition-colors"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </>
              ) : (
                /* Stage 2: Code Verification Input & Confirm Delete */
                <>
                  <div className="mb-6 rounded-xl bg-[#F7F9F7] border border-[#DDE1DF]/40 p-4">
                    <p className="text-sm text-[#2C2E2C]/80 leading-relaxed">
                      We have sent a 6-digit verification code to your email. Please enter it below to confirm and finalize account deletion.
                    </p>
                  </div>

                  <div className="relative mb-6">
                    <input
                      type="text"
                      maxLength={6}
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="Enter 6-digit code"
                      disabled={isSending}
                      className="w-full text-center tracking-[0.5em] font-mono text-lg rounded-xl border border-[#DDE1DF] bg-[#F7F9F7] px-4 py-3 text-[#2C2E2C] outline-none focus:border-rose-500/50 transition-all disabled:opacity-50 placeholder:tracking-normal placeholder:font-sans placeholder:text-sm"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !isSending) handleConfirmDelete();
                      }}
                    />
                  </div>

                  <div className="flex flex-col gap-3">
                    <motion.button
                      whileHover={{ scale: isSending ? 1 : 1.02 }}
                      whileTap={{ scale: isSending ? 1 : 0.98 }}
                      onClick={handleConfirmDelete}
                      disabled={isSending || code.length < 6}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 text-white py-3.5 text-sm font-bold shadow-lg shadow-red-100 transition-colors disabled:opacity-50"
                    >
                      {isSending ? (
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4" />
                          Delete Account Permanently
                        </>
                      )}
                    </motion.button>

                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02, backgroundColor: "#F7F9F7" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setStage("request")}
                        disabled={isSending}
                        className="flex-1 py-3 rounded-xl border border-[#DDE1DF] bg-white text-xs font-bold text-[#2C2E2C]/50 hover:text-[#2C2E2C]/80 text-center transition-colors"
                      >
                        Resend Code
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02, backgroundColor: "#F7F9F7" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCancel}
                        disabled={isSending}
                        className="flex-1 py-3 rounded-xl border border-[#DDE1DF] bg-white text-xs font-bold text-[#2C2E2C]/50 hover:text-[#2C2E2C]/80 text-center transition-colors"
                      >
                        Cancel
                      </motion.button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
