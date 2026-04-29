import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Zap } from "lucide-react";

export function AccountPasswordAction() {
  const [hovered, setHovered] = useState(false);

  return (
    <Link href="/auth/forgot-password" className="block w-full">
      <motion.div
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        whileHover={{ scale: 1.01, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="relative w-full overflow-hidden rounded-2xl cursor-pointer"
      >
        {/* The Animated Border: Swapped for Primary/Secondary Green */}
        <motion.div
          className="absolute -inset-[1px] rounded-2xl"
          style={{ 
            background: "linear-gradient(135deg, #2D5A27, #8BA888, #C5E1A5, #2D5A27)", 
            backgroundSize: "300% 300%" 
          }}
          animate={{
            backgroundPosition: hovered ? ["0% 50%", "100% 50%", "0% 50%"] : ["0% 50%"],
            opacity: hovered ? 1 : 0.3,
          }}
          transition={{ duration: 3, repeat: hovered ? Infinity : 0, ease: "linear" }}
        />

        {/* The Ambient Hover Glow: Swapped for soft Sage Green */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1.1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute -inset-4 rounded-3xl blur-2xl"
              style={{ background: "rgba(45, 90, 39, 0.15)" }}
            />
          )}
        </AnimatePresence>

        {/* The Button Body: Swapped for White/Sage Frosted Glass */}
        <div className="relative z-10 flex items-center justify-center gap-3 rounded-2xl border border-[#DDE1DF]/60 bg-white/80 px-6 py-4 backdrop-blur-md transition-colors group">
          <motion.div 
            animate={hovered ? { rotate: [0, -10, 10, 0] } : {}} 
            transition={{ duration: 0.5 }}
          >
            <Lock className={`h-5 w-5 transition-colors ${hovered ? "text-[#2D5A27]" : "text-[#2C2E2C]/40"}`} />
          </motion.div>

          <span 
            className="text-sm font-bold text-[#2C2E2C]" 
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            Change Account Password
          </span>

          <motion.div
            animate={hovered ? { x: [0, 4, 0] } : {}}
            transition={{ duration: 0.6, repeat: hovered ? Infinity : 0 }}
            className="ml-auto"
          >
            {/* Zap icon updated to Primary Green on hover */}
            <Zap className={`h-4 w-4 transition-colors ${hovered ? "text-[#2D5A27]" : "text-[#2C2E2C]/20"}`} />
          </motion.div>
        </div>
      </motion.div>
    </Link>
  );
}