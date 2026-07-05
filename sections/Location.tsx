"use client";

import { motion } from "framer-motion";
import { MapPin, Navigation } from "lucide-react";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { LOCATION_HIGHLIGHTS } from "@/lib/data";
import { staggerContainer, fadeUp } from "@/lib/animations";

export function Location() {
  return (
    <section id="location" className="relative px-6 py-28 lg:px-8 lg:py-36">
      <div className="absolute inset-0 bg-white" />

      <div className="relative mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Destination"
          title="Prime Location"
          description="Perfectly positioned in Thamel, the cultural heart of Kathmandu."
        />

        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative overflow-hidden rounded-sm border border-luxury-gold/10 bg-luxury-gradient p-12 shadow-luxury-lg md:p-16">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(198,169,114,0.08)_0%,transparent_60%)]" />

              <div className="relative flex flex-col items-center text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-luxury-gold/20 bg-white/60 shadow-luxury-gold backdrop-blur-sm">
                  <MapPin className="h-8 w-8 text-luxury-gold" strokeWidth={1.2} />
                </div>

                <h3 className="font-display text-3xl font-light text-luxury-charcoal">
                  Thamel, Kathmandu
                </h3>
                <p className="mt-3 text-sm text-luxury-muted">
                  Nepal 44600
                </p>

                <div className="mt-8 flex items-center gap-6">
                  <div className="text-center">
                    <p className="font-display text-2xl text-luxury-gold">6</p>
                    <p className="text-[10px] uppercase tracking-wider text-luxury-muted">
                      km to Airport
                    </p>
                  </div>
                  <div className="h-8 w-px bg-luxury-gold/20" />
                  <div className="text-center">
                    <p className="font-display text-2xl text-luxury-gold">5</p>
                    <p className="text-[10px] uppercase tracking-wider text-luxury-muted">
                      min to Durbar Sq
                    </p>
                  </div>
                  <div className="h-8 w-px bg-luxury-gold/20" />
                  <div className="text-center">
                    <p className="font-display text-2xl text-luxury-gold">24/7</p>
                    <p className="text-[10px] uppercase tracking-wider text-luxury-muted">
                      Concierge
                    </p>
                  </div>
                </div>
              </div>

              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                className="absolute -right-8 -top-8 h-32 w-32 rounded-full border border-luxury-gold/10"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
                className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full border border-luxury-gold/5"
              />
            </div>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="grid gap-4 sm:grid-cols-2"
          >
            {LOCATION_HIGHLIGHTS.map((highlight) => (
              <motion.div
                key={highlight.title}
                variants={fadeUp}
                className="group rounded-sm border border-luxury-gold/10 bg-luxury-cream/30 p-6 transition-all duration-500 hover:border-luxury-gold/20 hover:bg-white hover:shadow-luxury"
              >
                <Navigation className="mb-3 h-4 w-4 text-luxury-gold" strokeWidth={1.2} />
                <h4 className="font-display text-base text-luxury-charcoal">
                  {highlight.title}
                </h4>
                <p className="mt-2 text-xs leading-relaxed text-luxury-muted">
                  {highlight.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
