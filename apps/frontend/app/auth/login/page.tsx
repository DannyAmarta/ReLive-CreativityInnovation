"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect, useActionState } from "react"
// import Eye from './Eye'
// import Mouth from "./Mouth"
// import Eyes from "./Eyes"
import Face, { Expression } from '@/components/DoksliFaceAlias2'

type FocusField = "none" | "email" | "password"
type FormState = "idle" | "error"

const LoginForm = () => {
  // authentication
  // const [state, action] = useActionState(Register, undefined)
  // animation
    const [mouse, setMouse] = useState({ x: 0, y: 0 })
    const [focusField, setFocusField] = useState<FocusField>("none")
    const [formState, setFormState] = useState<FormState>("idle")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [rememberMe, setRememberMe] = useState(false)
    const [isTypingPassword, setIsTypingPassword] = useState(false)
  
    const [orangeSmiling, setOrangeSmiling] = useState(false)
    const [yellowYawning, setYellowYawning] = useState(false)
  
    const isError = formState === "error"
    const isPasswordActive = focusField === "password"
    const isEmailActive = focusField === "email"
    const isAnyActive = isPasswordActive || isEmailActive
  
    // ── PUSH RIGHT on any focus (all chars lean toward the form)
    // email → mild push, password → stronger push
    const pushX = isError ? 0 : isPasswordActive ? 28 : isEmailActive ? 14 : 0
    const pushRotate = isError ? 0 : isPasswordActive ? 14 : isEmailActive ? 6 : 0
  
    // ── PURPLE error: dramatic fall sideways
    const purpleRotate = isError ? -22 : pushRotate
    const purpleX = isError ? -30 : pushX
    const purpleY = isError ? 20 : 0
  
    // ── BLACK peek: grows tall + leans hard toward password when typing
    // Height goes from 320 → 640 (200%) and leans until its face is ~5px from the right edge
    const darkHeight = isTypingPassword && !isError ? 640 : 320
  
    const typingRotate = Math.min(password.length * 1.5, 10)
  
    const darkPeekRotate = isTypingPassword && !isError ? 40 + typingRotate: isPasswordActive && !isError ? 10 : pushRotate * 0.5
    const darkPeekX = isTypingPassword && !isError ? 38 : isPasswordActive && !isError ? 18 : pushX * 0.6
    const darkPeekY = isTypingPassword && !isError ? -60 : 0
  
    const handleMouseMove = (e: React.MouseEvent) => {
      setMouse({ x: e.clientX, y: e.clientY })
    }
  
    const handleLogin = () => {
      if (!email || !password || password.length < 3) {
        setFormState("error")
        setTimeout(() => setFormState("idle"), 2200)
      }
    }
  
    const spring = { type: "spring" as const, stiffness: 130, damping: 16 }
    const peekSpring = { type: "spring" as const, stiffness: 90, damping: 14 }
    const fastSpring = { type: "spring" as const, stiffness: 260, damping: 20 }
  
    const shakeTransition = {
      duration: 0.45,
      times: [0, 0.12, 0.25, 0.37, 0.5, 0.62, 0.75, 1],
    }
    const shakeX = isError ? [0, -10, 10, -8, 8, -4, 4, 0] : [0]
  
    const simplePupil = (factor: number) =>
      isError
        ? { x: 0, y: 3 }
        : { x: (mouse.x - 300) / factor, y: (mouse.y - 200) / factor }
      
     // Orange: random smile every 4–8 seconds
    useEffect(() => {
      let timeout: ReturnType<typeof setTimeout>
      const schedule = () => {
        timeout = setTimeout(() => {
          setOrangeSmiling(true)
          setTimeout(() => { setOrangeSmiling(false); schedule() }, 1800)
        }, 4000 + Math.random() * 4000)
      }
      schedule()
      return () => clearTimeout(timeout)
    }, [])
  
    // Yellow: yawns when mouse is far left
    useEffect(() => {
      if (mouse.x < 120 && !isAnyActive && !isError) {
        setYellowYawning(true)
      } else {
        setYellowYawning(false)
      }
    }, [mouse.x, isAnyActive, isError])
  
    // ── Expressions per character ────────────────────────────────────────────
    const purpleExpr: Expression = isError ? "sad" : "neutral"
  
    const darkExpr: Expression = isError ? "sad" : isTypingPassword ? "sus" : "neutral"
  
    const yellowExpr: Expression = isError
      ? "sad"
      : isAnyActive
        ? "unhappy"
        : yellowYawning
          ? "yawn"
          : "neutral"
  
    const orangeExpr: Expression = isError
      ? "sad"
      : orangeSmiling
        ? "happy"
        : "neutral"
    
    // Dark mouse: bias right when peeking so pupils stare at the form
    const darkMouse = isTypingPassword && !isError ? { x: mouse.x + 600, y: mouse.y } : mouse

  return (  
    <div
      className="flex h-screen"
      style={{ fontFamily: "'DM Sans', sans-serif", background: "#F0EFF4" }}
    >
      {/* ═══════════════ LEFT — Characters ═══════════════  haeusntya overflow hidden */}
      <div
        onMouseMove={handleMouseMove}
        className="w-1/2 flex items-end justify-center relative overflow-visible"
        style={{ background: "#ECEAF4" }}
      >
        <div className="relative flex items-end justify-center gap-2 h-[440px]">

          {/* ── PURPLE: leans right on focus, falls on error ── */}
          <motion.div
            animate={{
              y: isError ? purpleY : [0, -10, 0],
              x: purpleX,
              rotate: purpleRotate,
            }}
            transition={
              isError
                ? { ...spring }
                : { ...spring, y: { repeat: Infinity, duration: 3, ease: "easeInOut" } }
            }
            className="relative z-10 rounded-xl overflow-hidden"
            style={{
              width: 160,
              height: 400,
              background: "linear-gradient(180deg, #7B3FFF 0%, #5225E8 100%)",
              transformOrigin: "bottom center",
            }}
          >
            {/* Eyes */}
            {/* <div style={{ position: "absolute", top: "13%", left: 0, width: "100%", height: "17%" }}>
              <Eyes mouse={mouse} size={14} sad={isError} />
            </div> */}
            <div style={{ position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)" }}>
              <Face mouse={mouse} eyeSize={14} eyeGap={5} mouthWidth={28} expression={purpleExpr} pairTracking eyeballColor="white" pupilColor="black" />
            </div>

            {/* Password peek-cover slides down over eyes */}
            <motion.div
              animate={{ y: isPasswordActive ? "0%" : "-105%" }}
              transition={{ type: "spring", stiffness: 200, damping: 24 }}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "33%",
                background: "linear-gradient(180deg, #5225E8 65%, rgba(82,37,232,0) 100%)",
                zIndex: 10,
                pointerEvents: "none",
              }}
            />

            {/* Mouth */}
            {/* <div
              style={{
                position: "absolute",
                top: "28%",
                left: "50%",
                transform: "translateX(-50%)",
              }}
            >
              <Mouth mouse={mouse} width={26} sad={isError} />
            </div>*/}
          </motion.div> 

          {/* ── DARK: grows to 200% height + peeks aggressively when typing password ── */}
          <motion.div
            animate={{
              y: isError
                ? shakeX.map(v => v * 0.3)
                : isTypingPassword
                  ? darkPeekY
                  : [0, -8, 0],
              x: isError ? shakeX.map(v => v * 0.8) : darkPeekX,
              rotate: isError ? 0 : darkPeekRotate,
              height: darkHeight,
            }}
            transition={
              isError
                ? shakeTransition
                : isTypingPassword
                  ? peekSpring
                  : { ...spring, y: { repeat: Infinity, duration: 3.4, ease: "easeInOut" } }
            }
            className="relative z-20 rounded-xl flex flex-col"
            style={{
              width: 130,
              background: "#161A22",
              marginLeft: -40,
              transformOrigin: "bottom center",
              paddingTop: 24,
              overflow: "hidden",
            }}
          >
            {/* Sus eyes: move toward right (form side) when peeking */}
            {/* <div style={{ display: "flex", gap: 10, padding: "0 16px" }}>
              <motion.div
                animate={
                  isTypingPassword && !isError
                    ? { x: 6 }   // both pupils shift right — looking at the form
                    : { x: 0 }
                }
                transition={peekSpring}
                style={{ display: "flex", gap: 10 }}
              >
                <Eyes mouse={isTypingPassword && !isError ? { x: mouse.x + 400, y: mouse.y } : mouse} size={18} sad={isError} />
              </motion.div>
            </div> */}
              <Face mouse={darkMouse} eyeSize={18} eyeGap={8} mouthWidth={32} expression={darkExpr} eyeballColor="white" pupilColor="black" />
            {/* Mouth */}
            {/* <div style={{ marginTop: 8, padding: "0 18px" }}>
              <Mouth mouse={mouse} width={28} sad={isError} />
            </div>*/}
          </motion.div>

          {/* ── YELLOW: pushed right on focus ── */}
          <motion.div
            animate={{
              y: isError ? shakeX.map(v => v * 0.2) : [0, -12, 0],
              x: isError ? shakeX.map(v => v * 0.55) : pushX * 0.45,
              rotate: isError ? 0 : pushRotate * 0.35,
            }}
            transition={
              isError
                ? shakeTransition
                : { ...spring, y: { repeat: Infinity, duration: 2.8, ease: "easeInOut" } }
            }
            className="relative z-30 flex flex-col"
            style={{
              width: 110,
              height: 280,
              background: "#E7C900",
              borderRadius: "55px 55px 12px 12px",
              marginLeft: -32,
              transformOrigin: "bottom center",
              paddingTop: 40,
            }}
          >
            {/* <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <motion.div animate={simplePupil(15)} transition={fastSpring} className="w-3 h-3 bg-black rounded-full" />
              <motion.div animate={simplePupil(15)} transition={fastSpring} className="w-3 h-3 bg-black rounded-full" />
            </div>
            <div style={{ padding: "6px 20px 0" }}>
              <Mouth mouse={mouse} width={36} sad={isError} />
            </div> */}
            <Face mouse={mouse} eyeSize={8} eyeGap={10} mouthWidth={38} expression={yellowExpr} eyeballColor="black" pupilColor="black" />
          </motion.div>

          {/* ── ORANGE half-circle: pushed right on focus ── */}
          <motion.div
            animate={{
              y: isError ? shakeX.map(v => v * 0.25) : [0, -14, 0],
              x: isError ? shakeX.map(v => v * 0.4) : pushX * 0.3,
            }}
            transition={
              isError
                ? shakeTransition
                : { ...spring, y: { repeat: Infinity, duration: 3.2, ease: "easeInOut" } }
            }
            className="absolute z-40 flex flex-col justify-start"
            style={{
              bottom: 0,
              left: -40,
              width: 400,
              height: 220,
              background: "#F47A2C",
              borderRadius: "200px 200px 0 0",
              paddingTop: 44,
            }}
          >
            {/* <div style={{ display: "flex", gap: 24, justifyContent: "center" }}>
              <motion.div animate={simplePupil(25)} transition={fastSpring} className="w-3 h-3 bg-black rounded-full" />
              <motion.div animate={simplePupil(25)} transition={fastSpring} className="w-3 h-3 bg-black rounded-full" />
            </div>
            <div style={{ display: "flex", justifyContent: "center", marginTop: 10 }}>
              <Mouth mouse={mouse} width={42} sad={isError} />
            </div> */}
            <Face mouse={mouse} eyeSize={8} eyeGap={24} mouthWidth={48} expression={orangeExpr} eyeballColor="black" pupilColor="black" />
          </motion.div>

        </div>
      </div>

      {/* ═══════════════ RIGHT — Login Form ═══════════════ */}
      <form className="w-1/2 flex items-center justify-center bg-white">
        <div style={{ width: 380 }}>

          {/* Logo */}
          <div className="flex justify-center mb-8">
            <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
              <rect width="44" height="44" rx="10" fill="#F3EEFF"/>
              <path d="M10 34 L18 10 L26 22 L30 14 L38 34" stroke="#7B3FFF" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
          </div>

          <h1
            className="text-[2rem] font-bold text-center mb-7 text-gray-900"
            style={{ letterSpacing: "-0.025em" }}
          >
            Welcome Back
          </h1>

          {/* Error banner */}
          <AnimatePresence>
            {isError && (
              <motion.div
                initial={{ opacity: 0, y: -6, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-4"
              >
                <div className="px-4 py-2.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm text-center">
                  Invalid email or password. Please try again.
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-600 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onFocus={() => setFocusField("email")}
              onBlur={() => setFocusField("none")}
              placeholder="example@gmail.com"
              className="w-full outline-none py-2 text-gray-900 placeholder-gray-400 bg-transparent transition-colors"
              style={{
                borderBottom: `2px solid ${isEmailActive ? "#7B3FFF" : isError ? "#ef4444" : "#d1d5db"}`,
              }}
            />
          </div>

          {/* Password */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-600 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => {
                  setPassword(e.target.value)
                  setIsTypingPassword(e.target.value.length > 0)
                }}
                onFocus={() => setFocusField("password")}
                onBlur={() => {
                  setFocusField("none")
                  setIsTypingPassword(password.length > 0)
                }}
                placeholder="••••••••••••"
                className="w-full outline-none py-2 pr-10 text-gray-900 placeholder-gray-400 bg-transparent transition-colors"
                style={{
                  borderBottom: `2px solid ${isPasswordActive ? "#7B3FFF" : isError ? "#ef4444" : "#d1d5db"}`,
                }}
              />
              <button
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
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

          {/* Remember me + Forgot */}
          <div className="flex items-center justify-between mb-7">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded accent-purple-600 cursor-pointer"
              />
              Remember Me
            </label>
            <button className="text-sm text-gray-500 hover:text-purple-600 transition-colors">
              Forgot Password
            </button>
          </div>

          {/* Login button */}
          <motion.button
            onClick={handleLogin}
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.975 }}
            animate={isError ? { x: [0, -8, 8, -6, 6, -3, 3, 0] } : { x: 0 }}
            transition={isError ? { duration: 0.45 } : { type: "spring" }}
            className="w-full py-3.5 rounded-full text-white font-semibold text-base mb-3 transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #8B4FFF 0%, #5A25E8 100%)" }}
          >
            Login
          </motion.button>

          {/* Google */}
          <button className="w-full py-3.5 rounded-full border border-gray-200 bg-gray-50 text-gray-700 font-medium text-base flex items-center justify-center gap-3 hover:bg-gray-100 transition-colors mb-8">
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"/>
              <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
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
      </form>
    </div>
  )
}

export default LoginForm