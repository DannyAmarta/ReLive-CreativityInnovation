"use client";

import { useState } from "react";
import {
  motion,
  AnimatePresence
} from "framer-motion";
import Link from "next/link";
import { IntegrationOpenRouter } from "@/components/profile/integrations/IntegrationOpenRouter";
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
import { pageVariants, itemVariants, overlayVariants, modalVariants } from "./logic/profile.motions";

/* ── Magnetic spotlight card ── */
import { SpotlightCard } from "../ui/profile/SpotlightCard";

/* ── Animated background orbs with parallax ── */
import { BackgroundOrbs } from "../ui/profile/BackgroundOrbs";

/* ── Floating particles ── */
import { FloatingParticles } from "../ui/profile/Particles";

/* ── Avatar ── */
import { ProfileAvatar } from "./components/ProfileAvatar";

/* ── Animated count-up stat badge ── */
import { StatBadge } from "../ui/profile/StatBadge";

/* ── Shimmer badge ── */
import { SkillBadge } from "../ui/profile/SkillBadge";

/* ── Vitality card ── */
import { ProfileVitality } from "./sections/ProfileVitality";

/* ── Health goals card ── */
import { ProfileHealthGoals } from "./sections/ProfileHealthGoals";

/* ── Achievements card ── */
import { ProfileAchievements } from "./sections/ProfileAchievements";

/* ── Editable field with layout morph + async save ── */
import { UIEditableField } from "./components/UIEditableField";

/* ── Secure change email field ── */
import { AccountEmailField } from "./components/AccountEmailField";

/* ── Glowing Change Password button ── */
import { AccountPasswordAction } from "./components/AccountPasswordAction";

/* ── Permanent Account Deletion button ── */
import { AccountDeletionAction } from "./components/AccountDeletionAction";

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
      style={{ 
        background: "#F7F9F7", // The soft off-white from your reference //F9F9F7 for white
        fontFamily: "'Inter', sans-serif" // Reference uses Inter/Manrope, not Nunito
      }}
    >
      {/* <BackgroundOrbs />
      <FloatingParticles /> */}

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
            href={user.role === "USER" ? "/client" : "/trainer"}
            className="text-sm font-semibold text-[#2C2E2C]/50 hover:text-[#2C2E2C] transition-colors"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            ← Back to Dashboard
          </Link>
          <motion.div
            whileHover={{ scale: 1.05, y: -1 }}
            className="flex items-center gap-2 rounded-full border border-[#DDE1DF] bg-white px-4 py-2 shadow-sm"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#2D5A27]" />
            
            <span 
              className="text-xs font-bold text-[#2C2E2C]/60" 
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              ReLive Profile
            </span>
          </motion.div>
        </motion.nav>

        {/* ── Content ── */}
        <main className="mx-auto max-w-6xl px-4 pb-24 sm:px-6 space-y-6">

          {/* ── Hero Card ── */}
          <motion.div variants={itemVariants}>
            {/* <SpotlightCard
              className="relative mb-6 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-2xl"
              style={{
                boxShadow: "0 0 0 1px rgba(255,255,255,0.05), 0 40px 80px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.06)",
              }}
            > */}
              <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                
                <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                  <ProfileAvatar name={user.name} avatar={user.avatar} />
                  
                  {/* The Text Column */}
                  <div className="flex flex-col self-stretch justify-between py-2 text-center sm:text-left">
                    
                    {/* 1. Name Block */}
                    <div>
                      <motion.h1 
                        className="text-4xl font-bold text-[#2D5A27] tracking-tight"
                        style={{ fontFamily: "'Sora', sans-serif" }}
                      >
                        {user.name}
                      </motion.h1>
                    </div>

                    {/* 2. Member Since Block */}
                    <div className="flex flex-col gap-1">
                      {/* Color updated to Secondary Sage Green (#8BA888) */}
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: "#2C2E2C" }}>
                        Registry
                      </span>
                      <div className="inline-flex items-center gap-2 rounded-lg border border-[#2C2E2C] px-3 py-1.5 w-fit mx-auto sm:mx-0">
                          {/* Icon updated to Primary Green (#2D5A27) */}
                          <Calendar className="h-3 w-3" style={{ color: "#2C2E2C" }} />
                          <span className="text-xs font-medium text-[#2C2E2C]">
                            Member since {formatDate(user.createdAt)}
                          </span>
                      </div>
                    </div>
                    
                    {/* 3. Tags Block */}
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                      {["Macro Tracker", "Fitness Fan", "Explorer"].map((tag) => (
                        <SkillBadge key={tag} label={tag} />
                      ))}
                    </div>

                  </div>
                </div>

                {/* RIGHT: The Stats */}
                <div className="flex gap-3 justify-center lg:justify-end">
                  <StatBadge label="Member days" value={memberDays} />
                  <StatBadge label="Foods tracked" value={48} />
                  <StatBadge label="Streak" value={7} suffix="d" />
                </div>

              </div>
            {/* </SpotlightCard> */}
          </motion.div>

          {/* Vitality Card and Health Goals Card*/}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          <div className="lg:col-span-1 h-full">
            <ProfileVitality percentage={75} activitiesCount={6} />
          </div>

          <div className="lg:col-span-2 h-full">
            <ProfileHealthGoals />
          </div>
        </div>

        {/* ── Achievements Section ── */}
        {/* Added mt-6 (or mt-8) to create the gap you requested */}
        <div>
          <ProfileAchievements />
        </div>

          {/* ── Edit Profile Section ── */}
          <motion.div variants={itemVariants}>
            <div
              className="relative rounded-3xl border border-[#DDE1DF]/60 bg-[#F7F9F7] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
            >
              <SectionLabel>
                <span className="text-[#2D5A27]">
                  Profile Information
                </span>
              </SectionLabel>

              <div className="space-y-4 mt-6">
                <UIEditableField 
                  label="Display Name" 
                  icon={User} 
                  value={user.name} 
                  placeholder="Enter your name" 
                  onSave={handleSave("name")} 
                />

                <AccountEmailField
                  currentEmail={user.email}
                  onToast={(msg, kind) => setToast({ msg, kind })}
                />

                <UIEditableField 
                  label="Bio" 
                  icon={FileText} 
                  value={user.bio ?? ""} 
                  multiline 
                  placeholder="Write something about yourself…" 
                  onSave={handleSave("bio")} 
                />

                {/* Read-only member since: Updated to match card style */}
                <div className="rounded-2xl border border-[#DDE1DF]/40 bg-white/50 p-5">
                  <div className="flex items-center gap-2.5 mb-2">
                    <Calendar className="h-4 w-4 text-[#2D5A27]" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#2C2E2C]/40">Member Since</span>
                  </div>
                  <p className="text-sm font-medium text-[#2C2E2C]">{formatDate(user.createdAt)}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Security Section ── */}
          <motion.div variants={itemVariants}>
            <div
              className="relative rounded-3xl border border-[#DDE1DF]/60 bg-[#F7F9F7] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
            >
              <SectionLabel>
                <span className="text-[#2D5A27]">
                  Security
                </span>
              </SectionLabel>
              <p className="mb-6 mt-2 text-xs text-[#2C2E2C]/50 leading-relaxed max-w-md">
                Manage your account security settings. Changing your password will initiate a secure reset flow sent to your registered email.
              </p>
              
              <div className="space-y-4">
                <IntegrationOpenRouter
                  isConnected={user.hasOpenRouterConnection}
                  connectedAt={user.openRouterConnectedAt}
                  keyLabel={user.openRouterKeyLabel}
                  onToast={(msg, kind) => setToast({ msg, kind })}
                />
                <AccountPasswordAction />
              </div>
            </div>
          </motion.div>

          {/* ── Danger Zone Section ── */}
          <motion.div variants={itemVariants}>
            <div
              className="relative rounded-3xl border border-red-200 bg-red-50/5 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.01)]"
            >
              <SectionLabel>
                <span className="text-red-600">
                  Danger Zone
                </span>
              </SectionLabel>
              <p className="mb-6 mt-2 text-xs text-[#2C2E2C]/50 leading-relaxed max-w-md">
                Irreversible actions for your ReLive account. Once you delete your account, there is no going back.
              </p>
              
              <div className="space-y-4">
                <AccountDeletionAction onToast={(msg, kind) => setToast({ msg, kind })} />
              </div>
            </div>
          </motion.div>

          {/* ── Footer ── */}
          <motion.p
            variants={itemVariants}
            className="mt-16 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-[#2C2E2C]/20"
          >
            ReLive · Your creative fitness journey · {currentYear}
          </motion.p>
        </main>
      </motion.div>
    </div>
  );
}
