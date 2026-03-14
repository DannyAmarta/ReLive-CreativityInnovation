"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ═══════════ DATA ═══════════ */
const BOOK_PAGES = [
  {
    left:  { chapter: "Prologue", title: "The Book of Knowledge", subtitle: "An Ancient Artifact Awakens", content: "A book is a rectangular object made of many thin sheets of paper stacked and bound together along one edge. The outside is protected by a cover made from thick cardboard or hard material.\n\nWhen closed, a book appears as a solid block — a flat front and back cover and a spine that holds all the pages together.\n\nMay your journey through these pages reveal the secrets within.", centered: true },
    right: { chapter: "I", title: "Anatomy of a Book", subtitle: "Structure & Form", content: "A book is a rectangular object made of many thin sheets of paper stacked and bound together along one edge. The outside is usually protected by a cover made from thick paper, cardboard, or sometimes hard material.\n\nWhen closed, a book appears as a solid block with a flat front and back cover and a spine that holds all the pages together.\n\nBooks can vary in size, thickness, and design, but most share the same basic physical structure of bound pages enclosed by a protective cover.", centered: false },
  },
  {
    left:  { chapter: "II", title: "Forces & Gravity", subtitle: "Physical Standpoint", content: "A book, when observed from a physical standpoint, behaves like any other solid object that obeys the laws of physics. It has mass, volume, and occupies space, meaning it interacts with forces such as gravity and friction.\n\nWhen a book is placed on a table, gravity pulls it downward toward the Earth, while the table provides an equal and opposite normal force.\n\nThe stability of a book depends on the balance of these forces.", centered: false },
    right: { chapter: "III", title: "Motion & Friction", subtitle: "Newton's Laws", content: "The motion of a book can also be explained using Newton's laws of motion. According to the first law, a book will remain at rest on a table unless acted upon by an external force.\n\nIf a person slides the book across the table, the applied force causes the book to accelerate in the direction of the push.\n\nHowever, the motion gradually slows down due to friction between the surface of the book and the table.", centered: false },
  },
  {
    left:  { chapter: "IV", title: "Material Properties", subtitle: "Structural Deformation", content: "Most books are made of paper sheets bound together with glue or thread and covered with a cardboard or hard cover. Paper itself is composed of cellulose fibers that give it strength and flexibility.\n\nBecause of this structure, the pages of a book can bend easily but still maintain their shape.\n\nWhen a force is applied to a page, such as when turning it, the page undergoes slight elastic deformation and returns to its original form once the force is removed.", centered: false },
    right: { chapter: "V", title: "Light & Perception", subtitle: "Optical Physics", content: "The interaction between a book and light is a crucial aspect of its physical behavior. Books are designed so that printed text reflects light into the reader's eyes, allowing the information to be perceived.\n\nThe white or light-colored paper reflects most wavelengths of visible light, while the dark ink absorbs more light, creating contrast that makes letters visible.\n\nWithout sufficient light, reading becomes difficult because the reflected light reaching the eyes is reduced.", centered: false },
  },
];

/* ═══════════ CONSTANTS ═══════════ */
const OPEN_W = 960;
const OPEN_H = 580;
const CLOSED_W = 430;

/* ═══════════ PARTICLES ═══════════ */
const PARTICLES = Array.from({ length: 50 }, (_, i) => ({
  id: i, x: Math.random() * 100, y: Math.random() * 100,
  r: 0.8 + Math.random() * 2.2, dur: 4 + Math.random() * 8, del: Math.random() * 6,
  dx: (Math.random() - 0.5) * 90, dy: -(50 + Math.random() * 130),
  color: i % 5 === 0 ? "rgba(255,200,120,0.9)" : i % 3 === 0 ? "rgba(120,200,255,0.9)" : "rgba(200,160,255,0.9)",
}));

/* ═══════════ NIGHT BACKDROP ═══════════ */
function NightBackdrop() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 30% 20%, rgba(80,40,140,0.8) 0%, rgba(20,15,60,0.95) 40%, rgba(5,5,20,1) 100%)" }} />
      <svg className="absolute bottom-0 left-0 right-0 w-full" height="36%" preserveAspectRatio="none" viewBox="0 0 1200 400">
        <path d="M0 400 L0 280 Q100 200 200 260 Q280 195 360 240 Q440 155 540 220 Q620 140 720 200 Q800 115 880 185 Q960 100 1040 170 Q1110 128 1200 158 L1200 400 Z" fill="rgba(25,15,55,0.85)" />
        <path d="M0 400 L0 320 Q120 265 240 310 Q360 245 480 290 Q570 252 660 295 Q760 238 860 285 Q950 248 1040 278 Q1120 245 1200 263 L1200 400 Z" fill="rgba(30,18,65,0.9)" />
      </svg>
      <div className="absolute bottom-0 left-0 right-0 h-[16%]" style={{ background: "linear-gradient(to top, rgba(60,30,120,0.45) 0%, transparent 100%)" }} />
      {Array.from({ length: 55 }, (_, i) => (
        <motion.div key={i} className="absolute rounded-full bg-white"
          style={{ left: `${(i * 17.3) % 100}%`, top: `${(i * 13.7) % 55}%`, width: i % 8 === 0 ? 2.5 : 1.5, height: i % 8 === 0 ? 2.5 : 1.5, opacity: 0.3 }}
          animate={{ opacity: [0.15, 0.8, 0.15] }}
          transition={{ duration: 2 + (i % 5), delay: (i % 7) * 0.7, repeat: Infinity }}
        />
      ))}
      <motion.div className="absolute pointer-events-none" style={{ top: "18%", left: "50%", transform: "translateX(-50%)", width: 900, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(120,60,220,0.13) 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 5, repeat: Infinity }} />
    </div>
  );
}

/* ═══════════ FLOATING PARTICLES ═══════════ */
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
      {PARTICLES.map((p) => (
        <motion.div key={p.id} className="absolute rounded-full"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.r * 2, height: p.r * 2, background: p.color, boxShadow: `0 0 ${p.r * 5}px ${p.r * 2}px ${p.color}` }}
          animate={{ opacity: [0, 0.9, 0.9, 0], x: [0, p.dx * 0.4, p.dx], y: [0, p.dy * 0.5, p.dy], scale: [0.5, 1.3, 0.8, 0] }}
          transition={{ duration: p.dur, delay: p.del, repeat: Infinity, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

/* ═══════════ SPARKLE BURST ═══════════ */
function SparkleFlip({ active }: { active: boolean }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
          {Array.from({ length: 12 }, (_, i) => {
            const rad = ((i / 12) * 360 * Math.PI) / 180;
            const dist = 55 + (i % 3) * 25;
            return (
              <motion.div key={i} className="absolute left-1/2 top-1/2 rounded-full"
                style={{ width: 4 + (i % 3) * 2, height: 4 + (i % 3) * 2, background: i % 3 === 0 ? "rgba(255,220,100,1)" : i % 2 === 0 ? "rgba(160,200,255,1)" : "rgba(200,150,255,1)" }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1.5 }}
                animate={{ x: Math.cos(rad) * dist, y: Math.sin(rad) * dist, opacity: 0, scale: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.65, ease: "easeOut" }}
              />
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ═══════════ MAGICAL COVER FACE (HSR Arch style) ═══════════ */
function MagicalCoverFace() {
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: "3px 12px 12px 3px" }}>
      {/* Sky background */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(165deg, #0b0f2a 0%, #0e1850 30%, #091235 65%, #060b1e 100%)" }} />
      {/* Star field */}
      {Array.from({ length: 40 }, (_, i) => (
        <motion.div key={i} className="absolute rounded-full bg-white"
          style={{ left: `${(i * 23.7) % 95 + 2}%`, top: `${(i * 17.3) % 80 + 5}%`, width: i % 7 === 0 ? 2 : 1, height: i % 7 === 0 ? 2 : 1, opacity: 0.4 }}
          animate={{ opacity: [0.1, 0.9, 0.1] }} transition={{ duration: 2 + (i % 4), delay: (i % 5) * 0.5, repeat: Infinity }} />
      ))}
      {/* Stone arch frame */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 300 430" preserveAspectRatio="xMidYMid slice">
        {/* Outer stone border */}
        <rect x="2" y="2" width="296" height="426" rx="6" fill="none" stroke="rgba(170,160,140,0.7)" strokeWidth="4" />
        <rect x="8" y="8" width="284" height="414" rx="4" fill="none" stroke="rgba(150,140,120,0.4)" strokeWidth="1.5" />
        {/* Top arch */}
        <path d="M20 70 L20 20 Q20 10 30 10 L270 10 Q280 10 280 20 L280 70 Q280 100 150 115 Q20 100 20 70 Z" fill="rgba(100,90,70,0.35)" stroke="rgba(160,150,130,0.55)" strokeWidth="1.5" />
        {/* Stone column left */}
        <rect x="10" y="8" width="28" height="414" rx="3" fill="rgba(85,78,62,0.45)" />
        <rect x="12" y="10" width="24" height="410" rx="2" fill="none" stroke="rgba(140,130,110,0.3)" strokeWidth="1" />
        {[0,1,2,3,4,5,6,7,8,9].map(i => <line key={i} x1="10" y1={45 + i * 40} x2="38" y2={45 + i * 40} stroke="rgba(120,110,90,0.3)" strokeWidth="0.7" />)}
        {/* Stone column right */}
        <rect x="262" y="8" width="28" height="414" rx="3" fill="rgba(85,78,62,0.45)" />
        <rect x="264" y="10" width="24" height="410" rx="2" fill="none" stroke="rgba(140,130,110,0.3)" strokeWidth="1" />
        {[0,1,2,3,4,5,6,7,8,9].map(i => <line key={i} x1="262" y1={45 + i * 40} x2="290" y2={45 + i * 40} stroke="rgba(120,110,90,0.3)" strokeWidth="0.7" />)}
        {/* Corner ornaments */}
        <circle cx="20" cy="20" r="8" fill="rgba(130,120,100,0.6)" stroke="rgba(200,185,130,0.7)" strokeWidth="1.2" />
        <circle cx="280" cy="20" r="8" fill="rgba(130,120,100,0.6)" stroke="rgba(200,185,130,0.7)" strokeWidth="1.2" />
        <circle cx="20" cy="410" r="8" fill="rgba(130,120,100,0.6)" stroke="rgba(200,185,130,0.7)" strokeWidth="1.2" />
        <circle cx="280" cy="410" r="8" fill="rgba(130,120,100,0.6)" stroke="rgba(200,185,130,0.7)" strokeWidth="1.2" />
        {/* Bottom stone ledge */}
        <path d="M10 390 L290 390 L290 422 L10 422 Z" fill="rgba(75,68,52,0.55)" stroke="rgba(140,130,110,0.4)" strokeWidth="1" />
      </svg>
      {/* Central celestial wheel */}
      <div className="absolute flex items-center justify-center pointer-events-none" style={{ top: "12%", left: "13%", right: "13%", bottom: "22%" }}>
        {/* Outer moon phase ring */}
        <motion.div className="absolute" animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }}>
          <svg width="240" height="240" viewBox="0 0 240 240">
            <circle cx="120" cy="120" r="112" stroke="rgba(140,170,220,0.35)" fill="none" strokeWidth="1.5" />
            {[...Array(28)].map((_, j) => { const a = (j/28)*Math.PI*2; const r0=108, r1 = j%7===0?100:j%2===0?104:106; return <line key={j} x1={120+Math.cos(a)*r1} y1={120+Math.sin(a)*r1} x2={120+Math.cos(a)*112} y2={120+Math.sin(a)*112} stroke="rgba(160,190,230,0.55)" strokeWidth={j%7===0?2:0.8} />; })}
            {/* Moon phases */}
            {[...Array(8)].map((_, j) => { const a=(j/8)*Math.PI*2; const cx=120+Math.cos(a)*100; const cy=120+Math.sin(a)*100; return <g key={j}><circle cx={cx} cy={cy} r="7" fill="rgba(160,185,230,0.5)" stroke="rgba(200,215,255,0.6)" strokeWidth="0.8" /><circle cx={cx+3} cy={cy} r="5.5" fill="rgba(8,15,50,0.85)" /></g>; })}
          </svg>
        </motion.div>
        {/* Middle star wheel */}
        <motion.div className="absolute" animate={{ rotate: -360 }} transition={{ duration: 22, repeat: Infinity, ease: "linear" }}>
          <svg width="170" height="170" viewBox="0 0 170 170">
            <circle cx="85" cy="85" r="78" stroke="rgba(120,155,215,0.28)" fill="none" strokeWidth="1" strokeDasharray="6 4" />
            {[...Array(24)].map((_, j) => { const a=(j/24)*Math.PI*2; return <line key={j} x1={85+Math.cos(a)*70} y1={85+Math.sin(a)*70} x2={85+Math.cos(a)*78} y2={85+Math.sin(a)*78} stroke="rgba(180,200,240,0.5)" strokeWidth={j%6===0?1.5:0.6} />; })}
            {[0,45,90,135,180,225,270,315].map((deg,j) => { const r=(deg*Math.PI)/180; return <polygon key={j} points={`${85+Math.cos(r)*68},${85+Math.sin(r)*68} ${85+Math.cos(r+0.2)*74},${85+Math.sin(r+0.2)*74} ${85+Math.cos(r-0.2)*74},${85+Math.sin(r-0.2)*74}`} fill="rgba(150,190,255,0.7)" />; })}
          </svg>
        </motion.div>
        {/* Inner glowing star burst */}
        <motion.div className="absolute" animate={{ rotate: 360 }} transition={{ duration: 9, repeat: Infinity, ease: "linear" }}>
          <svg width="100" height="100" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" stroke="rgba(200,220,255,0.2)" fill="none" strokeWidth="0.8" />
            {[...Array(16)].map((_, j) => { const a=(j/16)*Math.PI*2; const r=j%2===0?42:36; return <line key={j} x1="50" y1="50" x2={50+Math.cos(a)*r} y2={50+Math.sin(a)*r} stroke={j%2===0?"rgba(160,210,255,0.8)":"rgba(220,240,255,0.4)"} strokeWidth={j%2===0?1.5:0.6} />; })}
          </svg>
        </motion.div>
        {/* Central glow core */}
        <motion.div className="absolute w-14 h-14 rounded-full" style={{ background: "radial-gradient(circle, rgba(200,230,255,0.95) 0%, rgba(120,170,255,0.6) 40%, transparent 75%)" }}
          animate={{ scale: [1, 1.4, 1], opacity: [0.65, 1, 0.65] }} transition={{ duration: 2.2, repeat: Infinity }} />
        <motion.div className="absolute w-5 h-5 rounded-full bg-white" style={{ boxShadow: "0 0 20px 8px rgba(180,220,255,0.9)" }}
          animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
        {/* Orbiting moons */}
        {[0,72,144,216,288].map((deg,i) => { const r=(deg*Math.PI)/180; return (
          <motion.div key={i} className="absolute" animate={{ rotate: 360 }} transition={{ duration: 6, repeat: Infinity, ease:"linear", delay: i*1.2 }} style={{ transformOrigin:"0 0" }}>
            <div style={{ transform: `translate(${Math.cos(r)*90}px,${Math.sin(r)*90}px)` }}>
              <motion.div className="rounded-full" style={{ width:9, height:9, background:"rgba(180,210,255,0.9)", boxShadow:"0 0 10px 4px rgba(140,180,255,0.7)" }}
                animate={{ scale:[0.7,1.3,0.7], opacity:[0.4,1,0.4] }} transition={{ duration:1.8+i*0.3, repeat:Infinity }} />
            </div>
          </motion.div>
        ); })}
      </div>
      {/* Title area at bottom */}
      <div className="absolute bottom-[4%] left-0 right-0 text-center pointer-events-none">
        <div className="w-2/3 h-[1px] bg-gradient-to-r from-transparent via-blue-300/40 to-transparent mx-auto mb-1.5" />
        <motion.h2 className="text-blue-100/90 text-base font-bold tracking-[0.22em] uppercase" style={{ fontFamily: "Georgia, serif", textShadow: "0 0 16px rgba(140,190,255,0.9)" }}
          animate={{ textShadow: ["0 0 8px rgba(100,160,255,0.5)", "0 0 28px rgba(160,210,255,1)", "0 0 8px rgba(100,160,255,0.5)"] }} transition={{ duration: 2.5, repeat: Infinity }}>
          Cookbook
        </motion.h2>
        <p className="text-blue-300/45 text-[7px] mt-0.5 tracking-[0.35em] uppercase">ReLive · Arcanum</p>
        <div className="w-1/2 h-[1px] bg-gradient-to-r from-transparent via-blue-300/30 to-transparent mx-auto mt-1.5" />
      </div>
      {/* Spine shadow left edge */}
      <div className="absolute top-0 bottom-0 left-0 w-6 bg-gradient-to-r from-black/60 to-transparent pointer-events-none" />
    </div>
  );
}

/* ═══════════ INSIDE COVER FACE ═══════════ */
function InsideCoverFace() {
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: "linear-gradient(160deg, #1a0e38 0%, #140a28 100%)", borderRadius: "4px 14px 14px 4px" }}>
      <div className="absolute inset-[10px] border border-purple-300/12 rounded-md" />
    </div>
  );
}

/* ═══════════ PAPER PAGE ═══════════ */
function PaperPage({ side, children, showFlipHint = false }: { side: "left" | "right"; children?: React.ReactNode; showFlipHint?: boolean }) {
  const isLeft = side === "left";
  return (
    <div className="absolute inset-0 overflow-hidden" style={{
      background: isLeft
        ? "linear-gradient(to right, #ede8db 0%, #f3ede0 30%, #f7f2e6 100%)"
        : "linear-gradient(to left,  #ede8db 0%, #f3ede0 30%, #f7f2e6 100%)",
      borderRadius: isLeft ? "2px 0 0 2px" : "0 2px 2px 0",
    }}>
      {/* Subtle top decorative arch line */}
      <svg className="absolute top-0 left-0 right-0 w-full pointer-events-none" height="40" preserveAspectRatio="none" viewBox="0 0 400 40">
        <path d="M0 40 Q200 0 400 40 L400 0 L0 0 Z" fill="rgba(160,140,105,0.04)" />
        <path d="M40 0 Q200 32 360 0" stroke="rgba(160,140,105,0.14)" fill="none" strokeWidth="0.8" />
        <circle cx="200" cy="20" r="2.5" fill="none" stroke="rgba(160,140,105,0.2)" strokeWidth="0.7" />
      </svg>
      {/* Subtle bottom line */}
      <svg className="absolute bottom-0 left-0 right-0 w-full pointer-events-none" height="28" preserveAspectRatio="none" viewBox="0 0 400 28">
        <path d="M0 0 Q200 24 400 0 L400 28 L0 28 Z" fill="rgba(160,140,105,0.035)" />
      </svg>
      {/* Left page: architectural column decoration in far left margin */}
      {isLeft && (
        <svg className="absolute top-0 bottom-0 left-0 h-full pointer-events-none" width="38" preserveAspectRatio="xMidYMid meet" viewBox="0 0 38 600">
          {/* Column shaft */}
          <rect x="14" y="40" width="10" height="520" fill="rgba(160,145,115,0.12)" />
          {/* Column lines */}
          {[...Array(14)].map((_, j) => <line key={j} x1="14" y1={40 + j * 38} x2="24" y2={40 + j * 38} stroke="rgba(140,125,95,0.2)" strokeWidth="0.6" />)}
          {/* Capital top */}
          <path d="M6 40 L32 40 L28 28 L10 28 Z" fill="rgba(155,140,110,0.2)" />
          <rect x="4" y="28" width="30" height="4" fill="rgba(155,140,110,0.15)" />
          {/* Base bottom */}
          <path d="M6 560 L32 560 L28 572 L10 572 Z" fill="rgba(155,140,110,0.2)" />
          <rect x="4" y="568" width="30" height="4" fill="rgba(155,140,110,0.15)" />
          {/* Subtle flute lines on shaft */}
          <line x1="17" y1="40" x2="17" y2="560" stroke="rgba(140,125,95,0.1)" strokeWidth="0.5" />
          <line x1="21" y1="40" x2="21" y2="560" stroke="rgba(140,125,95,0.1)" strokeWidth="0.5" />
        </svg>
      )}
      {/* Spine-side gradient (pages curve into binding) */}
      {isLeft  && <div className="absolute top-0 bottom-0 right-0 w-20 pointer-events-none" style={{ background: "linear-gradient(to left,  rgba(0,0,0,0.055) 0%, transparent 100%)" }} />}
      {!isLeft && <div className="absolute top-0 bottom-0 left-0  w-20 pointer-events-none" style={{ background: "linear-gradient(to right, rgba(0,0,0,0.055) 0%, transparent 100%)" }} />}
      {/* Thin frame border */}
      <div className="absolute inset-[5px] border border-[rgba(160,140,105,0.18)] rounded-[2px] pointer-events-none" />
      {children}
      {showFlipHint && (
        <motion.div className="absolute bottom-4 right-5 pointer-events-none flex items-center gap-1.5" animate={{ x: [0, 7, 0] }} transition={{ duration: 1.4, repeat: Infinity }}>
          <span className="text-[9px] uppercase tracking-[0.28em] text-amber-800/40 font-bold">Flip</span>
          <svg width="18" height="18" viewBox="0 0 18 18" className="text-amber-700/50">
            <path d="M2 9 L14 9 M9 4 L14 9 L9 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>
      )}
    </div>
  );
}

/* ═══════════ PAGE CONTENT ═══════════ */
function PageContent({ data, pageNum }: { data: any; pageNum: number }) {
  return (
    <div className={`absolute inset-0 flex flex-col px-6 py-6 ${data.centered ? "items-center text-center justify-center" : ""}`}>
      {data.chapter && (
        <div className="mb-3 mx-auto">
          <div className="relative">
            <div className="absolute -inset-[1px] rounded-full bg-gradient-to-r from-amber-400/30 to-yellow-300/22 blur-[2px]" />
            <div className="relative bg-gradient-to-r from-amber-800/60 to-amber-700/50 text-amber-100 px-5 py-0.5 rounded-full text-[9px] font-bold tracking-[0.25em] uppercase">{data.chapter}</div>
          </div>
        </div>
      )}
      <h2 className="text-[15px] font-bold text-amber-900/88 leading-snug tracking-wide whitespace-pre-wrap mt-1" style={{ fontFamily: "Georgia, serif" }}>{data.title}</h2>
      {data.subtitle && <p className="text-[9px] text-amber-700/48 mt-1 tracking-[0.2em] uppercase font-semibold">{data.subtitle}</p>}
      <div className="relative my-3">
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-amber-800/20 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rotate-45 border border-amber-800/20 bg-amber-50" />
      </div>
      <div className="flex-1 overflow-y-auto min-h-0">
        <pre className="text-[10.5px] text-amber-950/65 whitespace-pre-wrap leading-relaxed" style={{ fontFamily: "Georgia, serif" }}>{data.content}</pre>
      </div>
      <p className="text-center text-[8px] text-amber-700/30 mt-2 italic" style={{ fontFamily: "Georgia, serif" }}>— {pageNum} —</p>
    </div>
  );
}

/* ═══════════ PAGE EDGES (HSR reference style) ═══════════ */
function PageEdges({ side }: { side: "left" | "right" }) {
  const isLeft = side === "left";
  // Left side = brown leather spine; Right side = cream page stack
  if (isLeft) {
    return (
      <div className="absolute top-0 bottom-0 pointer-events-none z-30" style={{ left: -22, width: 22 }}>
        {/* Brown spine */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, #2a1a0a, #5c3a1e, #7a4e2a, #5c3a1e, #2a1a0a)", boxShadow: "-4px 0 18px rgba(0,0,0,0.7)" }} />
        {/* Spine highlight */}
        <div className="absolute top-0 bottom-0 w-[3px] left-[8px]" style={{ background: "linear-gradient(to bottom, transparent, rgba(200,150,80,0.3), transparent)" }} />
        {/* Horizontal stitching */}
        {[...Array(10)].map((_, i) => <div key={i} className="absolute left-0 right-0 h-[1px]" style={{ top: `${8 + i * 9}%`, background: "rgba(180,120,60,0.25)" }} />)}
      </div>
    );
  }
  // Right = stacked cream pages — visible thickness
  return (
    <div className="absolute top-[1.5%] bottom-[1.5%] pointer-events-none z-30" style={{ right: -18, width: 18 }}>
      {/* Page stack block */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(to right, #e8d9b8, #f2e6cc, #ede0c0, #f0e5ca)", boxShadow: "4px 0 14px rgba(0,0,0,0.35)" }} />
      {/* Individual page lines */}
      {Array.from({ length: 34 }, (_, i) => (
        <div key={i} className="absolute left-0 right-0 h-[1px]" style={{ top: `${(i / 33) * 98 + 1}%`, background: i % 5 === 0 ? "rgba(160,130,80,0.22)" : "rgba(140,115,70,0.10)" }} />
      ))}
      {/* Right shadow (outer edge of stack) */}
      <div className="absolute top-0 bottom-0 right-0 w-[5px]" style={{ background: "linear-gradient(to right, transparent, rgba(0,0,0,0.2))" }} />
      {/* Top/bottom curve illusion */}
      <div className="absolute top-0 left-0 right-0 h-3" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.15), transparent)" }} />
      <div className="absolute bottom-0 left-0 right-0 h-3" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.15), transparent)" }} />
    </div>
  );
}

/* ═══════════ 3D FLIP LAYER ═══════════ */
function FlipLayer({ front, back, isTurned, zIndex, isAnimating, duration = 0.92 }: { front: React.ReactNode; back: React.ReactNode; isTurned: boolean; zIndex: number; isAnimating: boolean; duration?: number }) {
  return (
    <motion.div className="absolute right-0 top-0 bottom-0 w-1/2"
      style={{ transformOrigin: "left center", transformStyle: "preserve-3d", zIndex }}
      initial={false}
      animate={{ rotateY: isTurned ? -180 : 0, z: isAnimating ? 110 : 0, rotateX: isAnimating ? (isTurned ? [-5, -9, -5, 0] : [5, 9, 5, 0]) : 0, scale: isAnimating ? [1, 1.012, 1.012, 1] : 1 }}
      transition={{ duration, ease: [0.34, 1.1, 0.5, 1] }}
    >
      {/* FRONT */}
      <div className="absolute inset-0" style={{ backfaceVisibility: "hidden" }}>
        {front}
        {/* Corner curl lifts before flip */}
        {!isTurned && (
          <motion.div className="absolute bottom-0 right-0 pointer-events-none" style={{ transformOrigin: "bottom right", zIndex: 10 }}
            animate={isAnimating ? { scaleX: [1, 0.8, 0.6, 0.4], scaleY: [1, 0.85, 0.7, 0.45], rotateZ: [0, -10, -18, -28] } : { scaleX: 1, scaleY: 1, rotateZ: 0 }}
            transition={{ duration: 0.28, ease: "easeIn" }}
          >
            <div style={{ width: 44, height: 44, background: "linear-gradient(315deg, #d4c4a0 0%, #ede0c5 60%, transparent 100%)", borderRadius: "80% 0 0 0", boxShadow: "-3px -3px 12px rgba(0,0,0,0.14)" }} />
          </motion.div>
        )}
        {/* Shadow sweeps across front face as it turns */}
        <motion.div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to right, rgba(0,0,0,0.38) 0%, transparent 52%)" }}
          initial={false} animate={{ opacity: isAnimating && !isTurned ? 0.95 : 0 }} transition={{ duration: 0.32 }} />
      </div>
      {/* BACK */}
      <div className="absolute inset-0" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
        {back}
        <motion.div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to left, rgba(0,0,0,0.38) 0%, transparent 52%)" }}
          initial={false} animate={{ opacity: isAnimating && isTurned ? 0.8 : 0 }} transition={{ duration: 0.38, delay: 0.38 }} />
      </div>
      <SparkleFlip active={isAnimating} />
    </motion.div>
  );
}

/* ═══════════ CLOSED BOOK VIEW ═══════════ */
function ClosedBook({ onOpen }: { onOpen: () => void }) {
  return (
    <motion.div
      className="relative cursor-pointer"
      style={{ width: CLOSED_W, height: OPEN_H, perspective: 1800 }}
      initial={{ y: -40, opacity: 0, scale: 0.9 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
      onClick={onOpen}
    >
      {/* 3D tilt container */}
      <motion.div className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateX: [5, 3, 5], rotateY: [-6, -4, -6] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Leather back cover (bottom face) */}
        <div className="absolute inset-0 rounded-[4px_14px_14px_4px]"
          style={{ background: "linear-gradient(135deg, #5c4530 0%, #4A3F2E 100%)", boxShadow: "0 50px 120px rgba(0,0,0,0.9), 0 0 80px rgba(80,60,200,0.25), 4px 4px 0 rgba(0,0,0,0.5)" }}
        />

        {/* Page edges — right side (many stacked pages) */}
        <div className="absolute top-[2%] bottom-[2%] right-[-16px] flex flex-col gap-[1px] z-10 pointer-events-none" style={{ width: 16 }}>
          {Array.from({ length: 32 }, (_, i) => (
            <div key={i} style={{ flex: 1, background: `hsl(${43 + (i % 4)}, ${26 + (i % 3) * 4}%, ${76 + (i % 3) * 5}%)`, boxShadow: "2px 0 4px rgba(0,0,0,0.1)" }} />
          ))}
        </div>

        {/* Page edges — top (book thickness) */}
        <div className="absolute top-[-14px] left-[3%] right-[2%] flex flex-row gap-[1px] z-10 pointer-events-none" style={{ height: 14 }}>
          {Array.from({ length: 40 }, (_, i) => (
            <div key={i} style={{ flex: 1, background: `hsl(${43 + (i % 3)}, 28%, ${80 + (i % 3) * 4}%)`, boxShadow: "0 -1px 3px rgba(0,0,0,0.08)" }} />
          ))}
        </div>

        {/* Leather outer frame */}
        <div className="absolute -inset-[16px] rounded-[6px_18px_18px_6px] pointer-events-none"
          style={{ background: "linear-gradient(135deg, #9B8B6A 0%, #7A6B4E 50%, #4A3F2E 100%)", zIndex: -1 }}>
          <div className="absolute inset-[3px] rounded-[4px_16px_16px_4px]" style={{ background: "linear-gradient(135deg, #B09A78 0%, #8B7B60 50%, #6B5B45 100%)" }} />
          {[...Array(7)].map((_, i) => <div key={i} className="absolute left-[12px] right-[12px] h-[1px] bg-amber-900/7" style={{ top: `${13 + i * 12}%` }} />)}
          <div className="absolute inset-[14px] rounded-[3px_14px_14px_3px] border border-yellow-400/18" />
        </div>

        {/* Spine */}
        <div className="absolute top-0 bottom-0 left-0 w-[12px] rounded-l-sm z-20 pointer-events-none"
          style={{ background: "linear-gradient(to right, #2d200e, #4a3420, #2d200e)", boxShadow: "inset 2px 0 8px rgba(0,0,0,0.4)" }} />
        <motion.div className="absolute top-0 bottom-0 left-0 w-[22px] pointer-events-none" style={{ zIndex: 19, background: "radial-gradient(ellipse at left, rgba(120,100,255,0.28) 0%, transparent 70%)" }}
          animate={{ opacity: [0.3, 0.9, 0.3] }} transition={{ duration: 2.5, repeat: Infinity }} />

        {/* Cover face */}
        <MagicalCoverFace />

        {/* "Tap to open" hint */}
        <motion.div className="absolute bottom-5 left-0 right-0 flex justify-center pointer-events-none z-30"
          animate={{ opacity: [0.5, 1, 0.5], y: [0, -4, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/10">
            <svg width="16" height="16" viewBox="0 0 16 16" className="text-yellow-200/80">
              <path d="M8 2 L8 14 M4 10 L8 14 L12 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-[10px] text-white/65 tracking-[0.25em] uppercase font-bold">Tap to Open</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Ambient glow around closed book */}
      <motion.div className="absolute -inset-16 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(100,80,220,0.18) 0%, transparent 65%)", zIndex: -1 }}
        animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.12, 1] }} transition={{ duration: 3.5, repeat: Infinity }} />
    </motion.div>
  );
}

/* ═══════════ OPEN BOOK ═══════════ */
function OpenBook({ currentPage, totalPages, flipDir, onPrev, onNext, onDotClick, isFlipping, onClose }: {
  currentPage: number; totalPages: number; flipDir: "next" | "prev";
  onPrev: () => void; onNext: () => void; onDotClick: (i: number) => void;
  isFlipping: boolean; onClose: () => void;
}) {
  return (
    <motion.div className="relative z-10 flex flex-col items-center" style={{ perspective: 3500 }}
      initial={{ scale: 0.55, opacity: 0, rotateY: -90 }}
      animate={{ scale: 1, opacity: 1, rotateY: 0 }}
      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Ground shadow */}
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 h-6 rounded-full blur-3xl pointer-events-none" style={{ width: "70%", background: "rgba(60,30,120,0.55)" }} />

      {/* Water reflection */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 pointer-events-none overflow-hidden" style={{ width: OPEN_W, height: 44 }}>
        <div className="w-full h-full" style={{ background: "linear-gradient(to bottom, rgba(80,60,150,0.35) 0%, transparent 100%)", transform: "scaleY(-1)", filter: "blur(4px)" }} />
      </div>

      {/* Camera tilt wrapper */}
      <motion.div style={{ perspective: 3500 }}
        animate={{ rotateX: 4, rotateY: 1.5 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        {/* Book container */}
        <div className="relative flex" style={{ width: OPEN_W, height: OPEN_H }}>

          {/* Thin gold HSR-style frame — replaces heavy leather outer cover */}
          <div className="absolute pointer-events-none" style={{ inset: -14, borderRadius: 10, boxShadow: "0 40px 110px rgba(0,0,0,0.88), 0 0 60px rgba(80,60,200,0.18)" }}>
            {/* Gold outer border */}
            <div className="absolute inset-0 rounded-[10px] border-[3px] border-yellow-600/70" style={{ boxShadow: "inset 0 0 0 1px rgba(255,210,80,0.2)" }} />
            {/* Inner recessed line */}
            <div className="absolute inset-[5px] rounded-[6px] border border-yellow-500/30" />
            {/* Corner accent gems */}
            {["top-0 left-0","top-0 right-0","bottom-0 left-0","bottom-0 right-0"].map((cls,i) => (
              <div key={i} className={`absolute ${cls} w-5 h-5 m-[-1px] rounded-sm`}
                style={{ background: "linear-gradient(135deg, #c89820, #8b6010)", boxShadow: "0 0 8px rgba(200,160,30,0.5)" }} />
            ))}
          </div>

          <PageEdges side="left" />
          <PageEdges side="right" />

          {/* Spine: subtle shadow join — pages flow naturally to each other */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[6px] z-20 pointer-events-none"
            style={{ background: "linear-gradient(to right, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.04) 50%, rgba(0,0,0,0.18) 100%)" }} />
          {/* Spine magical glow */}
          <motion.div className="absolute left-1/2 -translate-x-1/2 top-[5%] bottom-[5%] w-[20px] pointer-events-none" style={{ zIndex: 19, background: "radial-gradient(ellipse at center, rgba(140,120,255,0.22) 0%, transparent 70%)" }}
            animate={{ opacity: [0.25, 0.85, 0.25] }} transition={{ duration: 3, repeat: Infinity }} />

          {/* Static base pages */}
          <div className="absolute left-0 top-0 bottom-0 w-1/2 z-0"><PaperPage side="left" /></div>
          <div className="absolute right-0 top-0 bottom-0 w-1/2 z-0">
            <PaperPage side="right"><PageContent data={BOOK_PAGES[BOOK_PAGES.length - 1].right} pageNum={BOOK_PAGES.length * 2} /></PaperPage>
          </div>

          {/* Cover flip (starts turned-open) */}
          <FlipLayer zIndex={0} isTurned={true} isAnimating={false} duration={1.4}
            front={<MagicalCoverFace />}
            back={<PaperPage side="left"><PageContent data={BOOK_PAGES[0].left} pageNum={1} /></PaperPage>}
          />

          {/* Inner page flip layers */}
          {BOOK_PAGES.map((page, i) => {
            if (i === BOOK_PAGES.length - 1) return null;
            const isTurned = currentPage > i;
            const isAnimatingNext = isFlipping && flipDir === "next" && currentPage - 1 === i;
            const isAnimatingPrev = isFlipping && flipDir === "prev" && currentPage === i;
            const zLayer = isTurned ? i + 2 : (BOOK_PAGES.length - i) + 1;
            return (
              <FlipLayer key={`flip-${i}`} zIndex={zLayer} isTurned={isTurned} isAnimating={isAnimatingNext || isAnimatingPrev}
                front={<PaperPage side="right" showFlipHint={!isTurned && i === currentPage}><PageContent data={page.right} pageNum={i * 2 + 2} /></PaperPage>}
                back={<PaperPage side="left"><PageContent data={BOOK_PAGES[i + 1].left} pageNum={(i + 1) * 2 + 1} /></PaperPage>}
              />
            );
          })}

          {/* Click zones — HSR orange pill buttons */}
          {currentPage > 0 && (
            <div className="absolute left-0 top-0 bottom-0 w-20 z-50 flex items-end justify-center pb-6">
              <motion.button onClick={onPrev}
                className="flex items-center justify-center gap-1 px-5 py-2.5 rounded-full cursor-pointer select-none"
                style={{ background: "linear-gradient(to bottom, #d97c30, #b85c18)", boxShadow: "0 3px 0 rgba(100,40,0,0.5), 0 6px 20px rgba(0,0,0,0.3)", border: "1px solid rgba(255,160,80,0.3)" }}
                whileHover={{ scale: 1.08, y: -1 }} whileTap={{ scale: 0.95, y: 2 }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" className="text-yellow-100">
                  <path d="M11 4 L5 9 L11 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.button>
            </div>
          )}
          {currentPage < totalPages - 1 && (
            <div className="absolute right-0 top-0 bottom-0 w-20 z-50 flex items-end justify-center pb-6">
              <motion.button onClick={onNext}
                className="flex items-center justify-center gap-1 px-5 py-2.5 rounded-full cursor-pointer select-none"
                style={{ background: "linear-gradient(to bottom, #d97c30, #b85c18)", boxShadow: "0 3px 0 rgba(100,40,0,0.5), 0 6px 20px rgba(0,0,0,0.3)", border: "1px solid rgba(255,160,80,0.3)" }}
                whileHover={{ scale: 1.08, y: -1 }} whileTap={{ scale: 0.95, y: 2 }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" className="text-yellow-100">
                  <path d="M7 4 L13 9 L7 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>

      {/* HUD */}
      <motion.div className="absolute -bottom-20 w-full flex flex-col items-center gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
        <div className="flex items-center gap-2">
          {BOOK_PAGES.map((_, i) => (
            <motion.button key={i} onClick={() => onDotClick(i)}
              className={`rounded-full transition-all duration-300 ${i === currentPage ? "w-4 h-4 bg-purple-300/90" : "w-2.5 h-2.5 bg-white/20 hover:bg-white/38"}`}
              style={i === currentPage ? { boxShadow: "0 0 14px 4px rgba(180,130,255,0.7)" } : {}}
            />
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={onPrev} disabled={currentPage === 0} className="px-5 py-2 rounded-xl text-xs text-white/78 border border-white/14 bg-white/7 hover:bg-white/16 disabled:opacity-20 transition-all backdrop-blur-md">← Prev</button>
          <button onClick={onNext} disabled={currentPage === totalPages - 1} className="px-5 py-2 rounded-xl text-xs text-white/78 border border-white/14 bg-white/7 hover:bg-white/16 disabled:opacity-20 transition-all backdrop-blur-md">Next →</button>
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs text-rose-200/78 border border-rose-400/18 bg-rose-500/14 hover:bg-rose-500/32 transition-all backdrop-blur-md">✕ Close</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════ MAIN EXPORT ═══════════ */
export function CookBook({ onClose }: { onClose: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [flipDir, setFlipDir] = useState<"next" | "prev">("next");
  const [isFlipping, setIsFlipping] = useState(false);

  const flip = (dir: "next" | "prev", target?: number) => {
    if (isFlipping) return;
    setFlipDir(dir);
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentPage(target !== undefined ? target : (p) => p + (dir === "next" ? 1 : -1));
      setIsFlipping(false);
    }, 650);
  };

  return (
    <motion.div className="fixed inset-0 z-[100] flex items-center justify-center"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
      <div className="absolute inset-0 z-0" onClick={isOpen ? onClose : undefined} />
      <NightBackdrop />
      <FloatingParticles />
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.div key="closed" exit={{ scale: 0.6, opacity: 0, rotateY: -90 }} transition={{ duration: 0.75, ease: [0.64, 0, 0.78, 0] }}>
            <ClosedBook onOpen={() => setIsOpen(true)} />
          </motion.div>
        ) : (
          <motion.div key="open">
            <OpenBook
              currentPage={currentPage}
              totalPages={BOOK_PAGES.length}
              flipDir={flipDir}
              onPrev={() => currentPage > 0 && flip("prev")}
              onNext={() => currentPage < BOOK_PAGES.length - 1 && flip("next")}
              onDotClick={(i) => i !== currentPage && flip(i > currentPage ? "next" : "prev", i)}
              isFlipping={isFlipping}
              onClose={onClose}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
