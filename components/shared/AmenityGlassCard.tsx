"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { DynamicIcon } from "@/components/shared/DynamicIcon";
import { SafeImage } from "@/components/shared/SafeImage";
import { luxuryEase } from "@/lib/animations";
import type { SiteContent } from "@/lib/cms/types";

interface AmenityGlassCardProps {
  facility: SiteContent["facilities"][number];
  index?: number;
  goldColor?: string;
  headingColor?: string;
  bodyColor?: string;
}

export function AmenityGlassCard({
  facility,
  index = 0,
  goldColor = "#C5A059",
  headingColor = "#062C24",
  bodyColor = "#5A635C",
}: AmenityGlassCardProps) {
  const [hovered, setHovered] = useState(false);
  const customIcon = Boolean(facility.iconSrc?.trim());

  return (
    <motion.article
      variants={{
        hidden: { opacity: 0, y: 28 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.85, ease: luxuryEase, delay: index * 0.04 },
        },
      }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="group relative flex h-full flex-col items-center rounded-[20px] px-4 py-7 text-center transition-all duration-500 hover:-translate-y-1.5"
      style={{
        backgroundColor: "#FBF8F1",
        border: `1px solid ${hovered ? `${goldColor}AA` : `${goldColor}55`}`,
        boxShadow: hovered
          ? `0 20px 44px rgba(15, 42, 34, 0.12), 0 0 0 1px ${goldColor}33`
          : "0 14px 36px rgba(15, 42, 34, 0.08)",
      }}
    >
      <div
        className="mb-4 flex h-[4.25rem] w-[4.25rem] items-center justify-center rounded-full transition-transform duration-500 group-hover:scale-105"
        style={{
          background: `radial-gradient(circle at 35% 30%, #F7EFD8 0%, #E8D5A3 45%, ${goldColor}88 100%)`,
          boxShadow: `0 8px 22px ${goldColor}33`,
          border: `1px solid ${goldColor}66`,
        }}
      >
        {customIcon ? (
          <SafeImage
            src={facility.iconSrc!}
            alt=""
            width={32}
            height={32}
            objectFit="contain"
            className="h-8 w-8 object-contain"
          />
        ) : (
          <span style={{ color: goldColor }}>
            <DynamicIcon name={facility.icon} className="h-7 w-7" />
          </span>
        )}
      </div>

      <h3
        className="font-display text-[13px] font-semibold uppercase tracking-[0.1em] md:text-sm"
        style={{ color: headingColor }}
      >
        {facility.name}
      </h3>
      <p
        className="mt-2.5 text-[12px] leading-[1.65] md:text-[13px]"
        style={{ color: bodyColor }}
      >
        {facility.description}
      </p>
    </motion.article>
  );
}
