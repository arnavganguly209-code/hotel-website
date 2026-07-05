"use client";

import { motion } from "framer-motion";
import { HeroParticles } from "@/components/shared/HeroParticles";

interface LuxuryHeroBackgroundProps {
  animation: "particles" | "gradient" | "both";
  colors: {
    cream: string;
    lightCream: string;
    accent: string;
    green: string;
  };
  champagne?: string;
}

export function LuxuryHeroBackground({ animation, colors, champagne = "#D8B46A" }: LuxuryHeroBackgroundProps) {
  const shapes = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    size: 28 + (i % 3) * 16,
    left: `${12 + i * 14}%`,
    top: `${18 + (i % 4) * 16}%`,
    duration: 22 + i * 4,
  }));

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        background: `linear-gradient(165deg, ${colors.lightCream} 0%, ${colors.cream} 40%, ${champagne}12 70%, ${colors.cream} 100%)`,
      }}
    >
      {(animation === "gradient" || animation === "both") && (
        <>
          <motion.div
            className="absolute inset-0"
            animate={{
              background: [
                `radial-gradient(ellipse 90% 70% at 15% 20%, ${colors.accent}18 0%, transparent 50%)`,
                `radial-gradient(ellipse 80% 60% at 85% 30%, ${champagne}20 0%, transparent 55%)`,
                `radial-gradient(ellipse 90% 70% at 50% 80%, ${colors.green}08 0%, transparent 50%)`,
                `radial-gradient(ellipse 90% 70% at 15% 20%, ${colors.accent}18 0%, transparent 50%)`,
              ],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />

          <motion.div
            className="absolute -left-1/3 top-0 h-[120%] w-1/2 rotate-12 opacity-30"
            style={{
              background: `linear-gradient(90deg, transparent, ${champagne}15, transparent)`,
            }}
            animate={{ x: ["-10%", "30%", "-10%"] }}
            transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          />

          {shapes.map((s) => (
            <motion.div
              key={s.id}
              className="absolute border border-luxury-gold/25"
              style={{ width: s.size, height: s.size, left: s.left, top: s.top }}
              animate={{ rotate: [0, 90, 180, 270, 360], y: [0, -12, 0, 8, 0] }}
              transition={{ duration: s.duration, repeat: Infinity, ease: "linear" }}
            />
          ))}
        </>
      )}

      {(animation === "particles" || animation === "both") && (
        <HeroParticles accentColor={colors.accent} champagneColor={champagne} />
      )}
    </div>
  );
}
