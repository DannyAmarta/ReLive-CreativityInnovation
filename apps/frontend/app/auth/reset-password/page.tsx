"use client";

import { useSearchParams } from "next/navigation";
import { useState, useRef, useMemo, useActionState } from 'react';
import { motion } from "framer-motion";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float } from "@react-three/drei";

import {
    EffectComposer,
    Bloom,
    Noise,
    Vignette,
} from "@react-three/postprocessing";

import * as THREE from "three";

type FocusField = "none" | "email" | "password"

function InstancedSnow({ count = 120 }) {
  const { mouse, viewport } = useThree()
  const meshRef = useRef<THREE.InstancedMesh>(null!)

  const dummy = useMemo(() => new THREE.Object3D(), [])

  const particles = useMemo(() => {

    return new Array(count).fill(0).map(() => ({
      x: (Math.random() - 0.5) * 12,
      y: Math.random() * 10,
      z: (Math.random() - 0.5) * 12,
      speed: 0.4 + Math.random() * 1.2
    }))

  }, [count])

  useFrame((state, delta) => {

  const mouseX = mouse.x * viewport.width * 0.5
  const mouseY = mouse.y * viewport.height * 0.5

  particles.forEach((p, i) => {
      const dx = p.x - mouseX
      const dy = p.y - mouseY
      const dist = Math.sqrt(dx * dx + dy * dy)

      const force = Math.max(0, 1 - dist * 0.4)

      p.x += dx * force * delta * 1.5
      p.y += dy * force * delta * 0.8

      p.y -= delta * p.speed

      if (p.y < -8) p.y = 8

      dummy.position.set(p.x, p.y, p.z)
      dummy.updateMatrix()

      meshRef.current.setMatrixAt(i, dummy.matrix)
    })

    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, count]}
    >
      <icosahedronGeometry args={[0.07, 0]} />
      <meshStandardMaterial
        color="#e0f2fe"
        emissive="#60a5fa"
        emissiveIntensity={1.2}
        roughness={0.2}
      />
    </instancedMesh>
  )

}

//////////////////////////////////////////////////////////
//// Winter Scene
//////////////////////////////////////////////////////////

function WinterScene() {
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
            <InstancedSnow count={80}/>

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

function GlassCard({ children }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 80 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: [0, -12, 0]
            }}
            transition={{
              opacity: { duration: 0.8 },
              scale: { duration: 0.8 },
              y: {
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }
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

//////////////////////////////////////////////////////////
//// MAIN COMPONENT
//////////////////////////////////////////////////////////

export default function ResetPassword() {
   const [state, action] = useActionState(ResetPassword, undefined)

    const params = useSearchParams();
    const token = params.get("token");

    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false)

    const [focusField, setFocusField] = useState<FocusField>("none")

    const isError = !!state?.errors || !!state?.message
    const isPasswordActive = focusField === "password"
    
    async function submit() {
        await fetch("http://localhost:8000/auth/forgot-password", {
            method: "POST",

            headers: { "Content-Type": "application/json" },

            body: JSON.stringify({
                token,

                newPassword: password,
            }),
        });

        alert("Reset email sent");
    }

    return (
        <div className="relative w-full h-screen overflow-hidden text-white bg-[#020617]">
            <Canvas camera={{ position: [0, 0, 6] }}>
                <WinterScene />
            </Canvas>

            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/30 to-slate-950" />

            <div className="absolute inset-0 flex items-center justify-center px-6">
                <GlassCard>
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="
                          text-3xl
                          font-bold
                          mb-8
                          text-center
                          bg-gradient-to-r
                          from-cyan-300
                          to-blue-50
                          bg-clip-text
                          text-transparent"
                    >
                        Reset Your Password
                    </motion.h1>
                  <div className="mb-5">
                    <label className="block text-sm font-semibold text-gray-600 mb-1.5">
                      Password
                    </label>

                    <div className="relative mb-6">
                      <motion.input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setFocusField("password")}
                        onBlur={() => setFocusField("none")}
                        whileFocus={{ scale: 1.05 }}
                        style={{
                          borderBottom: `2px solid ${
                            isPasswordActive ? "#7B3FFF" : isError ? "#ef4444" : "#d1d5db"
                          }`,
                        }}
                        className="
                          w-full
                          px-4
                          pr-10
                          py-3
                          rounded-xl
                          bg-white/5
                          border
                          border-white/20
                          backdrop-blur-md
                          focus:outline-none
                          focus:ring-2
                          focus:ring-cyan-400
                        "
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="
                          absolute
                          right-3
                          top-1/2
                          -translate-y-1/2
                          text-gray-400
                          hover:text-gray-700
                          transition-colors
                        "
                        tabIndex={-1}
                      >
                        {showPassword ? (
                                          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                                            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                                            <line x1="1" y1="1" x2="23" y2="23"/>
                                          </svg>
                                        ) : (
                                          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                            <circle cx="12" cy="12" r="3"/>
                                          </svg>
                  )}
                      </button>
                    </div>
                  </div>
                  {!!state?.errors?.password && (
                    state.errors.password.map((err, i) => {
                      return(
                        <p key={i} className='text-red-500 text-sm'>{err}</p>
                      )
                    })
                  )} 

                    <motion.button
                        whileHover={{
                            scale: 1.08,
                            boxShadow: "0px 0px 40px rgba(56,189,248,0.9)",
                        }}
                        whileTap={{ scale: 0.95 }}
                        onClick={submit}
                        className="
                          w-full
                          py-3
                          rounded-xl
                          font-semibold
                          text-white
                          bg-gradient-to-r
                          from-cyan-400
                          via-blue-500
                          to-purple-500"
                        >
                        Reset Password
                    </motion.button>
                </GlassCard>
            </div>
        </div>
    );
}
