"use client";
import { motion } from "framer-motion";
import BlurHeading from "./BlurHeading";

const TESTIMONIALS = [
  {
    quote:
      "ReLive turned my coaching into a real ledger. Bookings settle in escrow, fatigue flags catch the bad days, and the world view makes the whole practice feel alive.",
    name: "Maya R.",
    role: "Strength Coach · Bali",
  },
  {
    quote:
      "I track every gram and every set in one place. The Qwen coach never pushes me past my safety envelope — it suggests, the math decides.",
    name: "Arif S.",
    role: "Trainee · Jakarta",
  },
  {
    quote:
      "Dual-currency escrow finally makes sense. IDR for my local clients, USDC on Solana for the rest. Releases are browser-signed and trust-less.",
    name: "Lena K.",
    role: "Mobility Trainer · Berlin",
  },
  {
    quote:
      "The cookbook scroll plus the nutrition hub means I plan a recipe and the macros are already in my day. It feels like one continuous tool, not a stack.",
    name: "Devon P.",
    role: "Nutritionist · NYC",
  },
];

export default function Testimonials() {
  return (
    <section
      id="testimonials"
      className="relative bg-[#f6f1e7] py-32 md:py-48 overflow-hidden"
    >
      {/* botanical ripple ambient */}
      <div className="relive-ripple absolute inset-0 pointer-events-none flex items-center justify-center" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#f6f1e7] via-transparent to-[#f6f1e7] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-6 text-center">
        <p className="font-inter text-xs uppercase tracking-[0.4em] text-[#c77a5a] mb-6">
          / from the world
        </p>
        <BlurHeading
          as="h2"
          className="font-sora text-4xl md:text-6xl font-light leading-[1.05] text-[#233126] max-w-3xl mx-auto"
        >
          What the living body{" "}
          <span className="italic text-[#2d5a27]">has to say.</span>
        </BlurHeading>
        <p className="font-inter mt-6 text-[#233126]/65 max-w-xl mx-auto">
          Trainers and trainees from across the ReLive world — every quote is a
          real entry in a real ledger.
        </p>
      </div>

      <div className="relative max-w-6xl mx-auto px-6 mt-20 grid md:grid-cols-2 gap-6 md:gap-8">
        {TESTIMONIALS.map((t, i) => (
          <motion.article
            key={i}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.4 }}
            transition={{
              duration: 0.7,
              delay: i * 0.08,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative rounded-3xl bg-white/70 backdrop-blur-xl border border-[#2d5a27]/10 p-10 shadow-[0_20px_60px_-30px_rgba(45,90,39,0.25)]"
          >
            <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-[#c77a5a]/80 border border-white shadow" />
            <p className="font-inter text-[#233126] text-lg md:text-xl leading-relaxed">
              "{t.quote}"
            </p>
            <div className="mt-8 pt-6 border-t border-[#2d5a27]/10 flex items-center justify-between">
              <div>
                <p className="font-sora font-semibold text-[#2d5a27]">
                  {t.name}
                </p>
                <p className="font-inter text-sm text-[#233126]/60">{t.role}</p>
              </div>
              <span className="font-inter text-xs uppercase tracking-[0.3em] text-[#8ba888]">
                0{i + 1}
              </span>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
