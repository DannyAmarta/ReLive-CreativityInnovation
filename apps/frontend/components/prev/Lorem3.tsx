"use client";

import Lake from "@/public/assets/wallpaper/lake.png";
import Image from "next/image";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { useEffect, useRef, useState} from "react";

type Bubble = {
  id: number
  size: number
  left: number
  delay: number
  duration: number
}

const Lorem3 = () => {
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const bubbleOpacity = useTransform(
    scrollYProgress,
    [0, 0.25, 0.45],
    [1, 1, 0]
  );
  const bubbleCount = useTransform(
    scrollYProgress,
    [0, 0.25, 0.6],
    [200, 100, 0]
  );
  const [visibleBubbles, setVisibleBubbles] = useState<number | null>(null);
  
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "10%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.15, 1]);
  const blur = useTransform(scrollYProgress, [0, 0.35], [12, 0]);
  const brightness = useTransform(scrollYProgress, [0, 1], [0.85, 1]);

  const refractX = useTransform(scrollYProgress, [0, 1], [-10, 10]);
  const refractY = useTransform(scrollYProgress, [0, 1], [-6, 6]);

  const filter = useTransform(
    [blur, brightness],
    ([b, br]) => `blur(${b}px) brightness(${br})`
  );

  // SpongeBob style bubbles
  const [bubbles, setBubbles] = useState<Bubble[]>([])

  useEffect(() => {
    const generated = Array.from({ length: 200 }).map((_, i) => ({
      id: i,
      size: Math.random() * 70 + 20,
      left: Math.random() * 100,
      delay: Math.random() * 0.3,
      duration: Math.random() * 3 + 3,
    }));

    setBubbles(generated);
  }, []);

  useEffect(() => {
    const unsubscribe = bubbleCount.on("change", (latest) => {
      setVisibleBubbles(Math.round(latest));
    });

    return () => unsubscribe();
  }, [bubbleCount]);

  return (
    <section ref={ref} className="relative z-35 h-screen overflow-hidden">
      {/* SpongeBob Bubble Transition */}
      <motion.div 
        initial={false}
        className="absolute inset-0 pointer-events-none overflow-hidden z-50"
        style={{opacity: bubbleOpacity,}}
      >
        {mounted && visibleBubbles !== null && 
          bubbles.slice(0, visibleBubbles).map((bubble) => (
          <motion.div
            key={bubble.id}
            initial={{
              y: -100,
              opacity: 0,
              scale: 0,
            }}
            animate={{
              y: 500,
              opacity: [0, 0.9, 0],
              scale: [0, 1.2, 1.8],
            }}
            transition={{
              duration: bubble.duration * 0.7,
              delay: bubble.delay,
              repeat: Infinity,
              repeatDelay: 1,
              ease: "easeOut",
            }}
            style={{
              width: bubble.size,
              height: bubble.size,
              left: `${bubble.left}%`,
            }}
            className="
            absolute top-0
            rounded-full
            border border-white/60
            bg-gradient-to-br from-white/40 via-white/20 to-transparent
            backdrop-blur-[2px]
            "
          />
        ))}
      </motion.div>
      {/* Base Lake */}
      <motion.div
        style={{ y, scale, filter }}
        className="absolute inset-0 will-change-transform"
      >
        <Image src={Lake} alt="Lake" fill priority className="object-cover" />
      </motion.div>

      {/* Refraction layer */}
      <motion.div
        style={{ x: refractX, y: refractY }}
        className="absolute inset-0 mix-blend-overlay opacity-10
        bg-gradient-to-b from-transparent via-white/10 to-transparent"
      />

      {/* Ripple rings */}
      <motion.div
        animate={{ scale: [0, 3], opacity: [0.4, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
        className="absolute top-[65%] left-1/2 w-40 h-40
        -translate-x-1/2 -translate-y-1/2
        rounded-full border border-white/30"
      />

      <motion.div
        animate={{ scale: [0, 3.5], opacity: [0.4, 0] }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: "easeOut",
          delay: 0.6,
        }}
        className="absolute top-[65%] left-1/2 w-40 h-40
        -translate-x-1/2 -translate-y-1/2
        rounded-full border border-white/20"
      />

      <motion.div
        animate={{ scale: [0, 4], opacity: [0.35, 0] }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeOut",
          delay: 1.2,
        }}
        className="absolute top-[65%] left-1/2 w-40 h-40
        -translate-x-1/2 -translate-y-1/2
        rounded-full border border-white/10"
      />

      {/* Rising bubbles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: 40, opacity: 0 }}
          animate={{
            y: -220,
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            delay: i * 0.8,
            ease: "easeOut",
          }}
          className="absolute bottom-0 left-1/2
          w-2 h-2 rounded-full bg-white/40 blur-[1px]"
        />
      ))}

      {/* Reflection shimmer */}
      <motion.div
        animate={{ opacity: [0.12, 0.35, 0.12] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0
        bg-gradient-to-b from-transparent via-white/5 to-transparent"
      />

      {/* Caustic light */}
      <motion.div
        animate={{ opacity: [0.05, 0.12, 0.05] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0
        bg-gradient-to-tr from-white/10 via-transparent to-transparent
        mix-blend-overlay"
      />

      {/* Mist atmosphere */}
      <motion.div
        animate={{ opacity: [0.2, 0.35, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-0 h-64 w-full
        bg-gradient-to-t from-black/40 to-transparent"
      />

      {/* Film grain */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "url('https://grainy-gradients.vercel.app/noise.svg')",
        }}
      />

      {/* Floating text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          animate={{ y: [0, -10, 0] }}
          transition={{
            opacity: { duration: 1.3 },
            y: { duration: 7, repeat: Infinity, ease: "easeInOut" },
          }}
          className="text-xl md:text-3xl lg:text-5xl
          text-white text-center drop-shadow-2xl px-6"
        >
          Lorem ipsum dolor sit amet consectetur adipisicing elit.
        </motion.p>
      </div>
    </section>
  );
};

export default Lorem3;