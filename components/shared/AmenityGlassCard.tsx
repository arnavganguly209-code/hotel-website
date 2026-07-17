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

/** Soft wave / texture accents for a few card indices — decorative only */
function CardTexture({ index, gold }: { index: number; gold: string }) {
  const variant = index % 5;
  if (variant === 0 || variant === 3) {
    return (
      <svg
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%] w-full opacity-[0.14]"
        viewBox="0 0 200 80"
        fill="none"
        aria-hidden
      >
        <path
          d="M0 50 Q40 30 80 48 T160 42 T200 50 V80 H0 Z"
          fill={gold}
        />
        <path
          d="M0 58 Q50 40 100 55 T200 52"
          stroke={gold}
          strokeWidth="0.8"
          opacity="0.5"
        />
      </svg>
    );
  }
  return (
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.35]"
      style={{
        backgroundImage: `radial-gradient(ellipse 80% 60% at 50% 100%, ${gold}18 0%, transparent 70%)`,
      }}
      aria-hidden
    />
  );
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
      className="group relative flex h-full flex-col items-center overflow-hidden rounded-[22px] px-4 py-8 text-center"
      style={{
        background: hovered
          ? "linear-gradient(165deg, #FFFCF7 0%, #FAF4E8 42%, #F3E8D4 100%)"
          : "linear-gradient(165deg, #FBF7EF 0%, #F6EFE3 48%, #EFE4D2 100%)",
        border: `1px solid ${hovered ? `${goldColor}BB` : `${goldColor}88`}`,
        boxShadow: hovered
          ? `0 22px 48px rgba(15, 42, 34, 0.14), 0 0 0 1px ${goldColor}44, 0 0 28px ${goldColor}22`
          : "0 16px 40px rgba(15, 42, 34, 0.09), 0 4px 12px rgba(197, 160, 89, 0.06)",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        transition:
          "transform 350ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 350ms ease, border-color 350ms ease, background 350ms ease",
      }}
    >
      <CardTexture index={index} gold={goldColor} />

      {/* Soft champagne sheen */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(ellipse 90% 55% at 50% 0%, rgba(255,252,245,0.9) 0%, transparent 55%)",
        }}
        aria-hidden
      />

      {/* Icon holder — embossed cream circle + gold ring */}
      <div
        className="relative z-[1] mb-5 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full transition-transform duration-[350ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
        style={{
          background:
            "radial-gradient(circle at 32% 28%, #FFFDF8 0%, #F5EBD8 55%, #E8D9BC 100%)",
          border: `1.5px solid ${goldColor}`,
          boxShadow: `
            inset 0 2px 4px rgba(255,255,255,0.85),
            inset 0 -3px 6px rgba(15,42,34,0.08),
            0 6px 16px rgba(197,160,89,0.22)
          `,
        }}
      >
        <span
          className="absolute inset-[3px] rounded-full"
          style={{
            border: `1px solid ${goldColor}55`,
            boxShadow: "inset 0 1px 2px rgba(255,255,255,0.7)",
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
            className="relative z-[1] h-[34px] w-[34px] object-contain"
            fadeIn={false}
          />
        ) : (
          <span className="relative z-[1]" style={{ color: goldColor }}>
            <DynamicIcon name={facility.icon} className="h-7 w-7" />
          </span>
        )}
      </div>

      <h3
        className="relative z-[1] font-display text-[13px] font-semibold uppercase tracking-[0.12em] md:text-sm"
        style={{ color: headingColor }}
      >
        {facility.name}
      </h3>
      <p
        className="relative z-[1] mt-2.5 max-w-[16rem] text-[12px] leading-[1.7] md:text-[13px]"
        style={{ color: bodyColor }}
      >
        {facility.description}
      </p>

      {/* Tiny gold ornament */}
      <div
        className="relative z-[1] mt-5 flex items-center justify-center gap-1.5"
        aria-hidden
      >
        <span className="h-px w-4" style={{ backgroundColor: `${goldColor}66` }} />
        <span
          className="h-1 w-1 rotate-45"
          style={{ backgroundColor: `${goldColor}CC` }}
        />
        <span className="h-px w-4" style={{ backgroundColor: `${goldColor}66` }} />
      </div>
    </motion.article>
  );
}
