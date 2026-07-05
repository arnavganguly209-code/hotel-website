"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { GlassCard } from "@/components/shared/GlassCard";
import { DynamicIcon } from "@/components/shared/DynamicIcon";
import { WHY_CHOOSE_US } from "@/lib/data";
import { staggerContainer, fadeUp } from "@/lib/animations";

export function WhyChooseUs() {
  return (
    <section
      id="why-choose-us"
      className="relative px-6 py-28 lg:px-8 lg:py-36"
    >
      <div className="absolute inset-0 bg-white" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(198,169,114,0.04)_0%,transparent_70%)]" />

      <div className="relative mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Distinction"
          title="Why Choose Us"
          description="Eight pillars of excellence that define the Hotel Thamel Park & Spa experience."
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {WHY_CHOOSE_US.map((feature) => (
            <motion.div key={feature.title} variants={fadeUp}>
              <GlassCard className="group h-full">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-sm border border-luxury-gold/15 bg-luxury-gold/5 transition-all duration-500 group-hover:border-luxury-gold/30 group-hover:bg-luxury-gold/10">
                  <DynamicIcon
                    name={feature.icon}
                    className="h-5 w-5 text-luxury-gold transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <h3 className="font-display text-lg text-luxury-charcoal">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-luxury-muted">
                  {feature.description}
                </p>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
