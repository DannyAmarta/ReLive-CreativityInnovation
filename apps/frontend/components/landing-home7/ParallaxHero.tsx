"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const SKY = "https://cdn.prod.website-files.com/671752cd4027f01b1b8f1c7f/6717795be09b462b2e8ebf71_osmo-parallax-layer-3.webp";
const MTN = "https://cdn.prod.website-files.com/671752cd4027f01b1b8f1c7f/6717795b4d5ac529e7d3a562_osmo-parallax-layer-2.webp";
const HUMAN = "https://cdn.prod.website-files.com/671752cd4027f01b1b8f1c7f/6717795bb5aceca85011ad83_osmo-parallax-layer-1.webp";

export default function ParallaxHero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const ySky = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const yMtn = useTransform(scrollYProgress, [0, 1], ["0%", "55%"]);
  const yHuman = useTransform(scrollYProgress, [0, 1], ["0%", "85%"]);
  const titleY = useTransform(scrollYProgress, [0, 1], ["0%", "120%"]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section ref={ref} className="relative h-[150vh] w-full overflow-hidden bg-[#f6f1e7]">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* cream wash so botanical theme dominates the parallax photo */}
        <motion.img src={SKY} alt="" style={{ y: ySky }} className="absolute inset-0 h-full w-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#f6f1e7]/30 via-[#f6f1e7]/10 to-[#f6f1e7]/70 z-[5]" />

        <motion.div style={{ y: titleY, opacity: titleOpacity }} className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-6">
          <p className="font-inter text-xs md:text-sm tracking-[0.4em] uppercase text-[#c77a5a] mb-6">A botanical wellness world</p>
          <h1 className="font-sora text-6xl md:text-8xl lg:text-[10rem] font-light text-[#2d5a27] leading-none">
            Re<span className="italic font-extralight text-[#233126]">Live</span>
          </h1>
          <p className="font-inter mt-8 max-w-xl text-base md:text-lg text-[#233126]/80">
            Re-enchant the body. A magical wellness universe where nutrition, training, and coaching unfold across a living 3D world.
          </p>
        </motion.div>
        <motion.img src={MTN} alt="" style={{ y: yMtn }} className="absolute inset-0 z-20 h-full w-full object-cover pointer-events-none opacity-85" />
        <motion.img src={HUMAN} alt="" style={{ y: yHuman }} className="absolute inset-0 z-30 h-full w-full object-cover pointer-events-none" />
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 font-inter text-[#2d5a27]/70 text-xs tracking-[0.3em] uppercase animate-pulse">
          Scroll
        </div>
      </div>
    </section>
  );
}
