"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "@/components/shared/SectionHeading";

export function Welcome() {
  return (
    <section id="overview" className="relative overflow-hidden px-6 py-28 lg:px-8 lg:py-36">
      <div className="absolute inset-0 bg-luxury-gradient opacity-50" />

      <div className="relative mx-auto max-w-7xl">
        <div className="grid items-center gap-16 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-5">
            <SectionHeading
              eyebrow="Welcome"
              title="A Sanctuary of Refined Elegance"
              align="left"
              className="mb-0"
            />
          </div>

          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <p className="font-display text-2xl font-light leading-relaxed text-luxury-charcoal md:text-3xl">
                In the vibrant heart of Thamel, Hotel Thamel Park offers an
                oasis of tranquility where premium hospitality meets the soul of
                Kathmandu.
              </p>

              <p className="text-base leading-relaxed text-luxury-muted md:text-lg">
                Every detail has been curated to deliver an experience that transcends
                expectation — from our elegantly appointed rooms and rejuvenating spa
                to the authentic flavors of our Garden View Korean Restaurant and the
                elevated ambience of Skyz Lounge.
              </p>

              <p className="text-base leading-relaxed text-luxury-muted md:text-lg">
                Whether you seek wellness, culinary discovery, or simply the finest
                in luxury comfort, our dedicated team crafts personalized experiences
                that linger long after your departure.
              </p>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-24 grid gap-6 md:grid-cols-3"
        >
          {[
            {
              number: "01",
              title: "Premium Hospitality",
              text: "Attentive service that anticipates your every need with grace and discretion.",
            },
            {
              number: "02",
              title: "Culinary Excellence",
              text: "From authentic Korean cuisine to rooftop cocktails, every meal is an occasion.",
            },
            {
              number: "03",
              title: "Wellness & Renewal",
              text: "Restore body and spirit in our sanctuary of spa treatments and therapies.",
            },
          ].map((item, i) => (
            <motion.div
              key={item.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="group border-t border-luxury-gold/20 pt-8"
            >
              <span className="font-display text-5xl font-light text-luxury-gold/30 transition-colors group-hover:text-luxury-gold/50">
                {item.number}
              </span>
              <h3 className="mt-4 font-display text-xl text-luxury-charcoal">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-luxury-muted">
                {item.text}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
