"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Camera } from "./Camera";
import { motion, AnimatePresence } from "framer-motion";
import Script from "next/script";
import Image from "next/image";
// import { AstrolabeProfile } from "./AstrolabeProfile";
import { useWorldStore } from "@/store/worldStore";
import { RadialMenu } from "./RadialMenu";
import dynamic from "next/dynamic";

const ArmillaryWidget = dynamic(
  () => import("./ArmillarySphere").then((m) => ({ default: m.ArmillarySphere })),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border border-white/20 border-t-[#ffd700] animate-spin" />
      </div>
    ),
  }
);

  /* ─── Intro cloud data ─── */
  const INTRO_CLOUDS = [
    { w: 600, h: 300, left: "0%",   top: "-5%",  dur: 7,   delay: 0 },
    { w: 450, h: 220, left: "20%",  top: "15%",  dur: 9,   delay: 0.3 },
    { w: 700, h: 350, left: "45%",  top: "-10%", dur: 6,   delay: 0.1 },
    { w: 500, h: 250, left: "65%",  top: "10%",  dur: 8,   delay: 0.5 },
    { w: 400, h: 200, left: "10%",  top: "40%",  dur: 10,  delay: 0.2 },
    { w: 650, h: 320, left: "55%",  top: "35%",  dur: 7.5, delay: 0.4 },
    { w: 550, h: 270, left: "75%",  top: "50%",  dur: 6.5, delay: 0.6 },
    { w: 480, h: 240, left: "35%",  top: "55%",  dur: 9,   delay: 0.1 },
    { w: 620, h: 310, left: "5%",   top: "65%",  dur: 8.5, delay: 0.7 },
    { w: 520, h: 260, left: "85%",  top: "25%",  dur: 7,   delay: 0.3 },
    { w: 580, h: 290, left: "-5%",  top: "80%",  dur: 6,   delay: 0.2 },
    { w: 420, h: 210, left: "50%",  top: "70%",  dur: 8,   delay: 0.5 },
  ];

  /* ─── Village interactive hotspots ─── */
  const HOTSPOTS = [
    { x: "12%",  y: "28%", label: "🏠 Health Center",  desc: "Track your wellness journey",   icon: "🏥", color: "from-rose-500/80 to-orange-500/80",    action: "zoom" },
    { x: "30%",  y: "22%", label: "🏡 Nutrition Hub",   desc: "Meal plans & calorie tracking",  icon: "🥗", color: "from-emerald-500/80 to-teal-500/80",   action: "cookbook" },
    { x: "60%",  y: "25%", label: "🏘️ Fitness Lodge",   desc: "Workouts & sport activities",    icon: "💪", color: "from-blue-500/80 to-indigo-500/80",    action: "zoom" },
    { x: "48%",  y: "60%", label: "🌉 The Bridge",      desc: "Connect all your goals",         icon: "🌟", color: "from-amber-500/80 to-yellow-500/80",   action: "zoom" },
    { x: "80%",  y: "35%", label: "✨ Astral Profile",  desc: "Your journey across the cosmos", icon: "🔮", color: "from-purple-500/80 to-fuchsia-500/80", action: "profile" },
  ];

  /* ─── Vanta Clouds (intro sky) ─── */
  function VantaClouds({ visible }: { visible: boolean }) {
    const ref = useRef<HTMLDivElement>(null);
    const effect = useRef<any>(null);

    const initClouds = () => {
      if (
        ref.current &&
        !effect.current &&
        (window as any).VANTA &&
        (window as any).THREE
      ) {
        effect.current = (window as any).VANTA.CLOUDS({
          el: ref.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200,
          minWidth: 200,
          skyColor: 0x68b8d7,
          cloudColor: 0xadc1de,
          cloudShadowColor: 0x183550,
          sunColor: 0xff9919,
          sunGlareColor: 0xff6633,
          sunlightColor: 0xff9933,
          speed: 1.2,
        });
      }
    };

    // Destroy effect when no longer visible
    if (!visible && effect.current) {
      effect.current.destroy();
      effect.current = null;
    }

    return (
      <>
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js"
          strategy="afterInteractive"
          onLoad={initClouds}
        />
        <Script
          src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.clouds.min.js"
          strategy="afterInteractive"
          onLoad={initClouds}
        />
        <div
          ref={ref}
          className="absolute inset-0 z-0"
          style={{ display: visible ? "block" : "none" }}
        />
      </>
    );
  }

  /* ─── Vanta Birds (always visible) ─── */
  function VantaBirds() {
  const ref = useRef<HTMLDivElement>(null)
  const effect = useRef<any>(null)

  const initBirds = () => {
    if (
      ref.current &&
      !effect.current &&
      (window as any).VANTA &&
      (window as any).THREE
    ) {
      effect.current = (window as any).VANTA.BIRDS({
        el: ref.current,
        backgroundAlpha: 0,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        quantity: 4,
        birdSize: 1.2,
        wingSpan: 25,
        speedLimit: 4,
        separation: 60,
        alignment: 40,
        cohesion: 30,
        colorMode: "variance",
        color1: 0x423322,
        color2: 0x665533,
      })
    }
  }

  useEffect(() => {
    const check = setInterval(() => {
      if ((window as any).VANTA && (window as any).THREE) {
        initBirds()
        clearInterval(check)
      }
    }, 100)

    return () => {
      clearInterval(check)
      if (effect.current) {
        effect.current.destroy()
        effect.current = null
      }
    }
  }, [])

  return (
    <>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js"
        strategy="afterInteractive"
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.birds.min.js"
        strategy="afterInteractive"
      />
      <div ref={ref} className="absolute inset-0 z-30 pointer-events-none" />
    </>
  )
}
  /* ═══════════════════════════════════════════════════════════
    MAIN WORLD SCENE
    ═══════════════════════════════════════════════════════════ */
export function WorldScene() {
  const router = useRouter();
  const [camera, setCamera] = useState({ x: 0, y: 0, zoom: 1 });
  const { phase, setPhase, activeSpot, setActiveSpot } = useWorldStore();

    /* User clicks Start → clouds part and reveal village */
    const handleStart = () => {
      setPhase("revealing");
      setTimeout(() => setPhase("village"), 2500);
    };

    const handleSpotClick = useCallback((index: number) => {  
      const spot = HOTSPOTS[index];

      // Special actions that open full-screen modals rather than zooming
      if (spot.action === "cookbook") {
        router.push("/cookbook");
        return;
      }
      if (spot.action === "profile") {
        router.push("/profile");
        return;
      }

      const xPct = parseFloat(spot.x) / 100;
      const yPct = parseFloat(spot.y) / 100;
      setActiveSpot(index);
      setCamera({
        x: -xPct * window.innerWidth * 0.8 + window.innerWidth * 0.25,
        y: -yPct * window.innerHeight * 0.8 + window.innerHeight * 0.15,
        zoom: 1.8,
      });
    }, [router]);

    const resetCamera = useCallback(() => {
      setActiveSpot(null);
      setCamera({ x: 0, y: 0, zoom: 1 });
    }, [setActiveSpot]);

    return (
      <div className="relative w-full h-screen overflow-hidden bg-[#4A90D9]">
        
        {/* ═══ RADIAL MENU ═══ */}
        <RadialMenu />

        {/* ═══ VANTA CLOUDS — visible during intro ═══ */}
        <VantaClouds visible={phase !== "village"} />

        {/* ═══ VANTA BIRDS — always visible ═══ */}
        <VantaBirds />
        

        {/* ═══ INTRO OVERLAY (text + button + CSS clouds on top of Vanta) ═══ */}
        <AnimatePresence>
          {phase !== "village" && (
            <motion.div
              className="absolute inset-0 z-40"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            >
              {/* Welcome text + Start button */}
              <motion.div
                className="absolute inset-0 z-20 flex flex-col items-center justify-center"
                animate={
                  phase === "revealing"
                    ? { opacity: 0, y: -80, scale: 1.1 }
                    : { opacity: 1, y: 0, scale: 1 }
                }
                transition={{ duration: 1.5, ease: "easeInOut" }}
              >
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.3 }}
                >
                  <h1 className="text-white text-8xl font-extrabold drop-shadow-[0_4px_30px_rgba(0,0,0,0.25)] tracking-tight leading-tight">
                    Health World
                  </h1>
                  <p className="text-white/70 text-xl mt-4 font-light tracking-widest uppercase">
                    Your wellness village awaits
                  </p>
                </motion.div>

                <motion.button
                  onClick={handleStart}
                  className="mt-12 relative group"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 rounded-2xl blur-md opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-lg px-10 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/20">
                    <span>🌍</span>
                    Enter the Village
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      →
                    </motion.span>
                  </div>
                </motion.button>
              </motion.div>

              {/* Extra CSS clouds on top of Vanta for the "parting" effect */}
              {INTRO_CLOUDS.map((cloud, i) => {
                const goLeft = i % 2 === 0;
                return (
                  <motion.div
                    key={i}
                    className="absolute rounded-full z-10"
                    style={{
                      width: cloud.w,
                      height: cloud.h,
                      left: cloud.left,
                      top: cloud.top,
                      background:
                        "radial-gradient(ellipse, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.3) 40%, transparent 70%)",
                      filter: "blur(12px)",
                    }}
                    initial={{ x: 0, opacity: 0.7 }}
                    animate={
                      phase === "revealing"
                        ? { x: goLeft ? -1200 : 1200, opacity: 0, scale: 1.3 }
                        : {
                            x: [0, goLeft ? 40 : -40, 0],
                            opacity: [0.5, 0.7, 0.5],
                          }
                    }
                    transition={
                      phase === "revealing"
                        ? { duration: 2.2, delay: cloud.delay * 0.8, ease: [0.4, 0, 0.2, 1] }
                        : { duration: cloud.dur, repeat: Infinity, ease: "easeInOut" }
                    }
                  />
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══ MAIN CAMERA & VILLAGE ═══ */}
        <Camera camera={camera}>
          <div className="relative w-full h-full">
            <Image
              src="/assets/home/wallpaper.png"
              alt="Health World Village"
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />

            {/* Sunlight shimmer */}
            <motion.div
              className="absolute inset-0 z-10 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at 60% 30%, rgba(255,255,200,0.12) 0%, transparent 60%)",
              }}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* ─── Visible hotspot cards ─── */}
            <AnimatePresence>
              {phase === "village" &&
                HOTSPOTS.map((spot, i) => (
                  <motion.div
                    key={i}
                    className="absolute z-20"
                    style={{ left: spot.x, top: spot.y }}
                    initial={{ opacity: 0, y: 30, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      delay: 0.3 + i * 0.2,
                      type: "spring",
                      stiffness: 200,
                      damping: 20,
                    }}
                  >
                    <motion.div
                      className="cursor-pointer group relative"
                      onClick={() => handleSpotClick(i)}
                      whileHover={{ scale: 1.08, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div
                        className={`bg-gradient-to-br ${spot.color} backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-white/30 min-w-[160px] transition-shadow duration-300 group-hover:shadow-[0_8px_40px_rgba(0,0,0,0.3)]`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{spot.icon}</span>
                          <div>
                            <p className="font-bold text-white text-sm leading-tight drop-shadow-sm">
                              {spot.label.replace(/^.+\s/, "")}
                            </p>
                            <p className="text-white/70 text-xs mt-0.5">{spot.desc}</p>
                          </div>
                        </div>
                      </div>
                      <div
                        className={`absolute -bottom-2 left-6 w-4 h-4 bg-gradient-to-br ${spot.color} rotate-45 border-r border-b border-white/30`}
                      />
                      <motion.div
                        className="absolute -inset-2 rounded-2xl border-2 border-white/20 pointer-events-none"
                        animate={{ scale: [1, 1.05, 1], opacity: [0.4, 0.7, 0.4] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      />
                    </motion.div>
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>
        </Camera>

        {/* ═══ BOTTOM UI ═══ */}
        <AnimatePresence>
          {phase === "village" && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4"
            >
              <button
                onClick={resetCamera}
                className="bg-white/15 hover:bg-white/30 backdrop-blur-xl text-white border border-white/25 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2"
              >
                <span>🗺️</span> Overview
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══ TOP-RIGHT INFO ═══ */}
        <AnimatePresence>
          {phase === "village" && (
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="absolute top-6 right-6 z-40"
            >
              <div className="bg-white/10 backdrop-blur-xl p-5 rounded-2xl border border-white/15 text-white shadow-2xl max-w-xs">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <span className="text-2xl">🏡</span> Health World
                </h3>
                <p className="text-sm text-white/60 mt-1">Click on a location to explore</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══ ACTIVE SPOT PANEL ═══ */}
        <AnimatePresence>
          {activeSpot !== null && (
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              className="absolute top-6 left-6 z-40 bg-white/15 backdrop-blur-2xl p-6 rounded-3xl border border-white/20 text-white shadow-2xl max-w-sm"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">{HOTSPOTS[activeSpot].icon}</span>
                <h2 className="font-bold text-2xl">{HOTSPOTS[activeSpot].label}</h2>
              </div>
              <p className="text-white/70">{HOTSPOTS[activeSpot].desc}</p>
              <button
                onClick={resetCamera}
                className="mt-4 text-sm bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl transition-all flex items-center gap-2"
              >
                <span>←</span> Back to map
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══ WORLD SUMMARY OVERVIEW ═══ */}
        <AnimatePresence>
          {phase === "village" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: -50, y: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: -50, y: 50 }}
              transition={{ delay: 1, duration: 1, type: "spring", bounce: 0.3 }}
              className="absolute bottom-0 left-0 w-[400px] h-[400px] z-30 pointer-events-auto"
            >
              <div className="absolute inset-0 overflow-hidden rounded-full pointer-events-none" style={{
                background: "radial-gradient(circle at center, rgba(0,0,0,0.4) 0%, transparent 60%)"
              }}></div>
              <ArmillaryWidget sectionPulse={0} />
            </motion.div>
          )}
        </AnimatePresence>

      
      </div>
    );
  }
