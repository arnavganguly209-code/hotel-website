"use client";

import { motion } from "framer-motion";
import { useMotionPreference } from "@/lib/motion-preference";

interface HeroFloatingLeavesProps {
  enabled: boolean;
  opacity?: number;
}

export function HeroFloatingLeaves({ enabled, opacity = 0.35 }: HeroFloatingLeavesProps) {
  const { skipLoops } = useMotionPreference();

  if (!enabled || skipLoops) return null;

  return (
    <>
      <motion.div
        className="pointer-events-none absolute -left-8 top-16 z-[1] h-32 w-32 opacity-40 md:h-44 md:w-44"
        style={{ opacity }}
        animate={{ y: [0, -12, 0], rotate: [0, 4, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      >
        <svg viewBox="0 0 120 120" className="h-full w-full text-[#184D3D]/25">
          <path
            fill="currentColor"
            d="M60 10 C40 30 20 50 25 75 C30 95 50 100 60 110 C70 100 90 95 95 75 C100 50 80 30 60 10 Z"
          />
        </svg>
      </motion.div>
      <motion.div
        className="pointer-events-none absolute -right-6 bottom-32 z-[1] h-28 w-28 opacity-30 md:bottom-40 md:h-36 md:w-36"
        style={{ opacity: opacity * 0.85 }}
        animate={{ y: [0, 10, 0], rotate: [0, -6, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        aria-hidden
      >
        <svg viewBox="0 0 120 120" className="h-full w-full text-[#184D3D]/20">
          <path
            fill="currentColor"
            d="M60 10 C40 30 20 50 25 75 C30 95 50 100 60 110 C70 100 90 95 95 75 C100 50 80 30 60 10 Z"
          />
        </svg>
      </motion.div>
    </>
  );
}
