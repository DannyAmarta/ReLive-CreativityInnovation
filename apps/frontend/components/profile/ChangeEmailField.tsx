"use client";

import { useEmailChange } from "@/hooks/useEmailChange";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Edit3, Shield, Eye, EyeOff, SendHorizonal, X, AlertTriangle } from "lucide-react";
import { overlayVariants, modalVariants } from "./profile-animations";

export function ChangeEmailField({ 
    currentEmail, 
    onToast 
}: {
    currentEmail: string,
    onToast: (msg: string, kind: "success" | "error" | "info") => void;
}) {
  // 1. Plug in the brain
  const {
    draftEmail, setDraftEmail,
    editing, setEditing,
    changeState,
    password, setPassword,
    showPassword, setShowPassword,
    inputRef,
    isSending,
    handleEditSave,
    handleCancel,
    handlePasswordConfirm,
    handleOverwriteConfirm
  } = useEmailChange(currentEmail, onToast);

  return (
    <>
      {/* ── Field ── */}
      <motion.div
        layout
        className="group relative rounded-2xl border border-white/8 bg-white/5 p-5 backdrop-blur-sm"
        animate={{ borderColor: editing ? "rgba(139,92,246,0.35)" : "rgba(255,255,255,0.08)" }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 mb-2">
            <Mail className="h-4 w-4 text-violet-400 flex-shrink-0" />
            <span className="text-xs font-semibold uppercase tracking-widest text-white/40">Email</span>
            {changeState.phase === "sent" && (
              <span className="text-xs font-semibold text-amber-400 tracking-wide animate-pulse">
                · Verify your inbox
              </span>
            )}
          </div>
          {!editing && changeState.phase !== "sent" && (
            <motion.button
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => setEditing(true)}
              className="opacity-0 group-hover:opacity-100 rounded-full border border-white/15 bg-white/10 p-1.5 text-white/60 transition-all hover:text-white hover:border-violet-400/40"
              aria-label="Change email"
            >
              <Edit3 className="h-3.5 w-3.5" />
            </motion.button>
          )}
        </div>
        <AnimatePresence mode="wait">
          {editing ? (
            <motion.div
              key="edit"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              <input
                ref={inputRef}
                type="email"
                value={draftEmail}
                onChange={(e) => setDraftEmail(e.target.value)}
                placeholder="Enter new email..."
                className="w-full rounded-xl border border-violet-500/40 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-violet-400/70 focus:ring-2 focus:ring-violet-400/20 placeholder:text-white/25 transition-all"
                style={{ fontFamily: "'Nunito', sans-serif" }}
                onKeyDown={(e) => { if (e.key === "Enter") handleEditSave(); if (e.key === "Escape") handleCancel(); }}
              />
              <div className="mt-2 flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  onClick={handleEditSave}
                  className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-500 transition-colors"
                >
                  <SendHorizonal className="h-3 w-3" /> Continue
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  onClick={handleCancel}
                  className="flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/60 hover:text-white transition-colors"
                >
                  <X className="h-3 w-3" /> Cancel
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.p
              key="view"
              layout
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.18 }}
              className="text-sm leading-relaxed text-white/80"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              {currentEmail}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Password Confirmation Modal ── */}
      <AnimatePresence>
        {(changeState.phase === "password_confirm" || isSending) && (
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="show"
            exit="hidden"
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ backdropFilter: "blur(8px)", backgroundColor: "rgba(0,0,0,0.65)" }}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="show"
              exit="hidden"
              className="relative w-full max-w-md rounded-3xl border border-violet-500/20 bg-[#080815]/95 p-8 shadow-2xl"
              style={{ boxShadow: "0 0 0 1px rgba(139,92,246,0.12), 0 40px 80px rgba(0,0,0,0.8)" }}
            >
              {/* corner glow */}
              <div className="pointer-events-none absolute -top-16 -right-16 h-32 w-32 rounded-full blur-3xl" style={{ background: "rgba(139,92,246,0.3)" }} />
              <div className="flex items-center gap-3 mb-1">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-500/10 border border-violet-500/20">
                  <Shield className="h-5 w-5 text-violet-400" />
                </div>
                <h2 className="text-lg font-bold text-white" style={{ fontFamily: "'Sora', sans-serif" }}>
                  Confirm your identity
                </h2>
              </div>
              <p className="text-sm text-white/45 mb-5 leading-relaxed">
                To change your email to <span className="text-cyan-400 font-semibold">{changeState.phase === "password_confirm" ? changeState.newEmail : ""}</span>, please confirm your current password.
              </p>
              <div className="relative mb-4">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Current password"
                  disabled={isSending}
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 pr-10 text-sm text-white outline-none focus:border-violet-400/60 focus:ring-2 focus:ring-violet-400/15 placeholder:text-white/25 transition-all disabled:opacity-50"
                  onKeyDown={(e) => { if (e.key === "Enter" && !isSending) handlePasswordConfirm(); }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-white/25 mb-6">
                Google OAuth users can leave this blank.
              </p>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: isSending ? 1 : 1.02 }}
                  whileTap={{ scale: isSending ? 1 : 0.97 }}
                  onClick={handlePasswordConfirm}
                  disabled={isSending}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-sm font-bold text-white disabled:opacity-60 transition-opacity"
                >
                  {isSending ? (
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <>
                      <SendHorizonal className="h-4 w-4" />
                      Send Verification
                    </>
                  )}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleCancel}
                  disabled={isSending}
                  className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white/60 hover:text-white transition-colors disabled:opacity-40"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Overwrite Confirmation Modal ── */}
      <AnimatePresence>
        {changeState.phase === "overwrite_confirm" && (
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="show"
            exit="hidden"
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ backdropFilter: "blur(8px)", backgroundColor: "rgba(0,0,0,0.7)" }}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="show"
              exit="hidden"
              className="relative w-full max-w-md rounded-3xl border border-rose-500/25 bg-[#080815]/95 p-8 shadow-2xl"
              style={{ boxShadow: "0 0 0 1px rgba(236,72,153,0.15), 0 40px 80px rgba(0,0,0,0.8)" }}
            >
              <div className="pointer-events-none absolute -top-12 -right-12 h-28 w-28 rounded-full blur-3xl" style={{ background: "rgba(236,72,153,0.28)" }} />
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20">
                  <AlertTriangle className="h-5 w-5 text-rose-400" />
                </div>
                <h2 className="text-lg font-bold text-white" style={{ fontFamily: "'Sora', sans-serif" }}>
                  Account conflict detected
                </h2>
              </div>
              <div className="mb-5 rounded-xl border border-rose-500/20 bg-rose-500/5 p-4">
                <p className="text-sm text-white/60 leading-relaxed">
                  The email <span className="text-rose-300 font-semibold">{changeState.newEmail}</span> is already linked to an active ReLive account.
                </p>
                <p className="mt-2 text-sm font-semibold text-rose-300">
                  ⚠ Proceeding will permanently delete that account. This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleOverwriteConfirm}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 py-3 text-sm font-bold text-white"
                >
                  <AlertTriangle className="h-4 w-4" />
                  Confirm & Delete Other Account
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleCancel}
                  className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white/60 hover:text-white transition-colors"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}