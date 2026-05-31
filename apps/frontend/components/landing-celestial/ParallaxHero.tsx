"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const SKY = "https://cdn.prod.website-files.com/671752cd4027f01b1b8f1c7f/6717795be09b462b2e8ebf71_osmo-parallax-layer-3.webp";
const MOUNTAIN = "https://cdn.prod.website-files.com/671752cd4027f01b1b8f1c7f/6717795b4d5ac529e7d3a562_osmo-parallax-layer-2.webp";
const HUMAN = "https://cdn.prod.website-files.com/671752cd4027f01b1b8f1c7f/6717795bb5aceca85011ad83_osmo-parallax-layer-1.webp";

export function ParallaxHero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  const ySky = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const yMountain = useTransform(scrollYProgress, [0, 1], ["0%", "55%"]);
  const yHuman = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);
  const titleY = useTransform(scrollYProgress, [0, 1], ["0%", "-40%"]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section ref={ref} className="relative h-[140vh] w-full overflow-hidden bg-background">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <motion.img
          src={SKY}
          alt=""
          aria-hidden
          style={{ y: ySky }}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <motion.div
          style={{ y: titleY, opacity: titleOpacity }}
          className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-6"
        >
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-white/80 backdrop-blur-md">
            <span className="size-1.5 rounded-full bg-aurora" /> A celestial wellness journey
          </span>
          <h1 className="font-display text-[clamp(4rem,16vw,16rem)] leading-none text-white drop-shadow-[0_8px_40px_rgba(120,180,255,0.35)]">
            ReLive
          </h1>
          <p className="mt-4 max-w-xl text-balance text-base md:text-lg text-white/85">
            Train, eat, and recover inside a world that listens.
            A magical wellness companion for the body you're becoming.
          </p>
        </motion.div>

        <motion.img
          src={MOUNTAIN}
          alt=""
          aria-hidden
          style={{ y: yMountain }}
          className="absolute inset-0 z-20 h-full w-full object-cover"
        />
        <motion.img
          src={HUMAN}
          alt="Wanderer on the ridge"
          style={{ y: yHuman }}
          className="absolute inset-0 z-30 h-full w-full object-cover"
        />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 h-40 bg-gradient-to-b from-transparent to-background" />
        <div className="absolute bottom-8 left-1/2 z-40 -translate-x-1/2 text-xs uppercase tracking-[0.3em] text-white/70">
          Scroll to begin ↓
        </div>
      </div>
    </section>
  );
}
