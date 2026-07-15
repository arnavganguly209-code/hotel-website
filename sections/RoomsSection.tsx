"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { HeritageMistBackdrop } from "@/components/home/HeritageMistBackdrop";
import { RoomCard } from "@/components/shared/RoomCard";
import { luxuryEase, luxuryFadeUp, luxuryStagger } from "@/lib/animations";
import type { SiteContent } from "@/lib/cms/types";
import { defaultContent } from "@/lib/cms/default-content";

interface RoomsSectionProps {
  rooms: SiteContent["rooms"];
  section?: SiteContent["roomsSection"];
}

/**
 * Accommodations / The Rooms — homepage section below Cultural Experience.
 * Atmosphere continues the cream → soft emerald mist of the section above.
 */
export function RoomsSection({
  rooms,
  section = defaultContent.roomsSection,
}: RoomsSectionProps) {
  const gold = section.goldColor || "#C5A059";
  const heading = section.headingColor || "#062C24";
  const topBg = section.backgroundTop || "#F9F6EF";
  const bottomBg = section.backgroundBottom || "#E8F0E9";

  const visibleRooms = [...rooms]
    .filter((r) => r.visible !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <section
      id="rooms"
      aria-label="Accommodations"
      className="relative overflow-x-clip"
      style={{
        background: `linear-gradient(180deg, ${topBg} 0%, ${topBg} 52%, ${bottomBg} 100%)`,
      }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <HeritageMistBackdrop
          goldColor={gold}
          visible={section.showMist !== false}
        />
      </div>

      <div className="relative mx-auto max-w-[1200px] px-4 py-16 sm:px-6 md:py-20 lg:px-8 lg:py-24">
        <div className="mb-12 flex flex-col items-start justify-between gap-6 md:mb-14 md:flex-row md:items-end">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.85, ease: luxuryEase }}
          >
            <p
              className="mb-3 font-display text-[11px] font-semibold uppercase"
              style={{ color: gold, letterSpacing: "0.32em" }}
            >
              {section.eyebrow}
            </p>
            <h2
              className="font-display text-3xl font-semibold uppercase tracking-[0.04em] md:text-4xl lg:text-[2.75rem]"
              style={{ color: heading }}
            >
              {section.title}
            </h2>
            <div className="mt-5 flex items-center gap-3" aria-hidden>
              <span className="h-px w-10" style={{ backgroundColor: `${gold}88` }} />
              <span className="h-1.5 w-1.5 rotate-45" style={{ backgroundColor: gold }} />
              <span className="h-px w-10" style={{ backgroundColor: `${gold}88` }} />
            </div>
          </motion.div>

          {section.ctaVisible !== false && section.ctaText ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.08, ease: luxuryEase }}
            >
              <Link
                href={section.ctaHref || "/rooms"}
                prefetch
                className="inline-flex items-center gap-2 rounded-xl px-6 py-3 font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(197,160,89,0.35)]"
                style={{
                  backgroundColor: gold,
                  boxShadow: `0 10px 28px ${gold}44`,
                }}
              >
                {section.ctaText}
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
              </Link>
            </motion.div>
          ) : null}
        </div>

        <motion.div
          variants={luxuryStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-7 xl:grid-cols-4 xl:gap-6"
        >
          {visibleRooms.map((room) => (
            <motion.div key={room.id} variants={luxuryFadeUp} className="h-full">
              <RoomCard room={room} goldColor={gold} headingColor={heading} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
