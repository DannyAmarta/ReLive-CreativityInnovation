"use client";

import { useEmailChange } from "@/hooks/features/profile/useEmailChange";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Edit3, Shield, Eye, EyeOff, SendHorizonal, X, AlertTriangle } from "lucide-react";
import { overlayVariants, modalVariants } from "../logic/profile.motions";

export function AccountEmailField({ 
    currentEmail, 
    onToast 
}: {
    currentEmail: string,
    onToast: (msg: string, kind: "success" | "error" | "info") => void;
}) {
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
      {/* ── Field Container ── */}
      <motion.div
        layout
        className="group relative rounded-2xl border border-[#DDE1DF]/60 bg-white p-5 shadow-sm transition-all"
        animate={{ 
          borderColor: editing ? "#2D5A27" : "#DDE1DF",
          boxShadow: editing ? "0 10px 25px -5px rgba(45, 90, 39, 0.1)" : "0 4px 12px rgba(0, 0, 0, 0.03)"
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 mb-2">
            <Mail className="h-4 w-4 text-[#2D5A27] flex-shrink-0" />
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#2C2E2C]/40">Email</span>
            {changeState.phase === "sent" && (
              <span className="text-[10px] font-bold text-amber-600 tracking-wide animate-pulse">
                · Verify your inbox
              </span>
            )}
          </div>
          {!editing && changeState.phase !== "sent" && (
            <motion.button
              whileHover={{ scale: 1.1, backgroundColor: "#F7F9F7" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setEditing(true)}
              className="opacity-0 group-hover:opacity-100 rounded-lg border border-[#DDE1DF] bg-white p-1.5 text-[#2D5A27] transition-all hover:border-[#2D5A27]/30"
            >
              <Edit3 className="h-3.5 w-3.5" />
            </motion.button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {editing ? (
            <motion.div
              key="edit"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <input
                ref={inputRef}
                type="email"
                value={draftEmail}
                onChange={(e) => setDraftEmail(e.target.value)}
                placeholder="Enter new email..."
                className="w-full rounded-xl border border-[#DDE1DF] bg-[#F7F9F7] px-3 py-2 text-sm text-[#2C2E2C] outline-none focus:border-[#2D5A27]/50 focus:ring-4 focus:ring-[#2D5A27]/5 placeholder:text-[#2C2E2C]/20 transition-all"
                style={{ fontFamily: "'Sora', sans-serif" }}
                onKeyDown={(e) => { if (e.key === "Enter") handleEditSave(); if (e.key === "Escape") handleCancel(); }}
              />
              <div className="mt-3 flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleEditSave}
                  className="flex items-center gap-1.5 rounded-lg bg-[#071407] px-4 py-1.5 text-xs font-bold text-white transition-colors"
                >
                  <SendHorizonal className="h-3.5 w-3.5" /> Continue
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02, backgroundColor: "#F7F9F7" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCancel}
                  className="flex items-center gap-1.5 rounded-lg border border-[#DDE1DF] bg-white px-4 py-1.5 text-xs font-bold text-[#2C2E2C]/60 hover:text-[#2C2E2C]"
                >
                  <X className="h-3.5 w-3.5" /> Cancel
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.p
              key="view"
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm font-medium text-[#2C2E2C]"
              style={{ fontFamily: "'Sora', sans-serif" }}
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
            className="fixed inset-0 z-50 flex items-center justify-center px-4 backdrop-blur-md bg-black/40"
          >
            <motion.div
              variants={modalVariants}
              className="relative w-full max-w-md rounded-3xl border border-[#DDE1DF] bg-white p-8 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-1">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#C5E1A5]/30 border border-[#C5E1A5]/50">
                  <Shield className="h-5 w-5 text-[#2D5A27]" />
                </div>
                <h2 className="text-lg font-bold text-[#2C2E2C]" style={{ fontFamily: "'Sora', sans-serif" }}>
                  Confirm your identity
                </h2>
              </div>
              <p className="text-sm text-[#2C2E2C]/50 mb-6 leading-relaxed">
                To change your email to <span className="text-[#2D5A27] font-bold">{changeState.phase === "password_confirm" ? changeState.newEmail : ""}</span>, please confirm your current password.
              </p>
              
              <div className="relative mb-4">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Current password"
                  disabled={isSending}
                  className="w-full rounded-xl border border-[#DDE1DF] bg-[#F7F9F7] px-4 py-3 pr-10 text-sm text-[#2C2E2C] outline-none focus:border-[#2D5A27]/50 transition-all disabled:opacity-50"
                  onKeyDown={(e) => { if (e.key === "Enter" && !isSending) handlePasswordConfirm(); }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2C2E2C]/30 hover:text-[#2C2E2C]/70"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: isSending ? 1 : 1.02 }}
                  whileTap={{ scale: isSending ? 1 : 0.98 }}
                  onClick={handlePasswordConfirm}
                  disabled={isSending}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#071407] py-3 text-sm font-bold text-white transition-opacity"
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
                  whileHover={{ scale: 1.02, backgroundColor: "#F7F9F7" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCancel}
                  className="px-5 py-3 rounded-xl border border-[#DDE1DF] bg-white text-sm font-bold text-[#2C2E2C]/60"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Overwrite Confirmation Modal (Danger State) ── */}
      <AnimatePresence>
        {changeState.phase === "overwrite_confirm" && (
          <motion.div
            variants={overlayVariants}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 backdrop-blur-md bg-black/40"
          >
            <motion.div
              variants={modalVariants}
              className="relative w-full max-w-md rounded-3xl border border-rose-100 bg-white p-8 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 border border-rose-100">
                  <AlertTriangle className="h-5 w-5 text-rose-600" />
                </div>
                <h2 className="text-lg font-bold text-rose-950" style={{ fontFamily: "'Sora', sans-serif" }}>
                  Account conflict detected
                </h2>
              </div>
              <div className="mb-6 rounded-xl bg-rose-50/50 border border-rose-100 p-4">
                <p className="text-sm text-rose-900/70 leading-relaxed">
                  The email <span className="text-rose-700 font-bold">{changeState.newEmail}</span> is already linked to an active ReLive account.
                </p>
                <p className="mt-3 text-xs font-bold text-rose-700 uppercase tracking-tight">
                  ⚠ Proceeding will permanently delete that account.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleOverwriteConfirm}
                  className="w-full py-3 rounded-xl bg-rose-600 text-sm font-bold text-white hover:bg-rose-700 shadow-lg shadow-rose-200 transition-colors"
                >
                  Confirm & Delete Other Account
                </motion.button>
                <motion.button
                  onClick={handleCancel}
                  className="w-full py-3 rounded-xl border border-[#DDE1DF] bg-white text-sm font-bold text-[#2C2E2C]/60"
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
