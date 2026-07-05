"use client";

import { motion } from "framer-motion";
import { ArrowRight, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { SPA_SERVICES } from "@/lib/data";
import { scrollToSection } from "@/lib/utils";
import { staggerContainer, fadeUp } from "@/lib/animations";

export function SpaWellness() {
  return (
    <section id="spa" className="relative overflow-hidden px-6 py-28 lg:px-8 lg:py-36">
      <div className="absolute inset-0 bg-luxury-gradient" />

      <motion.div
        animate={{ y: [0, -15, 0], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-[10%] top-[15%] h-72 w-72 rounded-full bg-luxury-gold/5 blur-3xl"
      />
      <motion.div
        animate={{ y: [0, 10, 0], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[10%] left-[5%] h-56 w-56 rounded-full bg-luxury-sand blur-2xl"
      />

      <div className="relative mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Wellness"
          title="Spa & Wellness"
          description="A sanctuary of rejuvenation where ancient healing traditions meet contemporary luxury."
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {SPA_SERVICES.map((service) => (
            <motion.div
              key={service.name}
              variants={fadeUp}
              className="group rounded-sm border border-luxury-gold/10 bg-white/60 p-8 shadow-glass backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-luxury-gold/20 hover:shadow-luxury-lg"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-sm border border-luxury-gold/15 bg-luxury-gold/5 transition-all group-hover:bg-luxury-gold/10">
                <Leaf className="h-4 w-4 text-luxury-gold" strokeWidth={1.2} />
              </div>
              <h3 className="font-display text-lg text-luxury-charcoal">
                {service.name}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-luxury-muted">
                {service.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mt-16 text-center"
        >
          <Button
            variant="gold"
            size="lg"
            onClick={() => scrollToSection("contact")}
          >
            Book Your Wellness Journey
            <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
