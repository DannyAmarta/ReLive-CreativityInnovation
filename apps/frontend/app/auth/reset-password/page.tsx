"use client";

import { useSearchParams } from "next/navigation";
import { useState, useActionState } from "react";
import { motion } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { ResetPasswordQuery } from "@/lib/auth";
import {
    WinterScene,
    GlassCard,
    SnowParticles,
} from "@/components/auth/IceThreeJs";
import Backup from "./backup";

type FocusField = "none" | "password";

//////////////////////////////////////////////////////////
//// MAIN COMPONENT
//////////////////////////////////////////////////////////

export default function ResetPassword() {
    const [state, action] = useActionState(ResetPasswordQuery, undefined);

    const token = useSearchParams().get("token");
    if (!token) {
        return <Backup />;
    }

    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [focusField, setFocusField] = useState<FocusField>("none");

    const isError = !!state?.errors;
    const isPasswordActive = focusField === "password";

    // async function submit() {
    //     await fetch("http://localhost:8000/auth/forgot-password", {
    //         method: "POST",

    //         headers: { "Content-Type": "application/json" },

    //         body: JSON.stringify({
    //             token,

    //             newPassword: password,
    //         }),
    //     });

    //     alert("Reset email sent");
    // }

    return (
        <div className="relative w-full h-screen overflow-hidden text-white bg-[#020617]">
            <SnowParticles />
            <Canvas camera={{ position: [0, 0, 6] }}>
                <WinterScene />
            </Canvas>

            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/30 to-slate-950" />

            <div className="absolute inset-0 flex items-center justify-center px-6">
                <GlassCard>
                    <form action={action}>
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

                        {/* Error banner */}
                        {!!state?.message && (
                            <motion.div
                                initial={{ opacity: 0, y: -6, height: 0 }}
                                animate={{ opacity: 1, y: 0, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden mb-4"
                            >
                                <div className="px-4 py-2.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm text-center">
                                    {state.message}
                                </div>
                            </motion.div>
                        )}
                        {/* PASSWORD */}
                        <div className="mb-5">
                            <label className="block text-sm font-semibold text-gray-600 mb-1.5">
                                New Password
                            </label>
                            <div className="relative mb-6">
                                <motion.input
                                    name="newPassword"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••••••"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    onFocus={() => setFocusField("password")}
                                    onBlur={() => setFocusField("none")}
                                    whileFocus={{ scale: 1.05 }}
                                    style={{
                                        borderBottom: `2px solid ${
                                            isPasswordActive
                                                ? "#7B3FFF"
                                                : isError
                                                  ? "#ef4444"
                                                  : "#d1d5db"
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
                        <div className="space-y-1">
                            {state?.errors?.newPassword?.map((err, i) => (
                                <p key={i} className="text-red-400 text-sm">
                                    {err}
                                </p>
                            ))}
                        </div>
                        {/* TOKEN */}
                        <input type="hidden" name="token" value={token ?? ""} />
                        <motion.button
                            disabled={!password}
                            type="submit"
                            whileHover={{
                                scale: 1.08,
                                boxShadow: "0px 0px 40px rgba(56,189,248,0.9)",
                            }}
                            whileTap={{ scale: 0.95 }}
                            // onClick={submit}
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
                    </form>
                </GlassCard>
            </div>
        </div>
    );
}
