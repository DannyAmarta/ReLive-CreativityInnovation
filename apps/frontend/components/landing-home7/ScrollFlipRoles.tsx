"use client";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { useRef } from "react";
import BlurHeading from "./BlurHeading";

/**
 * Scroll-triggered character flip — adapted from role.html.
 * Each line reveals letter-by-letter as the user scrolls.
 * Lines are spaced in scroll progress with an "interval" plateau so the
 * reader can dwell on a finished line before the next begins to flip.
 */

const LINES = [
  "integrated",
  "transaction",
  "mutual connection",
  "nutrition tracking",
  "training math",
];

function FlipLine({
  text,
  index,
  total,
  progress,
}: {
  text: string;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  // Each line gets a slice of the scroll. We give it an animating portion +
  // a flat "dwell" portion so it sits fully revealed before the next starts.
  const slice = 1 / total;
  const start = index * slice;
  const animEnd = start + slice * 0.55; // 55% animating, 45% dwell
  const chars = Array.from(text);

  return (
    <div className="font-sora font-bold uppercase tracking-tighter text-5xl md:text-7xl lg:text-8xl leading-[0.95] text-[#2d5a27]">
      <span className="inline-block">
        {chars.map((ch, i) => {
          const localStart = start + (animEnd - start) * (i / Math.max(chars.length - 1, 1));
          const localEnd = localStart + (animEnd - start) * 0.25;
          return <FlipChar key={i} ch={ch} progress={progress} start={localStart} end={localEnd} />;
        })}
      </span>
    </div>
  );
}

function FlipChar({
  ch,
  progress,
  start,
  end,
}: {
  ch: string;
  progress: MotionValue<number>;
  start: number;
  end: number;
}) {
  /**
   * IMPORTANT: we use the functional overload of useTransform so that ALL
   * clamping is done by our own Math.max/Math.min — zero reliance on
   * Framer Motion's internal string-interpolation clamp path, which behaved
   * inconsistently for percentage strings on lines 2-5.
   *
   * t = 0  →  animation has NOT started yet  (before `start`)
   * t = 1  →  animation is COMPLETE          (after `end`)
   */
  const topY = useTransform(progress, (p) => {
    const range = end - start;
    const t = range > 0 ? Math.max(0, Math.min(1, (p - start) / range)) : p >= end ? 1 : 0;
    return `${(-110 + t * 110).toFixed(3)}%`;   // -110% → 0%
  });
  const bottomY = useTransform(progress, (p) => {
    const range = end - start;
    const t = range > 0 ? Math.max(0, Math.min(1, (p - start) / range)) : p >= end ? 1 : 0;
    return `${(t * 110).toFixed(3)}%`;           // 0% → 110%
  });
  const topOpacity = useTransform(progress, (p) => {
    const range = end - start;
    return range > 0 ? Math.max(0, Math.min(1, (p - start) / range)) : p >= end ? 1 : 0;
  });
  const bottomOpacity = useTransform(progress, (p) => {
    const range = end - start;
    const t = range > 0 ? Math.max(0, Math.min(1, (p - start) / range)) : p >= end ? 1 : 0;
    return 0.2 * (1 - t);
  });

  const display = ch === " " ? "\u00a0" : ch;

  return (
    <span className="relative inline-block overflow-hidden align-baseline">
      <motion.span style={{ y: bottomY, opacity: bottomOpacity }} className="inline-block text-[#2d5a27]/30">
        {display}
      </motion.span>
      <motion.span
        style={{ y: topY, opacity: topOpacity }}
        className="absolute left-0 top-0 inline-block text-[#2d5a27]"
      >
        {display}
      </motion.span>
    </span>
  );
}

export default function ScrollFlipRoles() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  return (
    <section id="about" ref={ref} className="relative h-[420vh] bg-[#f6f1e7]">
      <div className="sticky top-0 h-screen flex flex-col justify-center px-6 md:px-16 overflow-hidden">
        <p className="font-inter text-xs uppercase tracking-[0.4em] text-[#c77a5a] mb-6">
          / a vocabulary for the living body
        </p>
        <BlurHeading
          as="h2"
          className="font-sora text-3xl md:text-5xl font-light text-[#233126] mb-12 max-w-2xl"
        >
          ReLive is built for <span className="italic text-[#8ba888]">five living tools.</span>
        </BlurHeading>

        <div className="flex flex-col gap-3 md:gap-5">
          {LINES.map((line, i) => (
            <FlipLine
              key={line}
              text={line}
              index={i}
              total={LINES.length}
              progress={scrollYProgress}
            />
          ))}
        </div>

        <p className="mt-12 max-w-md font-inter text-[#233126]/70 text-sm md:text-base leading-relaxed">
          Each one is a hotspot in the dashboard — and a column in your ledger.
        </p>
      </div>
    </section>
  );
}
