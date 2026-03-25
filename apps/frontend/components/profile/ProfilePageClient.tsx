"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
} from "framer-motion";
import Link from "next/link";
import {
  User,
  Mail,
  FileText,
  Calendar,
  Shield,
  Lock,
  Edit3,
  Check,
  X,
  Sparkles,
  Zap,
  Award,
  Activity,
  AlertTriangle,
  SendHorizonal,
  Eye,
  EyeOff,
} from "lucide-react";

/* ── Types ── */
type ProfileUser = {
  id: number;
  name: string;
  email: string;
  bio?: string;
  avatar: string | null;
  createdAt: Date;
};
type ProfilePageClientProps = { user: ProfileUser };

/* ── Utility ── */
function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}
function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

/* ── Secure email change API helper ── */
async function requestEmailChangeViaProxy(body: {
  newEmail: string;
  currentPassword?: string;
  overwriteAlternate?: boolean;
}): Promise<{ status: string; message: string }> {
  const res = await fetch("/api/email-change", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (json?.error) throw new Error(json.error);
  return json as { status: string; message: string };
}

/* ── Profile update API helper ── */
async function updateProfileViaProxy(body: {
  name?: string;
  bio?: string;
}): Promise<{ id: number; name: string; bio?: string; email: string }> {
  const res = await fetch("/api/update-profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (json?.error) throw new Error(json.error);
  return json;
}

/* ── Glowing Toast ── */
type ToastKind = "success" | "error" | "info";

const TOAST_CONFIG = {
  success: {
    bg: "rgba(4,120,87,0.18)",
    border: "rgba(16,185,129,0.35)",
    glow: "rgba(16,185,129,0.45)",
    bar: "from-emerald-400 to-teal-400",
    icon: "✓",
    iconBg: "rgba(16,185,129,0.2)",
    iconColor: "#34d399",
  },
  error: {
    bg: "rgba(127,29,29,0.18)",
    border: "rgba(239,68,68,0.35)",
    glow: "rgba(239,68,68,0.45)",
    bar: "from-red-400 to-rose-400",
    icon: "✕",
    iconBg: "rgba(239,68,68,0.2)",
    iconColor: "#f87171",
  },
  info: {
    bg: "rgba(49,10,101,0.22)",
    border: "rgba(139,92,246,0.35)",
    glow: "rgba(139,92,246,0.45)",
    bar: "from-violet-400 to-indigo-400",
    icon: "i",
    iconBg: "rgba(139,92,246,0.2)",
    iconColor: "#a78bfa",
  },
};

function Toast({
  message,
  kind,
  onClose,
}: {
  message: string;
  kind: ToastKind;
  onClose: () => void;
}) {
  const cfg = TOAST_CONFIG[kind];
  const DURATION = 4200;

  useEffect(() => {
    const t = setTimeout(onClose, DURATION);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 36, scale: 0.88 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9, filter: "blur(4px)" }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] overflow-hidden"
      style={{ maxWidth: "min(420px, 92vw)", width: "100%" }}
    >
      {/* Outer glow pulse */}
      <motion.div
        className="pointer-events-none absolute -inset-3 rounded-3xl"
        style={{
          background: `radial-gradient(ellipse at center, ${cfg.glow} 0%, transparent 70%)`,
          filter: "blur(12px)",
        }}
        animate={{ opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Card */}
      <div
        className="relative rounded-2xl px-4 py-3.5 backdrop-blur-2xl"
        style={{
          background: `linear-gradient(135deg, ${cfg.bg}, rgba(5,5,15,0.85))`,
          border: `1px solid ${cfg.border}`,
          boxShadow: `0 0 0 1px rgba(255,255,255,0.04), 0 20px 60px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)`,
        }}
      >
        {/* Inner shimmer */}
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{
            background:
              "linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.06) 50%, transparent 80%)",
            backgroundSize: "200% 100%",
            backgroundPositionX: "-100%",
          }}
          animate={{ backgroundPositionX: ["−100%", "200%"] }}
          transition={{ duration: 1.6, ease: "easeOut" }}
        />

        <div className="flex items-center gap-3">
          {/* Icon badge with pulse ring */}
          <div className="relative flex-shrink-0">
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ background: cfg.glow, filter: "blur(6px)" }}
              animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <div
              className="relative flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold"
              style={{
                background: cfg.iconBg,
                color: cfg.iconColor,
                border: `1px solid ${cfg.border}`,
              }}
            >
              {cfg.icon}
            </div>
          </div>

          {/* Message */}
          <p
            className="flex-1 text-sm font-semibold text-white/90 leading-snug"
            style={{ fontFamily: "'Nunito', sans-serif" }}
          >
            {message}
          </p>

          {/* Close */}
          <motion.button
            whileHover={{ scale: 1.15, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="flex-shrink-0 rounded-full p-1 text-white/30 hover:text-white/80 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </motion.button>
        </div>

        {/* Progress bar */}
        <div className="mt-3 overflow-hidden rounded-full" style={{ height: 2, background: "rgba(255,255,255,0.06)" }}>
          <motion.div
            className={`h-full rounded-full bg-gradient-to-r ${cfg.bar}`}
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: DURATION / 1000, ease: "linear" }}
          />
        </div>
      </div>
    </motion.div>
  );
}

/* ── Framer variants ── */
const pageVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};
const overlayVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.22 } },
};
const modalVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] } },
};

/* ── Global cursor tracking ── */
function useMousePosition() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  useEffect(() => {
    const update = (e: MouseEvent) => { x.set(e.clientX); y.set(e.clientY); };
    window.addEventListener("mousemove", update);
    return () => window.removeEventListener("mousemove", update);
  }, [x, y]);
  return { x, y };
}

/* ── Magnetic spotlight card ── */
function SpotlightCard({
  children,
  className = "",
  style = {},
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    },
    [mouseX, mouseY]
  );

  const spotlight = useMotionTemplate`radial-gradient(260px circle at ${mouseX}px ${mouseY}px, rgba(139,92,246,0.12) 0%, transparent 80%)`;

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      className={className}
      style={style}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-3xl transition-opacity duration-300"
        style={{ background: spotlight, opacity: 0 }}
        whileHover={{ opacity: 1 }}
      />
      {children}
    </motion.div>
  );
}

/* ── Animated background orbs with parallax ── */
function BackgroundOrbs() {
  const { x, y } = useMousePosition();

  const ox = useSpring(useTransform(x, [0, window.innerWidth], [-20, 20]), { stiffness: 40, damping: 25 });
  const oy = useSpring(useTransform(y, [0, window.innerHeight], [-15, 15]), { stiffness: 40, damping: 25 });
  const ox2 = useSpring(useTransform(x, [0, window.innerWidth], [20, -20]), { stiffness: 30, damping: 20 });
  const oy2 = useSpring(useTransform(y, [0, window.innerHeight], [15, -15]), { stiffness: 30, damping: 20 });

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      <motion.div
        className="absolute -top-32 -left-32 h-[600px] w-[600px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(88,28,135,0.55) 0%, rgba(49,10,101,0.3) 50%, transparent 70%)",
          x: ox,
          y: oy,
        }}
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -top-20 -right-20 h-[450px] w-[450px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(6,182,212,0.28) 0%, rgba(14,116,144,0.15) 50%, transparent 70%)",
          x: ox2,
          y: oy2,
        }}
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <motion.div
        className="absolute top-1/2 -left-40 h-[380px] w-[380px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(139,92,246,0.22) 0%, transparent 70%)",
          x: ox,
          y: oy2,
        }}
        animate={{ x: [0, 35, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 4 }}
      />
      <motion.div
        className="absolute -bottom-20 -right-20 h-[480px] w-[480px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(236,72,153,0.22) 0%, rgba(168,85,247,0.1) 50%, transparent 70%)",
          x: ox2,
          y: oy,
        }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />
    </div>
  );
}

/* ── Floating particles ── */
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: (i * 37.3) % 100,
  size: 1 + (i % 4),
  delay: (i * 0.85) % 9,
  duration: 10 + (i % 8),
  opacity: 0.08 + (i % 5) * 0.06,
}));

function FloatingParticles() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-violet-300"
          style={{ width: p.size, height: p.size, left: `${p.x}%`, bottom: -8, opacity: 0 }}
          animate={{ y: [0, -900], opacity: [0, p.opacity, p.opacity, 0] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "linear" }}
        />
      ))}
    </div>
  );
}

/* ── Avatar ── */
function AvatarDisplay({ name, avatar }: { name: string; avatar: string | null }) {
  const initials = getInitials(name);
  return (
    <div className="relative">
      <motion.div
        className="absolute -inset-2 rounded-full"
        style={{ background: "conic-gradient(from 0deg, #7c3aed, #06b6d4, #ec4899, #7c3aed)", filter: "blur(6px)" }}
        animate={{ rotate: 360 }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute -inset-1 rounded-full"
        style={{ background: "conic-gradient(from 0deg, #7c3aed, #06b6d4, #ec4899, #7c3aed)" }}
        animate={{ rotate: 360 }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        whileHover={{ scale: 1.06 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="relative h-28 w-28 rounded-full overflow-hidden border-2 border-white/10 bg-[#0e0e1a]"
      >
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatar} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-600 to-cyan-500">
            <span className="text-3xl font-bold text-white" style={{ fontFamily: "'Sora', sans-serif" }}>
              {initials}
            </span>
          </div>
        )}
      </motion.div>
    </div>
  );
}

/* ── Animated count-up stat badge ── */
function StatBadge({
  icon: Icon,
  label,
  value,
  unit = "",
  suffix = "",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  unit?: string;
  suffix?: string;
}) {
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { stiffness: 60, damping: 20 });
  const display = useTransform(spring, (v) => `${unit}${Math.round(v)}${suffix}`);

  useEffect(() => {
    const t = setTimeout(() => motionVal.set(value), 200);
    return () => clearTimeout(t);
  }, [value, motionVal]);

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.06, y: -3 }}
      className="relative flex flex-col items-center gap-1 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-sm overflow-hidden"
    >
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.07) 50%, transparent 70%)",
          backgroundSize: "200% 100%",
          backgroundPositionX: "-100%",
        }}
        whileHover={{ backgroundPositionX: "200%", transition: { duration: 0.6, ease: "easeInOut" } }}
      />
      <Icon className="h-5 w-5 text-violet-400 mb-1" />
      <motion.span
        className="text-xl font-bold text-white"
        style={{ fontFamily: "'Sora', sans-serif" }}
      >
        {display}
      </motion.span>
      <span className="text-xs font-medium text-white/40 uppercase tracking-wider">{label}</span>
    </motion.div>
  );
}

/* ── Shimmer badge ── */
function SkillBadge({ label }: { label: string }) {
  return (
    <motion.span
      whileHover={{ scale: 1.08, y: -2 }}
      className="relative inline-flex items-center gap-1.5 overflow-hidden rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-300 cursor-default"
    >
      <motion.span
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{
          background: "linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.18) 50%, transparent 80%)",
          backgroundSize: "200% 100%",
          backgroundPositionX: "-100%",
        }}
        whileHover={{ backgroundPositionX: "200%", transition: { duration: 0.5, ease: "easeInOut" } }}
      />
      <Award className="h-3 w-3 relative z-10" />
      <span className="relative z-10">{label}</span>
    </motion.span>
  );
}

/* ── Editable field with layout morph + async save ── */
function EditableField({
  label,
  icon: Icon,
  value,
  multiline = false,
  placeholder,
  onSave,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  multiline?: boolean;
  placeholder?: string;
  onSave: (v: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  async function handleSave() {
    const trimmed = draft.trim() || value;
    setSaving(true);
    try {
      await onSave(trimmed);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }
  function handleCancel() { setDraft(value); setEditing(false); }

  return (
    <motion.div
      layout
      className="group relative rounded-2xl border border-white/8 bg-white/5 p-5 backdrop-blur-sm"
      style={{ borderColor: editing ? "rgba(139,92,246,0.35)" : undefined }}
      animate={{ borderColor: editing ? "rgba(139,92,246,0.35)" : "rgba(255,255,255,0.08)" }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 mb-2">
          <Icon className="h-4 w-4 text-violet-400 flex-shrink-0" />
          <span className="text-xs font-semibold uppercase tracking-widest text-white/40">{label}</span>
        </div>
        {!editing && (
          <motion.button
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setEditing(true)}
            className="opacity-0 group-hover:opacity-100 rounded-full border border-white/15 bg-white/10 p-1.5 text-white/60 transition-all hover:text-white hover:border-violet-400/40"
            aria-label={`Edit ${label}`}
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
            {multiline ? (
              <textarea
                ref={inputRef as React.Ref<HTMLTextAreaElement>}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={placeholder}
                rows={3}
                className="w-full resize-none rounded-xl border border-violet-500/40 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-violet-400/70 focus:ring-2 focus:ring-violet-400/20 placeholder:text-white/25 transition-all"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              />
            ) : (
              <input
                ref={inputRef as React.Ref<HTMLInputElement>}
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-xl border border-violet-500/40 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-violet-400/70 focus:ring-2 focus:ring-violet-400/20 placeholder:text-white/25 transition-all"
                style={{ fontFamily: "'Nunito', sans-serif" }}
                onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") handleCancel(); }}
              />
            )}
            <motion.div layout className="mt-2 flex gap-2">
              <motion.button
                whileHover={{ scale: saving ? 1 : 1.04 }}
                whileTap={{ scale: saving ? 1 : 0.96 }}
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-500 transition-colors disabled:opacity-60"
              >
                {saving ? (
                  <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <Check className="h-3 w-3" />
                )}
                {saving ? "Saving…" : "Save"}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={handleCancel}
                disabled={saving}
                className="flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/60 hover:text-white transition-colors disabled:opacity-40"
              >
                <X className="h-3 w-3" /> Cancel
              </motion.button>
            </motion.div>
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
            {value || <span className="italic text-white/25">{placeholder ?? "Not set"}</span>}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ── Secure change email field ── */
type EmailChangeState =
  | { phase: "idle" }
  | { phase: "password_confirm"; newEmail: string }
  | { phase: "overwrite_confirm"; newEmail: string; currentPassword: string }
  | { phase: "sending" }
  | { phase: "sent" };

function ChangeEmailField({
  currentEmail,
  onToast,
}: {
  currentEmail: string;
  onToast: (msg: string, kind: "success" | "error" | "info") => void;
}) {
  const [draftEmail, setDraftEmail] = useState(currentEmail);
  const [editing, setEditing] = useState(false);
  const [changeState, setChangeState] = useState<EmailChangeState>({ phase: "idle" });
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  function handleEditSave() {
    const trimmed = draftEmail.trim();
    if (!trimmed || trimmed === currentEmail) {
      setEditing(false);
      return;
    }
    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      onToast("Please enter a valid email address.", "error");
      return;
    }
    // Open password confirmation modal
    setChangeState({ phase: "password_confirm", newEmail: trimmed });
    setEditing(false);
  }

  function handleCancel() {
    setDraftEmail(currentEmail);
    setEditing(false);
    setChangeState({ phase: "idle" });
    setPassword("");
  }

  async function handlePasswordConfirm() {
    const state = changeState;
    if (state.phase !== "password_confirm") return;

    setChangeState({ phase: "sending" });

    try {
      const res = await requestEmailChangeViaProxy({
        newEmail: state.newEmail,
        currentPassword: password || undefined,
      });

      if (res.status === "ALTERNATE_ACCOUNT_EXISTS") {
        setChangeState({ phase: "overwrite_confirm", newEmail: state.newEmail, currentPassword: password });
      } else if (res.status === "VERIFICATION_SENT") {
        setChangeState({ phase: "sent" });
        onToast(res.message ?? "Verification email sent!", "success");
        setPassword("");
      } else {
        throw new Error(res.message ?? "Unknown response");
      }
    } catch (e: unknown) {
      setChangeState({ phase: "idle" });
      setPassword("");
      onToast(e instanceof Error ? e.message : "Something went wrong. Please try again.", "error");
    }
  }

  async function handleOverwriteConfirm() {
    const state = changeState;
    if (state.phase !== "overwrite_confirm") return;

    setChangeState({ phase: "sending" });

    try {
      const res = await requestEmailChangeViaProxy({
        newEmail: state.newEmail,
        currentPassword: state.currentPassword || undefined,
        overwriteAlternate: true,
      });

      if (res.status === "VERIFICATION_SENT") {
        setChangeState({ phase: "sent" });
        onToast(res.message ?? "Verification email sent!", "success");
        setPassword("");
      } else {
        throw new Error(res.message ?? "Unknown response");
      }
    } catch (e: unknown) {
      setChangeState({ phase: "idle" });
      setPassword("");
      onToast(e instanceof Error ? e.message : "Something went wrong. Please try again.", "error");
    }
  }

  const isSending = changeState.phase === "sending";

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

/* ── Glowing Change Password button ── */
function ChangePasswordButton() {
  const [hovered, setHovered] = useState(false);
  return (
    <Link href="/auth/forgot-password" className="block w-full">
      <motion.div
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.98 }}
        className="relative w-full overflow-hidden rounded-2xl cursor-pointer"
      >
        <motion.div
          className="absolute -inset-1 rounded-2xl"
          style={{ background: "linear-gradient(135deg, #7c3aed, #06b6d4, #ec4899, #7c3aed)", backgroundSize: "300% 300%" }}
          animate={{
            backgroundPosition: hovered ? ["0% 50%", "100% 50%", "0% 50%"] : ["0% 50%"],
            opacity: hovered ? [0.8, 1, 0.8] : 0.5,
          }}
          transition={{ duration: 2, repeat: hovered ? Infinity : 0 }}
        />
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1.05 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute -inset-3 rounded-3xl blur-xl"
              style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.6), rgba(6,182,212,0.4), rgba(236,72,153,0.5))" }}
            />
          )}
        </AnimatePresence>
        <div className="relative z-10 flex items-center justify-center gap-2.5 rounded-2xl border border-white/20 bg-[#08080f]/90 px-6 py-4 backdrop-blur-xl">
          <motion.div animate={hovered ? { rotate: [0, -15, 15, 0] } : {}} transition={{ duration: 0.5 }}>
            <Lock className="h-5 w-5 text-violet-400" />
          </motion.div>
          <span className="text-sm font-bold text-white" style={{ fontFamily: "'Sora', sans-serif" }}>
            Change Password
          </span>
          <motion.div
            animate={hovered ? { x: [0, 4, 0] } : {}}
            transition={{ duration: 0.6, repeat: hovered ? Infinity : 0 }}
            className="ml-auto"
          >
            <Zap className={`h-4 w-4 transition-colors ${hovered ? "text-cyan-400" : "text-white/30"}`} />
          </motion.div>
        </div>
      </motion.div>
    </Link>
  );
}

/* ── Section label ── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="h-px flex-1 bg-gradient-to-r from-white/5 to-transparent" />
      <motion.span
        initial={{ opacity: 0, letterSpacing: "0.05em" }}
        animate={{ opacity: 1, letterSpacing: "0.2em" }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-xs font-bold uppercase text-white/30"
        style={{ fontFamily: "'Sora', sans-serif" }}
      >
        {children}
      </motion.span>
      <div className="h-px flex-1 bg-gradient-to-l from-white/5 to-transparent" />
    </div>
  );
}

/* ── Main export ── */
export function ProfilePageClient({ user: initialUser }: ProfilePageClientProps) {
  const [user, setUser] = useState(initialUser);
  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState<{ msg: string; kind: "success" | "error" | "info" } | null>(null);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

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

  const memberDays = Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24));

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
              <ChangePasswordButton />
            </SpotlightCard>
          </motion.div>

          {/* ── Footer ── */}
          <motion.p
            variants={itemVariants}
            className="mt-10 text-center text-xs text-white/20"
          >
            ReLive · Your creative fitness journey · {new Date().getFullYear()}
          </motion.p>
        </main>
      </motion.div>
    </div>
  );
}
