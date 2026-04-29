import { useFrame, useThree } from "@react-three/fiber";
import { useRef, useMemo, useState, useEffect } from 'react';
import {
    EffectComposer,
    Bloom,
    Noise,
    Vignette,
} from "@react-three/postprocessing";
import { motion } from "framer-motion";
import * as THREE from "three";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { useCallback } from "react";
import { Engine } from "@tsparticles/engine";

export function SnowParticles() {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine: Engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  if (!init) return null;

  return (
    <Particles
      id="snow"
      className="absolute inset-0"
      options={{
        fullScreen: { enable: false },
        fpsLimit: 120,

        interactivity: {
          events: {
            onHover: {
              enable: true,
              mode: "grab"
            }
          },

          modes: {
            grab: {
              distance: 250,
              links: {
                opacity: 0.2,
                color: "#7dd3fc"
              }
            }
          }
        },

        particles: {
          number: {
            value: 400,
            density: { enable: true }
          },

          color: { value: "#ffffff" },

          shape: { type: "circle" },

          opacity: {
            value: { min: 0.1, max: 0.7 }
          },

          size: {
            value: { min: 1, max: 4 }
          },

          move: {
            enable: true,
            direction: "bottom",
            random: true,
            speed: { min: 1, max: 3 },
            straight: false,
            outModes: { default: "out" }
          }
        },

        detectRetina: true
      }}
    />
  );
}
// webgl berat buat particle jelek
// export function InstancedSnow({ count = 120 }) {
//   const { mouse, viewport } = useThree()
//   const meshRef = useRef<THREE.InstancedMesh>(null!)

//   const dummy = useMemo(() => new THREE.Object3D(), [])

//   const particles = useMemo(() => {

//     return new Array(count).fill(0).map(() => ({
//       x: (Math.random() - 0.5) * 12,
//       y: Math.random() * 10,
//       z: (Math.random() - 0.5) * 12,
//       speed: 0.4 + Math.random() * 1.2
//     }))

//   }, [count])

//   useFrame((state, delta) => {

//   const mouseX = mouse.x * viewport.width * 0.5
//   const mouseY = mouse.y * viewport.height * 0.5

//   particles.forEach((p, i) => {
//       const dx = p.x - mouseX
//       const dy = p.y - mouseY
//       const dist = Math.sqrt(dx * dx + dy * dy)

//       const force = Math.max(0, 1 - dist * 0.4)

//       p.x += dx * force * delta * 1.5
//       p.y += dy * force * delta * 0.8

//       p.y -= delta * p.speed

//       if (p.y < -8) p.y = 8

//       dummy.position.set(p.x, p.y, p.z)
//       dummy.updateMatrix()

//       meshRef.current.setMatrixAt(i, dummy.matrix)
//     })

//     meshRef.current.instanceMatrix.needsUpdate = true
//   })

//   return (
//     <instancedMesh
//       ref={meshRef}
//       args={[undefined, undefined, count]}
//     >
//       <icosahedronGeometry args={[0.07, 0]} />
//       <meshStandardMaterial
//         color="#e0f2fe"
//         emissive="#60a5fa"
//         emissiveIntensity={1.2}
//         roughness={0.2}
//       />
//     </instancedMesh>
//   )

// }

//////////////////////////////////////////////////////////
//// Winter Scene
//////////////////////////////////////////////////////////

export function WinterScene() {
    return (
        <>
            {/* <color attach="background" args={["#020617"]} /> */}

            <fog attach="fog" args={["#020617", 4, 14]} />

            <ambientLight intensity={0.6} />

            <directionalLight
                position={[5, 5, 5]}
                intensity={2}
                color="#93c5fd"
            />

            {/* <SnowLayer count={40} spread={12} speed={0.4} />
            <SnowLayer count={30} spread={10} speed={0.8} />
            <SnowLayer count={20} spread={8} speed={1.4} /> */}
            {/* <InstancedSnow count={15}/> */}

            <EffectComposer>
                <Bloom
                    intensity={1.8}
                    luminanceThreshold={0.2}
                    luminanceSmoothing={0.9}
                />

                <Noise opacity={0.03} />

                <Vignette eskil={false} offset={0.2} darkness={1.2} />
            </EffectComposer>
        </>
    );
}

//////////////////////////////////////////////////////////
//// Glass Card
//////////////////////////////////////////////////////////

export function GlassCard({ children }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 80 }}
            animate={{
                opacity: 1,
                scale: 1,
                y: [0, -12, 0],
            }}
            transition={{
                opacity: { duration: 0.8 },
                scale: { duration: 0.8 },
                y: {
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                },
            }}
            className="
              relative
              rounded-2xl
              p-10
              w-full
              max-w-md
              bg-white/10
              backdrop-blur-xl
              border
              border-white/20
              shadow-[0_0_80px_rgba(56,189,248,0.4)]"
        >
            <div
                className="
            absolute inset-0
            rounded-2xl
            pointer-events-none
            backdrop-blur-xl
            before:absolute
            before:inset-0
            before:bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent)]
            "
            />
            <div className="absolute inset-0 rounded-2xl pointer-events-none animate-pulse bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 blur-xl" />

            {children}
        </motion.div>
    );
}
