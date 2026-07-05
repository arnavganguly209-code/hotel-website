"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { DynamicIcon } from "@/components/shared/DynamicIcon";
import { FACILITIES } from "@/lib/data";
import { staggerContainer, fadeUp } from "@/lib/animations";

export function Facilities() {
  return (
    <section id="facilities" className="relative px-6 py-28 lg:px-8 lg:py-36">
      <div className="absolute inset-0 bg-white" />

      <div className="relative mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Amenities"
          title="Hotel Facilities"
          description="Every convenience thoughtfully provided for an effortless luxury stay."
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6"
        >
          {FACILITIES.map((facility) => (
            <motion.div
              key={facility.name}
              variants={fadeUp}
              className="group flex flex-col items-center rounded-sm border border-luxury-gold/10 bg-luxury-cream/50 p-6 text-center transition-all duration-500 hover:-translate-y-1 hover:border-luxury-gold/25 hover:bg-white hover:shadow-luxury"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-sm border border-luxury-gold/15 bg-white transition-all duration-500 group-hover:border-luxury-gold/30 group-hover:shadow-luxury-gold">
                <DynamicIcon
                  name={facility.icon}
                  className="h-5 w-5 text-luxury-gold"
                />
              </div>
              <span className="text-xs font-medium uppercase tracking-wider text-luxury-slate">
                {facility.name}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
