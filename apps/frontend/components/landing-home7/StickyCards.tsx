"use client";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { useRef } from "react";
import BlurHeading from "./BlurHeading";

const CARDS = [
  {
    title: "The Booking Lifecycle",
    sub: "PENDING → ACTIVE → COMPLETED",
    body: "Clients request, payments verify, trainers deliver. Disputes freeze escrow with admin resolution.",
    accent: "from-[#8ba888]/40 to-[#2d5a27]/15",
  },
  {
    title: "AI Coaching, Bounded",
    sub: "Qwen + Safety Envelope",
    body: "The backend computes safe set/rep/weight ranges. The LLM advises within them — never recalculates.",
    accent: "from-[#ffe4ee]/70 to-[#c77a5a]/20",
  },
  {
    title: "Dual-Currency Escrow",
    sub: "IDR via Duitku · USDC on Solana",
    body: "Fiat held server-side; crypto locked on-chain. Browser-signed releases for trustless payouts.",
    accent: "from-[#c77a5a]/35 to-[#8ba888]/20",
  },
  {
    title: "CNS-Fatigue Aware",
    sub: "Append-only WorkoutSet ledger",
    body: "Sudden 1RM drops are flagged so a bad day never poisons your baseline.",
    accent: "from-[#8ba888]/50 to-[#f6f1e7]/40",
  },
];

function Card({ i, total, progress, data }: { i: number; total: number; progress: MotionValue<number>; data: typeof CARDS[number] }) {
  const start = i / total;
  const end = (i + 1) / total;
  const scale = useTransform(progress, [start, end], [1, 1 - (total - i) * 0.04]);
  return (
    <div className="sticky top-0 h-screen flex items-center justify-center px-6">
      <motion.div
        style={{ scale, top: `calc(-5vh + ${i * 30}px)` }}
        className={`relative w-full max-w-4xl h-[70vh] rounded-[2rem] border border-[#2d5a27]/15 bg-gradient-to-br ${data.accent} bg-white/60 backdrop-blur-xl p-12 md:p-16 flex flex-col justify-between shadow-[0_30px_80px_-30px_rgba(45,90,39,0.25)]`}
      >
        <div className="flex justify-between items-start">
          <span className="font-inter text-xs uppercase tracking-[0.3em] text-[#2d5a27]">{data.sub}</span>
          <span className="font-inter text-xs tabular-nums text-[#233126]/40">0{i + 1}</span>
        </div>
        <div>
          <h3 className="font-sora text-4xl md:text-6xl font-light text-[#2d5a27] leading-[1.05] mb-6">{data.title}</h3>
          <p className="font-inter text-[#233126]/75 text-lg md:text-xl max-w-2xl leading-relaxed">{data.body}</p>
        </div>
      </motion.div>
    </div>
  );
}

export default function StickyCards() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  return (
    <section id="features" ref={ref} className="relative bg-[#f6f1e7] text-[#233126]">
      <div className="pt-32 pb-16 text-center px-6">
        <p className="font-inter text-xs uppercase tracking-[0.4em] text-[#c77a5a] mb-4">The Spine</p>
        <BlurHeading as="h2" className="font-sora text-4xl md:text-6xl font-light text-[#233126]">
          Four pillars, <span className="italic text-[#8ba888]">stacked.</span>
        </BlurHeading>
      </div>
      {CARDS.map((c, i) => (
        <Card key={i} i={i} total={CARDS.length} progress={scrollYProgress} data={c} />
      ))}
    </section>
  );
}
