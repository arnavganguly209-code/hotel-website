"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { AmenityGlassCard } from "@/components/shared/AmenityGlassCard";
import { LuxuryMediaFrame } from "@/components/shared/LuxuryMediaFrame";
import { MotionSection } from "@/components/shared/MotionSection";
import { luxuryStagger, fadeUp } from "@/lib/animations";
import { routes } from "@/lib/navigation";
import type { SiteContent } from "@/lib/cms/types";

interface FacilitiesSectionProps {
  facilities: SiteContent["facilities"];
  section: SiteContent["facilitiesSection"];
}

export function FacilitiesSection({ facilities, section }: FacilitiesSectionProps) {
  const paragraphs = [section.description, section.caption].filter(Boolean);
  const copy = paragraphs
    .join("\n\n")
    .split(/\n\n+/)
    .filter(Boolean)
    .slice(0, 4);

  return (
    <MotionSection
      id="facilities"
      className="section-padding relative overflow-hidden bg-gradient-to-b from-luxury-cream via-luxury-white to-luxury-sage/40"
    >
      <div className="section-glow pointer-events-none absolute inset-x-0 top-0" />
      <div className="pointer-events-none absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-luxury-gold/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <div className="grid items-stretch gap-14 lg:grid-cols-2 lg:gap-20">
          <motion.div variants={fadeUp} className="min-h-[400px] lg:min-h-[520px]">
            <LuxuryMediaFrame
              media={section.media}
              label={section.media.caption || "Premium Amenities"}
              className="h-full"
              aspectClass="h-full min-h-[400px] lg:min-h-[520px]"
              roundedClass="rounded-[28px]"
            />
          </motion.div>

          <motion.div
            variants={luxuryStagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="flex flex-col justify-center lg:min-h-[520px]"
          >
            <motion.p
              variants={fadeUp}
              className="mb-4 text-[11px] font-semibold uppercase tracking-[0.32em] text-luxury-gold-label"
            >
              {section.eyebrow}
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="font-display text-3xl font-medium leading-[1.12] text-luxury-forest md:text-4xl lg:text-[2.75rem]"
            >
              {section.title}
            </motion.h2>
            <motion.div
              variants={fadeUp}
              className="my-6 h-px w-20 bg-gradient-to-r from-luxury-gold via-luxury-gold/40 to-transparent"
            />
            <motion.div variants={fadeUp} className="space-y-5 text-[15px] leading-[1.85] text-luxury-muted md:text-base">
              {copy.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </motion.div>
            <motion.div variants={fadeUp}>
              <Link
                href={routes.about}
                prefetch
                className="group mt-10 inline-flex items-center gap-2.5 rounded-full border border-luxury-gold/30 bg-luxury-gold px-7 py-3.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white shadow-luxury-gold transition-all duration-500 hover:-translate-y-0.5 hover:shadow-lg"
              >
                Explore Our Facilities
                <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </motion.div>
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
