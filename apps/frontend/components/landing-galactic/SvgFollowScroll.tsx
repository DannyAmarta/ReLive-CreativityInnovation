"use client";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { useRef } from "react";

const LinePath = ({ className, scrollYProgress }: { className: string; scrollYProgress: MotionValue<number> }) => {
  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);
  return (
    <svg className={className} viewBox="0 0 100 100" preserveAspectRatio="none" fill="none">
      <motion.path
        d="M 0 50 L 100 50"
        stroke="currentColor"
        strokeWidth="0.6"
        strokeLinecap="round"
        style={{ pathLength }}
      />
    </svg>
  );
};

export default function SvgFollowScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  return (
    <section ref={ref} className="relative bg-[#0a0a14] text-white py-32 md:py-48 overflow-hidden">
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid grid-cols-12 gap-4 items-start">
          <div className="col-span-12 md:col-span-7 space-y-10">
            <h2 className="text-4xl md:text-6xl font-serif font-light leading-[1.05]">
              A vocabulary <br />
              <span className="italic text-white/60">for the living body.</span>
            </h2>

            <div className="relative">
              <LinePath className="absolute -top-6 left-0 w-full h-6 text-emerald-300/80" scrollYProgress={scrollYProgress} />
              <p className="text-white/70 leading-relaxed text-lg max-w-md">
                ReLive is a magical wellness universe — part dashboard, part dream. Track nutrition,
                train with AI-guided safety envelopes, book trainers in escrow, and wander a 3D world
                where each location opens a tool for your body.
              </p>
            </div>

            <div className="relative">
              <LinePath className="absolute -top-6 left-0 w-full h-6 text-violet-300/80" scrollYProgress={scrollYProgress} />
              <p className="text-white/70 leading-relaxed text-lg max-w-md">
                Built on a real backend — Argon2 sessions, dual-currency escrow on Solana + IDR,
                CNS-fatigue aware training math, and a coaching LLM bounded by a numerical safety envelope.
              </p>
            </div>
          </div>

          <aside className="col-span-12 md:col-span-5 md:pl-10 mt-12 md:mt-32 space-y-8 text-sm text-white/60">
            <div>
              <p className="uppercase tracking-[0.3em] text-white/40 text-xs mb-2">Where</p>
              <p>The 3D World <br /> &amp; the Cookbook scroll</p>
            </div>
            <div>
              <p className="uppercase tracking-[0.3em] text-white/40 text-xs mb-2">When</p>
              <p>Every morning <br /> the moment you log a set</p>
            </div>
            <div>
              <p className="uppercase tracking-[0.3em] text-white/40 text-xs mb-2">For</p>
              <p>Trainees · free <br /> Trainers · escrowed</p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
