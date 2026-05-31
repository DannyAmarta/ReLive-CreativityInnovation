"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function MotionFooter() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const scale = useTransform(scrollYProgress, [0, 1], [0.85, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [80, 0]);

  return (
    <footer ref={ref} className="relative bg-[#06060d] text-white pt-24">
      <motion.div
        style={{ scale, y }}
        className="mx-4 md:mx-8 rounded-t-[3rem] bg-gradient-to-b from-white/[0.07] to-white/[0.02] border border-white/10 border-b-0 backdrop-blur-xl p-10 md:p-20"
      >
        <div className="flex flex-col md:flex-row md:justify-between gap-12">
          <div className="max-w-md">
            <h3 className="text-5xl md:text-7xl font-serif font-light leading-none mb-6">
              Re<span className="italic">Live</span>.
            </h3>
            <p className="text-white/60 leading-relaxed">
              A magical wellness universe for the living body. Train, eat, and journey through your own celestial map.
            </p>
            <button className="mt-8 inline-flex items-center gap-2 rounded-full bg-white text-black px-6 py-3 text-sm font-medium hover:bg-white/90 transition">
              Enter the World →
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-10 text-sm">
            <div>
              <p className="uppercase tracking-[0.3em] text-white/40 text-xs mb-4">Tools</p>
              <ul className="space-y-2 text-white/70">
                <li>Nutrition Hub</li>
                <li>Scroll Cookbook</li>
                <li>Set Calculator</li>
                <li>3D World</li>
              </ul>
            </div>
            <div>
              <p className="uppercase tracking-[0.3em] text-white/40 text-xs mb-4">Marketplace</p>
              <ul className="space-y-2 text-white/70">
                <li>Trainers</li>
                <li>Bookings</li>
                <li>Escrow (IDR)</li>
                <li>Escrow (USDC)</li>
              </ul>
            </div>
            <div>
              <p className="uppercase tracking-[0.3em] text-white/40 text-xs mb-4">Account</p>
              <ul className="space-y-2 text-white/70">
                <li>Sign in</li>
                <li>Register</li>
                <li>Google OAuth</li>
                <li>Astral Profile</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between gap-4 text-xs text-white/40">
          <p>© {new Date().getFullYear()} ReLive — A vocabulary for the living body.</p>
          <p>Built with NestJS · Next-style TanStack Start · Solana · Postgres</p>
        </div>

        <div className="mt-16 -mb-6 text-center select-none">
          <p className="text-[18vw] leading-none font-serif font-light tracking-tighter bg-gradient-to-b from-white/15 to-white/0 bg-clip-text text-transparent">
            ReLive
          </p>
        </div>
      </motion.div>
    </footer>
  );
}
