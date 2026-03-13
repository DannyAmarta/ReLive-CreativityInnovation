"use client"

import { motion } from "framer-motion"
import { useRef } from "react"

interface MouthProps {
  mouse: { x: number; y: number }
  width?: number
  sad?: boolean
}

export default function Mouth({ mouse, width = 24, sad = false }: MouthProps) {
  const ref = useRef<HTMLDivElement>(null)
  let x = 0

  if (ref.current) {
    const rect = ref.current.getBoundingClientRect()
    const dx = mouse.x - (rect.left + rect.width / 2)
    x = Math.max(-5, Math.min(5, dx * 0.04))
  }

  return (
    <motion.div
      ref={ref}
      animate={{ x: sad ? 0 : x }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      style={{ width }}
    >
      <motion.div
        animate={sad ? { scaleY: -1 } : { scaleY: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}
        style={{
          width: "100%",
          height: Math.max(3, width * 0.12),
          borderBottom: "3px solid black",
          borderLeft: "0px",
          borderRight: "0px",
          borderTop: "0px",
          borderRadius: "0 0 999px 999px",
          transformOrigin: "center center",
        }}
      />
    </motion.div>
  )
}
