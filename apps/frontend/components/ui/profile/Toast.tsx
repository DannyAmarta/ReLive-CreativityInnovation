import { useEffect } from "react";

import { motion } from "framer-motion";

import { X } from "lucide-react";

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

export function Toast({
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
