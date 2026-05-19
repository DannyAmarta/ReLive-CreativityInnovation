import { motion } from "framer-motion";
import { Award } from "lucide-react";

export function SkillBadge({ label }: { label: string }) {
  return (
    <motion.span
      whileHover={{ scale: 1.08, y: -2 }}
      // Updated background to #8BA888, removed violet border, updated text to #2C2E2C
      className="relative inline-flex items-center gap-1.5 overflow-hidden rounded-full px-3 py-1 text-xs font-bold cursor-default shadow-sm"
      style={{ 
        backgroundColor: "#8BA888",
        color: "#2C2E2C" 
      }}
    >
      {/* Subtle White Shimmer on Hover */}
      <motion.span
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{
          background: "linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.25) 50%, transparent 80%)",
          backgroundSize: "200% 100%",
          backgroundPositionX: "-100%",
        }}
        whileHover={{ backgroundPositionX: "200%", transition: { duration: 0.5, ease: "easeInOut" } }}
      />
      
      {/* Icon color matches the text for a cohesive look */}
      <Award className="h-3 w-3 relative z-10" strokeWidth={2.5} />
      
      <span className="relative z-10 tracking-tight">
        {label}
      </span>
    </motion.span>
  );
}
