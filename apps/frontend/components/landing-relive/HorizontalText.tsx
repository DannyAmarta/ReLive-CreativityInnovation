"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const WORDS = ["Move.", "Eat.", "Recover.", "Repeat.", "ReLive."];

export function HorizontalText() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  // pin for 300vh; translate from 0 to -60%
  const x = useTransform(scrollYProgress, [0, 1], ["10%", "-80%"]);
  const xSlow = useTransform(scrollYProgress, [0, 1], ["0%", "-40%"]);

  return (
    <section ref={ref} className="relative h-[300vh] bg-background text-foreground">
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <p className="absolute left-1/2 top-12 -translate-x-1/2 text-xs uppercase tracking-[0.4em] text-primary/80">
          Chapter II — A vocabulary for the living body
        </p>

        <motion.div style={{ x }} className="flex whitespace-nowrap font-serif text-[18vw] font-light leading-none tracking-tight">
          {WORDS.concat(WORDS).map((w, i) => (
            <span key={i} className="mr-16 inline-block">
              {w === "ReLive." ? <span className="italic text-primary">{w}</span> : w}
            </span>
          ))}
        </motion.div>

        <motion.div style={{ x: xSlow }} className="mt-8 flex whitespace-nowrap font-sans text-[6vw] uppercase tracking-[0.05em] text-white/30">
          {"nutrition · training · recovery · marketplace · escrow · ai coach · ".repeat(4)}
        </motion.div>
      </div>
    </section>
  );
}
