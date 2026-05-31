"use client";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { useRef } from "react";

/**
 * Zoom-parallax — sticky full-screen stage where 7 image tiles
 * grow as you scroll. Mirrors the 21st.dev/sshahaider/zoom-parallax pattern.
 * Wrapper is 300vh so the scroll feels long.
 */

const IMAGES = [
  "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=1600&auto=format&fit=crop", // forest sun rays
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1600&auto=format&fit=crop", // pine forest
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1600&auto=format&fit=crop", // mountain mist
  "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=1600&auto=format&fit=crop", // canopy
  "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=1600&auto=format&fit=crop", // valley
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&auto=format&fit=crop", // wheat field
  "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=1600&auto=format&fit=crop", // wildflowers
];

export function ZoomParallax() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const scales = [
    useTransform(scrollYProgress, [0, 1], [1, 4]),    // center hero
    useTransform(scrollYProgress, [0, 1], [1, 5]),
    useTransform(scrollYProgress, [0, 1], [1, 6]),
    useTransform(scrollYProgress, [0, 1], [1, 5]),
    useTransform(scrollYProgress, [0, 1], [1, 6]),
    useTransform(scrollYProgress, [0, 1], [1, 8]),
    useTransform(scrollYProgress, [0, 1], [1, 9]),
  ];

  // typography: blur + opacity reveal during first 35% of scroll
  const titleBlur = useTransform(scrollYProgress, [0, 0.25], [20, 0]);
  const titleFilter = useTransform(titleBlur, (b) => `blur(${b}px)`);
  // Fade in + unblur during the first 35% of scroll, then stay fully visible
  // for the rest of the section (no fade-out on scroll down).
  const titleOpacity = useTransform(scrollYProgress, [0, 0.18, 0.35, 1], [0, 1, 1, 1]);
  const titleY = useTransform(scrollYProgress, [0, 0.3], [40, 0]);

  // tile positions/sizes (relative to stage)
  const tiles: { className: string }[] = [
    { className: "w-[28vw] h-[36vh] top-[6%] left-[36%]" },                 // 0 center hero
    { className: "w-[22vw] h-[28vh] top-[-12%] left-[6%]" },                // 1 top-left
    { className: "w-[18vw] h-[24vh] top-[-10%] left-[72%]" },               // 2 top-right
    { className: "w-[26vw] h-[30vh] top-[44%] left-[-6%]" },                // 3 mid-left
    { className: "w-[20vw] h-[26vh] top-[48%] left-[76%]" },                // 4 mid-right
    { className: "w-[16vw] h-[22vh] top-[86%] left-[18%]" },                // 5 bottom-left
    { className: "w-[18vw] h-[24vh] top-[88%] left-[62%]" },                // 6 bottom-right
  ];

  return (
    <section ref={ref} className="relative h-[300vh] bg-background text-foreground">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* typographic overlay */}
        <motion.div
          style={{ filter: titleFilter, opacity: titleOpacity, y: titleY }}
          className="pointer-events-none absolute inset-0 z-30 flex flex-col items-center justify-center px-6 text-center"
        >
          <p className="mb-5 text-[11px] uppercase tracking-[0.4em] text-primary/80">
            Chapter I — The Premise
          </p>
          <h2 className="font-serif text-[clamp(2.5rem,7vw,6rem)] font-light leading-[0.95] tracking-tight text-foreground">
            The thread<br />
            <span className="italic text-primary">that follows</span><br />
            your becoming.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-balance text-foreground/60">
            ReLive stitches every set, every meal, every booked session into one continuous arc — drawn forward as you move.
          </p>
        </motion.div>

        {/* image tiles */}
        {tiles.map((t, i) => (
          <Tile key={i} src={IMAGES[i]} scale={scales[i]} className={t.className} />
        ))}
      </div>
    </section>
  );
}

function Tile({ src, scale, className }: { src: string; scale: MotionValue<number>; className: string }) {
  return (
    <motion.div
      style={{ scale }}
      className={`absolute z-10 overflow-hidden rounded-2xl shadow-2xl ring-1 ring-foreground/5 ${className}`}
    >
      <img src={src} alt="" className="h-full w-full object-cover" />
    </motion.div>
  );
}