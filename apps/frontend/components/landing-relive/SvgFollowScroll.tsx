"use client";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { useRef } from "react";

export function SvgFollowScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref });

  return (
    <section ref={ref} className="relative bg-background py-32 text-foreground">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-24 text-center">
          <p className="mb-4 text-xs uppercase tracking-[0.4em] text-primary/80">Chapter I — The Premise</p>
          <h2 className="font-serif text-5xl font-light leading-[1.05] md:text-7xl">
            The thread<br />
            <span className="italic text-primary">that follows</span><br />
            your becoming.
          </h2>
          <p className="mx-auto mt-8 max-w-xl text-white/60">
            ReLive stitches every set, every meal, every booked session into one continuous arc — drawn forward as you move.
          </p>
        </div>

        <div className="relative flex flex-col items-center gap-32">
          <LinePath scrollYProgress={scrollYProgress} className="left-1/2 top-0 h-full -translate-x-1/2" />

          <FeatureBlock
            align="left"
            kicker="Nutrition Hub"
            title="Every bite, normalized."
            body="Unified search across USDA and Open Food Facts with cached macros, serving-size math, and instant cross-linking from any recipe ingredient."
          />
          <FeatureBlock
            align="right"
            kicker="Set Calculator"
            title="Math that respects your CNS."
            body="Brzycki, Wathan, and cardio-load strategies routed per movement category — with automatic outlier flags so a single bad day never poisons your baseline."
          />
          <FeatureBlock
            align="left"
            kicker="Trainer Marketplace"
            title="Escrow in fiat and on-chain."
            body="Bookings flow through a strict state machine: PENDING → ACTIVE → COMPLETED, with disputes that freeze funds until a human resolves them."
          />
        </div>
      </div>
    </section>
  );
}

function FeatureBlock({ align, kicker, title, body }: { align: "left" | "right"; kicker: string; title: string; body: string }) {
  return (
    <div className={`relative w-full max-w-md ${align === "left" ? "self-start" : "self-end"}`}>
      <p className="mb-3 text-xs uppercase tracking-[0.3em] text-primary/80">{kicker}</p>
      <h3 className="font-serif text-3xl font-light leading-tight md:text-4xl">{title}</h3>
      <p className="mt-4 text-white/60">{body}</p>
    </div>
  );
}

function LinePath({ className, scrollYProgress }: { className: string; scrollYProgress: MotionValue<number> }) {
  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);
  return (
    <svg className={`absolute w-2 ${className}`} viewBox="0 0 4 1000" preserveAspectRatio="none" fill="none">
      <motion.path
        d="M 2 0 V 1000"
        stroke="currentColor"
        strokeWidth="2"
        className="text-primary"
        style={{ pathLength }}
      />
    </svg>
  );
}
