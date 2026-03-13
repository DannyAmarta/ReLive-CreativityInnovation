// "use client";

// export default function Activate() {
//   return <p>Coba cek email harusnya muncul bang</p>;
// }
"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { initParticlesEngine, Particles } from "@tsparticles/react";
import { loadAll } from "@tsparticles/all";
import { Engine } from "@tsparticles/engine";

export default function Activate() {
  const [init, setInit] = useState(false);
  const router = useRouter();

  useEffect(() => {
    initParticlesEngine(async (engine: Engine) => {
      await loadAll(engine);
    }).then(() => setInit(true));
  }, []);

  const particlesOptions = useMemo(() => ({
    fullScreen: { enable: false },
    fpsLimit: 120,
    interactivity: {
      events: {
        onHover: {
          enable: true,
          mode: "grab", // This creates the anti-gravity 'pull' towards the mouse
        },
      },
      modes: {
        grab: {
          distance: 250,
          links: { opacity: 0.2, color: "#7dd3fc" },
        },
      },
    },
    particles: {
      color: { value: "#ffffff" },
      move: {
        direction: "bottom",
        enable: true,
        random: true,
        speed: { min: 1, max: 3 },
        straight: false,
      },
      number: {
        density: { enable: true },
        value: 400, // Thick snow storm
      },
      opacity: {
        value: { min: 0.1, max: 0.7 },
      },
      shape: { type: "circle" },
      size: {
        value: { min: 1, max: 4 },
      },
    },
  }), []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#020617] flex items-center justify-center">
      {/* 1. Interactive Snow Layer */}
      {init && (
        <Particles
          id="tsparticles"
          options={particlesOptions as any}
          className="absolute inset-0 z-0"
        />
      )}

      {/* 2. Visual Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 via-transparent to-slate-950 z-1" />

      {/* 3. The "Cool Design" Content */}
      <div className="relative z-10 text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-10 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl max-w-lg"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
            className="text-6xl mb-6"
          >
            ❄️
          </motion.div>

          <h1 className="text-4xl font-black mb-4 bg-gradient-to-r from-cyan-300 via-blue-100 to-white bg-clip-text text-transparent italic tracking-tighter">
            CHECK YOUR EMAIL
          </h1>

          <p className="text-blue-200/70 text-lg mb-8 leading-relaxed">
            Check your email mailbox. <br />
            <span className="text-cyan-400 font-medium">If the registration email is missing please check in the spam</span>
          </p>

          <motion.button
            onClick={() => router.push("https://mail.google.com/")}
            whileHover={{ 
              scale: 1.05, 
              backgroundColor: "rgba(255,255,255,0.1)",
              boxShadow: "0 0 30px rgba(34,211,238,0.4)" 
            }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 rounded-full border border-cyan-500/50 text-cyan-300 font-bold uppercase tracking-widest text-xs transition-all"
          >
            CLICK HERE TO EMAIL
          </motion.button>
        </motion.div>
      </div>

      {/* 4. Artistic Frost Corners */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-cyan-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-600/10 blur-[120px] pointer-events-none" />
    </div>
  );
}