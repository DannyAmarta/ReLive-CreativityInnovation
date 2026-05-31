"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const ROWS = [
  { text: "NOURISH ✦ TRAIN ✦ RECOVER ✦ REPEAT ✦", dir: -1 },
  { text: "RITUAL ✦ RHYTHM ✦ RESILIENCE ✦ REST ✦", dir: 1 },
  { text: "MOVE GENTLY ✦ LIFT HONESTLY ✦ EAT KINDLY ✦", dir: -1 },
];

function Row({ text, dir, scrollYProgress }: { text: string; dir: number; scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"] }) {
  const x = useTransform(
    scrollYProgress,
    [0, 1],
    dir > 0 ? ["-50%", "10%"] : ["10%", "-50%"],
  );
  return (
    <motion.div
      style={{ x }}
      className="whitespace-nowrap font-display text-[clamp(4rem,13vw,12rem)] leading-[0.95] text-foreground/90"
    >
      {`${text} ${text} ${text} ${text}`}
    </motion.div>
  );
}

export function LeftRightParallax() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  return (
    <section ref={ref} className="relative w-full overflow-hidden bg-background py-40">
      <div className="mx-auto mb-20 max-w-2xl px-6 text-center">
        <p className="font-display text-sm uppercase tracking-[0.4em] text-aurora/90">The Liturgy</p>
        <h2 className="mt-4 font-display text-5xl md:text-6xl text-foreground">
          A vocabulary for the <span className="italic text-celestial">living body.</span>
        </h2>
      </div>

      <div className="space-y-2">
        {ROWS.map((row, i) => (
          <Row key={i} text={row.text} dir={row.dir} scrollYProgress={scrollYProgress} />
        ))}
      </div>
    </section>
  );
}
