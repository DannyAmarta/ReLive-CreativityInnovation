"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface CameraProps {
  camera: {
    x: number;
    y: number;
    zoom: number;
  };
  children: ReactNode;
}

export function Camera({ camera, children }: CameraProps) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        animate={{
          x: camera.x,
          y: camera.y,
          scale: camera.zoom,
        }}
        transition={{
          type: "spring",
          stiffness: 60,
          damping: 22,
          mass: 1.2,
        }}
        className="relative w-full h-full"
        style={{
          transformOrigin: "center center",
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
