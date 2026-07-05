"use client";

import { motion } from "framer-motion";
import { luxuryEase } from "@/lib/animations";

const PARTICLES = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  left: `${(i * 17) % 100}%`,
  delay: (i % 8) * 0.6,
  duration: 14 + (i % 6) * 2,
  size: i % 4 === 0 ? 4 : 2,
}));

export function LuxuryHeroPlaceholder() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0 animate-gradient-shift bg-[length:300%_300%]"
        style={{
          backgroundImage:
            "linear-gradient(125deg, #FFF9F2 0%, #F6ECD7 20%, #EAF2E8 40%, #F9F0DB 60%, #FAF6EE 80%, #FFF9F2 100%)",
        }}
      />

      <motion.div
        className="absolute -left-[10%] top-[10%] h-[55%] w-[55%] rounded-full opacity-70 blur-[100px]"
        style={{ background: "radial-gradient(circle, rgba(246,236,215,0.95) 0%, transparent 70%)" }}
        animate={{ x: [0, 60, 20, 0], y: [0, -30, 15, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: luxuryEase }}
      />
      <motion.div
        className="absolute -right-[5%] bottom-[5%] h-[50%] w-[50%] rounded-full opacity-60 blur-[90px]"
        style={{ background: "radial-gradient(circle, rgba(234,242,232,0.9) 0%, transparent 70%)" }}
        animate={{ x: [0, -50, -10, 0], y: [0, 25, -15, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: luxuryEase }}
      />
      <motion.div
        className="absolute left-[30%] top-[40%] h-[35%] w-[40%] rounded-full opacity-40 blur-[80px]"
        style={{ background: "radial-gradient(circle, rgba(201,164,76,0.25) 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.08, 0.96, 1], opacity: [0.3, 0.5, 0.35, 0.3] }}
        transition={{ duration: 20, repeat: Infinity, ease: luxuryEase }}
      />

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.25)_0%,transparent_35%,rgba(255,249,242,0.15)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(105deg,transparent_42%,rgba(255,255,255,0.2)_50%,transparent_58%)] opacity-50" />

      {PARTICLES.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full bg-luxury-gold/30"
          style={{
            left: p.left,
            bottom: "-5%",
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -900],
            opacity: [0, 0.7, 0.7, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "linear",
          }}
        />
      ))}

      <div className="absolute inset-0 backdrop-blur-[1px]" />
    </div>
  );
}
