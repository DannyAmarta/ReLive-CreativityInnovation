"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const MARQUEE_ITEMS = [
  "ABSOLUTE PRIVACY",
  "HONEST 1RM MATH",
  "DUAL-CURRENCY ESCROW",
  "CNS-FATIGUE GUARD",
  "3D WELLNESS WORLD",
  "SAFETY ENVELOPE AI",
  "TRAINER MARKETPLACE",
  "RECIPE × NUTRITION LINKS",
];

export function MotionFooter() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const tiltY = useTransform(scrollYProgress, [0, 1], [80, -20]);

  return (
    <section ref={ref} className="relative w-full overflow-hidden bg-white text-neutral-900">
      {/* Tilted marquee strip */}
      <div className="relative h-40 overflow-hidden">
        <motion.div
          style={{ y: tiltY, rotate: -4 }}
          className="absolute left-1/2 top-1/2 w-[140vw] -translate-x-1/2 -translate-y-1/2 border-y border-neutral-200 bg-white py-5"
        >
          <div className="flex gap-12 whitespace-nowrap font-display text-2xl uppercase tracking-[0.25em] text-neutral-700 animate-marquee">
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((t, i) => (
              <span key={i} className="flex items-center gap-12">
                <span>{t}</span>
                <span className="text-neutral-400">✦</span>
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      <style>{`
        .animate-marquee {
          animation: relive-marquee 38s linear infinite;
        }
        @keyframes relive-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-33.333%); }
        }
      `}</style>

      <div className="relative mx-auto flex max-w-6xl flex-col items-center px-6 pt-40 pb-12 text-center">
        <h2
          className="font-display leading-[0.9] text-transparent bg-clip-text bg-gradient-to-b from-neutral-900 via-neutral-600 to-neutral-300"
          style={{ fontSize: "clamp(4rem, 13vw, 11rem)" }}
        >
          Ready to ReLive?
        </h2>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#"
            className="inline-flex items-center gap-3 rounded-full border border-neutral-200 bg-white px-7 py-4 text-sm font-medium text-neutral-900 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="size-5"><path d="M17.5 12.5c0-2.4 2-3.5 2-3.6-1.1-1.6-2.8-1.8-3.4-1.8-1.5-.2-2.9.9-3.6.9-.8 0-1.9-.9-3.1-.8-1.6 0-3 .9-3.9 2.4-1.7 2.9-.4 7.1 1.2 9.4.8 1.2 1.7 2.4 3 2.4 1.2-.1 1.6-.8 3.1-.8s1.8.8 3.1.8 2.2-1.2 3-2.3c.9-1.3 1.3-2.6 1.3-2.7-.1 0-2.7-1-2.7-3.9zM15 4.8c.6-.7 1-1.8.9-2.8-.9 0-2 .6-2.6 1.3-.6.7-1.1 1.7-1 2.7 1 .1 2-.5 2.7-1.2z"/></svg>
            Download iOS
          </a>
          <a
            href="#"
            className="inline-flex items-center gap-3 rounded-full border border-neutral-200 bg-white px-7 py-4 text-sm font-medium text-neutral-900 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="size-5"><path d="M17.5 9.2 19.3 6c.1-.2 0-.4-.2-.5s-.4 0-.5.2l-1.8 3.2c-1.4-.6-3-1-4.8-1s-3.4.4-4.8 1L5.4 5.7c-.1-.2-.3-.3-.5-.2s-.3.3-.2.5L6.5 9.2C3.7 10.7 1.8 13.5 1.5 17h21c-.3-3.5-2.2-6.3-5-7.8zM7 14.5c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm10 0c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1z"/></svg>
            Download Android
          </a>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs">
          {["Privacy Policy", "Terms of Service", "Support"].map((l) => (
            <a key={l} href="#" className="rounded-full border border-neutral-200 px-4 py-2 text-neutral-600 transition-colors hover:bg-neutral-50">
              {l}
            </a>
          ))}
        </div>

        {/* Ghost word */}
        <div
          aria-hidden
          className="pointer-events-none mt-24 select-none font-display leading-none text-neutral-200"
          style={{ fontSize: "clamp(8rem, 28vw, 24rem)" }}
        >
          ReLive
        </div>

        <div className="mt-8 flex w-full flex-col items-center justify-between gap-4 border-t border-neutral-200 pt-8 text-xs text-neutral-500 md:flex-row">
          <p>© {new Date().getFullYear()} ReLive. All rights reserved.</p>
          <p className="inline-flex items-center gap-2">
            CRAFTED WITH <span className="inline-block size-4 rounded-full bg-rose-500" /> BY <span className="font-display text-neutral-900">ReLive</span>
          </p>
          <button
            onClick={() => typeof window !== "undefined" && window.scrollTo({ top: 0, behavior: "smooth" })}
            className="inline-flex size-9 items-center justify-center rounded-full border border-neutral-200 text-neutral-700 transition-colors hover:bg-neutral-50"
            aria-label="Back to top"
          >
            ↑
          </button>
        </div>
      </div>
    </section>
  );
}
