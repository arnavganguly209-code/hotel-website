"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  Flower2,
  Landmark,
  Mountain,
  Sparkles,
  TramFront,
} from "lucide-react";
import { HeritageMistBackdrop } from "@/components/home/HeritageMistBackdrop";
import { SafeImage } from "@/components/shared/SafeImage";
import type { SiteContent } from "@/lib/cms/types";
import { luxuryFadeUp, luxuryStagger } from "@/lib/animations";

interface ExploreKathmanduSectionProps {
  section: SiteContent["exploreKathmanduSection"];
}

const iconMap: Record<
  string,
  React.ComponentType<{ className?: string; strokeWidth?: number }>
> = {
  stupa: Landmark,
  pagoda: Building2,
  trident: Sparkles,
  mountain: Mountain,
  lotus: Flower2,
  palace: Building2,
  cablecar: TramFront,
  landmark: Landmark,
  flower: Flower2,
};

function resolveIcon(key: string) {
  return iconMap[key] || Landmark;
}

/**
 * Explore Kathmandu — Sightseeing & Day Trips
 * Positioned between Meetings & Events and Visual Journey.
 */
export function ExploreKathmanduSection({ section }: ExploreKathmanduSectionProps) {
  if (section.enabled === false) return null;

  const gold = section.goldColor || "#C5A059";
  const heading = section.headingColor || "#062C24";
  const body = section.bodyColor || "#5A635C";
  const topBg = section.backgroundTop || "#F9F6EF";
  const bottomBg = section.backgroundBottom || "#E8F0E9";
  const cardBg = section.cardBackgroundColor || "#FBF8F1";
  const cardBorder = section.cardBorderColor || `${gold}66`;
  const gap = section.cardsGapPx ?? 22;
  const paddingY = section.sectionPaddingY ?? 96;

  const destinations = [...(section.destinations ?? [])]
    .filter((d) => d.enabled !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <section
      id="explore-kathmandu"
      aria-label="Explore Kathmandu — Sightseeing and Day Trips"
      className="relative overflow-x-clip"
      style={{
        background: `linear-gradient(180deg, ${topBg} 0%, ${topBg} 48%, ${bottomBg} 100%)`,
      }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <HeritageMistBackdrop goldColor={gold} visible={section.showMist !== false} />
      </div>

      <div
        className="relative mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8"
        style={{ paddingTop: paddingY, paddingBottom: paddingY }}
      >
        {/* Header */}
        <motion.div
          variants={luxuryStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="mx-auto mb-12 max-w-3xl text-center md:mb-14"
        >
          <motion.p
            variants={luxuryFadeUp}
            className="mb-5 font-body text-[12px] font-semibold uppercase sm:text-[13px]"
            style={{ color: gold, letterSpacing: "0.34em" }}
          >
            {section.eyebrow}
          </motion.p>

          <motion.h2
            variants={luxuryFadeUp}
            className="font-display text-[1.85rem] font-semibold leading-[1.2] tracking-[0.02em] sm:text-3xl md:text-[2.4rem] lg:text-[2.6rem]"
          >
            <span style={{ color: heading }}>{section.titlePrimary}</span>{" "}
            <span className="italic font-medium" style={{ color: gold }}>
              {section.titleAccent}
            </span>
          </motion.h2>

          <motion.div
            variants={luxuryFadeUp}
            className="mx-auto mt-5 h-px w-16"
            style={{ backgroundColor: `${gold}99` }}
            aria-hidden
          />

          <motion.p
            variants={luxuryFadeUp}
            className="mx-auto mt-6 max-w-2xl font-body text-[15px] leading-[1.85] md:text-base"
            style={{ color: body }}
          >
            {section.description}
          </motion.p>
        </motion.div>

        {/* Destination grid — 4 / 2 / 1 */}
        <motion.div
          variants={luxuryStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          style={{ gap }}
        >
          {destinations.map((dest) => {
            const Icon = resolveIcon(dest.icon);
            const img = dest.media?.imageSrc || "";
            const href = dest.href || "/cultural-experience";

            return (
              <motion.article
                key={dest.id}
                variants={luxuryFadeUp}
                className="group flex h-full flex-col overflow-hidden rounded-[20px] transition-all duration-500 hover:-translate-y-1.5"
                style={{
                  backgroundColor: cardBg,
                  border: `1px solid ${cardBorder}`,
                  boxShadow: "0 18px 40px rgba(15, 42, 34, 0.10)",
                }}
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  {img ? (
                    <SafeImage
                      src={img}
                      alt={dest.media?.alt || dest.title}
                      fill
                      objectFit="cover"
                      className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#EFE8DA]">
                      <p className="font-display text-[10px] uppercase tracking-[0.2em]" style={{ color: gold }}>
                        Destination
                      </p>
                    </div>
                  )}

                  {/* Distance badge */}
                  {dest.distance ? (
                    <span
                      className="absolute right-3 top-3 rounded-md px-2.5 py-1 font-body text-[10px] font-medium tracking-wide text-white"
                      style={{ backgroundColor: "rgba(15, 30, 28, 0.78)" }}
                    >
                      {dest.distance}
                    </span>
                  ) : null}

                  {/* Overlapping circular icon */}
                  <div
                    className="absolute -bottom-5 left-1/2 z-10 flex h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: cardBg,
                      border: `1.5px solid ${gold}`,
                      boxShadow: "0 8px 20px rgba(15, 42, 34, 0.12)",
                    }}
                  >
                    {dest.iconSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={dest.iconSrc} alt="" className="h-5 w-5 object-contain" />
                    ) : (
                      <span style={{ color: gold }}>
                        <Icon className="h-4 w-4" strokeWidth={1.6} />
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col px-5 pb-5 pt-8 text-center">
                  <p
                    className="font-body text-[10px] font-semibold uppercase tracking-[0.2em]"
                    style={{ color: gold }}
                  >
                    {dest.category}
                  </p>
                  <h3
                    className="mt-2 font-display text-lg font-semibold leading-snug md:text-[1.15rem]"
                    style={{ color: heading }}
                  >
                    {dest.title}
                  </h3>
                  <p
                    className="mt-2.5 flex-1 font-body text-[13px] leading-[1.7]"
                    style={{ color: body }}
                  >
                    {dest.description}
                  </p>

                  <div className="mt-5 flex flex-col items-center gap-3">
                    <span className="h-px w-10" style={{ backgroundColor: `${gold}77` }} aria-hidden />
                    <Link
                      href={href}
                      prefetch
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full transition-all duration-500 group-hover:translate-x-0.5"
                      style={{
                        border: `1px solid ${gold}88`,
                        color: gold,
                      }}
                      aria-label={`Explore ${dest.title}`}
                    >
                      <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.8} />
                    </Link>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
