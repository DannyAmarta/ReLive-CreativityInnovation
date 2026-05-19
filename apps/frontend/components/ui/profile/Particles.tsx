import { motion } from "framer-motion";

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: (i * 37.3) % 100,
  size: 1 + (i % 4),
  delay: (i * 0.85) % 9,
  duration: 10 + (i % 8),
  opacity: 0.08 + (i % 5) * 0.06,
}));

export function FloatingParticles() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-violet-300"
          style={{ width: p.size, height: p.size, left: `${p.x}%`, bottom: -8, opacity: 0 }}
          animate={{ y: [0, -900], opacity: [0, p.opacity, p.opacity, 0] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "linear" }}
        />
      ))}
    </div>
  );
}
