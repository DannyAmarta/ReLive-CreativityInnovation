"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useActionState, useRef } from "react";
import Face, { Expression } from "@/components/auth/components/Face";
import { Register } from "@/lib/auth";

type FocusField = "none" | "email" | "password";

/* ─────────────────────────────────────────────
   SnowParticles — pure CSS canvas-free snow
   Rendered behind everything via absolute pos
───────────────────────────────────────────── */
const FLAKE_COUNT = 60;

interface Flake {
    id: number;
    x: number; // % across width
    size: number; // px
    opacity: number;
    duration: number; // animation seconds
    delay: number; // animation delay seconds
    drift: number; // horizontal drift px
}

function generateFlakes(): Flake[] {
    return Array.from({ length: FLAKE_COUNT }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        size: 2 + Math.random() * 5,
        opacity: 0.3 + Math.random() * 0.55,
        duration: 8 + Math.random() * 14,
        delay: -(Math.random() * 20),
        drift: (Math.random() - 0.5) * 60,
    }));
}

const FLAKES = generateFlakes();

const SnowLayer = () => (
    <div
        aria-hidden
        style={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
            pointerEvents: "none",
            zIndex: 0,
        }}
    >
        {FLAKES.map((f) => (
            <div
                key={f.id}
                style={
                    {
                        position: "absolute",
                        top: "-10px",
                        left: `${f.x}%`,
                        width: f.size,
                        height: f.size,
                        borderRadius: "50%",
                        background: "white",
                        opacity: f.opacity,
                        animation: `snowfall ${f.duration}s ${f.delay}s linear infinite`,
                        // drift via custom property trick
                        "--drift": `${f.drift}px`,
                    } as React.CSSProperties
                }
            />
        ))}
        <style>{`
      @keyframes snowfall {
        0%   { transform: translateY(-10px) translateX(0);          opacity: 0; }
        5%   { opacity: 1; }
        95%  { opacity: 0.6; }
        100% { transform: translateY(100vh) translateX(var(--drift)); opacity: 0; }
      }
      @keyframes shimmer {
        0%   { background-position: -200% center; }
        100% { background-position:  200% center; }
      }
      @keyframes aurora {
        0%   { transform: translateX(-5%) scale(1);   opacity: 0.55; }
        50%  { transform: translateX(5%)  scale(1.04); opacity: 0.7; }
        100% { transform: translateX(-5%) scale(1);   opacity: 0.55; }
      }
      @keyframes floatStar {
        0%, 100% { transform: translateY(0) scale(1);   opacity: 0.6; }
        50%       { transform: translateY(-8px) scale(1.15); opacity: 1; }
      }
      @keyframes spinSlow {
        from { transform: rotate(0deg);   }
        to   { transform: rotate(360deg); }
      }
    `}</style>
    </div>
);

/* ─────────────────────────────────────────────
   Decorative large snowflake SVG
───────────────────────────────────────────── */
const SnowflakeSVG = ({
    size = 40,
    opacity = 0.18,
    style = {},
}: {
    size?: number;
    opacity?: number;
    style?: React.CSSProperties;
}) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        aria-hidden
        style={{ opacity, pointerEvents: "none", ...style }}
    >
        <line
            x1="20"
            y1="2"
            x2="20"
            y2="38"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
        />
        <line
            x1="2"
            y1="20"
            x2="38"
            y2="20"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
        />
        <line
            x1="6.06"
            y1="6.06"
            x2="33.94"
            y2="33.94"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
        />
        <line
            x1="33.94"
            y1="6.06"
            x2="6.06"
            y2="33.94"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
        />
        {/* branch ticks */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a, i) => (
            <g key={i} transform={`rotate(${a},20,20)`}>
                <line
                    x1="20"
                    y1="7"
                    x2="17"
                    y2="10"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                />
                <line
                    x1="20"
                    y1="7"
                    x2="23"
                    y2="10"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                />
            </g>
        ))}
        <circle cx="20" cy="20" r="3" fill="white" />
    </svg>
);

/* ─────────────────────────────────────────────
   Main RegisterForm
───────────────────────────────────────────── */
const RegisterForm = () => {
    // ── authentication ───────────────────────────────────────────────
    const [state, action, pending] = useActionState(Register, undefined);

    // ── animation state ──────────────────────────────────────────────
    const [mouse, setMouse] = useState({ x: 0, y: 0 });
    const [focusField, setFocusField] = useState<FocusField>("none");

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [isTypingPassword, setIsTypingPassword] = useState(false);

    const [orangeSmiling, setOrangeSmiling] = useState(false);
    const [yellowYawning, setYellowYawning] = useState(false);

    const isError = !!state?.errors || !!state?.message;

    const isPasswordActive = focusField === "password";
    const isEmailActive = focusField === "email";
    const isAnyActive = isPasswordActive || isEmailActive;

    const pushX = isError ? 0 : isPasswordActive ? 28 : isEmailActive ? 14 : 0;
    const pushRotate = isError
        ? 0
        : isPasswordActive
          ? 14
          : isEmailActive
            ? 6
            : 0;

    const purpleRotate = isError ? -22 : pushRotate;
    const purpleX = isError ? -30 : pushX;
    const purpleY = isError ? 20 : 0;

    const darkHeight = isTypingPassword && !isError ? 640 : 320;

    const typingRotate = Math.min(password.length * 1.5, 10);

    const darkPeekRotate =
        isTypingPassword && !isError
            ? 40 + typingRotate
            : isPasswordActive && !isError
              ? 10
              : pushRotate * 0.5;
    const darkPeekX =
        isTypingPassword && !isError
            ? 38
            : isPasswordActive && !isError
              ? 18
              : pushX * 0.6;
    const darkPeekY = isTypingPassword && !isError ? -60 : 0;

    const handleMouseMove = (e: React.MouseEvent) => {
        setMouse({ x: e.clientX, y: e.clientY });
    };

    const spring = { type: "spring" as const, stiffness: 130, damping: 16 };
    const peekSpring = { type: "spring" as const, stiffness: 90, damping: 14 };
    const fastSpring = { type: "spring" as const, stiffness: 260, damping: 20 };

    const shakeTransition = {
        duration: 0.45,
        times: [0, 0.12, 0.25, 0.37, 0.5, 0.62, 0.75, 1],
    };
    const shakeX = isError ? [0, -10, 10, -8, 8, -4, 4, 0] : [0];

    const simplePupil = (factor: number) =>
        isError
            ? { x: 0, y: 3 }
            : { x: (mouse.x - 300) / factor, y: (mouse.y - 200) / factor };

    // Orange: random smile every 4–8 seconds
    useEffect(() => {
        let timeout: ReturnType<typeof setTimeout>;
        const schedule = () => {
            timeout = setTimeout(
                () => {
                    setOrangeSmiling(true);
                    setTimeout(() => {
                        setOrangeSmiling(false);
                        schedule();
                    }, 1800);
                },
                4000 + Math.random() * 4000,
            );
        };
        schedule();
        return () => clearTimeout(timeout);
    }, []);

    // Yellow: yawns when mouse is far left
    useEffect(() => {
        if (mouse.x < 120 && !isAnyActive && !isError) {
            setYellowYawning(true);
        } else {
            setYellowYawning(false);
        }
    }, [mouse.x, isAnyActive, isError]);

    // ── Expressions ────────────────────────────────────────────────
    const purpleExpr: Expression = isError ? "sad" : "neutral";
    const darkExpr: Expression = isError
        ? "sad"
        : isTypingPassword
          ? "sus"
          : "neutral";
    const yellowExpr: Expression = isError
        ? "sad"
        : isAnyActive
          ? "unhappy"
          : yellowYawning
            ? "yawn"
            : "neutral";
    const orangeExpr: Expression = isError
        ? "sad"
        : orangeSmiling
          ? "happy"
          : "neutral";

    const darkMouse =
        isTypingPassword && !isError ? { x: mouse.x + 600, y: mouse.y } : mouse;

    return (
        <>
            {/* Global font import */}
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Sora:wght@400;600;700&display=swap');

        * { box-sizing: border-box; }

        /* Responsive layout helpers */
        .rform-root {
          display: flex;
          min-height: 100svh;
          font-family: 'Nunito', sans-serif;
          background: #0f172a;
        }

        /* ── Character panel ── */
        .char-panel {
          width: 50%;
          position: relative;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
        }

        /* ── Form panel ── */
        .form-panel {
          width: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
          position: relative;
          overflow: hidden;
        }

        /* Tablet: stack vertically */
        @media (max-width: 900px) {
          .rform-root    { flex-direction: column; }
          .char-panel    { width: 100%; height: 320px; align-items: flex-end; }
          .form-panel    { width: 100%; padding: 28px 20px 40px; }
        }

        /* Phone: tighter */
        @media (max-width: 480px) {
          .char-panel  { height: 240px; }
          .form-panel  { padding: 20px 16px 36px; }
        }

        /* Character stage */
        .char-stage {
          position: relative;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          gap: 8px;
          height: 440px;
        }
        @media (max-width: 900px) {
          .char-stage { height: 300px; transform: scale(0.72); transform-origin: bottom center; }
        }
        @media (max-width: 480px) {
          .char-stage { height: 220px; transform: scale(0.52); transform-origin: bottom center; }
        }

        /* Aurora background */
        .aurora-1 {
          position: absolute;
          width: 70%;
          height: 55%;
          bottom: 30%;
          left: 5%;
          background: radial-gradient(ellipse at center, rgba(123,167,255,0.35) 0%, transparent 70%);
          animation: aurora 9s ease-in-out infinite;
          pointer-events: none;
        }
        .aurora-2 {
          position: absolute;
          width: 60%;
          height: 45%;
          bottom: 15%;
          right: 0%;
          background: radial-gradient(ellipse at center, rgba(167,139,250,0.28) 0%, transparent 70%);
          animation: aurora 12s ease-in-out infinite reverse;
          pointer-events: none;
        }

        /* Ground glow */
        .ground-glow {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 120px;
          background: linear-gradient(to top, rgba(191,212,255,0.22), transparent);
          pointer-events: none;
        }

        /* Frosted form card */
        .form-card {
          width: 100%;
          max-width: 400px;
          background: rgba(255,255,255,0.72);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border: 1px solid rgba(255,255,255,0.55);
          border-radius: 24px;
          padding: 40px 36px 36px;
          box-shadow:
            0 0 0 1px rgba(123,167,255,0.12),
            0 8px 32px rgba(82,37,232,0.13),
            0 32px 80px rgba(30,60,120,0.18);
          position: relative;
          overflow: hidden;
        }
        @media (max-width: 480px) {
          .form-card { padding: 28px 20px 24px; border-radius: 18px; }
        }

        /* Card inner snow shimmer */
        .form-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            120deg,
            transparent 30%,
            rgba(255,255,255,0.25) 50%,
            transparent 70%
          );
          background-size: 200% 100%;
          animation: shimmer 6s linear infinite;
          pointer-events: none;
          border-radius: inherit;
        }

        /* Winter input */
        .winter-input {
          width: 100%;
          outline: none;
          padding: 10px 0;
          background: transparent;
          color: #1e293b;
          font-family: 'Nunito', sans-serif;
          font-size: 0.95rem;
          transition: border-color 0.2s;
        }
        .winter-input::placeholder { color: #94a3b8; }

        /* Winter label */
        .winter-label {
          display: block;
          font-size: 0.78rem;
          font-weight: 700;
          color: #5b7ab5;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 4px;
        }

        /* Register button ice glow */
        .ice-btn {
          width: 100%;
          padding: 14px;
          border-radius: 999px;
          border: none;
          cursor: pointer;
          font-family: 'Sora', sans-serif;
          font-weight: 700;
          font-size: 0.95rem;
          color: white;
          background: linear-gradient(135deg, #7BA7FF 0%, #A78BFA 55%, #7B3FFF 100%);
          background-size: 200% 200%;
          position: relative;
          overflow: hidden;
          transition: opacity 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 20px rgba(123,167,255,0.35);
        }
        .ice-btn:hover:not(:disabled) {
          opacity: 0.93;
          box-shadow: 0 6px 28px rgba(123,167,255,0.55), 0 0 40px rgba(167,139,250,0.25);
        }
        .ice-btn:disabled { opacity: 0.65; cursor: default; }
        .ice-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%);
          background-size: 200% 100%;
          animation: shimmer 3s linear infinite;
          pointer-events: none;
        }

        /* Floating snowflake decorators */
        .fl-1 { position: absolute; top: 12%; left:  8%; animation: floatStar 5s ease-in-out infinite; }
        .fl-2 { position: absolute; top: 20%; right: 6%; animation: floatStar 7s ease-in-out infinite 1.2s; }
        .fl-3 { position: absolute; bottom: 22%; left: 4%; animation: floatStar 6s ease-in-out infinite 2.5s; }
        .fl-4 { position: absolute; bottom: 10%; right: 8%; animation: floatStar 8s ease-in-out infinite 0.8s; }
        .fl-5 { position: absolute; top: 40%; left: 50%; animation: spinSlow 20s linear infinite; }
      `}</style>

            <div className="rform-root">
                {/* ═══════════════ LEFT — Characters ═══════════════ */}
                <div
                    className="char-panel"
                    onMouseMove={handleMouseMove}
                    style={{
                        background:
                            "linear-gradient(165deg, #0f172a 0%, #1a2744 40%, #0d1f3e 70%, #111827 100%)",
                    }}
                >
                    {/* Snow particles */}
                    <SnowLayer />

                    {/* Aurora glows */}
                    <div className="aurora-1" />
                    <div className="aurora-2" />

                    {/* Decorative snowflakes */}
                    <div className="fl-1">
                        <SnowflakeSVG size={28} opacity={0.22} />
                    </div>
                    <div className="fl-2">
                        <SnowflakeSVG size={20} opacity={0.16} />
                    </div>
                    <div className="fl-3">
                        <SnowflakeSVG size={36} opacity={0.14} />
                    </div>
                    <div className="fl-4">
                        <SnowflakeSVG size={18} opacity={0.2} />
                    </div>
                    <div className="fl-5">
                        <SnowflakeSVG size={60} opacity={0.06} />
                    </div>

                    {/* Ground glow */}
                    <div className="ground-glow" />

                    {/* ── Character Stage ── */}
                    <div className="char-stage">
                        {/* ── PURPLE ── */}
                        <motion.div
                            animate={{
                                y: isError ? purpleY : [0, -10, 0],
                                x: purpleX,
                                rotate: purpleRotate,
                            }}
                            transition={
                                isError
                                    ? { ...spring }
                                    : {
                                          ...spring,
                                          y: {
                                              repeat: Infinity,
                                              duration: 3,
                                              ease: "easeInOut",
                                          },
                                      }
                            }
                            className="relative z-10 rounded-xl overflow-hidden"
                            style={{
                                width: 160,
                                height: 400,
                                background:
                                    "linear-gradient(180deg, #a78bfa 0%, #7B3FFF 40%, #4c1d95 100%)",
                                transformOrigin: "bottom center",
                                boxShadow:
                                    "inset 0 0 30px rgba(255,255,255,0.08), 0 0 30px rgba(123,167,255,0.2)",
                            }}
                        >
                            {/* Frost highlight */}
                            <div
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: "30%",
                                    background:
                                        "linear-gradient(180deg,rgba(224,231,255,0.18) 0%,transparent 100%)",
                                    pointerEvents: "none",
                                    zIndex: 5,
                                }}
                            />

                            <div
                                style={{
                                    position: "absolute",
                                    top: "13%",
                                    left: 0,
                                    width: "100%",
                                    height: "17%",
                                }}
                            >
                                <Face
                                    mouse={mouse}
                                    eyeSize={14}
                                    eyeGap={5}
                                    mouthWidth={28}
                                    expression={purpleExpr}
                                    pairTracking
                                    eyeballColor="white"
                                    pupilColor="black"
                                />
                            </div>

                            {/* Password peek-cover */}
                            <motion.div
                                animate={{
                                    y: isPasswordActive ? "0%" : "-105%",
                                }}
                                transition={{
                                    type: "spring",
                                    stiffness: 200,
                                    damping: 24,
                                }}
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    width: "100%",
                                    height: "33%",
                                    background:
                                        "linear-gradient(180deg, #4c1d95 65%, rgba(76,29,149,0) 100%)",
                                    zIndex: 10,
                                    pointerEvents: "none",
                                }}
                            />
                        </motion.div>

                        {/* ── DARK ── */}
                        <motion.div
                            animate={{
                                y: isError
                                    ? shakeX.map((v) => v * 0.3)
                                    : isTypingPassword
                                      ? darkPeekY
                                      : [0, -8, 0],
                                x: isError
                                    ? shakeX.map((v) => v * 0.8)
                                    : darkPeekX,
                                rotate: isError ? 0 : darkPeekRotate,
                                height: darkHeight,
                            }}
                            transition={
                                isError
                                    ? shakeTransition
                                    : isTypingPassword
                                      ? peekSpring
                                      : {
                                            ...spring,
                                            y: {
                                                repeat: Infinity,
                                                duration: 3.4,
                                                ease: "easeInOut",
                                            },
                                        }
                            }
                            className="relative z-20 rounded-xl flex flex-col"
                            style={{
                                width: 130,
                                background:
                                    "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)",
                                marginLeft: -40,
                                transformOrigin: "bottom center",
                                paddingTop: 24,
                                overflow: "hidden",
                                boxShadow:
                                    "inset 0 0 20px rgba(123,167,255,0.06), 0 0 20px rgba(30,60,120,0.35)",
                            }}
                        >
                            {/* Icy edge glow */}
                            <div
                                style={{
                                    position: "absolute",
                                    inset: 0,
                                    border: "1px solid rgba(123,167,255,0.14)",
                                    borderRadius: "12px",
                                    pointerEvents: "none",
                                }}
                            />
                            <Face
                                mouse={darkMouse}
                                eyeSize={18}
                                eyeGap={8}
                                mouthWidth={32}
                                expression={darkExpr}
                                eyeballColor="white"
                                pupilColor="black"
                            />
                        </motion.div>

                        {/* ── YELLOW ── */}
                        <motion.div
                            animate={{
                                y: isError
                                    ? shakeX.map((v) => v * 0.2)
                                    : [0, -12, 0],
                                x: isError
                                    ? shakeX.map((v) => v * 0.55)
                                    : pushX * 0.45,
                                rotate: isError ? 0 : pushRotate * 0.35,
                            }}
                            transition={
                                isError
                                    ? shakeTransition
                                    : {
                                          ...spring,
                                          y: {
                                              repeat: Infinity,
                                              duration: 2.8,
                                              ease: "easeInOut",
                                          },
                                      }
                            }
                            className="relative z-30 flex flex-col"
                            style={{
                                width: 110,
                                height: 280,
                                background:
                                    "linear-gradient(180deg, #fde68a 0%, #E7C900 60%, #b45309 100%)",
                                borderRadius: "55px 55px 12px 12px",
                                marginLeft: -32,
                                transformOrigin: "bottom center",
                                paddingTop: 40,
                                boxShadow:
                                    "inset 0 0 20px rgba(255,255,255,0.18), 0 0 16px rgba(253,230,138,0.22)",
                            }}
                        >
                            {/* Frost overlay */}
                            <div
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: "25%",
                                    background:
                                        "linear-gradient(180deg,rgba(255,255,255,0.2) 0%,transparent 100%)",
                                    borderRadius: "55px 55px 0 0",
                                    pointerEvents: "none",
                                }}
                            />
                            <Face
                                mouse={mouse}
                                eyeSize={8}
                                eyeGap={10}
                                mouthWidth={38}
                                expression={yellowExpr}
                                eyeballColor="black"
                                pupilColor="black"
                            />
                        </motion.div>

                        {/* ── ORANGE half-circle ── */}
                        <motion.div
                            animate={{
                                y: isError
                                    ? shakeX.map((v) => v * 0.25)
                                    : [0, -14, 0],
                                x: isError
                                    ? shakeX.map((v) => v * 0.4)
                                    : pushX * 0.3,
                            }}
                            transition={
                                isError
                                    ? shakeTransition
                                    : {
                                          ...spring,
                                          y: {
                                              repeat: Infinity,
                                              duration: 3.2,
                                              ease: "easeInOut",
                                          },
                                      }
                            }
                            className="absolute z-40 flex flex-col justify-start"
                            style={{
                                bottom: 0,
                                left: -40,
                                width: 400,
                                height: 220,
                                background:
                                    "linear-gradient(170deg, #fb923c 0%, #F47A2C 50%, #c2410c 100%)",
                                borderRadius: "200px 200px 0 0",
                                paddingTop: 44,
                                boxShadow:
                                    "inset 0 4px 20px rgba(255,255,255,0.14), 0 0 24px rgba(244,122,44,0.25)",
                            }}
                        >
                            {/* Frost rim */}
                            <div
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: "30%",
                                    background:
                                        "linear-gradient(180deg,rgba(255,255,255,0.16) 0%,transparent 100%)",
                                    borderRadius: "200px 200px 0 0",
                                    pointerEvents: "none",
                                }}
                            />
                            <Face
                                mouse={mouse}
                                eyeSize={8}
                                eyeGap={24}
                                mouthWidth={48}
                                expression={orangeExpr}
                                eyeballColor="black"
                                pupilColor="black"
                            />
                        </motion.div>
                    </div>
                    {/* /char-stage */}
                </div>
                {/* /char-panel */}

                {/* ═══════════════ RIGHT — Form ═══════════════ */}
                <div
                    className="form-panel"
                    style={{
                        background:
                            "linear-gradient(145deg, #1e3a5f 0%, #1a2744 35%, #0f172a 70%, #1a1033 100%)",
                    }}
                >
                    {/* Background decorative snowflakes */}
                    <div
                        style={{
                            position: "absolute",
                            top: "8%",
                            right: "10%",
                            opacity: 0.09,
                        }}
                    >
                        <SnowflakeSVG size={80} opacity={1} />
                    </div>
                    <div
                        style={{
                            position: "absolute",
                            bottom: "12%",
                            left: "6%",
                            opacity: 0.07,
                        }}
                    >
                        <SnowflakeSVG size={60} opacity={1} />
                    </div>
                    <SnowLayer />

                    {/* ── Frosted glass form card ── */}
                    <form action={action} className="form-card">
                        {/* Logo */}
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                marginBottom: 24,
                            }}
                        >
                            <div
                                style={{
                                    width: 52,
                                    height: 52,
                                    borderRadius: 14,
                                    background:
                                        "linear-gradient(135deg, rgba(123,167,255,0.25) 0%, rgba(167,139,250,0.3) 100%)",
                                    border: "1px solid rgba(255,255,255,0.35)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    boxShadow:
                                        "0 4px 16px rgba(123,167,255,0.25)",
                                }}
                            >
                                <svg
                                    width="28"
                                    height="28"
                                    viewBox="0 0 44 44"
                                    fill="none"
                                >
                                    <path
                                        d="M10 34 L18 10 L26 22 L30 14 L38 34"
                                        stroke="#a78bfa"
                                        strokeWidth="3.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        fill="none"
                                    />
                                </svg>
                            </div>
                        </div>

                        <h1
                            style={{
                                fontFamily: "'Sora', sans-serif",
                                fontSize: "clamp(1.3rem, 3vw, 1.65rem)",
                                fontWeight: 700,
                                textAlign: "center",
                                marginBottom: 24,
                                color: "#1e293b",
                                letterSpacing: "-0.025em",
                                lineHeight: 1.25,
                            }}
                        >
                            Create Your Account
                        </h1>

                        {/* Error banner */}
                        {!!state?.message && (
                            <AnimatePresence>
                                {isError && (
                                    <motion.div
                                        initial={{
                                            opacity: 0,
                                            y: -6,
                                            height: 0,
                                        }}
                                        animate={{
                                            opacity: 1,
                                            y: 0,
                                            height: "auto",
                                        }}
                                        exit={{ opacity: 0, height: 0 }}
                                        style={{
                                            overflow: "hidden",
                                            marginBottom: 16,
                                        }}
                                    >
                                        <div
                                            style={{
                                                padding: "10px 14px",
                                                borderRadius: 10,
                                                background:
                                                    "rgba(254,202,202,0.6)",
                                                border: "1px solid rgba(248,113,113,0.4)",
                                                color: "#dc2626",
                                                fontSize: "0.85rem",
                                                textAlign: "center",
                                                backdropFilter: "blur(8px)",
                                            }}
                                        >
                                            {state.message}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        )}

                        {/* ── Name ── */}
                        <div style={{ marginBottom: 18 }}>
                            <label className="winter-label">Username</label>
                            <input
                                name="name"
                                type="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Jonathan Fernandes"
                                className="winter-input"
                                style={{
                                    borderBottom: `2px solid ${isError ? "#ef4444" : "rgba(123,167,255,0.35)"}`,
                                }}
                            />
                        </div>
                        {!!state?.errors?.name && (
                            <p
                                style={{
                                    color: "#ef4444",
                                    fontSize: "0.8rem",
                                    marginTop: -10,
                                    marginBottom: 10,
                                }}
                            >
                                {state.errors.name}
                            </p>
                        )}

                        {/* ── Email ── */}
                        <div style={{ marginBottom: 18 }}>
                            <label className="winter-label">Email</label>
                            <input
                                name="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onFocus={() => setFocusField("email")}
                                onBlur={() => setFocusField("none")}
                                placeholder="example@gmail.com"
                                className="winter-input"
                                style={{
                                    borderBottom: `2px solid ${isEmailActive ? "#7BA7FF" : isError ? "#ef4444" : "rgba(123,167,255,0.35)"}`,
                                }}
                            />
                        </div>
                        {!!state?.errors?.email && (
                            <p
                                style={{
                                    color: "#ef4444",
                                    fontSize: "0.8rem",
                                    marginTop: -10,
                                    marginBottom: 10,
                                }}
                            >
                                {state.errors.email}
                            </p>
                        )}

                        {/* ── Password ── */}
                        <div style={{ marginBottom: 18 }}>
                            <label className="winter-label">Password</label>
                            <div style={{ position: "relative" }}>
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setIsTypingPassword(
                                            e.target.value.length > 0,
                                        );
                                    }}
                                    onFocus={() => setFocusField("password")}
                                    onBlur={() => {
                                        setFocusField("none");
                                        setIsTypingPassword(
                                            password.length > 0,
                                        );
                                    }}
                                    placeholder="••••••••••••"
                                    className="winter-input"
                                    style={{
                                        paddingRight: 36,
                                        borderBottom: `2px solid ${isPasswordActive ? "#A78BFA" : isError ? "#ef4444" : "rgba(123,167,255,0.35)"}`,
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    style={{
                                        position: "absolute",
                                        right: 0,
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        color: "#94a3b8",
                                        padding: 0,
                                    }}
                                    tabIndex={-1}
                                >
                                    {showPassword ? (
                                        <svg
                                            width="20"
                                            height="20"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                                            <line
                                                x1="1"
                                                y1="1"
                                                x2="23"
                                                y2="23"
                                            />
                                        </svg>
                                    ) : (
                                        <svg
                                            width="20"
                                            height="20"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                        <div style={{ marginBottom: 4 }}>
                            {state?.errors?.password?.map((err, i) => (
                                <p
                                    key={i}
                                    style={{
                                        color: "#f87171",
                                        fontSize: "0.8rem",
                                    }}
                                >
                                    {err}
                                </p>
                            ))}
                        </div>

                        {/* ── Reenter password ── */}
                        <div style={{ marginBottom: 22 }}>
                            <label className="winter-label">
                                Confirm Password
                            </label>
                            <input
                                name="password2"
                                type="password"
                                value={password2}
                                onChange={(e) => setPassword2(e.target.value)}
                                onFocus={() => setFocusField("email")}
                                onBlur={() => setFocusField("none")}
                                placeholder="••••••••••••"
                                className="winter-input"
                                style={{
                                    borderBottom: `2px solid ${isError ? "#ef4444" : "rgba(123,167,255,0.35)"}`,
                                }}
                            />
                        </div>
                        {!!state?.errors?.password2 && (
                            <p
                                style={{
                                    color: "#ef4444",
                                    fontSize: "0.8rem",
                                    marginBottom: 10,
                                }}
                            >
                                {state.errors.password2}
                            </p>
                        )}

                        {/* ── Register button ── */}
                        <motion.button
                            type="submit"
                            whileHover={{ scale: 1.015 }}
                            whileTap={{ scale: 0.975 }}
                            animate={
                                isError
                                    ? { x: [0, -8, 8, -6, 6, -3, 3, 0] }
                                    : { x: 0 }
                            }
                            transition={
                                isError
                                    ? { duration: 0.45 }
                                    : { type: "spring" }
                            }
                            className="ice-btn"
                            style={{ marginBottom: 16 }}
                            disabled={pending}
                        >
                            {pending ? "Please wait…" : "✦ Create Account"}
                        </motion.button>

                        <p
                            style={{
                                textAlign: "center",
                                fontSize: "0.85rem",
                                color: "#64748b",
                            }}
                        >
                            Already have an account?{" "}
                            <a
                                href="/auth/login/"
                                style={{
                                    fontWeight: 700,
                                    color: "#7BA7FF",
                                    textDecoration: "underline",
                                    textUnderlineOffset: 3,
                                }}
                            >
                                Sign In
                            </a>
                        </p>
                    </form>
                </div>
            </div>
        </>
    );
};

export default RegisterForm;
