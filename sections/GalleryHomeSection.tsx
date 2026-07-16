"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { HeritageMistBackdrop } from "@/components/home/HeritageMistBackdrop";
import { SafeImage } from "@/components/shared/SafeImage";
import type { SiteContent } from "@/lib/cms/types";
import { luxuryEase, luxuryFadeUp, luxuryStagger } from "@/lib/animations";

interface GalleryHomeSectionProps {
  gallery: SiteContent["gallery"];
  section: SiteContent["gallerySection"];
}

/**
 * Homepage Gallery — VISUAL JOURNEY / MOMENTS OF ELEGANCE
 * Positioned immediately below Meetings & Events.
 * Matches the approved luxury reference (header hierarchy + premium grid).
 */
export function GalleryHomeSection({ gallery, section }: GalleryHomeSectionProps) {
  if (section.enabled === false) return null;

  const gold = section.goldColor || "#C5A059";
  const heading = section.headingColor || "#062C24";
  const body = section.bodyColor || "#5A635C";
  const topBg = section.backgroundTop || "#F9F6EF";
  const bottomBg = section.backgroundBottom || "#E8F0E9";
  const border = section.borderColor || `${gold}88`;
  const radius = section.cardRadiusPx ?? 18;
  const gap = section.gridGapPx ?? 22;
  const limit = section.homeImageLimit ?? 6;
  const overlay = section.overlayOpacity ?? 0.58;

  const items = gallery
    .filter((item) => item.active !== false && Boolean(item.src) && item.showOnHome !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .slice(0, limit);

  return (
    <section
      id="gallery"
      aria-label="Visual Journey — Moments of Elegance"
      className="relative overflow-x-clip"
      style={{
        background: `linear-gradient(180deg, ${topBg} 0%, ${topBg} 48%, ${bottomBg} 100%)`,
      }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <HeritageMistBackdrop goldColor={gold} visible={section.showMist !== false} />
      </div>

      <div className="relative mx-auto max-w-[1200px] px-4 py-16 sm:px-6 md:py-20 lg:px-8 lg:py-24">
        {/* Header — Label → Heading → Divider → Description (matches reference) */}
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
            className="font-display text-[1.95rem] font-semibold uppercase leading-[1.18] tracking-[0.03em] sm:text-3xl md:text-[2.35rem] lg:text-[2.5rem]"
            style={{ color: heading }}
          >
            {section.title}
          </motion.h2>

          <motion.div
            variants={luxuryFadeUp}
            className="mx-auto mt-5 flex items-center justify-center gap-3"
            aria-hidden
          >
            <span className="h-px w-12" style={{ backgroundColor: `${gold}77` }} />
            <span className="h-1.5 w-1.5 rotate-45" style={{ backgroundColor: gold }} />
            <span className="h-px w-12" style={{ backgroundColor: `${gold}77` }} />
          </motion.div>

          <motion.p
            variants={luxuryFadeUp}
            className="mx-auto mt-6 max-w-xl font-body text-[15px] leading-[1.85] md:text-base"
            style={{ color: body }}
          >
            {section.description}
          </motion.p>
        </motion.div>

        {/* Premium 3-column gallery grid */}
        <motion.div
          variants={luxuryStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          style={{ gap }}
        >
          {items.map((item) => (
            <motion.article
              key={item.id}
              variants={luxuryFadeUp}
              className="group relative overflow-hidden"
              style={{
                borderRadius: radius,
                border: `1px solid ${border}`,
                boxShadow: "0 24px 52px rgba(15, 42, 34, 0.14)",
              }}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                {item.type === "video" ? (
                  <video
                    src={item.src}
                    muted
                    loop
                    playsInline
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                ) : (
                  <SafeImage
                    src={item.src}
                    alt={item.alt || item.title}
                    fill
                    objectFit="cover"
                    className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                )}

                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"
                  style={{ opacity: overlay }}
                />

                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                  {item.category ? (
                    <p
                      className="mb-1.5 font-body text-[10px] font-semibold uppercase tracking-[0.28em]"
                      style={{ color: gold }}
                    >
                      {item.category}
                    </p>
                  ) : null}
                  <h3 className="font-display text-lg font-semibold uppercase tracking-[0.04em] text-white sm:text-xl">
                    {item.title}
                  </h3>
                  {item.description ? (
                    <p className="mt-1.5 font-body text-[13px] leading-snug text-white/85 sm:text-sm">
                      {item.description}
                    </p>
                  ) : null}
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>

        {/* VIEW FULL GALLERY — emerald pill, gold text (matches luxury CTA language) */}
        {section.ctaVisible !== false && section.ctaText ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: luxuryEase }}
            className="mt-12 flex justify-center md:mt-14"
          >
            <Link
              href={section.ctaHref || "/gallery"}
              prefetch
              className="group inline-flex items-center gap-2.5 rounded-full px-9 py-3.5 font-body text-[11px] font-semibold uppercase tracking-[0.18em] transition-all duration-500 hover:-translate-y-0.5"
              style={{
                backgroundColor: heading,
                color: gold,
                boxShadow: "0 12px 32px rgba(6, 44, 36, 0.22)",
              }}
            >
              {section.ctaText}
              <ArrowRight
                className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1"
                strokeWidth={1.6}
              />
            </Link>
          </motion.div>
        ) : null}
      </div>
    </section>
  );
}
