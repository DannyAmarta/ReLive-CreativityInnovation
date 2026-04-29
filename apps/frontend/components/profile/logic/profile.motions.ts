import { Variants } from "framer-motion";

// Add "as const" to the ease arrays to satisfy TypeScript's tuple requirement
export const pageVariants: Variants = {
  hidden: {},
  show: { 
    transition: { 
      staggerChildren: 0.1, 
      delayChildren: 0.05 
    } 
  },
};

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.55, 
      ease: [0.22, 1, 0.36, 1] 
    } 
  },
};

export const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  show: { 
    opacity: 1, 
    transition: { duration: 0.22 } 
  },
};

export const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  show: { 
    opacity: 1, 
    scale: 1, 
    y: 0, 
    transition: { 
      duration: 0.32, 
      ease: [0.22, 1, 0.36, 1] 
    } 
  },
};