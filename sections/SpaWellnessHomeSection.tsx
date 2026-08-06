"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  Droplets,
  Footprints,
  Flower2,
  Flame,
  Leaf,
  HeartHandshake,
  Waves,
} from "lucide-react";
import { HeritageMistBackdrop } from "@/components/home/HeritageMistBackdrop";
import { SafeImage } from "@/components/shared/SafeImage";
import type { SiteContent } from "@/lib/cms/types";
import { luxuryEase, luxuryFadeUp, luxuryStagger } from "@/lib/animations";

interface SpaWellnessHomeSectionProps {
  section: SiteContent["spaWellnessSection"];
}

const iconMap: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  leaf: Leaf,
  flame: Flame,
  flower: Flower2,
  brain: Brain,
  waves: Waves,
  droplets: Droplets,
  footprints: Footprints,
  couple: HeartHandshake,
};

function resolveTreatmentIcon(iconKey: string) {
  return iconMap[iconKey] || Leaf;
}

/**
 * Spa & Wellness — left copy + right image in one shared frame.
 * Tops and bottoms flush (button aligns with image bottom).
 */
export function SpaWellnessHomeSection({ section }: SpaWellnessHomeSectionProps) {
  const gold = section.goldColor || "#C5A059";
  const heading = section.headingColor || "#062C24";
  const body = section.bodyColor || "#5A635C";
  const topBg = section.backgroundTop || "#F9F6EF";
  const bottomBg = section.backgroundBottom || "#E8F0E9";

  // Reference uses a compact 2×2 feature grid so height matches the image
  const treatments = [...(section.treatments ?? [])]
    .filter((t) => t.enabled !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .slice(0, 4);

  const imageSrc = section.media?.imageSrc || "";
  const imageAlt = section.media?.alt || section.title;
  const roomsCard = section.treatmentRoomsCard;

  return (
    <section
      id="spa"
      aria-label="Spa & Wellness"
      className="relative overflow-x-clip"
      style={{
        background: `linear-gradient(180deg, ${topBg} 0%, ${topBg} 48%, ${bottomBg} 100%)`,
      }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <HeritageMistBackdrop goldColor={gold} visible={section.showMist !== false} />
      </div>

      <div className="relative mx-auto max-w-[1200px] px-4 py-8 sm:px-6 md:py-10 lg:px-8 lg:py-12">
        {/* Shared frame: left copy + right image, tops/bottoms flush */}
        <div
          className="rounded-[22px] p-4 sm:rounded-[26px] sm:p-5 md:p-6 lg:p-7"
          style={{
            backgroundColor: "#FBF8F1",
            border: `1px solid ${gold}55`,
            boxShadow: "0 18px 44px rgba(15, 42, 34, 0.08)",
          }}
        >
          <div className="grid items-start gap-6 lg:grid-cols-2 lg:items-stretch lg:gap-8 xl:gap-10">
            {/* LEFT — defines height; CTA pinned to bottom */}
            <motion.div
              variants={luxuryStagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              className="flex min-w-0 flex-col"
            >
              <motion.p
                variants={luxuryFadeUp}
                className="mb-3 font-body text-[10px] font-semibold uppercase sm:text-[11px]"
                style={{ color: gold, letterSpacing: "0.32em" }}
              >
                {section.eyebrow}
              </motion.p>

              <motion.h2
                variants={luxuryFadeUp}
                className="font-display text-[1.65rem] font-semibold uppercase leading-[1.15] tracking-[0.03em] sm:text-[1.9rem] md:text-[2.15rem] lg:text-[2.25rem]"
                style={{ color: heading }}
              >
                {section.title}
              </motion.h2>

              <motion.div
                variants={luxuryFadeUp}
                className="mt-3.5 flex items-center gap-3"
                aria-hidden
              >
                <span className="h-px w-10" style={{ backgroundColor: `${gold}77` }} />
                <span className="h-1.5 w-1.5 rotate-45" style={{ backgroundColor: gold }} />
                <span className="h-px w-10" style={{ backgroundColor: `${gold}77` }} />
              </motion.div>

              <motion.p
                variants={luxuryFadeUp}
                className="mt-4 max-w-xl font-body text-[14px] leading-[1.7] md:text-[15px]"
                style={{ color: body }}
              >
                {section.description}
              </motion.p>

              <motion.div
                variants={luxuryStagger}
                className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3.5"
              >
                {treatments.map((t) => {
                  const Icon = resolveTreatmentIcon(t.icon);
                  return (
                    <motion.article
                      key={t.id}
                      variants={luxuryFadeUp}
                      className="flex min-w-0 flex-col rounded-[14px] border border-[#C5A059]/20 bg-white/70 px-3.5 py-3.5 shadow-[0_8px_20px_rgba(15,42,34,0.05)]"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                          style={{
                            background:
                              "radial-gradient(circle at 35% 30%, #F7EFD8 0%, #E8D5A3 45%, rgba(197,160,89,0.22) 100%)",
                            border: `1px solid ${gold}66`,
                            color: gold,
                            boxShadow: "0 6px 16px rgba(197,160,89,0.16)",
                          }}
                        >
                          <Icon className="h-4 w-4" strokeWidth={1.4} />
                        </div>
                        <div className="min-w-0">
                          <p
                            className="font-display text-[12px] font-semibold uppercase leading-snug tracking-[0.08em]"
                            style={{ color: heading }}
                          >
                            {t.title}
                          </p>
                          <p
                            className="mt-1.5 line-clamp-2 text-[11px] leading-[1.5] sm:text-[12px]"
                            style={{ color: body }}
                          >
                            {t.description}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-center gap-1.5" aria-hidden>
                        <span className="h-px w-4" style={{ backgroundColor: `${gold}66` }} />
                        <span
                          className="h-1 w-1 rotate-45"
                          style={{ backgroundColor: gold }}
                        />
                        <span className="h-px w-4" style={{ backgroundColor: `${gold}66` }} />
                      </div>
                    </motion.article>
                  );
                })}
              </motion.div>

              {section.ctaVisible !== false && section.ctaText ? (
                <motion.div
                  variants={luxuryFadeUp}
                  className="mt-5 flex lg:mt-auto lg:pt-5"
                >
                  <Link
                    href={section.ctaHref || "https://hotelthamelparkspa.com/"}
                    prefetch
                    className="inline-flex min-h-11 items-center gap-2.5 rounded-xl px-7 py-3 font-body text-[11px] font-semibold uppercase tracking-[0.16em] transition-all duration-500 hover:-translate-y-0.5"
                    style={{
                      backgroundColor: heading,
                      color: gold,
                      border: `1px solid ${gold}66`,
                      boxShadow: "0 10px 26px rgba(6,44,36,0.22)",
                    }}
                  >
                    {section.ctaText}
                    <ArrowRight className="h-4 w-4" strokeWidth={1.6} />
                  </Link>
                </motion.div>
              ) : null}
            </motion.div>

            {/* RIGHT — stretches to left column height */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, ease: luxuryEase }}
              className="relative h-auto min-h-[260px] w-full lg:h-full lg:min-h-[420px]"
            >
              <div
                className="relative aspect-[4/3] overflow-hidden rounded-[18px] sm:rounded-[20px] lg:absolute lg:inset-0 lg:aspect-auto lg:h-full"
                style={{
                  border: `1px solid ${gold}88`,
                  boxShadow: "0 18px 40px rgba(15, 42, 34, 0.12)",
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
                      Spa
                    </p>
                  </div>
                )}

                {roomsCard?.enabled !== false ? (
                  <div
                    className="absolute bottom-3 left-3 z-10 sm:bottom-4 sm:left-4"
                    style={{
                      width: Math.min(roomsCard.widthPx || 168, 180),
                      backgroundColor: roomsCard.backgroundColor || "#FFFFFF",
                      color: roomsCard.textColor || heading,
                      border: `1px solid ${roomsCard.borderColor || `${gold}55`}`,
                      boxShadow: roomsCard.shadow || "0 12px 28px rgba(15,42,34,0.14)",
                      borderRadius: 16,
                    }}
                  >
                    <div className="grid grid-cols-[10px_1fr] overflow-hidden rounded-[16px]">
                      <div style={{ backgroundColor: roomsCard.accentColor || heading }} />
                      <div className="px-4 py-3.5">
                        <p
                          className="font-display text-[1.65rem] font-semibold leading-none"
                          style={{ color: heading }}
                        >
                          {roomsCard.number}
                        </p>
                        <p
                          className="mt-1.5 font-body text-[10px] font-semibold uppercase tracking-[0.18em]"
                          style={{ color: roomsCard.textColor || body }}
                        >
                          {roomsCard.label}
                        </p>
                        <div className="mt-2 flex justify-center" aria-hidden>
                          <span
                            className="h-1 w-1 rotate-45"
                            style={{ backgroundColor: gold }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
