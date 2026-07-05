"use client";

import { motion } from "framer-motion";
import { DynamicIcon } from "@/components/shared/DynamicIcon";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { fadeUp, staggerContainer } from "@/lib/animations";
import type { SiteContent } from "@/lib/cms/types";

interface AboutPageProps {
  content: SiteContent["aboutPage"];
}

export function AboutPage({ content }: AboutPageProps) {
  return (
    <section className="section-padding bg-luxury-cream-light">
      <div className="mx-auto max-w-7xl space-y-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-3xl text-center"
        >
          <h2 className="font-display text-3xl font-light text-luxury-green-dark md:text-4xl">
            {content.history.title}
          </h2>
          <p className="mt-6 text-base leading-relaxed text-luxury-muted">{content.history.content}</p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-2">
          {[
            { block: content.mission, label: "Mission" },
            { block: content.vision, label: "Vision" },
          ].map(({ block, label }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="luxury-card p-10"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-luxury-orange">{label}</p>
              <h3 className="mt-4 font-display text-2xl text-luxury-green-dark">{block.title}</h3>
              <p className="mt-4 text-sm leading-relaxed text-luxury-muted">{block.content}</p>
            </motion.div>
          ))}
        </div>

        <div>
          <SectionHeading eyebrow="Amenities" title="Hotel Facilities" />
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {content.facilities.map((facility) => (
              <motion.div key={facility.name} variants={fadeUp} className="luxury-card p-6 text-center">
                <DynamicIcon name={facility.icon} className="mx-auto mb-4 h-6 w-6 text-luxury-orange" />
                <h4 className="font-display text-lg text-luxury-green-dark">{facility.name}</h4>
                <p className="mt-2 text-xs leading-relaxed text-luxury-muted">{facility.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <div>
          <SectionHeading eyebrow="Heritage" title="Our Timeline" />
          <div className="relative mt-12">
            <div className="absolute left-4 top-0 hidden h-full w-px bg-luxury-orange/20 md:left-1/2 md:block" />
            <div className="space-y-10">
              {content.timeline.map((item, i) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className={`relative md:flex ${i % 2 === 0 ? "md:justify-start" : "md:justify-end"}`}
                >
                  <div className="luxury-card ml-0 max-w-lg p-8 md:ml-0 md:w-[calc(50%-2rem)]">
                    <span className="font-display text-2xl text-luxury-orange">{item.year}</span>
                    <h4 className="mt-2 font-display text-xl text-luxury-green-dark">{item.title}</h4>
                    <p className="mt-3 text-sm leading-relaxed text-luxury-muted">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
