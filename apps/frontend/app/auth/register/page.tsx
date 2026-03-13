"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useActionState, useRef } from "react";
import Face, { Expression } from "@/components/auth/Face";
import { Register } from "@/lib/auth";
import Link from "next/link";
import {
    AuroraLayer,
    GroundScene,
    SnowflakeSVG,
    StarField,
} from "@/components/auth/SnowAuth";

type FocusField = "none" | "email" | "password";

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

    const [uiError, setUiError] = useState(false);
    useEffect(() => {
        if (state?.errors || state?.message) {
            setUiError(true);
        }
    }, [state]);
    const isError = uiError;

    const isPasswordActive = focusField === "password";
    const isEmailActive = focusField === "email";
    const isAnyActive = isPasswordActive || isEmailActive;

    // ── PUSH RIGHT on any focus (all chars lean toward the form)
    // email → mild push, password → stronger push
    const pushX = isError ? 0 : isPasswordActive ? 28 : isEmailActive ? 14 : 0;
    const pushRotate = isError
        ? 0
        : isPasswordActive
          ? 14
          : isEmailActive
            ? 6
            : 0;

    // ── PURPLE error: dramatic fall sideways
    const purpleRotate = isError ? -22 : pushRotate;
    const purpleX = isError ? -30 : pushX;
    const purpleY = isError ? 20 : 0;

    // ── BLACK peek: grows tall + leans hard toward password when typing
    // Height goes from 320 → 640 (200%) and leans until its face is ~5px from the right edge
    const darkHeight = isTypingPassword && !isError ? 500 : 320;

    const typingRotate = Math.min(password.length * 1.5, 10);

    const darkPeekRotate =
        isTypingPassword && !isError
            ? 55 + typingRotate
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

    const mouseRef = useRef({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent) => {
        mouseRef.current.x = e.clientX;
        mouseRef.current.y = e.clientY;
    };

    useEffect(() => {
        let frame: number;

        const loop = () => {
            setMouse((prev) => {
                const next = mouseRef.current;

                if (prev.x === next.x && prev.y === next.y) {
                    return prev;
                }

                return { ...next };
            });

            frame = requestAnimationFrame(loop);
        };

        frame = requestAnimationFrame(loop);

        return () => cancelAnimationFrame(frame);
    }, []);

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

    // ── Expressions per character ────────────────────────────────────────────
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

    // Dark mouse: bias right when peeking so pupils stare at the form
    const darkMouse =
        isTypingPassword && !isError ? { x: mouse.x + 600, y: mouse.y } : mouse;

    /* ── Input border helper ── */
    const ib = (active: boolean, error: boolean) =>
        active ? "#7BA7FF" : error ? "#ef4444" : "rgba(99,155,255,0.30)";

    return (
        <>
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

                        <div className="relative z-20 rounded-xl flex flex-col">
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
                        </div>

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
                                onChange={(e) => {
                                    setName(e.target.value);
                                    if (uiError) setUiError(false);
                                }}
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
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (uiError) setUiError(false);
                                }}
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
                                        if (uiError) setUiError(false);
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
                                onChange={(e) => {
                                    setPassword2(e.target.value);
                                    if (uiError) setUiError(false);
                                }}
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
                            <Link
                                href="/auth/login/"
                                style={{
                                    fontWeight: 800,
                                    color: "#7BA7FF",
                                    textDecoration: "underline",
                                    textUnderlineOffset: 3,
                                }}
                            >
                                Sign In
                            </Link>
                        </p>
                    </form>
                </div>
                {/* /form-panel */}
            </div>
        </>
    );
};

export default RegisterForm;
