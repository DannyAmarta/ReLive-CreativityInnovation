"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const IMAGES = [
  "https://images.unsplash.com/photo-1717893777838-4e222311630b?w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1717618389115-88db6d7d8f77?w=900&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1717588604557-55b2888f59a6?w=900&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1713417338603-1b6b72fcade2?w=900&auto=format&fit=crop",
];

export function ScrollGallery() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1.15, 1]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [0.5, 1]);
  const y1 = useTransform(scrollYProgress, [0, 1], ["0%", "-25%"]);
  const y2 = useTransform(scrollYProgress, [0, 1], ["0%", "-12%"]);
  const y3 = useTransform(scrollYProgress, [0, 1], ["0%", "-35%"]);

  return (
    <section ref={ref} className="relative w-full bg-background py-32">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <p className="font-display text-sm uppercase tracking-[0.4em] text-aurora/90">The Journey</p>
        <h2 className="mt-4 font-display text-5xl md:text-7xl leading-[0.95] text-foreground">
          You'll never train <span className="italic text-celestial">alone again.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-muted-foreground">
          ReLive remembers your sets, your meals, your trainers, your rest. Scroll, and the world remembers with you.
        </p>
      </div>

      <div className="relative mx-auto mt-20 max-w-6xl px-6">
        <motion.div
          style={{ scale: heroScale, opacity: heroOpacity }}
          className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl border border-white/15"
        >
          <img src={IMAGES[0]} alt="Mountain ridge at dawn" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
        </motion.div>

        <div className="mt-10 grid grid-cols-12 gap-6">
          <motion.div style={{ y: y1 }} className="col-span-12 md:col-span-5 aspect-[3/4] overflow-hidden rounded-2xl border border-white/15">
            <img src={IMAGES[1]} alt="" className="h-full w-full object-cover" />
          </motion.div>
          <motion.div style={{ y: y2 }} className="col-span-12 md:col-span-7 aspect-[4/3] overflow-hidden rounded-2xl border border-white/15">
            <img src={IMAGES[2]} alt="" className="h-full w-full object-cover" />
          </motion.div>
          <motion.div style={{ y: y3 }} className="col-span-12 md:col-span-8 md:col-start-3 aspect-[16/9] overflow-hidden rounded-2xl border border-white/15">
            <img src={IMAGES[3]} alt="" className="h-full w-full object-cover" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
