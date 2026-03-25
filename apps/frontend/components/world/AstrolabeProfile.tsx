// "use client";

// import { useState, useCallback } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import dynamic from "next/dynamic";
// import Image from "next/image";

// /* ── Lazy-load heavy 3D + particles (avoid SSR) ── */
// const ArmillarySphere = dynamic(
//     () =>
//         import("./ArmillarySphere").then((m) => ({
//             default: m.ArmillarySphere,
//         })),
//     {
//         ssr: false,
//         loading: () => (
//             <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a1235]/60 backdrop-blur-2xl z-[200]">
//                 {/* Magical rotating rings */}
//                 <div className="relative w-32 h-32 flex items-center justify-center">
//                     <div className="absolute inset-0 rounded-full border border-white/10 border-t-[#ffd700]/80 border-r-[#ffd700]/20 animate-[spin_3s_linear_infinite]" />
//                     <div className="absolute inset-3 rounded-full border border-white/10 border-b-[#4ade80]/80 border-l-[#4ade80]/20 animate-[spin_2s_linear_infinite_reverse]" />
//                     {/* Inner glowing core */}
//                     <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ffd700] to-[#ffaa00] blur-md animate-pulse" />
//                     <div className="absolute w-3 h-3 rounded-full bg-white shadow-[0_0_20px_#ffd700]" />
//                 </div>
                
//                 {/* Text readout */}
//                 <div className="mt-8 text-center animate-pulse">
//                     <h3 className="text-[#ffd700] text-lg font-bold tracking-[0.3em] uppercase" style={{ fontFamily: "'Sora', sans-serif" }}>
//                         Calibrating
//                     </h3>
//                     <p className="text-white/50 text-[10px] tracking-[0.2em] mt-2">
//                         ALIGNING CELESTIAL SPHERES
//                     </p>
//                 </div>
                
//                 {/* Scanning bar */}
//                 <div className="mt-6 w-48 h-[1px] bg-white/10 overflow-hidden">
//                     <div className="h-full bg-gradient-to-r from-transparent via-[#ffd700] to-transparent w-[50%] animate-[translateX_1.5s_ease-in-out_infinite]" />
//                 </div>
//                 <style>{`
//                     @keyframes translateX {
//                         0% { transform: translateX(-150%); }
//                         100% { transform: translateX(250%); }
//                     }
//                 `}</style>
//             </div>
//         ),
//     },
// );
// const StarParticles = dynamic(
//     () => import("./StarParticles").then((m) => ({ default: m.StarParticles })),
//     { ssr: false },
// );

// /* ═══════════════════════════════════════════════════════
//    SECTION DATA
//    ═══════════════════════════════════════════════════════ */
// /* ═══════════════════════════════════════════════════════
//    SECTION DATA HYDRATION
//    ═══════════════════════════════════════════════════════ */
// export interface AstrolabeUserData {
//     stats: { label: string; value: string | number; color: string }[];
//     nutrition: { name: string; pct: number; color: string }[];
//     fitness: { label: string; value: string | number; icon: string }[];
//     impact: { label: string; emoji: string }[];
// }

// export const DEFAULT_USER_DATA: AstrolabeUserData = {
//     stats: [
//         { label: "Streak", value: "12d", color: "#ff8c00" },
//         { label: "Calories", value: "1,840", color: "#4ade80" },
//         { label: "Workouts", value: "23", color: "#60a5fa" },
//     ],
//     nutrition: [
//         { name: "Protein", pct: 78, color: "#60a5fa" },
//         { name: "Carbs", pct: 65, color: "#fbbf24" },
//         { name: "Fats", pct: 42, color: "#f472b6" },
//         { name: "Fiber", pct: 90, color: "#34d399" },
//     ],
//     fitness: [
//         { label: "Steps Today", value: "8,432", icon: "🚶" },
//         { label: "Active Mins", value: "47", icon: "⏱️" },
//         { label: "Calories Burned", value: "320", icon: "🔥" },
//         { label: "Heart Rate", value: "72 bpm", icon: "❤️" },
//     ],
//     impact: [
//         { emoji: "🌱", label: "128 Trees" },
//         { emoji: "💧", label: "340L Water" },
//         { emoji: "⚡", label: "89 kWh" },
//     ],
// };

// interface Section {
//     id: string;
//     title: string;
//     icon: string;
//     content: React.ReactNode;
// }

// const getSections = (userData: AstrolabeUserData): Section[] => [
//     {
//         id: "hero",
//         title: "Welcome",
//         icon: "✨",
//         content: (
//             <div className="text-center space-y-4">
//                 <div className="text-5xl mb-2">🌟</div>
//                 <h2
//                     style={{
//                         fontFamily: "'Sora', sans-serif",
//                         fontSize: "1.8rem",
//                         fontWeight: 700,
//                         background:
//                             "linear-gradient(135deg, #ffd700, #ffaa00, #ff8c00)",
//                         WebkitBackgroundClip: "text",
//                         WebkitTextFillColor: "transparent",
//                     }}
//                 >
//                     Your Celestial Journey
//                 </h2>
//                 <p
//                     style={{
//                         color: "rgba(255,255,255,0.6)",
//                         maxWidth: 420,
//                         margin: "0 auto",
//                         lineHeight: 1.7,
//                     }}
//                 >
//                     Track your health across the cosmos. Every step you take,
//                     every meal you log, adds a new star to your constellation.
//                 </p>
//             </div>
//         ),
//     },
//     {
//         id: "stats",
//         title: "Statistics",
//         icon: "📊",
//         content: (
//             <div className="space-y-5">
//                 <h2
//                     style={{
//                         fontFamily: "'Sora', sans-serif",
//                         fontSize: "1.5rem",
//                         fontWeight: 700,
//                         color: "#ffd700",
//                     }}
//                 >
//                     📊 Your Stats
//                 </h2>
//                 <div className="grid grid-cols-3 gap-4">
//                     {userData.stats.map((s) => (
//                         <div
//                             key={s.label}
//                             style={{
//                                 background: "rgba(255,255,255,0.06)",
//                                 border: "1px solid rgba(255,255,255,0.1)",
//                                 borderRadius: 16,
//                                 padding: "20px 12px",
//                                 textAlign: "center",
//                             }}
//                         >
//                             <div
//                                 style={{
//                                     fontSize: "1.6rem",
//                                     fontWeight: 800,
//                                     color: s.color,
//                                     fontFamily: "'Sora', sans-serif",
//                                 }}
//                             >
//                                 {s.value}
//                             </div>
//                             <div
//                                 style={{
//                                     fontSize: "0.75rem",
//                                     color: "rgba(255,255,255,0.5)",
//                                     marginTop: 4,
//                                 }}
//                             >
//                                 {s.label}
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             </div>
//         ),
//     },
//     {
//         id: "nutrition",
//         title: "Nutrition",
//         icon: "🥗",
//         content: (
//             <div className="space-y-4">
//                 <h2
//                     style={{
//                         fontFamily: "'Sora', sans-serif",
//                         fontSize: "1.5rem",
//                         fontWeight: 700,
//                         color: "#4ade80",
//                     }}
//                 >
//                     🥗 Nutrition Overview
//                 </h2>
//                 <div className="space-y-3">
//                     {userData.nutrition.map((n) => (
//                         <div key={n.name}>
//                             <div
//                                 className="flex justify-between"
//                                 style={{
//                                     fontSize: "0.85rem",
//                                     color: "rgba(255,255,255,0.7)",
//                                     marginBottom: 4,
//                                 }}
//                             >
//                                 <span>{n.name}</span>
//                                 <span style={{ color: n.color }}>{n.pct}%</span>
//                             </div>
//                             <div
//                                 style={{
//                                     height: 6,
//                                     borderRadius: 3,
//                                     background: "rgba(255,255,255,0.08)",
//                                     overflow: "hidden",
//                                 }}
//                             >
//                                 <motion.div
//                                     initial={{ width: 0 }}
//                                     animate={{ width: `${n.pct}%` }}
//                                     transition={{
//                                         duration: 1,
//                                         delay: 0.2,
//                                         ease: "easeOut",
//                                     }}
//                                     style={{
//                                         height: "100%",
//                                         borderRadius: 3,
//                                         background: `linear-gradient(90deg, ${n.color}88, ${n.color})`,
//                                     }}
//                                 />
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             </div>
//         ),
//     },
//     {
//         id: "fitness",
//         title: "Fitness",
//         icon: "💪",
//         content: (
//             <div className="space-y-4">
//                 <h2
//                     style={{
//                         fontFamily: "'Sora', sans-serif",
//                         fontSize: "1.5rem",
//                         fontWeight: 700,
//                         color: "#60a5fa",
//                     }}
//                 >
//                     💪 Fitness Journey
//                 </h2>
//                 <div className="grid grid-cols-2 gap-3">
//                     {userData.fitness.map((f) => (
//                         <div
//                             key={f.label}
//                             style={{
//                                 background: "rgba(255,255,255,0.05)",
//                                 border: "1px solid rgba(255,255,255,0.08)",
//                                 borderRadius: 14,
//                                 padding: "16px 14px",
//                             }}
//                         >
//                             <div
//                                 style={{ fontSize: "1.2rem", marginBottom: 4 }}
//                             >
//                                 {f.icon}
//                             </div>
//                             <div
//                                 style={{
//                                     fontSize: "1.2rem",
//                                     fontWeight: 700,
//                                     color: "white",
//                                     fontFamily: "'Sora', sans-serif",
//                                 }}
//                             >
//                                 {f.value}
//                             </div>
//                             <div
//                                 style={{
//                                     fontSize: "0.7rem",
//                                     color: "rgba(255,255,255,0.45)",
//                                     marginTop: 2,
//                                 }}
//                             >
//                                 {f.label}
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             </div>
//         ),
//     },
//     {
//         id: "impact",
//         title: "Impact",
//         icon: "🌍",
//         content: (
//             <div className="text-center space-y-4">
//                 <h2
//                     style={{
//                         fontFamily: "'Sora', sans-serif",
//                         fontSize: "1.5rem",
//                         fontWeight: 700,
//                         color: "#c084fc",
//                     }}
//                 >
//                     🌍 Your Impact
//                 </h2>
//                 <p
//                     style={{
//                         color: "rgba(255,255,255,0.55)",
//                         fontSize: "0.9rem",
//                         maxWidth: 380,
//                         margin: "0 auto",
//                     }}
//                 >
//                     Your wellness journey contributes to SDG 3 — Good Health and
//                     Well-being. Every healthy choice ripples outward.
//                 </p>
//                 <div
//                     style={{
//                         display: "inline-flex",
//                         gap: 16,
//                         marginTop: 8,
//                     }}
//                 >
//                     {userData.impact.map((i) => (
//                         <div
//                             key={i.label}
//                             style={{
//                                 background: "rgba(192,132,252,0.12)",
//                                 border: "1px solid rgba(192,132,252,0.2)",
//                                 borderRadius: 12,
//                                 padding: "14px 18px",
//                                 textAlign: "center",
//                             }}
//                         >
//                             <div style={{ fontSize: "1.4rem" }}>{i.emoji}</div>
//                             <div
//                                 style={{
//                                     fontSize: "0.72rem",
//                                     color: "rgba(255,255,255,0.6)",
//                                     marginTop: 4,
//                                 }}
//                             >
//                                 {i.label}
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             </div>
//         ),
//     },
// ];

// /* ═══════════════════════════════════════════════════════
//    ASTROLABE PROFILE — Full-screen Overlay
//    ═══════════════════════════════════════════════════════ */
// export interface AstrolabeProfileProps {
//     onClose: () => void;
//     userData?: AstrolabeUserData;
// }

// /* ── Slide direction helper ── */
// const slideVariants = {
//     enter: (dir: number) => ({
//         x: dir > 0 ? 300 : -300,
//         opacity: 0,
//         scale: 0.92,
//     }),
//     center: {
//         x: 0,
//         opacity: 1,
//         scale: 1,
//     },
//     exit: (dir: number) => ({
//         x: dir > 0 ? -300 : 300,
//         opacity: 0,
//         scale: 0.92,
//     }),
// };

// export function AstrolabeProfile({
//     onClose,
//     userData = DEFAULT_USER_DATA,
// }: AstrolabeProfileProps) {
//     const [sectionIdx, setSectionIdx] = useState(0);
//     const [slideDir, setSlideDir] = useState(0);
//     const [sectionPulse, setSectionPulse] = useState(0);

//     const goTo = useCallback(
//         (idx: number, maxIdx: number) => {
//             if (idx < 0 || idx >= maxIdx || idx === sectionIdx) return;
//             setSlideDir(idx > sectionIdx ? 1 : -1);
//             setSectionIdx(idx);
//             setSectionPulse((p) => p + 1);
//         },
//         [sectionIdx],
//     );

//     const sections = getSections(userData);
//     const section = sections[sectionIdx];

//     return (
//         <motion.div
//             className="fixed inset-0 z-[100] flex flex-col"
//             style={{
//                 background: "#0f1228", // Solid dark baseline to prevent bleeding
//                 fontFamily: "'Nunito', sans-serif",
//             }}
//             initial={{ opacity: 0, scale: 1.05 }}
//             animate={{ opacity: 1, scale: 1 }}
//             exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.5 } }}
//             transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
//         >
//             {/* ═══════ CLOSE BUTTON ═══════ */}
//             <motion.button
//                 onClick={onClose}
//                 className="absolute top-5 right-5 z-[110] cursor-pointer"
//                 style={{
//                     background: "rgba(255,255,255,0.08)",
//                     backdropFilter: "blur(20px)",
//                     border: "1px solid rgba(255,255,255,0.15)",
//                     borderRadius: 14,
//                     padding: "10px 16px",
//                     color: "rgba(255,255,255,0.7)",
//                     fontSize: "0.85rem",
//                     fontWeight: 600,
//                     display: "flex",
//                     alignItems: "center",
//                     gap: 6,
//                 }}
//                 whileHover={{
//                     background: "rgba(255,255,255,0.15)",
//                     color: "white",
//                     scale: 1.05,
//                 }}
//                 whileTap={{ scale: 0.95 }}
//             >
//                 <span style={{ fontSize: "1rem" }}>←</span> Back to Map
//             </motion.button>

//             {/* ═══════ SKY ZONE (70%) ═══════ */}
//             <div
//                 className="relative"
//                 style={{
//                     flex: "0 0 68%",
//                     minHeight: 0,
//                     overflow: "hidden",
//                     background:
//                         "linear-gradient(180deg, #020818 0%, #0a1235 35%, #101845 60%, #151d52 80%, #1a2260 100%)",
//                 }}
//             >
//                 {/* Moon background — full-screen behind everything */}
//                 <motion.div
//                     className="absolute inset-0 z-[0]"
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     transition={{ duration: 2, ease: "easeOut" }}
//                 >
//                     <Image
//                         src="/assets/model/moon.png"
//                         alt="Cosmic background"
//                         fill
//                         className="object-cover"
//                         style={{
//                             filter: "brightness(0.3) contrast(1.2) saturate(0.7)",
//                             opacity: 0.5,
//                         }}
//                         priority
//                     />
//                     {/* Dark overlay to blend moon into gradient */}
//                     <div
//                         className="absolute inset-0"
//                         style={{
//                             background:
//                                 "radial-gradient(ellipse at 50% 40%, transparent 20%, rgba(2,8,24,0.7) 70%, rgba(2,8,24,0.95) 100%)",
//                         }}
//                     />
//                 </motion.div>

//                 {/* Star particles */}
//                 <div className="absolute inset-0 z-[1]">
//                     <StarParticles />
//                 </div>

//                 {/* Atmospheric nebula glows */}
//                 {/* <div
//                     className="absolute inset-0 z-[0] pointer-events-none"
//                     style={{ overflow: "hidden" }}
//                 >
//                     <motion.div
//                         className="absolute"
//                         style={{
//                             width: "60vw",
//                             height: "60vh",
//                             left: "-10%",
//                             top: "20%",
//                             background:
//                                 "radial-gradient(ellipse, rgba(100,50,200,0.08) 0%, transparent 70%)",
//                             filter: "blur(60px)",
//                         }}
//                         animate={{
//                             opacity: [0.4, 0.7, 0.4],
//                             x: [-20, 20, -20],
//                         }}
//                         transition={{
//                             duration: 15,
//                             repeat: Infinity,
//                             ease: "easeInOut",
//                         }}
//                     />
//                     <motion.div
//                         className="absolute"
//                         style={{
//                             width: "50vw",
//                             height: "40vh",
//                             right: "-5%",
//                             top: "40%",
//                             background:
//                                 "radial-gradient(ellipse, rgba(50,100,200,0.06) 0%, transparent 70%)",
//                             filter: "blur(50px)",
//                         }}
//                         animate={{ opacity: [0.3, 0.6, 0.3], x: [10, -10, 10] }}
//                         transition={{
//                             duration: 12,
//                             repeat: Infinity,
//                             ease: "easeInOut",
//                             delay: 3,
//                         }}
//                     />
//                 </div> */}
//                 <div className="absolute inset-0 w-full h-full flex items-center justify-center">
//                         {/* Armillary Sphere (moved to root level so it can overlay BOTH zones without being clipped by overflow:hidden) */}
//                         <motion.div
//                             className="z-[15] pointer-events-none" // Set to 15 to place it above the background and stairs, pointer-events-none lets clicks pass through
//                             style={{
//                                 position: "absolute",
//                                 bottom: "5px", //0 dari dasar sink kalo ini sih sekarang
//                                 width: "clamp(400px, min(70vw, 70vh), 900px)",
//                                 height: "clamp(400px, min(70vw, 70vh), 900px)",
//                                 transform: "translateX(-50%)",
//                             }}
//                             initial={{ opacity: 0, scale: 0.5, y: 80 }}
//                             animate={{ opacity: 1, scale: 1, y: 0 }}
//                             transition={{
//                                 duration: 2.0,
//                                 delay: 0.2,
//                                 ease: [0.16, 1, 0.3, 1],
//                             }}
//                         >
//                             <div className="w-full h-full pointer-events-auto">
//                                 <ArmillarySphere sectionPulse={sectionPulse} />
//                             </div>
//                         </motion.div>
//                         {/* Golden shimmer overlay on sphere area */}
//                         <motion.div
//                             className="absolute z-[14] pointer-events-none"
//                             style={{
//                                 position: "absolute",
//                                 left: "50%",
//                                 bottom: "-120px",
//                                 width: "clamp(450px, min(80vw, 80vh), 1000px)",
//                                 height: "clamp(450px, min(80vw, 80vh), 1000px)",
//                                 transform: "translateX(-50%)",
//                                 background:
//                                     "radial-gradient(circle, rgba(255,215,0,0.06) 0%, rgba(255,200,0,0.02) 40%, transparent 65%)",
//                             }}
//                             animate={{ opacity: [0.3, 0.8, 0.3] }}
//                             transition={{
//                                 duration: 6,
//                                 repeat: Infinity,
//                                 ease: "easeInOut",
//                             }}
//                         />
//                     </div>
//                 </div>

//             {/* ═══════ STAIRS TRANSITION (~5%) ═══════ */}
//             <div
//                 className="relative z-[10]"
//                 style={{
//                     flex: "0 0 auto",
//                     height: "clamp(20px, 3vh, 32px)",
//                     background: "#0a1235", // Solid matching base to stop bleed
//                     borderTop: "1px solid rgba(255,215,0,0.08)",
//                 }}
//             >
//                 {/* Two distinct mechanical stair steps */}
//                 <div className="absolute inset-0 flex flex-col justify-end">
//                     {[0.08, 0.16].map((opacity, i) => (
//                         <div
//                             key={i}
//                             style={{
//                                 height: "50%",
//                                 background: `linear-gradient(90deg, 
//                   rgba(255,215,0,${opacity * 0.4}) 0%, 
//                   rgba(255,215,0,${opacity}) 25%, 
//                   rgba(255,215,0,${opacity}) 75%, 
//                   rgba(255,215,0,${opacity * 0.4}) 100%)`,
//                                 borderTop: `1px solid rgba(255,215,0,${opacity * 1.5})`,
//                                 boxShadow: "inset 0 1px 3px rgba(0,0,0,0.7)", // Shadow implies depth overlaying the platform securely
//                             }}
//                         />
//                     ))}
//                 </div>
//             </div>

//             {/* ═══════ PLATFORM ZONE (~30%) ═══════ */}
//             <div
//                 className="relative z-[10] flex flex-col"
//                 style={{
//                     flex: "1 1 0%",
//                     minHeight: 0,
//                     background:
//                         "linear-gradient(180deg, rgba(15,18,40,0.95) 0%, rgba(8,10,28,0.98) 100%)",
//                     borderTop: "1px solid rgba(255,215,0,0.15)",
//                 }}
//             >
//                 {/* Brass edge highlight */}
//                 <div
//                     className="absolute inset-x-0 top-0 h-px"
//                     style={{
//                         background:
//                             "linear-gradient(90deg, transparent 10%, rgba(255,215,0,0.4) 50%, transparent 90%)",
//                     }}
//                 />

//                 {/* Section content area */}
//                 <div
//                     className="flex-1 flex items-center justify-center"
//                     style={{
//                         minHeight: 0,
//                         padding: "20px 24px 10px",
//                         position: "relative",
//                     }}
//                 >
//                     {/* Left arrow */}
//                     <motion.button
//                         onClick={() => goTo(sectionIdx - 1, sections.length)}
//                         className="absolute left-4 md:left-8 z-20 cursor-pointer"
//                         style={{
//                             background: "rgba(255,255,255,0.05)",
//                             border: "1px solid rgba(255,255,255,0.1)",
//                             borderRadius: 12,
//                             width: 44,
//                             height: 44,
//                             display: "flex",
//                             alignItems: "center",
//                             justifyContent: "center",
//                             color:
//                                 sectionIdx > 0
//                                     ? "rgba(255,255,255,0.7)"
//                                     : "rgba(255,255,255,0.15)",
//                             fontSize: "1.2rem",
//                         }}
//                         whileHover={
//                             sectionIdx > 0
//                                 ? {
//                                       background: "rgba(255,215,0,0.12)",
//                                       borderColor: "rgba(255,215,0,0.3)",
//                                       scale: 1.1,
//                                   }
//                                 : {}
//                         }
//                         whileTap={sectionIdx > 0 ? { scale: 0.92 } : {}}
//                         disabled={sectionIdx === 0}
//                     >
//                         ‹
//                     </motion.button>

//                     {/* Content panel (animated slide) */}
//                     <div
//                         className="relative overflow-hidden"
//                         style={{
//                             width: "100%",
//                             maxWidth: 520,
//                             minHeight: 180,
//                         }}
//                     >
//                         <AnimatePresence mode="wait" custom={slideDir}>
//                             <motion.div
//                                 key={section.id}
//                                 custom={slideDir}
//                                 variants={slideVariants}
//                                 initial="enter"
//                                 animate="center"
//                                 exit="exit"
//                                 transition={{
//                                     x: {
//                                         type: "spring",
//                                         stiffness: 200,
//                                         damping: 28,
//                                     },
//                                     opacity: { duration: 0.35 },
//                                     scale: { duration: 0.35 },
//                                 }}
//                                 style={{
//                                     background: "rgba(255,255,255,0.03)",
//                                     border: "1px solid rgba(255,255,255,0.06)",
//                                     borderRadius: 20,
//                                     padding: "28px 32px",
//                                     backdropFilter: "blur(12px)",
//                                 }}
//                             >
//                                 {section.content}
//                             </motion.div>
//                         </AnimatePresence>
//                     </div>

//                     {/* Right arrow */}
//                     <motion.button
//                         onClick={() => goTo(sectionIdx + 1, sections.length)}
//                         className="absolute right-4 md:right-8 z-20 cursor-pointer"
//                         style={{
//                             background: "rgba(255,255,255,0.05)",
//                             border: "1px solid rgba(255,255,255,0.1)",
//                             borderRadius: 12,
//                             width: 44,
//                             height: 44,
//                             display: "flex",
//                             alignItems: "center",
//                             justifyContent: "center",
//                             color:
//                                 sectionIdx < sections.length - 1
//                                     ? "rgba(255,255,255,0.7)"
//                                     : "rgba(255,255,255,0.15)",
//                             fontSize: "1.2rem",
//                         }}
//                         whileHover={
//                             sectionIdx < sections.length - 1
//                                 ? {
//                                       background: "rgba(255,215,0,0.12)",
//                                       borderColor: "rgba(255,215,0,0.3)",
//                                       scale: 1.1,
//                                   }
//                                 : {}
//                         }
//                         whileTap={
//                             sectionIdx < sections.length - 1
//                                 ? { scale: 0.92 }
//                                 : {}
//                         }
//                         disabled={sectionIdx === sections.length - 1}
//                     >
//                         ›
//                     </motion.button>
//                 </div>

//                 {/* Dot indicators */}
//                 <div
//                     className="flex items-center justify-center gap-2 pb-5"
//                     style={{ flexShrink: 0 }}
//                 >
//                     {sections.map((s, i) => (
//                         <motion.button
//                             key={s.id}
//                             onClick={() => goTo(i, sections.length)}
//                             className="cursor-pointer relative"
//                             style={{
//                                 width: i === sectionIdx ? 32 : 10,
//                                 height: 10,
//                                 borderRadius: 5,
//                                 border: "none",
//                                 padding: 0,
//                                 background:
//                                     i === sectionIdx
//                                         ? "linear-gradient(90deg, #ffd700, #ffaa00)"
//                                         : "rgba(255,255,255,0.15)",
//                                 transition:
//                                     "width 0.4s cubic-bezier(0.16,1,0.3,1), background 0.3s",
//                             }}
//                             whileHover={{ scale: 1.3 }}
//                             whileTap={{ scale: 0.9 }}
//                             title={s.title}
//                         />
//                     ))}
//                 </div>
//             </div>
//         </motion.div>
//     );
// }
