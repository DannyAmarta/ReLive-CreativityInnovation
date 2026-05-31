"use client";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";

function LinePath({ scrollYProgress, className }: { scrollYProgress: MotionValue<number>; className?: string }) {
  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);
  return (
    <svg
      viewBox="0 0 800 1600"
      fill="none"
      className={className}
      preserveAspectRatio="none"
    >
      <motion.path
        d="M 400 0 C 200 200, 600 360, 400 560 S 100 900, 400 1080 S 700 1320, 400 1600"
        stroke="url(#relive-grad)"
        strokeWidth={2}
        strokeLinecap="round"
        style={{ pathLength }}
      />
      <defs>
        <linearGradient id="relive-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.85 0.18 160)" />
          <stop offset="50%" stopColor="oklch(0.82 0.12 200)" />
          <stop offset="100%" stopColor="oklch(0.78 0.16 320)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function SvgFollowScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  const stops = [
    {
      tag: "Astral Profile",
      title: "A self that grows with you",
      body: "Your activation begins with a verified ritual — register, confirm your email, and step into a session-hardened account that syncs across every realm you visit.",
    },
    {
      tag: "The 3D World",
      title: "Navigate wellness as terrain",
      body: "Instead of a flat dashboard, ReLive opens a hand-rendered map. Nutrition Hub, Workout Workshop, and the Scroll Cookbook live as hotspots in a fantasy you can wander.",
    },
    {
      tag: "Set Calculator",
      title: "Numbers your body can trust",
      body: "Brzycki for the lower body, Wathan for technical lifts, RPE-aware cardio. CNS fatigue detection quietly protects your baseline from a bad day.",
    },
    {
      tag: "Trainer Escrow",
      title: "Coaches paid the honest way",
      body: "Fiat in rupiah or USDC on Solana — held in escrow until the work is real. Disputes go to humans, not algorithms.",
    },
  ];

  return (
    <section ref={ref} className="relative w-full bg-background py-32">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <p className="font-display text-sm uppercase tracking-[0.4em] text-aurora/90">The thread</p>
        <h2 className="mt-4 font-display text-5xl md:text-7xl leading-[0.95] text-foreground">
          One quiet line, <span className="italic text-celestial">four awakenings.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground">
          ReLive isn't a fitness app. It's a slow, deliberate ritual woven through training, food,
          and trust. Scroll, and the path will draw itself.
        </p>
      </div>

      <div className="relative mx-auto mt-24 max-w-5xl px-6">
        <div className="pointer-events-none absolute inset-y-0 left-1/2 hidden -translate-x-1/2 md:block">
          <LinePath scrollYProgress={scrollYProgress} className="h-full w-[800px]" />
        </div>

        <div className="space-y-32">
          {stops.map((s, i) => (
            <motion.div
              key={s.tag}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`relative md:w-[42%] ${i % 2 === 0 ? "md:ml-0" : "md:ml-auto"}`}
            >
              <div className="rounded-2xl border border-white/15 bg-white/5 p-7 backdrop-blur-xl">
                <p className="font-display text-xs uppercase tracking-[0.3em] text-aurora/90">{s.tag}</p>
                <h3 className="mt-3 font-display text-3xl md:text-4xl leading-tight text-foreground">{s.title}</h3>
                <p className="mt-3 text-sm md:text-base leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
