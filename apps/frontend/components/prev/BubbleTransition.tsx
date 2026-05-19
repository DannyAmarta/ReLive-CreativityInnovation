"use client";

import { motion } from "framer-motion";

const bubbles = Array.from({ length: 100 }).map((_, i) => ({
  id: i,
  size: Math.random() * 80 + 20,
  left: Math.random() * 100,
  delay: Math.random() * 3,
  duration: Math.random() * 4 + 3,
}));

const BubbleSpam = () => {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-50">
      {bubbles.map((bubble) => (
        <motion.div
          key={bubble.id}
          initial={{
            y: 300,
            opacity: 0,
            scale: 0,
          }}
          animate={{
            y: -300,
            opacity: [0, 0.9, 0],
            scale: [0, 1.2, 1.8],
          }}
          transition={{
            duration: bubble.duration,
            delay: bubble.delay,
            repeat: Infinity,
            ease: "easeOut",
          }}
          style={{
            width: bubble.size,
            height: bubble.size,
            left: `${bubble.left}%`,
          }}
          className="
          absolute bottom-[-100px]
          rounded-full
          border border-white/50
          bg-white/10
          backdrop-blur-[2px]
          "
        />
      ))}
    </div>
  );
};

export default BubbleSpam;
