import { getInitials } from "@/lib/utils";

import { motion } from "framer-motion";

export function AvatarDisplay({ name, avatar }: { name: string; avatar: string | null }) {
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