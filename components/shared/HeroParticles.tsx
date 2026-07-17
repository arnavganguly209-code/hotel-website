"use client";

import { motion } from "framer-motion";
import { useMotionPreference } from "@/lib/motion-preference";

interface HeroParticlesProps {
  accentColor?: string;
  champagneColor?: string;
}

export function HeroParticles({
  accentColor = "#C99A4A",
  champagneColor = "#D8B46A",
}: HeroParticlesProps) {
  const { reduced, skipLoops, isMobile } = useMotionPreference();

  if (reduced) return null;

  const count = skipLoops ? 8 : 32;
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${(i * 3.1 + 2) % 100}%`,
    delay: (i * 0.5) % 12,
    duration: 16 + (i % 7) * 2,
    size: 2 + (i % 4),
    color: i % 3 === 0 ? champagneColor : accentColor,
  }));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            bottom: "-8px",
            backgroundColor: `${p.color}${p.id % 2 === 0 ? "66" : "44"}`,
            boxShadow: `0 0 ${p.size * 4}px ${p.color}55`,
            opacity: skipLoops ? 0.35 : undefined,
          }}
          animate={
            skipLoops
              ? undefined
              : {
                  y: [0, -1200],
                  opacity: [0, 0.95, 0.4, 0],
                  x: [0, p.id % 2 === 0 ? 20 : -20],
                }
          }
          transition={
            skipLoops
              ? undefined
              : {
                  duration: p.duration,
                  repeat: Infinity,
                  delay: p.delay,
                  ease: "linear",
                }
          }
        />
      ))}
    </div>
  );
}
