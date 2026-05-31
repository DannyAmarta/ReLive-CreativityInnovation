"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const SKY = "https://cdn.prod.website-files.com/671752cd4027f01b1b8f1c7f/6717795be09b462b2e8ebf71_osmo-parallax-layer-3.webp";
const MOUNTAIN = "https://cdn.prod.website-files.com/671752cd4027f01b1b8f1c7f/6717795b4d5ac529e7d3a562_osmo-parallax-layer-2.webp";
const HUMAN = "https://cdn.prod.website-files.com/671752cd4027f01b1b8f1c7f/6717795bb5aceca85011ad83_osmo-parallax-layer-1.webp";

export function ParallaxHero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  // Osmo-style staggered layer speeds (back moves least, front moves most)
  const ySky = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);
  const yMountain = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const yTitle = useTransform(scrollYProgress, [0, 1], ["0%", "55%"]);
  const yHuman = useTransform(scrollYProgress, [0, 1], ["0%", "0%"]);

  return (
    <section ref={ref} className="relative h-[180vh] w-full overflow-hidden bg-[#070d1f]">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Layer 1 — sky (deepest back) */}
        <motion.img
          src={SKY}
          alt=""
          aria-hidden
          style={{ y: ySky }}
          className="absolute inset-0 z-10 h-full w-full object-cover"
        />
        {/* Layer 2 — mountain */}
        <motion.img
          src={MOUNTAIN}
          alt=""
          aria-hidden
          style={{ y: yMountain }}
          className="absolute inset-0 z-20 h-full w-full object-cover"
        />
        {/* Layer 3 — title (sandwiched between mountain and human) */}
        <motion.div
          style={{ y: yTitle }}
          className="absolute inset-0 z-30 flex flex-col items-center justify-center text-center px-6"
        >
          <h1 className="font-display font-black uppercase tracking-tight text-[clamp(5rem,22vw,22rem)] leading-[0.85] text-white drop-shadow-[0_8px_40px_rgba(0,0,0,0.25)]">
            ReLive
          </h1>
          <p className="mt-2 font-sans text-xs md:text-sm uppercase tracking-[0.4em] text-white/85">
            A celestial wellness journey
          </p>
        </motion.div>
        {/* Layer 4 — human foreground (covers the lower portion of the title) */}
        <motion.img
          src={HUMAN}
          alt="Wanderer on the ridge"
          style={{ y: yHuman }}
          className="absolute inset-0 z-40 h-full w-full object-cover"
        />

        {/* Long dark→cream wash that smoothly hands off the hero to the light theme below */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-50 h-[55vh]"
          style={{
            background:
              "linear-gradient(to bottom, rgba(7,13,31,0) 0%, rgba(7,13,31,0.5) 40%, rgba(180,180,170,0.5) 78%, var(--background) 100%)",
          }}
        />
        <div className="absolute bottom-8 left-1/2 z-50 -translate-x-1/2 font-sans text-xs uppercase tracking-[0.3em] text-white/85 mix-blend-difference">
          Scroll to begin ↓
        </div>
      </div>
    </section>
  );
}
