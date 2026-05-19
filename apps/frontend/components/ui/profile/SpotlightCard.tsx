import { useRef, useCallback } from "react";

import { useMotionValue, useMotionTemplate, motion } from "framer-motion";

export function SpotlightCard({
  children,
  className = "",
  style = {},
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    },
    [mouseX, mouseY]
  );

  const spotlight = useMotionTemplate`radial-gradient(260px circle at ${mouseX}px ${mouseY}px, rgba(139,92,246,0.12) 0%, transparent 80%)`;

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      className={className}
      style={style}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-3xl transition-opacity duration-300"
        style={{ background: spotlight, opacity: 0 }}
        whileHover={{ opacity: 1 }}
      />
      {children}
    </motion.div>
  );
}
