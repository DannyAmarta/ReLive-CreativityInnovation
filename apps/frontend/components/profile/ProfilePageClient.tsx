"use client";

import { useState } from "react";
import {
  motion,
  AnimatePresence
} from "framer-motion";
import Link from "next/link";
import { OpenRouterConnectionCard } from "@/components/profile/OpenRouterConnectionCard";
import {
  User,
  FileText,
  Calendar,
  Shield,
  Sparkles,
  Activity
} from "lucide-react";

/* ── Types ── */
import { ProfilePageClientProps } from "@/types/profile";

/* ── Utility ── */
import { formatDate } from "@/lib/utils";


/* ── Profile update API helper ── */
import { updateProfileViaProxy } from "@/lib/actions/profile";

/* ── Glowing Toast ── */
import { Toast } from "../ui/profile/Toast";

/* ── Framer variants ── --> For this Page Only*/ 
import { pageVariants, itemVariants, overlayVariants, modalVariants } from "./profile-animations";

/* ── Magnetic spotlight card ── */
import { SpotlightCard } from "../ui/profile/SpotlightCard";

/* ── Animated background orbs with parallax ── */
import { BackgroundOrbs } from "../ui/profile/BackgroundOrbs";

/* ── Floating particles ── */
import { FloatingParticles } from "../ui/profile/Particles";

/* ── Avatar ── */
import { AvatarDisplay } from "./AvatarDisplay";

/* ── Animated count-up stat badge ── */
import { StatBadge } from "../ui/profile/StatBadge";

/* ── Shimmer badge ── */
import { SkillBadge } from "../ui/profile/SkillBadge";

/* ── Editable field with layout morph + async save ── */
import { EditableField } from "./EditableField";

/* ── Secure change email field ── */
import { ChangeEmailField } from "./ChangeEmailField";

/* ── Glowing Change Password button ── */
import { ChangePasswordButton } from "./ChangePasswordButton";

/* ── Section label ── */
import { SectionLabel } from "../ui/profile/SectionLabel";

/* ── Main export ── */
export function ProfilePageClient({ user: initialUser }: ProfilePageClientProps) {
  const [user, setUser] = useState(initialUser);
  const [renderedAt] = useState(() => Date.now());
  const [toast, setToast] = useState<{ msg: string; kind: "success" | "error" | "info" } | null>(null);

  function handleSave(field: "name" | "bio") {
    return async (value: string) => {
      try {
        const updated = await updateProfileViaProxy({ [field]: value });
        setUser((u) => ({ ...u, name: updated.name ?? u.name, bio: updated.bio ?? u.bio }));
        setToast({ msg: `${field === "name" ? "Name" : "Bio"} updated successfully!`, kind: "success" });
      } catch (e: unknown) {
        setToast({ msg: e instanceof Error ? e.message : "Failed to save. Please try again.", kind: "error" });
      }
    };
  }

  const memberDays = Math.floor((renderedAt - user.createdAt.getTime()) / (1000 * 60 * 60 * 24));
  const currentYear = new Date(renderedAt).getFullYear();

  return (
    <div
      className="relative min-h-screen overflow-x-hidden"
      style={{ background: "linear-gradient(160deg, #04040b 0%, #060412 50%, #04040b 100%)", fontFamily: "'Nunito', sans-serif" }}
    >
      <BackgroundOrbs />
      <FloatingParticles />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <Toast
            key="toast"
            message={toast.msg}
            kind={toast.kind}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="show"
        className="relative z-10"
      >
        {/* ── Nav ── */}
        <motion.nav
          variants={itemVariants}
          className="flex items-center justify-between px-6 py-5 sm:px-10"
        >
          <Link
            href="/"
            className="text-sm font-semibold text-white/40 hover:text-white/80 transition-colors"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            ← Back
          </Link>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md"
          >
            <Sparkles className="h-3.5 w-3.5 text-violet-400" />
            <span className="text-xs font-semibold text-white/60" style={{ fontFamily: "'Sora', sans-serif" }}>
              ReLive Profile
            </span>
          </motion.div>
        </motion.nav>

        {/* ── Content ── */}
        <main className="mx-auto max-w-2xl px-4 pb-24 sm:px-6">

          {/* ── Hero card ── */}
          <motion.div variants={itemVariants}>
            <SpotlightCard
              className="relative mb-6 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-2xl"
              style={{
                boxShadow: "0 0 0 1px rgba(255,255,255,0.05), 0 40px 80px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.06)",
              }}
            >
              <div
                className="pointer-events-none absolute inset-0 rounded-3xl"
                style={{
                  background: "linear-gradient(115deg, transparent 25%, rgba(255,255,255,0.025) 50%, transparent 75%)",
                  backgroundSize: "220% 100%",
                  animation: "shimmer 7s linear infinite",
                }}
              />
              <div className="pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full blur-3xl" style={{ background: "rgba(124,58,237,0.3)" }} />
              <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full blur-2xl" style={{ background: "rgba(6,182,212,0.18)" }} />

              <div className="relative flex flex-col items-center gap-5 sm:flex-row sm:items-start sm:gap-8">
                <motion.div
                  initial={{ scale: 0.6, opacity: 0, rotate: -10 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  transition={{ duration: 0.7, delay: 0.15, type: "spring", stiffness: 200, damping: 18 }}
                >
                  <AvatarDisplay name={user.name} avatar={user.avatar} />
                </motion.div>

                <div className="flex-1 text-center sm:text-left">
                  <motion.h1
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.55, delay: 0.28 }}
                    className="text-3xl font-bold text-white"
                    style={{ fontFamily: "'Sora', sans-serif" }}
                  >
                    {user.name}
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.36 }}
                    className="mt-1 text-sm text-white/40"
                  >
                    {user.email}
                  </motion.p>
                  {user.bio && (
                    <motion.p
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.44 }}
                      className="mt-3 text-sm leading-relaxed text-white/60 max-w-sm"
                    >
                      {user.bio}
                    </motion.p>
                  )}

                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.52 }}
                    className="mt-4 flex flex-wrap gap-2 justify-center sm:justify-start"
                  >
                    {["Macro Tracker", "Fitness Fan", "Explorer"].map((tag) => (
                      <SkillBadge key={tag} label={tag} />
                    ))}
                  </motion.div>
                </div>
              </div>
            </SpotlightCard>
          </motion.div>

          {/* ── Stats row ── */}
          <motion.div
            variants={itemVariants}
            className="mb-6 grid grid-cols-3 gap-3"
          >
            <StatBadge icon={Calendar} label="Member days" value={memberDays} />
            <StatBadge icon={Activity} label="Foods tracked" value={48} />
            <StatBadge icon={Shield} label="Streak" value={7} suffix="d" />
          </motion.div>

          {/* ── Edit profile section ── */}
          <motion.div variants={itemVariants}>
            <SpotlightCard
              className="relative mb-6 space-y-3 rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl"
              style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)" }}
            >
              <SectionLabel>Profile Information</SectionLabel>

              <EditableField label="Display Name" icon={User} value={user.name} placeholder="Enter your name" onSave={handleSave("name")} />

              {/* Secure email change (replaces simple EditableField for email) */}
              <ChangeEmailField
                currentEmail={user.email}
                onToast={(msg, kind) => setToast({ msg, kind })}
              />

              <EditableField label="Bio" icon={FileText} value={user.bio ?? ""} multiline placeholder="Write something about yourself…" onSave={handleSave("bio")} />

              {/* Read-only member since */}
              <div className="rounded-2xl border border-white/8 bg-white/5 p-5">
                <div className="flex items-center gap-2.5 mb-2">
                  <Calendar className="h-4 w-4 text-violet-400" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-white/40">Member Since</span>
                </div>
                <p className="text-sm text-white/80">{formatDate(user.createdAt)}</p>
              </div>
            </SpotlightCard>
          </motion.div>

          {/* ── Security section ── */}
          <motion.div variants={itemVariants}>
            <SpotlightCard
              className="relative rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl"
              style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)" }}
            >
              <SectionLabel>Security</SectionLabel>
              <p className="mb-4 text-xs text-white/30 leading-relaxed">
                Manage your account security settings. Changing your password will send you to a password reset flow.
              </p>
              <div className="mb-4">
                <OpenRouterConnectionCard
                  isConnected={user.hasOpenRouterConnection}
                  connectedAt={user.openRouterConnectedAt}
                  keyLabel={user.openRouterKeyLabel}
                  onToast={(msg, kind) => setToast({ msg, kind })}
                />
              </div>
              <ChangePasswordButton />
            </SpotlightCard>
          </motion.div>

          {/* ── Footer ── */}
          <motion.p
            variants={itemVariants}
            className="mt-10 text-center text-xs text-white/20"
          >
            ReLive · Your creative fitness journey · {currentYear}
          </motion.p>
        </main>
      </motion.div>
    </div>
  );
}
