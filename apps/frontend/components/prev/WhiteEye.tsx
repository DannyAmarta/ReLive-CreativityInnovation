"use client"

import { motion } from "framer-motion"
import Pupil from "./Pupil"

export default function WhiteEye({
  size,
  whiteX,
  whiteY,
  pupilX,
  pupilY
}: any) {

  return (
    <motion.div
      animate={{ x: whiteX, y: whiteY }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      style={{ width: size, height: size }}
      className="absolute bg-white rounded-full flex items-center justify-center"
    >
      <Pupil x={pupilX} y={pupilY} size={size * 0.4} />
    </motion.div>
  )
}