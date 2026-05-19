import { motion } from "framer-motion";

export function SectionLabel({ children }: { children: React.ReactNode }) {
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
