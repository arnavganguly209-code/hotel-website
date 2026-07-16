"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { HeritageMistBackdrop } from "@/components/home/HeritageMistBackdrop";
import { SafeImage } from "@/components/shared/SafeImage";
import { luxuryEase, luxuryFadeUp, luxuryStagger } from "@/lib/animations";
import type { SiteContent } from "@/lib/cms/types";

interface FineDiningSectionProps {
  section: SiteContent["fineDiningSection"];
}

/**
 * Fine Dining — Garden View & Korean Restaurant homepage section.
 * Positioned immediately below World-Class Amenities.
 */
export function FineDiningSection({ section }: FineDiningSectionProps) {
  const gold = section.goldColor || "#C5A059";
  const heading = section.headingColor || "#062C24";
  const body = section.bodyColor || "#5A635C";
  const topBg = section.backgroundTop || "#F9F6EF";
  const bottomBg = section.backgroundBottom || "#E8F0E9";

  const imageSrc = section.media?.imageSrc || "";
  const imageAlt = section.media?.alt || section.title;

  return (
    <section
      id="garden-restaurant"
      aria-label="Fine dining"
      className="relative overflow-x-clip"
      style={{
        background: `linear-gradient(180deg, ${topBg} 0%, ${topBg} 48%, ${bottomBg} 100%)`,
      }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <HeritageMistBackdrop goldColor={gold} visible={section.showMist !== false} />
      </div>

      <div className="relative mx-auto max-w-[1200px] px-4 py-16 sm:px-6 md:py-20 lg:px-8 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14 xl:gap-16">
          {/* Left — premium dining image */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.9, ease: luxuryEase }}
            className="relative"
          >
            <div
              className="relative aspect-[4/3] overflow-hidden rounded-[22px] md:rounded-[24px]"
              style={{
                border: `1px solid ${gold}88`,
                boxShadow: "0 28px 60px rgba(15, 42, 34, 0.16)",
              }}
            >
              {imageSrc ? (
                <SafeImage
                  src={imageSrc}
                  alt={imageAlt}
                  fill
                  objectFit="cover"
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 560px"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#EFE8DA]">
                  <p
                    className="font-display text-xs uppercase tracking-[0.28em]"
                    style={{ color: `${gold}99` }}
                  >
                    Fine Dining
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Right — copy */}
          <motion.div
            variants={luxuryStagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="flex min-w-0 flex-col"
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
              className="font-display text-[1.85rem] font-semibold uppercase leading-[1.2] tracking-[0.03em] sm:text-3xl md:text-[2.35rem] lg:text-[2.5rem]"
              style={{ color: heading }}
            >
              {section.title}
            </motion.h2>

            <motion.div
              variants={luxuryFadeUp}
              className="my-5 flex items-center gap-3"
              aria-hidden
            >
              <span className="h-px w-10" style={{ backgroundColor: `${gold}77` }} />
              <span className="h-1.5 w-1.5 rotate-45" style={{ backgroundColor: gold }} />
              <span className="h-px w-10" style={{ backgroundColor: `${gold}77` }} />
            </motion.div>

            <motion.p
              variants={luxuryFadeUp}
              className="max-w-xl font-body text-[15px] leading-[1.85] md:text-base"
              style={{ color: body }}
            >
              {section.description}
            </motion.p>

            {section.ctaVisible !== false && section.ctaText ? (
              <motion.div variants={luxuryFadeUp} className="mt-8">
                <Link
                  href={section.ctaHref || "/dining"}
                  prefetch
                  className="inline-flex items-center gap-2.5 rounded-full px-8 py-3.5 font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition-all duration-500 hover:-translate-y-0.5"
                  style={{
                    backgroundColor: gold,
                    boxShadow: "0 10px 28px rgba(197, 160, 89, 0.38)",
                  }}
                >
                  {section.ctaText}
                  <ArrowRight className="h-4 w-4" strokeWidth={1.6} />
                </Link>
              </motion.div>
            ) : null}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
