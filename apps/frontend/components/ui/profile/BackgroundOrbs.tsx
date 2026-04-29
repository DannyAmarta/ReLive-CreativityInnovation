import React, { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { useMousePosition } from "@/hooks/ui/useMousePosition";

export function BackgroundOrbs() {
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