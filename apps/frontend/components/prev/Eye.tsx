"use client"

import { motion } from "framer-motion"
import { useRef } from "react"

interface EyeProps {
  mouse: { x: number; y: number }
  size?: number
  sad?: boolean
}

export default function Eye({ mouse, size = 14, sad = false }: EyeProps) {
  const socketRef = useRef<HTMLDivElement>(null)

  let eyeX = 0, eyeY = 0, pupilX = 0, pupilY = 0

  const eyeSize = size
  const pupilSize = size * 0.35

  if (socketRef.current) {
    const rect = socketRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const dx = mouse.x - centerX
    const dy = mouse.y - centerY
    const sensitivity = 0.05
    const moveX = dx * sensitivity
    const moveY = dy * sensitivity
    const edgeX = rect.width / 2 - eyeSize / 2
    const edgeY = rect.height / 2 - eyeSize / 2

    eyeX = Math.max(-edgeX, Math.min(edgeX, moveX))
    eyeY = Math.max(-edgeY, Math.min(edgeY, moveY))
    const maxPupil = (eyeSize - pupilSize) / 2
    pupilX = Math.max(-maxPupil, Math.min(maxPupil, moveX))
    pupilY = Math.max(-maxPupil, Math.min(maxPupil, moveY))
  }

  return (
    <div
      ref={socketRef}
      className="relative w-full h-full flex items-center justify-center"
    >
      <motion.div
        animate={{ x: eyeX, y: eyeY }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        style={{ width: eyeSize, height: eyeSize }}
        className="absolute bg-white rounded-full flex items-center justify-center overflow-hidden"
      >
        {/* sad eyebrow overlay */}
        {sad && (
          <div
            className="absolute top-0 left-0 w-full z-10"
            style={{
              height: eyeSize * 0.45,
              background: "black",
              borderRadius: "0 0 40% 40%",
              transform: "rotate(-15deg) translateY(-30%)",
              transformOrigin: "center top",
            }}
          />
        )}
        <motion.div
          animate={{ x: pupilX, y: pupilY }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          style={{ width: pupilSize, height: pupilSize }}
          className="bg-black rounded-full relative z-20"
        />
      </motion.div>
    </div>
  )
}
