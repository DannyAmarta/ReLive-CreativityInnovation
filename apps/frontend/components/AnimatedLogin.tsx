"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useRef } from "react"
import Eye from './Eye'
import Mouth from "./Mouth"
import Eyes from "./Eyes"

type FocusField = "none" | "email" | "password"
type FormState = "idle" | "error"

export default function AnimatedLogin() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const [focusField, setFocusField] = useState<FocusField>("none")
  const [formState, setFormState] = useState<FormState>("idle")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const isError = formState === "error"
  const isPasswordFocus = focusField === "password"

  // How much each character leans toward the form
  // email focus → slight lean right, password focus → more lean
  const leanAngle = focusField === "email" ? 8 : focusField === "password" ? 18 : 0

  const handleMouseMove = (e: React.MouseEvent) => {
    setMouse({ x: e.clientX, y: e.clientY })
  }

  const handleLogin = () => {
    if (!email || !password || password.length < 4) {
      setFormState("error")
      setTimeout(() => setFormState("idle"), 2000)
    }
  }

  // Shared spring for character lean
  const leanSpring = { type: "spring" as const, stiffness: 120, damping: 14 }

  // Error shake keyframes
  const shakeX = isError
    ? [0, -12, 12, -10, 10, -6, 6, 0]
    : [0]

  // Purple cover for password (slides down over eyes)
  const coverY = isPasswordFocus ? 0 : "-100%"

  const pupilMove = (factor = 8) => ({
    x: isError ? 0 : (mouse.x - 300) / factor,
    y: isError ? 8 : (mouse.y - 200) / factor,
  })

  return (
    <div className="flex h-screen bg-[#F0EFF4]" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* LEFT SIDE – Characters */}
      <div
        onMouseMove={handleMouseMove}
        className="w-1/2 flex items-end justify-center relative overflow-hidden pb-0"
        style={{ background: "#EDEAF5" }}
      >
        <div className="relative flex items-end justify-center gap-2 h-[440px]">

          {/* ── PURPLE ── */}
          <motion.div
            animate={{
              y: [0, -10, 0],
              rotate: isError ? shakeX.map(v => v * 0.15) : leanAngle,
              x: isError ? shakeX : 0,
            }}
            transition={
              isError
                ? { duration: 0.5, times: [0, .1, .2, .3, .4, .5, .6, .7] }
                : { ...leanSpring, y: { repeat: Infinity, duration: 3, ease: "easeInOut" } }
            }
            className="relative z-10 w-[160px] h-[400px] rounded-xl overflow-hidden"
            style={{
              background: "linear-gradient(180deg, #7B3FFF 0%, #5A25E8 100%)",
              transformOrigin: "bottom center",
            }}
          >
            {/* Eyes slot */}
            <div className="absolute left-0 w-full" style={{ top: "12%", height: "18%" }}>
              <Eyes mouse={mouse} size={14} sad={isError} />
            </div>

            {/* Password-cover: slides down to hide eyes */}
            <motion.div
              animate={{ y: coverY }}
              transition={{ type: "spring", stiffness: 180, damping: 22 }}
              className="absolute left-0 w-full"
              style={{
                top: 0,
                height: "32%",
                background: "linear-gradient(180deg, #5A25E8 70%, transparent 100%)",
                zIndex: 20,
              }}
            />

            {/* Mouth */}
            <div
              className="absolute left-1/2 -translate-x-1/2"
              style={{ top: "28%" }}
            >
              <Mouth mouse={mouse} width={26} sad={isError} />
            </div>
          </motion.div>

          {/* ── DARK ── */}
          <motion.div
            animate={{
              y: [0, -8, 0],
              rotate: isError ? shakeX.map(v => v * 0.1) : leanAngle * 0.5,
              x: isError ? shakeX.map(v => v * 0.7) : 0,
            }}
            transition={
              isError
                ? { duration: 0.5, times: [0, .1, .2, .3, .4, .5, .6, .7] }
                : { ...leanSpring, y: { repeat: Infinity, duration: 3.4, ease: "easeInOut" } }
            }
            className="relative z-20 w-[130px] h-[320px] -ml-10 rounded-xl flex flex-col pt-6"
            style={{ background: "#161A22", transformOrigin: "bottom center" }}
          >
            <div className="flex gap-3 px-4">
              <Eye mouse={mouse} size={18} sad={isError} />
              <Eye mouse={mouse} size={18} sad={isError} />
            </div>

            {/* Dark character mouth */}
            <div className="mt-2 px-5">
              <Mouth mouse={mouse} width={30} sad={isError} />
            </div>
          </motion.div>

          {/* ── YELLOW ── */}
          <motion.div
            animate={{
              y: [0, -12, 0],
              rotate: isError ? shakeX.map(v => v * 0.12) : leanAngle * 0.4,
              x: isError ? shakeX.map(v => v * 0.5) : 0,
            }}
            transition={
              isError
                ? { duration: 0.5, times: [0, .1, .2, .3, .4, .5, .6, .7] }
                : { ...leanSpring, y: { repeat: Infinity, duration: 2.8, ease: "easeInOut" } }
            }
            className="relative z-30 w-[110px] h-[280px] -ml-8 flex flex-col pt-10"
            style={{
              background: "#E7C900",
              borderRadius: "55px 55px 12px 12px",
              transformOrigin: "bottom center",
            }}
          >
            <div className="flex gap-4 px-4 justify-center">
              <motion.div
                animate={isError ? { y: 2 } : pupilMove(15)}
                className="w-3 h-3 bg-black rounded-full"
              />
              <motion.div
                animate={isError ? { y: 2 } : pupilMove(15)}
                className="w-3 h-3 bg-black rounded-full"
              />
            </div>

            <div className="px-4 mt-2">
              <Mouth mouse={mouse} width={36} sad={isError} />
            </div>
          </motion.div>

          {/* ── ORANGE (half-circle) ── */}
          <motion.div
            animate={{
              y: [0, -14, 0],
              x: isError ? shakeX.map(v => v * 0.4) : 0,
            }}
            transition={
              isError
                ? { duration: 0.5, times: [0, .1, .2, .3, .4, .5, .6, .7] }
                : { y: { repeat: Infinity, duration: 3.2, ease: "easeInOut" } }
            }
            className="absolute z-40 bottom-0 left-[-40px] flex flex-col justify-start pt-10"
            style={{
              width: 400,
              height: 220,
              background: "#F47A2C",
              borderRadius: "200px 200px 0 0",
            }}
          >
            <div className="flex gap-6 justify-center">
              <motion.div
                animate={isError ? { y: 2 } : pupilMove(25)}
                className="w-3 h-3 bg-black rounded-full"
              />
              <motion.div
                animate={isError ? { y: 2 } : pupilMove(25)}
                className="w-3 h-3 bg-black rounded-full"
              />
            </div>

            <div className="flex justify-center mt-3">
              {isError ? (
                // Frown
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  className="w-10 h-5 border-t-[3px] border-black rounded-t-full"
                />
              ) : (
                <motion.div
                  animate={{ x: (mouse.x - 300) * 0.01 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="w-10 h-5 border-b-[3px] border-black rounded-b-full"
                />
              )}
            </div>
          </motion.div>

        </div>
      </div>

      {/* RIGHT SIDE – Login Form */}
      <div className="w-1/2 flex items-center justify-center bg-white">
        <div className="w-[380px]">

          {/* Logo */}
          <div className="flex justify-center mb-8">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path d="M8 32 L16 8 L24 20 L28 12 L36 32" stroke="#7B3FFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
          </div>

          <h1
            className="text-3xl font-bold text-center mb-8 text-gray-900"
            style={{ letterSpacing: "-0.02em" }}
          >
            Welcome Back
          </h1>

          {/* Error message */}
          <AnimatePresence>
            {isError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm text-center"
              >
                Invalid email or password. Please try again.
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onFocus={() => setFocusField("email")}
              onBlur={() => setFocusField("none")}
              placeholder="example@gmail.com"
              className="w-full border-b-2 border-gray-300 outline-none py-2 text-gray-900 placeholder-gray-400 transition-colors bg-transparent"
              style={{
                borderBottomColor: focusField === "email" ? "#7B3FFF" : isError ? "#ef4444" : undefined,
              }}
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setFocusField("password")}
                onBlur={() => setFocusField("none")}
                placeholder="••••••••••••"
                className="w-full border-b-2 border-gray-300 outline-none py-2 pr-10 text-gray-900 placeholder-gray-400 transition-colors bg-transparent"
                style={{
                  borderBottomColor: focusField === "password" ? "#7B3FFF" : isError ? "#ef4444" : undefined,
                }}
              />
              <button
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
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

          {/* Remember + Forgot */}
          <div className="flex items-center justify-between mb-7">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="w-4 h-4 accent-purple-600 cursor-pointer"
              />
              Remember Me
            </label>
            <button className="text-sm text-gray-500 hover:text-purple-600 transition-colors">
              Forgot Password
            </button>
          </div>

          {/* Login Button */}
          <motion.button
            onClick={handleLogin}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            animate={isError ? { x: [0, -6, 6, -4, 4, 0] } : {}}
            transition={isError ? { duration: 0.4 } : {}}
            className="w-full py-3.5 rounded-full text-white font-semibold text-base mb-3 transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #7B3FFF, #5A25E8)" }}
          >
            Login
          </motion.button>

          {/* Google */}
          <button className="w-full py-3.5 rounded-full border border-gray-200 bg-gray-50 text-gray-700 font-medium text-base flex items-center justify-center gap-3 hover:bg-gray-100 transition-colors mb-8">
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
            </svg>
            Login With Google
          </button>

          <p className="text-center text-sm text-gray-500">
            Don't Have An Account?{" "}
            <button className="font-semibold text-gray-900 underline underline-offset-2 hover:text-purple-600 transition-colors">
              Sign Up
            </button>
          </p>

        </div>
      </div>
    </div>
  )
}
