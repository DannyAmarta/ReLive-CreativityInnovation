"use client"

import { motion } from "framer-motion"

export default function Pupil({ x, y, size = 6 }: any) {
  return (
    <motion.div
      animate={{ x, y }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      style={{ width: size, height: size }}
      className="bg-black rounded-full"
    />
  )
}