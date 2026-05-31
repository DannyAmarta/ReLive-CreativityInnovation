"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function MotionFooter() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const scale = useTransform(scrollYProgress, [0, 1], [0.9, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [80, 0]);

  return (
    <footer ref={ref} className="relative bg-[#f6f1e7] text-[#233126] pt-24">
      <motion.div
        style={{ scale, y }}
        className="mx-4 md:mx-8 rounded-t-[3rem] bg-[#2d5a27] text-[#f6f1e7] border border-[#2d5a27] p-10 md:p-20 shadow-[0_-30px_80px_-40px_rgba(45,90,39,0.45)]"
      >
        <div className="flex flex-col md:flex-row md:justify-between gap-12">
          <div className="max-w-md">
            <h3 className="font-sora text-5xl md:text-7xl font-light leading-none mb-6">
              Re<span className="italic text-[#ffe4ee]">Live</span>.
            </h3>
            <p className="font-inter text-[#f6f1e7]/75 leading-relaxed">
              A magical wellness universe for the living body. Train, eat, and journey through your own botanical map.
            </p>
            <button className="font-inter mt-8 inline-flex items-center gap-2 rounded-full bg-[#c77a5a] text-[#f6f1e7] px-6 py-3 text-sm font-medium hover:bg-[#b66a4a] transition">
              Enter the World →
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-10 text-sm font-inter">
            <div>
              <p className="uppercase tracking-[0.3em] text-[#8ba888] text-xs mb-4">Tools</p>
              <ul className="space-y-2 text-[#f6f1e7]/80">
                <li>Nutrition Hub</li>
                <li>Scroll Cookbook</li>
                <li>Set Calculator</li>
                <li>3D World</li>
              </ul>
            </div>
            <div>
              <p className="uppercase tracking-[0.3em] text-[#8ba888] text-xs mb-4">Marketplace</p>
              <ul className="space-y-2 text-[#f6f1e7]/80">
                <li>Trainers</li>
                <li>Bookings</li>
                <li>Escrow (IDR)</li>
                <li>Escrow (USDC)</li>
              </ul>
            </div>
            <div>
              <p className="uppercase tracking-[0.3em] text-[#8ba888] text-xs mb-4">Account</p>
              <ul className="space-y-2 text-[#f6f1e7]/80">
                <li>Sign in</li>
                <li>Register</li>
                <li>Google OAuth</li>
                <li>Astral Profile</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-[#f6f1e7]/15 flex flex-col md:flex-row justify-between gap-4 font-inter text-xs text-[#f6f1e7]/55">
          <p>© {new Date().getFullYear()} ReLive — A vocabulary for the living body.</p>
          <p>Built with NestJS · TanStack Start · Solana · Postgres</p>
        </div>

        <div className="mt-16 -mb-6 text-center select-none">
          <p className="font-sora text-[18vw] leading-none font-light tracking-tighter bg-gradient-to-b from-[#f6f1e7]/20 to-[#f6f1e7]/0 bg-clip-text text-transparent">
            ReLive
          </p>
        </div>
      </motion.div>
    </footer>
  );
}
