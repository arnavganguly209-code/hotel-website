"use client";

import { motion } from "framer-motion";
import { DynamicIcon } from "@/components/shared/DynamicIcon";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { MotionSection } from "@/components/shared/MotionSection";
import { staggerContainer, fadeUp } from "@/lib/animations";
import type { SiteContent } from "@/lib/cms/types";

interface LocationAdvantagesProps {
  locations: SiteContent["locationAdvantages"];
}

export function LocationAdvantages({ locations }: LocationAdvantagesProps) {
  return (
    <MotionSection
      id="location"
      className="section-padding relative overflow-hidden bg-luxury-cream"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(201,169,98,0.06)_0%,transparent_60%)]" />

      <div className="relative mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Prime Location"
          title="In the Heart of Kathmandu"
          description="Discover the finest attractions and cultural landmarks, all within easy reach of Hotel Thamel Park."
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {locations.map((loc) => (
            <motion.div
              key={loc.id}
              variants={fadeUp}
              className="group border border-luxury-gold/10 bg-white p-8 shadow-luxury transition-all duration-500 hover:-translate-y-1 hover:border-luxury-gold/25 hover:shadow-luxury-lg"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center border border-luxury-gold/20 bg-luxury-cream transition-colors group-hover:border-luxury-gold/40 group-hover:bg-luxury-gold/5">
                <DynamicIcon name={loc.icon} className="h-5 w-5 text-luxury-gold" />
              </div>
              <h3 className="font-display text-lg text-luxury-charcoal">{loc.title}</h3>
              <p className="mt-2 text-sm text-luxury-gold">{loc.distance}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </MotionSection>
  );
}
