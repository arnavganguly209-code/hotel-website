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
 * Box-less amenity item — ivory gold icon circle, title, description, gold divider.
 * Matches World-Class Amenities reference (no cream card chrome).
 */
export function AmenityGlassCard({
  facility,
  index = 0,
  goldColor = "#C5A059",
  headingColor = "#062C24",
  bodyColor = "#5A635C",
}: AmenityGlassCardProps) {
  const customIcon = Boolean(facility.iconSrc?.trim());

  return (
    <motion.article
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.75, ease: luxuryEase, delay: index * 0.035 },
        },
      }}
      className="group flex h-full flex-col items-center px-2 text-center sm:px-3"
    >
      {/* Icon holder — soft ivory + metallic gold ring + emboss */}
      <div
        className="relative mb-5 flex h-[4.75rem] w-[4.75rem] items-center justify-center rounded-full transition-[transform,box-shadow] duration-[350ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1.5 group-hover:scale-[1.06] md:h-20 md:w-20"
        style={{
          background:
            "radial-gradient(circle at 32% 28%, #FFFDF8 0%, #F8F1E4 52%, #EDE2CE 100%)",
          border: `1.5px solid ${goldColor}`,
          boxShadow: `
            inset 0 2px 5px rgba(255,255,255,0.9),
            inset 0 -3px 6px rgba(15,42,34,0.07),
            0 8px 20px rgba(197,160,89,0.18)
          `,
        }}
      >
        {/* Soft gold glow on hover */}
        <span
          className="pointer-events-none absolute -inset-1 rounded-full opacity-0 transition-opacity duration-[350ms] group-hover:opacity-100"
          style={{
            boxShadow: `0 0 22px ${goldColor}55, 0 0 8px ${goldColor}33`,
          }}
          aria-hidden
        />
        <span
          className="absolute inset-[3px] rounded-full"
          style={{
            border: `1px solid ${goldColor}44`,
            boxShadow: "inset 0 1px 2px rgba(255,255,255,0.75)",
          }}
          aria-hidden
        />
        {customIcon ? (
          <SafeImage
            src={facility.iconSrc!}
            alt=""
            width={34}
            height={34}
            objectFit="contain"
            className="relative z-[1] h-[34px] w-[34px] object-contain transition-transform duration-[350ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
            fadeIn={false}
          />
        ) : (
          <span
            className="relative z-[1] transition-transform duration-[350ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
            style={{ color: goldColor }}
          >
            <DynamicIcon name={facility.icon} className="h-7 w-7" />
          </span>
        )}
      </div>

      <h3
        className="font-display text-[12px] font-semibold uppercase tracking-[0.14em] md:text-[13px]"
        style={{ color: headingColor }}
      >
        {facility.name}
      </h3>
      <p
        className="mt-2.5 max-w-[11.5rem] text-[12px] leading-[1.65] line-clamp-2 md:text-[13px]"
        style={{ color: bodyColor }}
      >
        {facility.description}
      </p>

      {/* Premium gold divider — line · diamond · line */}
      <div
        className="mt-4 flex items-center justify-center gap-1.5"
        aria-hidden
      >
        <span className="h-px w-5" style={{ backgroundColor: `${goldColor}77` }} />
        <span
          className="h-[5px] w-[5px] rotate-45"
          style={{ backgroundColor: `${goldColor}CC` }}
        />
        <span className="h-px w-5" style={{ backgroundColor: `${goldColor}77` }} />
      </div>
    </motion.article>
  );
}
