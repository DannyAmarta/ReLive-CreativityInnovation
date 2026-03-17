"use client";

import { useState, useActionState, useEffect } from "react";
import { motion } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { ForgotPasswordQuery } from "@/lib/auth";
import {
    WinterScene,
    GlassCard,
    SnowParticles,
} from "@/components/auth/IceThreeJs";

type FocusField = "none" | "email";

//////////////////////////////////////////////////////////
//// MAIN COMPONENT
//////////////////////////////////////////////////////////

export default function ForgotPassword() {
    const [state, action] = useActionState(ForgotPasswordQuery, undefined);

    const [email, setEmail] = useState("");

    const [focusField, setFocusField] = useState<FocusField>("none");

    const isError = !!state?.errors;
    const isSuccess = state?.status === "success";
    const isEmailActive = focusField === "email";

    useEffect(() => {
        if (isSuccess) {
            setEmail("");
        }
    }, [isSuccess]);

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
                            Enter Your Email
                        </motion.h1>

                        {/* Error banner */}
                        {!!state?.message && (
                            <motion.div
                                initial={{ opacity: 0, y: -6, height: 0 }}
                                animate={{ opacity: 1, y: 0, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden mb-4"
                            >
                                <div
                                    className={`px-4 py-2.5 rounded-lg text-sm text-center ${
                                        isSuccess
                                            ? "bg-green-50 border border-green-200 text-green-700"
                                            : "bg-red-50 border border-red-200 text-red-600"
                                    }`}
                                >
                                    {state.message}
                                </div>
                            </motion.div>
                        )}
                        {/* Email */}
                        <div className="mb-5">
                            <label className="block text-sm font-semibold text-gray-600 mb-1.5">
                                Email
                            </label>
                            <div className="relative">
                                <motion.input
                                    name="email"
                                    type="email"
                                    value={email}
                                    placeholder="example@gmail.com"
                                    onChange={(e) => setEmail(e.target.value)}
                                    onFocus={() => setFocusField("email")}
                                    onBlur={() => setFocusField("none")}
                                    style={{
                                        borderBottom: `2px solid ${
                                            isEmailActive
                                                ? "#7B3FFF"
                                                : isError
                                                  ? "#ef4444"
                                                  : "#d1d5db"
                                        }`,
                                    }}
                                    className="
                              w-full
                              mb-6
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
                            </div>
                        </div>
                        {!!state?.errors?.email && (
                            <p className="text-red-500 text-sm">
                                {state.errors.email}
                            </p>
                        )}

                        <motion.button
                            disabled={!email}
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
