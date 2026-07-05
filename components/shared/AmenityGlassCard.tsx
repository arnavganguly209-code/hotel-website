"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { DynamicIcon } from "@/components/shared/DynamicIcon";
import { luxuryEase } from "@/lib/animations";
import { cn } from "@/lib/utils";
import type { SiteContent } from "@/lib/cms/types";

interface AmenityGlassCardProps {
  facility: SiteContent["facilities"][number];
  index?: number;
}

export function AmenityGlassCard({ facility, index = 0 }: AmenityGlassCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.article
      variants={{
        hidden: { opacity: 0, y: 32, scale: 0.97 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: 0.95, ease: luxuryEase, delay: index * 0.05 },
        },
      }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className={cn(
        "group relative overflow-hidden rounded-[22px] border p-6 backdrop-blur-[28px] transition-all duration-700",
        "hover:-translate-y-2.5 hover:scale-[1.015]"
      )}
      style={{
        background:
          "linear-gradient(155deg, rgba(255,249,242,0.88) 0%, rgba(234,242,232,0.72) 100%)",
        borderColor: hovered ? "rgba(201,164,76,0.45)" : "rgba(255,255,255,0.72)",
        boxShadow: hovered
          ? "0 32px 80px rgba(201,164,76,0.18), inset 0 1px 0 rgba(255,255,255,0.85)"
          : "0 22px 60px rgba(24,56,47,0.08), inset 0 1px 0 rgba(255,255,255,0.75)",
      }}
    >
      <motion.div
        className="pointer-events-none absolute inset-0"
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.8, ease: luxuryEase }}
        style={{
          background:
            "radial-gradient(ellipse at 85% 15%, rgba(201,164,76,0.14) 0%, transparent 55%)",
        }}
      />

      <div
        className="mb-5 flex h-14 w-14 items-center justify-center rounded-full transition-all duration-700 group-hover:scale-105"
        style={{
          background: "linear-gradient(145deg, rgba(246,236,215,0.9) 0%, rgba(255,249,242,0.95) 100%)",
          border: "1px solid rgba(201,164,76,0.35)",
          boxShadow: "0 8px 24px rgba(201,164,76,0.15)",
        }}
      >
        <motion.div
          animate={hovered ? { rotate: [0, -6, 6, 0] } : { rotate: 0 }}
          transition={{ duration: 0.75, ease: luxuryEase }}
        >
          <DynamicIcon name={facility.icon} className="h-7 w-7 text-luxury-gold" />
        </motion.div>
      </div>

      <h3 className="font-display text-[1.05rem] font-medium leading-snug text-luxury-forest">
        {facility.name}
      </h3>
      <p className="mt-2.5 text-[13px] leading-[1.7] text-luxury-muted">{facility.description}</p>

      <div
        className="pointer-events-none absolute inset-x-5 bottom-0 h-px opacity-0 transition-opacity duration-700 group-hover:opacity-100"
        style={{ background: "linear-gradient(90deg, transparent, rgba(201,164,76,0.5), transparent)" }}
      />
    </motion.article>
  );
}
