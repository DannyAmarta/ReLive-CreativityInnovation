"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useActionState } from "react";
import Face, { Expression } from "@/components/auth/Face";
import { Register } from "@/lib/auth";
import { SnowParticles } from "./SnowParticles";
import { PixiSnowflakes } from "./PixiSnowflakes";

type FocusField = "none" | "email" | "password";

/* ─────────────────────────────────────────────────────────────────
   GROUND SCENE — pine trees, snow drifts, crystals, stars
───────────────────────────────────────────────────────────────── */
const GroundScene = () => (
    <div
        aria-hidden
        style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "55%",
            pointerEvents: "none",
            zIndex: 3,
            overflow: "hidden",
        }}
    >
        <svg
            width="100%"
            height="100%"
            viewBox="0 0 800 460"
            preserveAspectRatio="xMidYMax meet"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* ── Far pine trees ── */}
            {[30, 90, 155, 215, 640, 700, 760].map((x, i) => (
                <g
                    key={`far-${i}`}
                    transform={`translate(${x}, 190)`}
                    opacity="0.16"
                >
                    <polygon points="0,-95 15,0 -15,0" fill="#c7d8ff" />
                    <polygon points="0,-68 13,12 -13,12" fill="#c7d8ff" />
                    <polygon points="0,-42 11,22 -11,22" fill="#c7d8ff" />
                    <rect
                        x="-4.5"
                        y="20"
                        width="9"
                        height="24"
                        fill="#9ab4d6"
                    />
                    {/* Snow caps */}
                    <polygon
                        points="0,-95 5,-80 -5,-80"
                        fill="rgba(255,255,255,0.55)"
                    />
                    <polygon
                        points="0,-68 4,-55 -4,-55"
                        fill="rgba(255,255,255,0.4)"
                    />
                </g>
            ))}

            {/* ── Mid pine trees ── */}
            {[270, 340, 460, 545, 610].map((x, i) => (
                <g
                    key={`mid-${i}`}
                    transform={`translate(${x}, 215)`}
                    opacity="0.30"
                >
                    <polygon points="0,-115 20,0 -20,0" fill="#b0c8f0" />
                    <polygon points="0,-84  18,16 -18,16" fill="#b0c8f0" />
                    <polygon points="0,-52  14,28 -14,28" fill="#b0c8f0" />
                    <rect
                        x="-5.5"
                        y="26"
                        width="11"
                        height="30"
                        fill="#8aaad8"
                    />
                    {/* Snow caps */}
                    <polygon
                        points="0,-115 7,-95 -7,-95"
                        fill="rgba(255,255,255,0.6)"
                    />
                    <polygon
                        points="0,-84  6,-68 -6,-68"
                        fill="rgba(255,255,255,0.45)"
                    />
                </g>
            ))}

            {/* ── Snow drift — back layer ── */}
            <path
                d="M0,295 Q70,240 150,258 Q230,275 310,245 Q390,215 470,250 Q550,280 630,255 Q710,228 800,265 L800,460 L0,460 Z"
                fill="url(#drift1)"
                opacity="0.88"
            />
            {/* Snow drift — front layer ── */}
            <path
                d="M0,330 Q55,298 120,312 Q195,328 270,300 Q350,270 430,305 Q510,335 590,308 Q665,280 740,310 Q775,325 800,318 L800,460 L0,460 Z"
                fill="url(#drift2)"
                opacity="0.94"
            />
            {/* Highlight streak on front drift */}
            <path
                d="M0,328 Q55,296 120,310 Q195,326 270,298 Q350,268 430,303 Q510,333 590,306 Q665,278 740,308 Q775,323 800,316"
                stroke="rgba(255,255,255,0.6)"
                strokeWidth="2.8"
                fill="none"
                strokeLinecap="round"
            />

            {/* ── Ice crystals on drift ── */}
            {[
                { x: 80, y: 318, s: 1.0 },
                { x: 175, y: 300, s: 0.75 },
                { x: 290, y: 282, s: 1.15 },
                { x: 395, y: 292, s: 0.65 },
                { x: 488, y: 298, s: 0.9 },
                { x: 605, y: 296, s: 1.05 },
                { x: 710, y: 308, s: 0.8 },
                { x: 148, y: 340, s: 0.6 },
                { x: 510, y: 338, s: 0.7 },
            ].map(({ x, y, s }, i) => (
                <g
                    key={`cr-${i}`}
                    transform={`translate(${x},${y}) scale(${s})`}
                    opacity="0.75"
                >
                    <polygon points="0,-20 4,0 -4,0" fill="url(#crystalG)" />
                    <polygon
                        points="-10,-14 -2,0 -18,0"
                        fill="url(#crystalG)"
                        opacity="0.75"
                    />
                    <polygon
                        points="10,-14 18,0 2,0"
                        fill="url(#crystalG)"
                        opacity="0.75"
                    />
                    <polygon
                        points="0,-9 3,5 -3,5"
                        fill="white"
                        opacity="0.45"
                    />
                </g>
            ))}

            {/* ── Sparkle dots ── */}
            {[
                [100, 310],
                [195, 293],
                [320, 272],
                [445, 284],
                [535, 289],
                [665, 286],
                [745, 300],
                [65, 348],
                [380, 316],
                [590, 328],
                [250, 325],
                [480, 322],
            ].map(([cx, cy], i) => (
                <circle
                    key={`sp-${i}`}
                    cx={cx}
                    cy={cy}
                    r="2.4"
                    fill="white"
                    opacity="0.25"
                >
                    <animate
                        attributeName="opacity"
                        values={`0.12;${0.65 + (i % 4) * 0.18};0.12`}
                        dur={`${1.6 + i * 0.3}s`}
                        repeatCount="indefinite"
                    />
                </circle>
            ))}

            {/* ── Stars in upper sky ── */}
            {Array.from({ length: 28 }, (_, i) => {
                const sx = (i * 131) % 800;
                const sy = (i * 67) % 200;
                const r = 0.7 + (i % 4) * 0.45;
                return (
                    <circle
                        key={`st-${i}`}
                        cx={sx}
                        cy={sy}
                        r={r}
                        fill="white"
                        opacity="0.18"
                    >
                        <animate
                            attributeName="opacity"
                            values={`0.07;${0.55 + (i % 5) * 0.2};0.07`}
                            dur={`${2.2 + i * 0.25}s`}
                            repeatCount="indefinite"
                        />
                    </circle>
                );
            })}

            <defs>
                <linearGradient id="drift1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d4e5ff" stopOpacity="0.82" />
                    <stop offset="50%" stopColor="#b8d0ff" stopOpacity="0.9" />
                    <stop
                        offset="100%"
                        stopColor="#7aa4cc"
                        stopOpacity="0.95"
                    />
                </linearGradient>
                <linearGradient id="drift2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#eaf3ff" stopOpacity="0.92" />
                    <stop offset="55%" stopColor="#c8deff" stopOpacity="0.94" />
                    <stop
                        offset="100%"
                        stopColor="#90b8e0"
                        stopOpacity="0.96"
                    />
                </linearGradient>
                <linearGradient id="crystalG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#e8f4ff" />
                    <stop
                        offset="100%"
                        stopColor="#7ba7ff"
                        stopOpacity="0.65"
                    />
                </linearGradient>
            </defs>
        </svg>
    </div>
);

/* ─────────────────────────────────────────────────────────────────
   STAR FIELD
───────────────────────────────────────────────────────────────── */
const StarField = () => (
    <div
        aria-hidden
        style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 0,
        }}
    >
        <svg
            width="100%"
            height="100%"
            viewBox="0 0 800 900"
            preserveAspectRatio="xMidYMid slice"
        >
            {Array.from({ length: 65 }, (_, i) => {
                const sx = (i * 137.5) % 800;
                const sy = (i * 73.1) % 550;
                const r = 0.7 + (i % 4) * 0.5;
                const dur = 2.2 + (i % 5) * 0.7;
                const del = (i * 0.18) % 3;
                return (
                    <circle
                        key={i}
                        cx={sx}
                        cy={sy}
                        r={r}
                        fill="white"
                        opacity="0.15"
                    >
                        <animate
                            attributeName="opacity"
                            values={`0.05;${0.45 + (i % 4) * 0.18};0.05`}
                            dur={`${dur}s`}
                            begin={`${del}s`}
                            repeatCount="indefinite"
                        />
                    </circle>
                );
            })}
        </svg>
    </div>
);

/* ─────────────────────────────────────────────────────────────────
   AURORA BLOBS
───────────────────────────────────────────────────────────────── */
const AuroraLayer = () => (
    <div
        aria-hidden
        style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 0,
            overflow: "hidden",
        }}
    >
        <div
            style={{
                position: "absolute",
                width: "72%",
                height: "48%",
                top: "15%",
                left: "6%",
                background:
                    "radial-gradient(ellipse, rgba(99,155,255,0.22) 0%, transparent 70%)",
                animation: "aurora 10s ease-in-out infinite",
            }}
        />
        <div
            style={{
                position: "absolute",
                width: "58%",
                height: "40%",
                top: "28%",
                right: "2%",
                background:
                    "radial-gradient(ellipse, rgba(167,139,250,0.17) 0%, transparent 70%)",
                animation: "aurora 14s ease-in-out infinite reverse",
            }}
        />
        <div
            style={{
                position: "absolute",
                width: "48%",
                height: "28%",
                top: "4%",
                left: "28%",
                background:
                    "radial-gradient(ellipse, rgba(56,189,248,0.09) 0%, transparent 70%)",
                animation: "aurora 18s ease-in-out infinite 3s",
            }}
        />
    </div>
);

/* ─────────────────────────────────────────────────────────────────
   DECORATIVE SVG SNOWFLAKE
───────────────────────────────────────────────────────────────── */
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
        style={{ opacity, pointerEvents: "none", display: "block", ...style }}
    >
        {[0, 60, 120, 180, 240, 300].map((angle, i) => (
            <g key={i} transform={`rotate(${angle}, 20, 20)`}>
                <line
                    x1="20"
                    y1="2"
                    x2="20"
                    y2="38"
                    stroke="white"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                />
                <line
                    x1="20"
                    y1="9"
                    x2="15"
                    y2="14"
                    stroke="white"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                />
                <line
                    x1="20"
                    y1="9"
                    x2="25"
                    y2="14"
                    stroke="white"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                />
                <line
                    x1="20"
                    y1="17"
                    x2="14"
                    y2="21"
                    stroke="white"
                    strokeWidth="1.1"
                    strokeLinecap="round"
                />
                <line
                    x1="20"
                    y1="17"
                    x2="26"
                    y2="21"
                    stroke="white"
                    strokeWidth="1.1"
                    strokeLinecap="round"
                />
            </g>
        ))}
        <circle cx="20" cy="20" r="2.5" fill="white" />
    </svg>
);

/* ═══════════════════════════════════════════════════════════════
   MAIN REGISTER FORM
═══════════════════════════════════════════════════════════════ */
const RegisterForm = () => {
    // ── authentication ──────────────────────────────────────────────
    const [state, action, pending] = useActionState(Register, undefined);

    // ── animation state ─────────────────────────────────────────────
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

    useEffect(() => {
        if (mouse.x < 120 && !isAnyActive && !isError) {
            setYellowYawning(true);
        } else {
            setYellowYawning(false);
        }
    }, [mouse.x, isAnyActive, isError]);

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

    /* ── Input border helper ── */
    const ib = (active: boolean, error: boolean) =>
        active ? "#7BA7FF" : error ? "#ef4444" : "rgba(99,155,255,0.30)";

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Sora:wght@300;400;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes aurora {
          0%   { transform: translateX(-6%) scale(1);    opacity: 0.6; }
          50%  { transform: translateX(6%)  scale(1.06); opacity: 0.9; }
          100% { transform: translateX(-6%) scale(1);    opacity: 0.6; }
        }
        @keyframes floatUp {
          0%, 100% { transform: translateY(0)     scale(1);    opacity: 0.5; }
          50%       { transform: translateY(-10px) scale(1.12); opacity: 0.85; }
        }
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes shimmer {
          0%   { background-position: -220% center; }
          100% { background-position:  220% center; }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(123,167,255,0.28), 0 10px 40px rgba(82,37,232,0.16); }
          50%       { box-shadow: 0 0 40px rgba(123,167,255,0.52), 0 14px 55px rgba(82,37,232,0.28); }
        }

        /* ─── Layout ─── */
        .rform-root {
          display: flex;
          min-height: 100svh;
          font-family: 'Nunito', sans-serif;
          background: #080e1f;
        }
        .char-panel {
          width: 50%;
          position: relative;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
        }
        .form-panel {
          width: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
        }

        /* ─── Tablet ─── */
        @media (max-width: 900px) {
          .rform-root  { flex-direction: column; }
          .char-panel  { width: 100%; height: 370px; }
          .form-panel  { width: 100%; padding: 28px 20px 44px; }
        }
        @media (max-width: 480px) {
          .char-panel  { height: 265px; }
          .form-panel  { padding: 18px 14px 36px; }
        }

        /* ─── Character stage ─── */
        .char-stage {
          position: relative;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          gap: 8px;
          height: 440px;
          z-index: 10;
          margin-bottom: 60px; /* lift above ground drift */
        }
        @media (max-width: 900px) {
          .char-stage { height: 300px; transform: scale(0.68); transform-origin: bottom center; margin-bottom: 30px; }
        }
        @media (max-width: 480px) {
          .char-stage { height: 220px; transform: scale(0.49); transform-origin: bottom center; margin-bottom: 10px; }
        }

        /* ─── Frosted card ─── */
        .form-card {
          width: 100%;
          max-width: 400px;
          background: rgba(255,255,255,0.78);
          backdrop-filter: blur(22px);
          -webkit-backdrop-filter: blur(22px);
          border: 1px solid rgba(255,255,255,0.6);
          border-radius: 26px;
          padding: 42px 38px 38px;
          position: relative;
          overflow: hidden;
          animation: pulseGlow 5s ease-in-out infinite;
        }
        .form-card::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(115deg, transparent 25%, rgba(255,255,255,0.28) 50%, transparent 75%);
          background-size: 220% 100%;
          animation: shimmer 7s linear infinite;
          pointer-events: none;
          border-radius: inherit;
        }
        @media (max-width: 480px) {
          .form-card { padding: 24px 18px 22px; border-radius: 18px; max-width: 360px; }
        }

        /* ─── Labels / inputs ─── */
        .wlabel {
          display: block;
          font-size: 0.70rem;
          font-weight: 800;
          color: #4a6fa5;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        .winput {
          width: 100%;
          outline: none;
          padding: 9px 0;
          background: transparent;
          color: #1e293b;
          font-family: 'Nunito', sans-serif;
          font-size: 0.92rem;
          font-weight: 600;
          transition: border-color 0.25s;
          border: none;
        }
        .winput::placeholder { color: #94a3b8; font-weight: 400; }

        /* ─── Ice button ─── */
        .ice-btn {
          width: 100%;
          padding: 14px;
          border-radius: 999px;
          border: none;
          cursor: pointer;
          font-family: 'Sora', sans-serif;
          font-weight: 700;
          font-size: 0.94rem;
          letter-spacing: 0.03em;
          color: white;
          background: linear-gradient(135deg, #60a5fa 0%, #7BA7FF 28%, #A78BFA 62%, #7B3FFF 100%);
          background-size: 200% 200%;
          position: relative;
          overflow: hidden;
          transition: opacity 0.2s;
          box-shadow: 0 4px 22px rgba(123,167,255,0.45), inset 0 1px 0 rgba(255,255,255,0.2);
        }
        .ice-btn:hover:not(:disabled) {
          opacity: 0.91;
          box-shadow: 0 8px 32px rgba(123,167,255,0.62), 0 0 60px rgba(167,139,250,0.3), inset 0 1px 0 rgba(255,255,255,0.3);
        }
        .ice-btn:disabled { opacity: 0.6; cursor: default; }
        .ice-btn::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.36) 50%, transparent 70%);
          background-size: 200% 100%;
          animation: shimmer 3.5s linear infinite;
          pointer-events: none;
        }

        /* ─── Floating deco snowflake positions ─── */
        .fl-tl { position: absolute; top: 10%; left:  8%; animation: floatUp 5.5s ease-in-out infinite; }
        .fl-tr { position: absolute; top: 18%; right: 7%; animation: floatUp 7.0s ease-in-out infinite 1.4s; }
        .fl-bl { position: absolute; bottom: 30%; left: 4%; animation: floatUp 6.5s ease-in-out infinite 2.8s; }
        .fl-br { position: absolute; bottom: 24%; right:5%; animation: floatUp 8.5s ease-in-out infinite 0.7s; }
        .fl-cx { position: absolute; top: 40%; left: 46%; animation: spinSlow 24s linear infinite; }
      `}</style>

            <div className="rform-root">
                {/* ═══════════ LEFT — Characters ═══════════ */}
                <div
                    className="char-panel"
                    onMouseMove={handleMouseMove}
                    style={{
                        background:
                            "linear-gradient(175deg, #050c1c 0%, #0c1830 30%, #091424 65%, #060e1a 100%)",
                    }}
                >
                    <StarField />
                    <AuroraLayer />

                    {/* tsParticles snow — z-index 1 */}
                    <SnowParticles />

                    {/* PixiJS decorative snowflakes — z-index 2 */}
                    <PixiSnowflakes />

                    {/* Static deco snowflakes (above pixi) */}
                    <div className="fl-tl">
                        <SnowflakeSVG size={30} opacity={0.26} />
                    </div>
                    <div className="fl-tr">
                        <SnowflakeSVG size={22} opacity={0.18} />
                    </div>
                    <div className="fl-bl">
                        <SnowflakeSVG size={38} opacity={0.15} />
                    </div>
                    <div className="fl-br">
                        <SnowflakeSVG size={20} opacity={0.22} />
                    </div>
                    <div className="fl-cx">
                        <SnowflakeSVG size={72} opacity={0.05} />
                    </div>

                    {/* Rich ground scene — pine trees, snow drifts, crystals */}
                    <GroundScene />

                    {/* ── Character stage ── */}
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
                                    "linear-gradient(180deg, #c4b5fd 0%, #7B3FFF 35%, #4c1d95 100%)",
                                transformOrigin: "bottom center",
                                boxShadow:
                                    "inset 0 0 28px rgba(255,255,255,0.1), 0 0 28px rgba(123,167,255,0.22), inset 0 1px 0 rgba(255,255,255,0.35)",
                            }}
                        >
                            <div
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: "28%",
                                    background:
                                        "linear-gradient(180deg,rgba(224,231,255,0.22) 0%,transparent 100%)",
                                    pointerEvents: "none",
                                    zIndex: 5,
                                }}
                            />
                            <div
                                style={{
                                    position: "absolute",
                                    inset: 0,
                                    border: "1px solid rgba(196,181,253,0.28)",
                                    borderRadius: "12px",
                                    pointerEvents: "none",
                                    zIndex: 6,
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
                                    "inset 0 0 18px rgba(123,167,255,0.07), 0 0 22px rgba(30,60,120,0.45)",
                            }}
                        >
                            <div
                                style={{
                                    position: "absolute",
                                    inset: 0,
                                    border: "1px solid rgba(123,167,255,0.18)",
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
                                    "linear-gradient(180deg, #fef08a 0%, #E7C900 55%, #a16207 100%)",
                                borderRadius: "55px 55px 12px 12px",
                                marginLeft: -32,
                                transformOrigin: "bottom center",
                                paddingTop: 40,
                                boxShadow:
                                    "inset 0 0 22px rgba(255,255,255,0.2), 0 0 18px rgba(253,230,138,0.28)",
                            }}
                        >
                            <div
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: "22%",
                                    background:
                                        "linear-gradient(180deg,rgba(255,255,255,0.24) 0%,transparent 100%)",
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
                                    "linear-gradient(170deg, #fdba74 0%, #F47A2C 50%, #9a3412 100%)",
                                borderRadius: "200px 200px 0 0",
                                paddingTop: 44,
                                boxShadow:
                                    "inset 0 4px 24px rgba(255,255,255,0.16), 0 0 28px rgba(244,122,44,0.30)",
                            }}
                        >
                            <div
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: "28%",
                                    background:
                                        "linear-gradient(180deg,rgba(255,255,255,0.18) 0%,transparent 100%)",
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

                {/* ═══════════ RIGHT — Form ═══════════ */}
                <div
                    className="form-panel"
                    style={{
                        background:
                            "linear-gradient(145deg, #0c1e42 0%, #0f172a 45%, #130c2e 100%)",
                    }}
                >
                    <StarField />
                    <AuroraLayer />
                    <SnowParticles />

                    {/* Large deco snowflakes behind card */}
                    <div
                        style={{
                            position: "absolute",
                            top: "6%",
                            right: "7%",
                            animation: "floatUp 7s ease-in-out infinite 1s",
                        }}
                    >
                        <SnowflakeSVG size={95} opacity={0.07} />
                    </div>
                    <div
                        style={{
                            position: "absolute",
                            bottom: "8%",
                            left: "4%",
                            animation: "floatUp 9s ease-in-out infinite 3s",
                        }}
                    >
                        <SnowflakeSVG size={68} opacity={0.06} />
                    </div>
                    <div
                        style={{
                            position: "absolute",
                            top: "45%",
                            left: "2%",
                            animation: "spinSlow 30s linear infinite",
                        }}
                    >
                        <SnowflakeSVG size={42} opacity={0.05} />
                    </div>

                    {/* ── Frosted form card ── */}
                    <form action={action} className="form-card">
                        {/* Logo */}
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                marginBottom: 22,
                            }}
                        >
                            <div
                                style={{
                                    width: 54,
                                    height: 54,
                                    borderRadius: 16,
                                    background:
                                        "linear-gradient(135deg, rgba(96,165,250,0.22) 0%, rgba(167,139,250,0.28) 100%)",
                                    border: "1px solid rgba(255,255,255,0.38)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    boxShadow:
                                        "0 4px 18px rgba(123,167,255,0.28), inset 0 1px 0 rgba(255,255,255,0.3)",
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
                                        stroke="url(#logoG)"
                                        strokeWidth="3.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        fill="none"
                                    />
                                    <defs>
                                        <linearGradient
                                            id="logoG"
                                            x1="10"
                                            y1="10"
                                            x2="38"
                                            y2="34"
                                            gradientUnits="userSpaceOnUse"
                                        >
                                            <stop stopColor="#7BA7FF" />
                                            <stop
                                                offset="1"
                                                stopColor="#a78bfa"
                                            />
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </div>
                        </div>

                        <h1
                            style={{
                                fontFamily: "'Sora', sans-serif",
                                fontSize: "clamp(1.15rem, 2.6vw, 1.58rem)",
                                fontWeight: 700,
                                textAlign: "center",
                                marginBottom: 22,
                                color: "#0f172a",
                                letterSpacing: "-0.02em",
                                lineHeight: 1.25,
                            }}
                        >
                            Register Your Account Now!
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
                                            marginBottom: 14,
                                        }}
                                    >
                                        <div
                                            style={{
                                                padding: "10px 14px",
                                                borderRadius: 10,
                                                background:
                                                    "rgba(254,202,202,0.65)",
                                                border: "1px solid rgba(248,113,113,0.45)",
                                                color: "#b91c1c",
                                                fontSize: "0.83rem",
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

                        {/* Name */}
                        <div style={{ marginBottom: 16 }}>
                            <label className="wlabel">Username</label>
                            <input
                                name="name"
                                type="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Jonathan Fernandes"
                                className="winput"
                                style={{
                                    borderBottom: `2px solid ${ib(false, isError)}`,
                                }}
                            />
                        </div>
                        {!!state?.errors?.name && (
                            <p
                                style={{
                                    color: "#ef4444",
                                    fontSize: "0.78rem",
                                    marginBottom: 10,
                                }}
                            >
                                {state.errors.name}
                            </p>
                        )}

                        {/* Email */}
                        <div style={{ marginBottom: 16 }}>
                            <label className="wlabel">Email</label>
                            <input
                                name="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onFocus={() => setFocusField("email")}
                                onBlur={() => setFocusField("none")}
                                placeholder="example@gmail.com"
                                className="winput"
                                style={{
                                    borderBottom: `2px solid ${ib(isEmailActive, isError)}`,
                                }}
                            />
                        </div>
                        {!!state?.errors?.email && (
                            <p
                                style={{
                                    color: "#ef4444",
                                    fontSize: "0.78rem",
                                    marginBottom: 10,
                                }}
                            >
                                {state.errors.email}
                            </p>
                        )}

                        {/* Password */}
                        <div style={{ marginBottom: 16 }}>
                            <label className="wlabel">Password</label>
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
                                    className="winput"
                                    style={{
                                        paddingRight: 36,
                                        borderBottom: `2px solid ${isPasswordActive ? "#A78BFA" : isError ? "#ef4444" : "rgba(99,155,255,0.30)"}`,
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
                                        lineHeight: 0,
                                    }}
                                    tabIndex={-1}
                                >
                                    {showPassword ? (
                                        <svg
                                            width="19"
                                            height="19"
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
                                            width="19"
                                            height="19"
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
                        <div style={{ marginBottom: 6 }}>
                            {state?.errors?.password?.map((err, i) => (
                                <p
                                    key={i}
                                    style={{
                                        color: "#f87171",
                                        fontSize: "0.78rem",
                                    }}
                                >
                                    {err}
                                </p>
                            ))}
                        </div>

                        {/* Reenter password */}
                        <div style={{ marginBottom: 22 }}>
                            <label className="wlabel">
                                Reenter password one more time!
                            </label>
                            <input
                                name="password2"
                                type="password"
                                value={password2}
                                onChange={(e) => setPassword2(e.target.value)}
                                onFocus={() => setFocusField("email")}
                                onBlur={() => setFocusField("none")}
                                placeholder="••••••••••••"
                                className="winput"
                                style={{
                                    borderBottom: `2px solid ${ib(false, isError)}`,
                                }}
                            />
                        </div>
                        {!!state?.errors?.password2 && (
                            <p
                                style={{
                                    color: "#ef4444",
                                    fontSize: "0.78rem",
                                    marginBottom: 10,
                                }}
                            >
                                {state.errors.password2}
                            </p>
                        )}

                        {/* Register button */}
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
                            {pending ? "Please wait…" : "Register Account"}
                        </motion.button>

                        <p
                            style={{
                                textAlign: "center",
                                fontSize: "0.83rem",
                                color: "#64748b",
                            }}
                        >
                            Already have an account?{" "}
                            <a
                                href="/auth/login/"
                                style={{
                                    fontWeight: 800,
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
                {/* /form-panel */}
            </div>
        </>
    );
};

export default RegisterForm;
