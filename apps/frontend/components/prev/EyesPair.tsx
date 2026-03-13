"use client";

import { motion } from "framer-motion";
import Eye from "./prev/Eye";

export default function EyesPair({ mouse, size = 12 }: any) {
    return (
        <motion.div
            className="w-full h-full flex items-center justify-center"
            style={{ transformOrigin: "center" }}
        >
            <Eye mouse={mouse} size={size} />
            <Eye mouse={mouse} size={size} />
        </motion.div>
    );
}
