"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { AmenitiesMountainBackdrop } from "@/components/home/AmenitiesMountainBackdrop";
import { AmenityGlassCard } from "@/components/shared/AmenityGlassCard";
import { SafeImage } from "@/components/shared/SafeImage";
import { luxuryEase, luxuryFadeUp, luxuryStagger } from "@/lib/animations";
import type { SiteContent } from "@/lib/cms/types";

interface FacilitiesSectionProps {
  facilities: SiteContent["facilities"];
  section: SiteContent["facilitiesSection"];
}

type FacilityItem = SiteContent["facilities"][number];

function LotusMark({ gold }: { gold: string }) {
  return (
    <svg
      width="28"
      height="22"
      viewBox="0 0 28 22"
      fill="none"
      aria-hidden
      className="mx-auto"
    >
      <path
        d="M14 20c-2.2-3.2-5.8-5.2-9.5-5.8 2.4-1.2 4.6-3.2 5.8-5.8C11.5 5.2 12.6 2.4 14 0c1.4 2.4 2.5 5.2 3.7 8.4 1.2 2.6 3.4 4.6 5.8 5.8C19.8 14.8 16.2 16.8 14 20Z"
        fill={gold}
        fillOpacity="0.92"
      />
      <path
        d="M14 20c1.5-2.8 1.8-5.6 1.2-8.2C14.8 9.2 14.3 6.8 14 4.5c-.3 2.3-.8 4.7-1.2 7.3C12.2 14.4 12.5 17.2 14 20Z"
        fill={gold}
        fillOpacity="0.55"
      />
    </svg>
  );
}

function AmenityRow({
  items,
  startIndex,
  gold,
  heading,
  body,
  columnsClass,
}: {
  items: FacilityItem[];
  startIndex: number;
  gold: string;
  heading: string;
  body: string;
  columnsClass: string;
}) {
  return (
    <div className={`grid gap-x-3 gap-y-10 sm:gap-x-4 sm:gap-y-12 ${columnsClass}`}>
      {items.map((facility, i) => (
        <AmenityGlassCard
          key={facility.id}
          facility={facility}
          index={startIndex + i}
          goldColor={gold}
          headingColor={heading}
          bodyColor={body}
        />
      ))}
    </div>
  );
}

/** Exceptional Services grid — cream cards, gold-rim green badges (reference match) */
function AmenitiesIconGrid({
  cards,
  gold,
  heading,
}: {
  cards: FacilityItem[];
  gold: string;
  heading: string;
}) {
  const row1 = cards.slice(0, 5);
  const row2 = cards.slice(5, 10);
  const descColor = "#6B5E4E";

  return (
    <motion.div
      variants={luxuryStagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      className="mt-14 md:mt-16"
    >
      {/* Section label — Exceptional Services */}
      <div className="mb-10 text-center sm:mb-12">
        <LotusMark gold={gold} />
        <h3
          className="mt-3 font-display text-[1.35rem] font-semibold uppercase tracking-[0.18em] sm:text-[1.55rem] md:text-[1.75rem]"
          style={{ color: heading }}
        >
          Exceptional Services
        </h3>
        <p
          className="mt-2 font-accent text-[14px] italic sm:text-[15px] md:text-[16px]"
          style={{ color: gold }}
        >
          Crafted for Comfort. Designed for You.
        </p>
        <div className="mx-auto mt-4 flex max-w-xs items-center justify-center gap-3" aria-hidden>
          <span className="h-px flex-1" style={{ backgroundColor: `${gold}77` }} />
          <span className="h-1.5 w-1.5 rotate-45" style={{ backgroundColor: gold }} />
          <span className="h-px flex-1" style={{ backgroundColor: `${gold}77` }} />
        </div>
      </div>

      {/* Desktop — 5 × 2 */}
      <div className="hidden space-y-10 xl:block">
        <AmenityRow
          items={row1}
          startIndex={0}
          gold={gold}
          heading={heading}
          body={descColor}
          columnsClass="grid-cols-5"
        />
        <AmenityRow
          items={row2}
          startIndex={5}
          gold={gold}
          heading={heading}
          body={descColor}
          columnsClass="grid-cols-5"
        />
      </div>

      {/* Tablet — 3 → 3 → 2 → 2 */}
      <div className="hidden space-y-10 md:block xl:hidden">
        <AmenityRow
          items={cards.slice(0, 3)}
          startIndex={0}
          gold={gold}
          heading={heading}
          body={descColor}
          columnsClass="grid-cols-3"
        />
        <AmenityRow
          items={cards.slice(3, 6)}
          startIndex={3}
          gold={gold}
          heading={heading}
          body={descColor}
          columnsClass="grid-cols-3"
        />
        <AmenityRow
          items={cards.slice(6, 8)}
          startIndex={6}
          gold={gold}
          heading={heading}
          body={descColor}
          columnsClass="mx-auto max-w-md grid-cols-2"
        />
        <AmenityRow
          items={cards.slice(8, 10)}
          startIndex={8}
          gold={gold}
          heading={heading}
          body={descColor}
          columnsClass="mx-auto max-w-md grid-cols-2"
        />
      </div>

      {/* Mobile — 2 columns */}
      <div className="md:hidden">
        <AmenityRow
          items={cards}
          startIndex={0}
          gold={gold}
          heading={heading}
          body={descColor}
          columnsClass="grid-cols-2"
        />
      </div>
    </motion.div>
  );
}

/**
 * World-Class Amenities — homepage section immediately below The Rooms.
 * Cream → soft emerald mist atmosphere continues from Accommodations.
 */
export function FacilitiesSection({ facilities, section }: FacilitiesSectionProps) {
  const gold = section.goldColor || "#C5A059";
  const heading = section.headingColor || "#062C24";
  const body = section.bodyColor || "#5A635C";
  const topBg = section.backgroundTop || "#F9F6EF";
  const bottomBg = section.backgroundBottom || "#E8F0E9";

  const paragraphs = [section.description, section.caption]
    .filter(Boolean)
    .join("\n\n")
    .split(/\n\n+/)
    .filter(Boolean)
    .slice(0, 3);

  const imageSrc = section.media?.imageSrc || "";
  const imageAlt = section.media?.alt || section.title;

  const cards = [...facilities]
    .filter((f) => f.enabled !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .slice(0, 10);

  return (
    <section
      id="facilities"
      aria-label="World-class amenities"
      className="relative overflow-x-clip"
      style={{
        background: `linear-gradient(180deg, ${topBg} 0%, ${topBg} 48%, ${bottomBg} 100%)`,
      }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <AmenitiesMountainBackdrop goldColor={gold} visible={section.showMist !== false} />
      </div>

      <div className="relative mx-auto max-w-[1200px] px-4 py-8 sm:px-6 md:py-10 lg:px-8 lg:py-12">
        {/* Shared frame: image top/bottom flush with copy + CTA */}
        <div
          className="rounded-[22px] p-4 sm:rounded-[26px] sm:p-5 md:p-6 lg:p-7"
          style={{
            backgroundColor: "#FBF8F1",
            border: `1px solid ${gold}55`,
            boxShadow: "0 18px 44px rgba(15, 42, 34, 0.08)",
          }}
        >
          <div className="grid items-start gap-6 lg:grid-cols-2 lg:items-stretch lg:gap-8 xl:gap-10">
            {/* Left — stretches to right column height */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, ease: luxuryEase }}
              className="relative h-auto min-h-[240px] w-full lg:h-full lg:min-h-[420px]"
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
                      Amenities
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Right — defines frame height; CTA sits at bottom edge */}
            <motion.div
              variants={luxuryStagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              className="flex min-w-0 flex-col"
            >
              <motion.div
                variants={luxuryFadeUp}
                className="mb-4 flex items-center justify-center gap-3 lg:justify-start"
              >
                <span className="h-px w-8" style={{ backgroundColor: `${gold}88` }} aria-hidden />
                <p
                  className="font-display text-[10px] font-semibold uppercase sm:text-[11px]"
                  style={{ color: gold, letterSpacing: "0.28em" }}
                >
                  {section.eyebrow}
                </p>
                <span className="h-1 w-1 rotate-45" style={{ backgroundColor: gold }} aria-hidden />
                <span className="h-px w-8" style={{ backgroundColor: `${gold}88` }} aria-hidden />
              </motion.div>

              <motion.h2
                variants={luxuryFadeUp}
                className="text-center font-display text-[1.65rem] font-semibold uppercase leading-[1.2] tracking-[0.03em] sm:text-[1.9rem] md:text-[2.15rem] lg:text-left lg:text-[2.25rem]"
                style={{ color: heading }}
              >
                {section.title}
              </motion.h2>

              <motion.div
                variants={luxuryFadeUp}
                className="my-4 flex items-center justify-center gap-3 lg:justify-start"
                aria-hidden
              >
                <span className="h-px w-10" style={{ backgroundColor: `${gold}77` }} />
                <span className="h-1.5 w-1.5 rotate-45" style={{ backgroundColor: gold }} />
                <span className="h-px w-10" style={{ backgroundColor: `${gold}77` }} />
              </motion.div>

              <motion.div
                variants={luxuryFadeUp}
                className="space-y-3.5 font-body text-[14px] leading-[1.75] md:text-[15px]"
                style={{ color: body }}
              >
                {paragraphs.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </motion.div>

              {section.ctaVisible !== false && section.ctaText ? (
                <motion.div variants={luxuryFadeUp} className="mt-6 flex justify-center lg:mt-auto lg:justify-start lg:pt-6">
                  <Link
                    href={section.ctaHref || "/about"}
                    prefetch
                    className="inline-flex min-h-11 items-center gap-2.5 rounded-xl px-7 py-3 font-body text-[11px] font-semibold uppercase tracking-[0.16em] transition-all duration-500 hover:-translate-y-0.5"
                    style={{
                      backgroundColor: heading,
                      color: gold,
                      border: `1px solid ${gold}66`,
                      boxShadow: "0 10px 26px rgba(6, 44, 36, 0.22)",
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

        <AmenitiesIconGrid
          cards={cards}
          gold={gold}
          heading={heading}
        />
      </div>
    </section>
  );
}
