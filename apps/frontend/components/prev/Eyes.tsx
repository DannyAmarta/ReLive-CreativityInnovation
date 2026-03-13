"use client"

import { motion } from "framer-motion"
import { useRef } from "react"

interface EyesProps {
  mouse: { x: number; y: number }
  size?: number
  sad?: boolean
}

export default function Eyes({ mouse, size = 12, sad = false }: EyesProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const gap = 5
  const eyeSize = size
  const pupilSize = size * 0.4

  let pairX = 0, pairY = 0, pupilX = 0, pupilY = 0

  if (containerRef.current) {
    const rect = containerRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const dx = mouse.x - centerX
    const dy = mouse.y - centerY

    const pairSensitivity = 0.08
    const parentRect = containerRef.current.parentElement?.getBoundingClientRect()
    const availableX = parentRect
      ? (parentRect.width / 2) - eyeSize - gap / 2 - 8
      : (rect.width / 2) - eyeSize - gap / 2
    const maxPairY = (rect.height / 2) - eyeSize / 2

    pairX = Math.max(-availableX, Math.min(availableX, dx * pairSensitivity))
    pairY = Math.max(-maxPairY, Math.min(maxPairY, dy * pairSensitivity))

    const pupilSensitivity = 0.06
    const maxPupil = (eyeSize - pupilSize) / 2
    pupilX = Math.max(-maxPupil, Math.min(maxPupil, dx * pupilSensitivity))
    pupilY = Math.max(-maxPupil, Math.min(maxPupil, dy * pupilSensitivity))
  }

  const spring = { type: "spring" as const, stiffness: 260, damping: 18 }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center overflow-visible"
    >
      <motion.div
        animate={{ x: pairX, y: pairY }}
        transition={spring}
        style={{ gap, display: "flex", alignItems: "center" }}
      >
        {[0, 1].map((i) => (
          <div
            key={i}
            style={{ width: eyeSize, height: eyeSize }}
            className="relative bg-white rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
          >
            {/* sad eyebrow */}
            {sad && (
              <div
                className="absolute top-0 left-0 w-full z-10"
                style={{
                  height: eyeSize * 0.45,
                  background: "black",
                  borderRadius: "0 0 40% 40%",
                  transform: i === 0
                    ? "rotate(15deg) translateY(-30%)"
                    : "rotate(-15deg) translateY(-30%)",
                  transformOrigin: "center top",
                }}
              />
            )}
            <motion.div
              animate={{ x: pupilX, y: pupilY }}
              transition={spring}
              style={{ width: pupilSize, height: pupilSize }}
              className="bg-black rounded-full relative z-20"
            />
          </div>
        ))}
      </motion.div>
    </div>
  )
}
