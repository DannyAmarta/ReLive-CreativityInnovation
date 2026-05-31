"use client";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";

function LinePath({ scrollYProgress, className }: { scrollYProgress: MotionValue<number>; className?: string }) {
  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);
  return (
    <svg viewBox="0 0 800 1600" fill="none" className={className} preserveAspectRatio="none">
      <motion.path
        d="M 400 0 C 200 200, 600 360, 400 560 S 100 900, 400 1080 S 700 1320, 400 1600"
        stroke="url(#relive-grad)"
        strokeWidth={2}
        strokeLinecap="round"
        style={{ pathLength }}
      />
      <defs>
        <linearGradient id="relive-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.55 0.09 160)" />
          <stop offset="50%" stopColor="oklch(0.68 0.14 45)" />
          <stop offset="100%" stopColor="oklch(0.38 0.08 150)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const STOPS = [
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

function Stop({ stop, side }: { stop: (typeof STOPS)[number]; side: "left" | "right" }) {
  const ref = useRef<HTMLDivElement>(null);
  // Tie each card's reveal to its own scroll position:
  // when the card's top hits ~80% of viewport, start fading in;
  // when it crosses ~30% from top, fully visible.
  // Reverses smoothly when scrolled back up.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "start 0.25"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.6, 1], [0, 0.85, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [60, 0]);
  const blur = useTransform(scrollYProgress, [0, 1], [10, 0]);
  const filter = useTransform(blur, (v) => `blur(${v}px)`);

  return (
    <div ref={ref} className={`relative md:w-[42%] ${side === "left" ? "md:ml-0" : "md:ml-auto"}`}>
      <motion.div
        style={{ opacity, y, filter }}
        className="rounded-2xl p-7"
      >
        <p className="font-display text-xs uppercase tracking-[0.3em] text-accent">{stop.tag}</p>
        <h3 className="mt-3 font-display text-3xl md:text-4xl leading-tight text-foreground">{stop.title}</h3>
        <p className="mt-3 text-sm md:text-base leading-relaxed text-muted-foreground">{stop.body}</p>
      </motion.div>
    </div>
  );
}

export function SvgFollowScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  return (
    <section ref={ref} className="relative w-full bg-background py-32">
      <CinematicHeader />

      <div className="relative mx-auto mt-24 max-w-5xl px-6">
        <div className="pointer-events-none absolute inset-y-0 left-1/2 hidden -translate-x-1/2 md:block">
          <LinePath scrollYProgress={scrollYProgress} className="h-full w-[800px]" />
        </div>

        <div className="space-y-32">
          {STOPS.map((s, i) => (
            <Stop key={s.tag} stop={s} side={i % 2 === 0 ? "left" : "right"} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CinematicHeader() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.95", "start 0.3"],
  });

  const blur = useTransform(scrollYProgress, [0, 1], [22, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.6, 1], [0, 0.85, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [60, 0]);
  const letterSpacing = useTransform(scrollYProgress, [0, 1], ["0.08em", "0em"]);
  const headingFilter = useTransform(blur, (v) => `blur(${v}px)`);

  const bodyBlur = useTransform(scrollYProgress, [0.15, 1], [14, 0]);
  const bodyOpacity = useTransform(scrollYProgress, [0.15, 1], [0, 1]);
  const bodyY = useTransform(scrollYProgress, [0.15, 1], [30, 0]);
  const bodyFilter = useTransform(bodyBlur, (v) => `blur(${v}px)`);

  return (
    <div ref={ref} className="mx-auto max-w-3xl px-6 text-center">
      <motion.p
        style={{ opacity, filter: headingFilter }}
        className="font-display text-sm uppercase tracking-[0.4em] text-accent"
      >
        The thread
      </motion.p>
      <motion.h2
        style={{ opacity, y, filter: headingFilter, letterSpacing, willChange: "filter, transform" }}
        className="mt-4 font-display text-5xl md:text-7xl leading-[0.95] text-foreground"
      >
        One quiet line, <span className="italic text-primary">four awakenings.</span>
      </motion.h2>
      <motion.p
        style={{ opacity: bodyOpacity, y: bodyY, filter: bodyFilter, willChange: "filter, transform" }}
        className="mx-auto mt-6 max-w-xl text-base text-muted-foreground"
      >
        ReLive isn't a fitness app. It's a slow, deliberate ritual woven through training, food,
        and trust. Scroll, and the path will draw itself.
      </motion.p>
    </div>
  );
}

