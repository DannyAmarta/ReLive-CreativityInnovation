import { motion } from "framer-motion";

import { Award } from "lucide-react";

export function SkillBadge({ label }: { label: string }) {
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