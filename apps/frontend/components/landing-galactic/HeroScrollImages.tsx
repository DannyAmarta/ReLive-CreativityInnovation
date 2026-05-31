"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const IMGS = [
  "https://images.unsplash.com/photo-1717893777838-4e222311630b?w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1717618389115-88db6d7d8f77?w=500&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1717588604557-55b2888f59a6?w=500&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1713417338603-1b6b72fcade2?w=500&auto=format&fit=crop",
];

export default function HeroScrollImages() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  const scale = useTransform(scrollYProgress, [0, 0.5], [0.6, 1]);
  const rotate = useTransform(scrollYProgress, [0, 0.5], [-8, 0]);
  const y1 = useTransform(scrollYProgress, [0, 1], [200, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [100, -300]);
  const y3 = useTransform(scrollYProgress, [0, 1], [300, -100]);

  return (
    <section ref={ref} className="relative bg-[#0a0a14] text-white py-40 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 text-center mb-20">
        <h2 className="text-4xl md:text-6xl font-serif font-light leading-tight">
          A world you can <span className="italic text-white/60">walk through.</span>
        </h2>
        <p className="mt-6 text-white/60 max-w-xl mx-auto">
          The /world scene is a real 3D map. Every hotspot is a tool — and every tool feeds your ledger.
        </p>
      </div>

      <div className="relative max-w-6xl mx-auto px-6">
        <motion.div
          style={{ scale, rotate }}
          className="relative mx-auto w-full aspect-[16/10] rounded-3xl overflow-hidden border border-white/10 shadow-[0_50px_120px_-30px_rgba(80,200,180,0.25)]"
        >
          <img src={IMGS[0]} alt="" className="h-full w-full object-cover" />
        </motion.div>

        <motion.img style={{ y: y1 }} src={IMGS[1]} alt="" className="absolute -left-4 md:left-[-6%] top-10 w-32 md:w-56 aspect-square object-cover rounded-2xl border border-white/15 shadow-2xl" />
        <motion.img style={{ y: y2 }} src={IMGS[2]} alt="" className="absolute right-0 md:right-[-4%] top-32 w-28 md:w-48 aspect-[3/4] object-cover rounded-2xl border border-white/15 shadow-2xl" />
        <motion.img style={{ y: y3 }} src={IMGS[3]} alt="" className="absolute left-1/4 -bottom-10 w-32 md:w-52 aspect-[4/5] object-cover rounded-2xl border border-white/15 shadow-2xl" />
      </div>
    </section>
  );
}
