import { useMotionValue, useSpring, useTransform, motion } from "framer-motion";
import { useEffect } from "react";
import { itemVariants } from "../../profile/logic/profile.motions";

export function StatBadge({
  label,
  value,
  unit = "",
  suffix = "",
}: {
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
      // Hover state: Increased Y-offset and a much deeper/wider shadow
      whileHover={{ 
        scale: 1.05, 
        y: -8,
        shadow: "0 25px 50px -12px rgba(45, 90, 39, 0.25)" 
      }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      
      // Initial state: Heavier base shadow to make it feel "solid"
      className="relative flex flex-col items-center justify-center gap-1 rounded-2xl border border-[#DDE1DF]/80 bg-white px-8 py-7 overflow-hidden w-full text-center shadow-[0_10px_20px_rgba(0,0,0,0.08),_0_4px_8px_rgba(45,90,39,0.06)]"
    >
      {/* Shimmer Effect */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "linear-gradient(105deg, transparent 30%, rgba(45,90,39,0.03) 50%, transparent 70%)",
          backgroundSize: "200% 100%",
          backgroundPositionX: "-100%",
        }}
        whileHover={{ backgroundPositionX: "200%", transition: { duration: 0.8 } }}
      />
      
      {/* Label: #2C2E2C */}
      <span 
        className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1"
        style={{ color: "#2C2E2C", opacity: 0.5 }}
      >
        {label}
      </span>

      {/* Value: #2D5A27 */}
      <motion.span
        className="text-3xl font-bold leading-none"
        style={{ 
          fontFamily: "'Sora', sans-serif",
          color: "#2D5A27" 
        }}
      >
        {display}
      </motion.span>
    </motion.div>
  );
}
