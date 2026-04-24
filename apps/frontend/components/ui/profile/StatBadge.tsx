import { useMotionValue, useSpring, useTransform, motion } from "framer-motion";

import { useEffect } from "react";

import { itemVariants } from "../../profile/profile-animations";

export function StatBadge({
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