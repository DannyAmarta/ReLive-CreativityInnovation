"use client"

/**
 * Face.tsx — merged Eyes + Mouth in one component.
 *
 * Expressions:
 *   "neutral"  — flat line mouth, eyes follow cursor
 *   "happy"    — smile arc, normal eyes
 *   "sad"      — frown arc, angled brows (pushed-down half-circle inside eye)
 *   "unhappy"  — mild frown, slightly angled brows (less extreme than sad)
 *   "yawn"     — open oval mouth, droopy eyes
 *   "sus"      — eyes shifted hard right, one-side squint
 */

import { motion } from "framer-motion"
import { useRef, useEffect, useState } from "react"

export type Expression = "neutral" | "happy" | "sad" | "unhappy" | "yawn" | "sus"

interface FaceProps {
  mouse: { x: number; y: number }
  eyeSize?: number
  eyeGap?: number
  mouthWidth?: number
  expression?: Expression
  /** If true, the eye PAIR moves as one unit (purple). Otherwise individual eyes track. */
  pairTracking?: boolean
  /** Override pupil color (default black) */
  pupilColor?: string
  /** Override eyeball color (default white) */
  eyeballColor?: string
}

// ─── SVG Mouth shapes ────────────────────────────────────────────────────────

function MouthShape({
  width,
  expression,
  mouseX,
}: {
  width: number
  expression: Expression
  mouseX: number
}) {
  const h = width * 0.45   // height of the mouth bounding box
  const cx = width / 2
  const cy = h / 2

  // Subtle x drift for neutral/happy
  const drift = expression === "neutral" || expression === "happy"
    ? Math.max(-4, Math.min(4, mouseX * 0.03))
    : 0

  let path = ""
  let viewH = h

  switch (expression) {
    case "happy":
      // Smile: arc opening upward (convex bottom)
      path = `M 4 ${h * 0.2} Q ${cx} ${h * 1.1} ${width - 4} ${h * 0.2}`
      break

    case "sad":
      // Frown: arc opening downward (convex top)
      path = `M 4 ${h * 0.85} Q ${cx} ${-h * 0.1} ${width - 4} ${h * 0.85}`
      break

    case "unhappy":
      // Mild frown, less extreme
      path = `M 4 ${h * 0.75} Q ${cx} ${h * 0.2} ${width - 4} ${h * 0.75}`
      break

    case "yawn":
      // Open oval — big O mouth
      viewH = width * 0.7
      return (
        <svg
          width={width}
          height={viewH}
          viewBox={`0 0 ${width} ${viewH}`}
          overflow="visible"
        >
          <ellipse
            cx={cx}
            cy={viewH / 2}
            rx={width * 0.38}
            ry={viewH * 0.46}
            fill="black"
          />
          {/* tongue hint */}
          <ellipse
            cx={cx}
            cy={viewH * 0.72}
            rx={width * 0.2}
            ry={viewH * 0.18}
            fill="#CC4444"
          />
        </svg>
      )

    case "sus":
      // Smirk — left corner up, right corner flat
      path = `M 4 ${h * 0.5} Q ${cx * 0.7} ${-h * 0.1} ${cx} ${h * 0.2} Q ${cx * 1.5} ${h * 0.4} ${width - 4} ${h * 0.55}`
      break

    case "neutral":
    default:
      // Flat line with very slight smile
      path = `M 4 ${h * 0.5} Q ${cx} ${h * 0.65} ${width - 4} ${h * 0.5}`
      break
  }

  return (
    <motion.svg
      width={width}
      height={viewH ?? h}
      viewBox={`0 0 ${width} ${viewH ?? h}`}
      overflow="visible"
      animate={{ x: drift }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
    >
      <motion.path
        d={path}
        fill="none"
        stroke="black"
        strokeWidth={Math.max(2.5, width * 0.1)}
        strokeLinecap="round"
        initial={false}
        animate={{ d: path }}
        transition={{ type: "spring", stiffness: 160, damping: 18 }}
      />
    </motion.svg>
  )
}

// ─── Single Eyeball ──────────────────────────────────────────────────────────

function Eyeball({
  size,
  pupilX,
  pupilY,
  expression,
  side,
  eyeballColor = "white",
  pupilColor = "black",
}: {
  size: number
  pupilX: number
  pupilY: number
  expression: Expression
  side: "left" | "right"
  eyeballColor?: string
  pupilColor?: string
}) {
  const pupilSize = size * 0.38
  const spring = { type: "spring" as const, stiffness: 260, damping: 18 }

  // Brow coverage amount based on expression
  const browHeight = expression === "sad"
    ? size * 0.5
    : expression === "unhappy"
      ? size * 0.38
      : 0

  // Brow angle: inward for sad/unhappy (inner corner down)
  const browSkew = expression === "sad" || expression === "unhappy"
    ? (side === "left" ? "skewX(18deg)" : "skewX(-18deg)")
    : "skewX(0deg)"

  // Yawn: half-closed — droopy top
  const drowsyHeight = expression === "yawn" ? size * 0.42 : 0

  // Sus: pupils pushed hard right, squint on right eye
  const susSquint = expression === "sus" && side === "right" ? size * 0.28 : 0

  const finalPupilX = expression === "sus" ? size * 0.25 : pupilX
  const finalPupilY = expression === "yawn" ? size * 0.1 : pupilY

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: eyeballColor,
        overflow: "hidden",
        position: "relative",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Sad/unhappy brow — dark wedge slides down from top */}
      {browHeight > 0 && (
        <motion.div
          animate={{ height: browHeight, opacity: 1 }}
          initial={{ height: 0, opacity: 0 }}
          transition={spring}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            background: "black",
            borderRadius: "0 0 50% 50%",
            transform: browSkew,
            zIndex: 2,
          }}
        />
      )}

      {/* Drowsy lid — slides down from top for yawn */}
      {expression === "yawn" && (
        <motion.div
          animate={{ height: drowsyHeight, opacity: 1 }}
          initial={{ height: 0, opacity: 0 }}
          transition={spring}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            background: eyeballColor === "white" ? "#ddd" : eyeballColor,
            zIndex: 2,
            borderRadius: "0 0 30% 30%",
          }}
        />
      )}

      {/* Sus squint — bottom lid for right eye */}
      {susSquint > 0 && (
        <motion.div
          animate={{ height: susSquint }}
          initial={{ height: 0 }}
          transition={spring}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            background: eyeballColor === "white" ? "#ccc" : eyeballColor,
            zIndex: 2,
            borderRadius: "30% 30% 0 0",
          }}
        />
      )}

      {/* Pupil */}
      <motion.div
        animate={{ x: finalPupilX, y: finalPupilY }}
        transition={spring}
        style={{
          width: pupilSize,
          height: pupilSize,
          borderRadius: "50%",
          background: pupilColor,
          position: "relative",
          zIndex: 3,
        }}
      />
    </div>
  )
}

// ─── Main Face Component ─────────────────────────────────────────────────────

export default function Face({
  mouse,
  eyeSize = 12,
  eyeGap = 5,
  mouthWidth = 24,
  expression = "neutral",
  pairTracking = false,
  pupilColor = "black",
  eyeballColor = "white",
}: FaceProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  let pairX = 0, pairY = 0
  let pupilX = 0, pupilY = 0
  const pupilSize = eyeSize * 0.38

  // Compute tracking values on each render (ref-based, no state needed)
  const el = containerRef.current
  if (el) {
    const rect = el.getBoundingClientRect()
    const dx = mouse.x - (rect.left + rect.width / 2)
    const dy = mouse.y - (rect.top + rect.height / 2)

    if (pairTracking) {
      const parentRect = el.parentElement?.getBoundingClientRect()
      const availableX = parentRect
        ? (parentRect.width / 2) - eyeSize - eyeGap / 2 - 8
        : eyeSize * 2
      pairX = Math.max(-availableX, Math.min(availableX, dx * 0.08))
      pairY = Math.max(-(eyeSize * 0.4), Math.min(eyeSize * 0.4, dy * 0.05))
    }

    const maxPupil = (eyeSize - pupilSize) / 2
    pupilX = Math.max(-maxPupil, Math.min(maxPupil, dx * 0.07))
    pupilY = Math.max(-maxPupil, Math.min(maxPupil, dy * 0.07))
  }

  const spring = { type: "spring" as const, stiffness: 260, damping: 18 }

  // Relative mouse X for mouth drift (normalized)
  const relMouseX = el
    ? mouse.x - (el.getBoundingClientRect().left + el.getBoundingClientRect().width / 2)
    : 0

  return (
    <div
      ref={containerRef}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: eyeSize * 0.5,
        overflow: "visible",
      }}
    >
      {/* Eyes row */}
      <motion.div
        animate={pairTracking ? { x: pairX, y: pairY } : { x: 0, y: 0 }}
        transition={spring}
        style={{ display: "flex", gap: eyeGap, alignItems: "center" }}
      >
        {(["left", "right"] as const).map((side) => (
          <Eyeball
            key={side}
            size={eyeSize}
            pupilX={expression === "sus" ? eyeSize * 0.25 : pupilX}
            pupilY={expression === "yawn" ? eyeSize * 0.1 : pupilY}
            expression={expression}
            side={side}
            eyeballColor={eyeballColor}
            pupilColor={pupilColor}
          />
        ))}
      </motion.div>

      {/* Mouth */}
      <MouthShape
        width={mouthWidth}
        expression={expression}
        mouseX={relMouseX}
      />
    </div>
  )
}
