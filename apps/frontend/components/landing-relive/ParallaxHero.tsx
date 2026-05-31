"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const SKY = "https://cdn.prod.website-files.com/671752cd4027f01b1b8f1c7f/6717795be09b462b2e8ebf71_osmo-parallax-layer-3.webp";
const MID = "https://cdn.prod.website-files.com/671752cd4027f01b1b8f1c7f/6717795b4d5ac529e7d3a562_osmo-parallax-layer-2.webp";
const FRONT = "https://cdn.prod.website-files.com/671752cd4027f01b1b8f1c7f/6717795bb5aceca85011ad83_osmo-parallax-layer-1.webp";

export function ParallaxHero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  const ySky = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const yMid = useTransform(scrollYProgress, [0, 1], ["0%", "55%"]);
  const yFront = useTransform(scrollYProgress, [0, 1], ["0%", "85%"]);
  const titleY = useTransform(scrollYProgress, [0, 1], ["0%", "120%"]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section ref={ref} className="relative h-screen w-full overflow-hidden bg-[#0b0b14]">
      <motion.img src={SKY} alt="celestial sky" style={{ y: ySky }} className="absolute inset-0 h-full w-full object-cover" />
      <motion.div style={{ y: titleY, opacity: titleOpacity }} className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center">
        <span className="mb-6 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs uppercase tracking-[0.3em] text-white/70 backdrop-blur-md">
          A celestial wellness world
        </span>
        <h1 className="font-serif text-[clamp(3rem,10vw,9rem)] font-light leading-[0.95] tracking-tight text-white">
          Re<span className="italic text-primary">Live</span>
        </h1>
        <p className="mt-6 max-w-xl text-balance text-base text-white/70 md:text-lg">
          Nutrition, training, and trainer marketplaces — bound together inside an explorable 3D world for the body you're becoming.
        </p>
      </motion.div>
      <motion.img src={MID} alt="mountains" style={{ y: yMid }} className="pointer-events-none absolute inset-0 z-20 h-full w-full object-cover" />
      <motion.img src={FRONT} alt="foreground" style={{ y: yFront }} className="pointer-events-none absolute inset-0 z-30 h-full w-full object-cover" />
      <div className="absolute bottom-8 left-1/2 z-40 -translate-x-1/2 text-xs uppercase tracking-[0.4em] text-white/60">
        scroll to enter
      </div>
    </section>
  );
}
