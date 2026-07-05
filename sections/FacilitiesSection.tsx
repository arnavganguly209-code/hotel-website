"use client";

import { motion } from "framer-motion";
import { AmenityGlassCard } from "@/components/shared/AmenityGlassCard";
import { LuxuryMediaFrame } from "@/components/shared/LuxuryMediaFrame";
import { MotionSection } from "@/components/shared/MotionSection";
import { luxuryStagger, fadeUp } from "@/lib/animations";
import type { SiteContent } from "@/lib/cms/types";

interface FacilitiesSectionProps {
  facilities: SiteContent["facilities"];
  section: SiteContent["facilitiesSection"];
}

export function FacilitiesSection({ facilities, section }: FacilitiesSectionProps) {
  return (
    <MotionSection
      id="facilities"
      className="section-padding relative overflow-hidden bg-gradient-to-b from-luxury-cream via-luxury-white to-luxury-sage/40"
    >
      <div className="section-glow pointer-events-none absolute inset-x-0 top-0" />
      <div className="pointer-events-none absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-luxury-gold/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <div className="grid items-start gap-14 lg:grid-cols-2 lg:gap-20">
          <motion.div variants={fadeUp}>
            <LuxuryMediaFrame
              media={section.media}
              label={section.media.caption || "Premium Amenities"}
            />
            {section.caption ? (
              <p className="mt-6 font-accent text-lg italic leading-relaxed text-luxury-muted">
                {section.caption}
              </p>
            ) : null}
          </motion.div>

          <div>
            <motion.p
              variants={fadeUp}
              className="mb-4 text-[11px] font-semibold uppercase tracking-[0.3em] text-luxury-gold-label"
            >
              {section.eyebrow}
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="font-display text-3xl font-normal leading-tight text-luxury-forest md:text-4xl lg:text-[2.65rem]"
            >
              {section.title}
            </motion.h2>
            {section.description ? (
              <motion.p variants={fadeUp} className="mt-5 max-w-xl text-base leading-relaxed text-luxury-muted">
                {section.description}
              </motion.p>
            ) : null}
          </div>
        </div>

        <motion.div
          variants={luxuryStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 xl:grid-cols-5"
        >
          {facilities.map((facility, index) => (
            <AmenityGlassCard key={facility.id} facility={facility} index={index} />
          ))}
        </motion.div>
      </div>
    </MotionSection>
  );
}
