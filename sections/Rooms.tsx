"use client";

import { motion } from "framer-motion";
import { Users, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { ROOMS } from "@/lib/data";
import { scrollToSection } from "@/lib/utils";
import { staggerContainer, fadeUp } from "@/lib/animations";

export function Rooms() {
  return (
    <section id="rooms" className="relative px-6 py-28 lg:px-8 lg:py-36">
      <div className="absolute inset-0 bg-luxury-cream" />

      <div className="relative mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Accommodations"
          title="Rooms & Suites"
          description="Four distinctive categories of luxury, each thoughtfully designed for comfort and elegance."
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid gap-8 md:grid-cols-2"
        >
          {ROOMS.map((room) => (
            <motion.article
              key={room.id}
              variants={fadeUp}
              className="group overflow-hidden rounded-sm border border-luxury-gold/10 bg-white shadow-luxury transition-all duration-500 hover:-translate-y-2 hover:shadow-luxury-lg"
            >
              <div
                className={`relative h-48 bg-gradient-to-br ${room.gradient} p-8`}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(198,169,114,0.1)_0%,transparent_50%)]" />
                <div className="relative flex h-full flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-display text-2xl font-light text-luxury-charcoal">
                        {room.name}
                      </h3>
                      <p className="mt-2 text-sm text-luxury-muted">
                        Starting From{" "}
                        <span className="font-medium text-luxury-gold">
                          ${room.price}
                        </span>
                        /Night
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-sm border border-luxury-gold/15 bg-white/60 px-3 py-1.5 text-xs text-luxury-muted backdrop-blur-sm">
                      <Users className="h-3.5 w-3.5 text-luxury-gold" />
                      {room.occupancy}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {room.features.slice(0, 2).map((f) => (
                      <span
                        key={f}
                        className="rounded-sm bg-white/50 px-2.5 py-1 text-[10px] uppercase tracking-wider text-luxury-slate backdrop-blur-sm"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-8">
                <p className="text-sm leading-relaxed text-luxury-muted">
                  {room.description}
                </p>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-luxury-gold">
                      Amenities
                    </p>
                    <ul className="space-y-1.5">
                      {room.amenities.map((a) => (
                        <li
                          key={a}
                          className="flex items-center gap-2 text-xs text-luxury-muted"
                        >
                          <Check className="h-3 w-3 text-luxury-gold" />
                          {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-luxury-gold">
                      Features
                    </p>
                    <ul className="space-y-1.5">
                      {room.features.map((f) => (
                        <li
                          key={f}
                          className="flex items-center gap-2 text-xs text-luxury-muted"
                        >
                          <Check className="h-3 w-3 text-luxury-gold" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <Button
                  variant="gold"
                  className="mt-8 w-full"
                  onClick={() => scrollToSection("contact")}
                >
                  Book Now
                </Button>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
