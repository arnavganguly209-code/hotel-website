"use client";

import { motion } from "framer-motion";
import { Check, UtensilsCrossed, Wine } from "lucide-react";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { DINING_VENUES } from "@/lib/data";
import { staggerContainer, fadeUp } from "@/lib/animations";

const venueIcons = [UtensilsCrossed, Wine];

export function Dining() {
  return (
    <section id="dining" className="relative px-6 py-28 lg:px-8 lg:py-36">
      <div className="absolute inset-0 bg-white" />

      <div className="relative mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Culinary"
          title="Dining Experience"
          description="Two extraordinary venues where flavor, atmosphere, and artistry converge."
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid gap-10 lg:grid-cols-2"
        >
          {DINING_VENUES.map((venue, index) => {
            const Icon = venueIcons[index];
            return (
              <motion.article
                key={venue.name}
                variants={fadeUp}
                className="group relative overflow-hidden rounded-sm border border-luxury-gold/10 shadow-luxury transition-all duration-500 hover:shadow-luxury-lg"
              >
                <div
                  className={`bg-gradient-to-br ${venue.gradient} p-10 md:p-12`}
                >
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-sm border border-luxury-gold/20 bg-white/50 backdrop-blur-sm transition-all duration-500 group-hover:border-luxury-gold/40">
                    <Icon className="h-6 w-6 text-luxury-gold" strokeWidth={1.2} />
                  </div>

                  <h3 className="font-display text-3xl font-light text-luxury-charcoal">
                    {venue.name}
                  </h3>
                  <p className="mt-3 text-sm italic text-luxury-muted">
                    {venue.tagline}
                  </p>
                </div>

                <div className="bg-white/80 p-8 backdrop-blur-sm md:p-10">
                  <ul className="space-y-4">
                    {venue.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-3 text-sm text-luxury-muted"
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-luxury-gold/20 bg-luxury-gold/5">
                          <Check className="h-3 w-3 text-luxury-gold" />
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
