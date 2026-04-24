import { useState } from "react";

import Link from "next/link";

import {
  motion,
  AnimatePresence
} from "framer-motion";

import { Lock, Zap } from "lucide-react";

export function ChangePasswordButton() {
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