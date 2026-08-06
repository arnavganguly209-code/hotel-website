"use client";

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

/**
 * Exceptional Services card — cream panel, gold-rimmed green icon badge
 * overlapping the top edge (matches luxury reference).
 */
export function AmenityGlassCard({
  facility,
  index = 0,
  goldColor = "#C5A059",
  headingColor = "#062C24",
  bodyColor = "#6B5E4E",
}: AmenityGlassCardProps) {
  const customIcon = Boolean(facility.iconSrc?.trim());

  return (
    <motion.article
      variants={{
        hidden: { opacity: 0, y: 18 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.7, ease: luxuryEase, delay: index * 0.03 },
        },
      }}
      className="group relative flex h-full flex-col pt-9 sm:pt-10"
    >
      {/* Icon badge — sits on top edge of card */}
      <div
        className="absolute left-1/2 top-0 z-20 flex h-[4.25rem] w-[4.25rem] -translate-x-1/2 items-center justify-center rounded-full transition-transform duration-500 group-hover:-translate-y-1 sm:h-[4.75rem] sm:w-[4.75rem] md:h-[5.15rem] md:w-[5.15rem]"
        style={{
          background: `radial-gradient(circle at 35% 30%, #2A5540 0%, #1A3D30 45%, #0E2A22 100%)`,
          border: `2.5px solid ${goldColor}`,
          boxShadow: `
            0 8px 22px rgba(6, 44, 36, 0.28),
            inset 0 1px 2px rgba(255,255,255,0.18),
            inset 0 -2px 6px rgba(0,0,0,0.25)
          `,
        }}
      >
        <span
          className="pointer-events-none absolute inset-[3px] rounded-full"
          style={{ border: `1px solid ${goldColor}55` }}
          aria-hidden
        />
        {customIcon ? (
          <SafeImage
            src={facility.iconSrc!}
            alt=""
            width={36}
            height={36}
            objectFit="contain"
            className="relative z-[1] h-8 w-8 object-contain sm:h-9 sm:w-9"
            fadeIn={false}
          />
        ) : (
          <span className="relative z-[1]" style={{ color: goldColor }}>
            <DynamicIcon name={facility.icon} className="h-7 w-7 sm:h-8 sm:w-8" />
          </span>
        )}
      </div>

      {/* Card body */}
      <div
        className="flex h-full flex-col items-center rounded-[16px] px-3 pb-5 pt-10 text-center sm:rounded-[18px] sm:px-3.5 sm:pb-6 sm:pt-11 md:pt-12"
        style={{
          backgroundColor: "#FBF8F1",
          border: `1px solid ${goldColor}66`,
          boxShadow: "0 10px 28px rgba(15, 42, 34, 0.07)",
        }}
      >
        <h3
          className="font-display text-[11px] font-semibold uppercase leading-snug tracking-[0.12em] sm:text-[12px] md:text-[13px]"
          style={{ color: headingColor }}
        >
          {facility.name}
        </h3>
        <p
          className="mt-2 line-clamp-3 max-w-[12rem] font-body text-[11px] leading-[1.55] sm:text-[12px] md:mt-2.5 md:text-[12.5px]"
          style={{ color: bodyColor }}
        >
          {facility.description}
        </p>
      </div>
    </motion.article>
  );
}
