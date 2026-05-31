"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const IMAGES = [
  "https://images.unsplash.com/photo-1717893777838-4e222311630b?w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1717618389115-88db6d7d8f77?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1717588604557-55b2888f59a6?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1713417338603-1b6b72fcade2?w=800&auto=format&fit=crop",
];

export function ScrollImages() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  const scale = useTransform(scrollYProgress, [0, 0.5], [0.7, 1]);
  const y1 = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const y2 = useTransform(scrollYProgress, [0, 1], ["0%", "-10%"]);
  const y3 = useTransform(scrollYProgress, [0, 1], ["0%", "-50%"]);

  return (
    <section ref={ref} className="relative bg-background py-32 text-foreground">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <p className="mb-4 text-xs uppercase tracking-[0.4em] text-primary/80">Chapter III — The world</p>
        <h2 className="font-serif text-5xl font-light leading-tight md:text-7xl">
          Step into a <span className="italic text-primary">spatial</span><br />wellness sanctuary.
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-white/60">
          The /world is your hub — fantasy hotspots route you to the Nutrition Hub, Astral Profile, Cookbook Scrolls, and the Workout Workshop.
        </p>
      </div>

      <div className="relative mx-auto mt-24 h-[80vh] max-w-6xl">
        <motion.img
          src={IMAGES[0]}
          style={{ scale }}
          className="absolute left-1/2 top-0 h-[60vh] w-[70%] -translate-x-1/2 rounded-2xl object-cover shadow-2xl"
          alt="hero scape"
        />
        <motion.img
          src={IMAGES[1]}
          style={{ y: y1 }}
          className="absolute left-0 top-32 h-56 w-44 rounded-xl object-cover shadow-xl md:h-72 md:w-56"
          alt=""
        />
        <motion.img
          src={IMAGES[2]}
          style={{ y: y2 }}
          className="absolute right-0 top-16 h-56 w-44 rounded-xl object-cover shadow-xl md:h-72 md:w-56"
          alt=""
        />
        <motion.img
          src={IMAGES[3]}
          style={{ y: y3 }}
          className="absolute bottom-0 right-20 h-44 w-60 rounded-xl object-cover shadow-xl md:h-56 md:w-72"
          alt=""
        />
      </div>
    </section>
  );
}
