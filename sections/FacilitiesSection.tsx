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

function RowDivider({ gold }: { gold: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-2" aria-hidden>
      <span
        className="h-px max-w-[min(100%,28rem)] flex-1"
        style={{ backgroundColor: `${gold}55` }}
      />
      <span
        className="h-1.5 w-1.5 shrink-0 rotate-45"
        style={{ backgroundColor: `${gold}BB` }}
      />
      <span
        className="h-px max-w-[min(100%,28rem)] flex-1"
        style={{ backgroundColor: `${gold}55` }}
      />
    </div>
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
    <div className={`grid gap-x-4 gap-y-10 sm:gap-x-6 ${columnsClass}`}>
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

/** Responsive amenity grid: 5×2 desktop, 3-3-2-2 tablet, 2-col mobile */
function AmenitiesIconGrid({
  cards,
  gold,
  heading,
  body,
}: {
  cards: FacilityItem[];
  gold: string;
  heading: string;
  body: string;
}) {
  const row1 = cards.slice(0, 5);
  const row2 = cards.slice(5, 10);

  return (
    <motion.div
      variants={luxuryStagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      className="mt-14 md:mt-16"
    >
      {/* Desktop — 5 × 2 with mid-row gold divider */}
      <div className="hidden space-y-2 xl:block">
        <AmenityRow
          items={row1}
          startIndex={0}
          gold={gold}
          heading={heading}
          body={body}
          columnsClass="grid-cols-5"
        />
        <RowDivider gold={gold} />
        <AmenityRow
          items={row2}
          startIndex={5}
          gold={gold}
          heading={heading}
          body={body}
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
          body={body}
          columnsClass="grid-cols-3"
        />
        <AmenityRow
          items={cards.slice(3, 6)}
          startIndex={3}
          gold={gold}
          heading={heading}
          body={body}
          columnsClass="grid-cols-3"
        />
        <AmenityRow
          items={cards.slice(6, 8)}
          startIndex={6}
          gold={gold}
          heading={heading}
          body={body}
          columnsClass="mx-auto max-w-md grid-cols-2"
        />
        <AmenityRow
          items={cards.slice(8, 10)}
          startIndex={8}
          gold={gold}
          heading={heading}
          body={body}
          columnsClass="mx-auto max-w-md grid-cols-2"
        />
      </div>

      {/* Mobile — 2 columns */}
      <div className="space-y-10 md:hidden">
        <AmenityRow
          items={cards}
          startIndex={0}
          gold={gold}
          heading={heading}
          body={body}
          columnsClass="grid-cols-2"
        />
      </div>

      <div className="mt-12 flex justify-center" aria-hidden>
        <span className="h-1.5 w-1.5 rotate-45" style={{ backgroundColor: `${gold}AA` }} />
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

      <div className="relative mx-auto max-w-[1200px] px-4 py-16 sm:px-6 md:py-20 lg:px-8 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14 xl:gap-16">
          {/* Left — luxury image */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.9, ease: luxuryEase }}
            className="relative"
          >
            <div
              className="relative aspect-[4/3] overflow-hidden rounded-[24px] md:rounded-[28px]"
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
                    Amenities
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
            <motion.div
              variants={luxuryFadeUp}
              className="mb-5 flex items-center gap-3"
            >
              <p
                className="font-display text-[11px] font-semibold uppercase"
                style={{ color: gold, letterSpacing: "0.32em" }}
              >
                {section.eyebrow}
              </p>
              <span
                className="h-px max-w-[5rem] flex-1"
                style={{ backgroundColor: `${gold}88` }}
              />
              <span
                className="h-1 w-1 rotate-45"
                style={{ backgroundColor: gold }}
                aria-hidden
              />
            </motion.div>

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

            <motion.div
              variants={luxuryFadeUp}
              className="space-y-4 font-body text-[15px] leading-[1.85] md:text-base"
              style={{ color: body }}
            >
              {paragraphs.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </motion.div>

            {section.ctaVisible !== false && section.ctaText ? (
              <motion.div variants={luxuryFadeUp} className="mt-8">
                <Link
                  href={section.ctaHref || "/about"}
                  prefetch
                  className="inline-flex items-center gap-2.5 rounded-full px-8 py-3.5 font-body text-[11px] font-semibold uppercase tracking-[0.18em] transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(6,44,36,0.28)]"
                  style={{
                    backgroundColor: heading,
                    color: gold,
                    boxShadow: "0 10px 28px rgba(6, 44, 36, 0.22)",
                  }}
                >
                  {section.ctaText}
                  <ArrowRight className="h-4 w-4" strokeWidth={1.6} />
                </Link>
              </motion.div>
            ) : null}
          </motion.div>
        </div>

        <AmenitiesIconGrid
          cards={cards}
          gold={gold}
          heading={heading}
          body={body}
        />
      </div>
    </section>
  );
}
