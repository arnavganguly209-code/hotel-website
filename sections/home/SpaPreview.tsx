"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Leaf } from "lucide-react";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { MediaPlaceholder } from "@/components/shared/MediaPlaceholder";
import { SectionPreviewLink } from "@/components/shared/SectionPreviewLink";
import { SPA_SERVICES } from "@/lib/data";
import { spaImages } from "@/lib/media";
import { routes } from "@/lib/navigation";
import { fadeUp, staggerContainer } from "@/lib/animations";

export function SpaPreview() {
  return (
    <section id="spa" className="relative overflow-hidden px-6 py-28 lg:px-8 lg:py-36">
      <div className="absolute inset-0 bg-luxury-gradient" />
      <div className="relative mx-auto max-w-7xl">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="overflow-hidden border border-luxury-gold/10 shadow-luxury-lg"
          >
            <MediaPlaceholder
              src={spaImages.hero}
              alt="Spa & Wellness"
              variant="spa"
              aspect="portrait"
              className="min-h-[480px]"
            />
          </motion.div>
          <div>
            <SectionHeading
              eyebrow="Wellness"
              title="Spa & Wellness"
              description="A sanctuary of rejuvenation where ancient healing meets contemporary luxury."
              align="left"
              className="mb-10"
            />
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid gap-4 sm:grid-cols-2"
            >
              {SPA_SERVICES.slice(0, 4).map((service) => (
                <motion.div
                  key={service.name}
                  variants={fadeUp}
                  className="border border-luxury-gold/10 bg-white/60 p-5 backdrop-blur-sm"
                >
                  <Leaf className="mb-3 h-4 w-4 text-luxury-gold" strokeWidth={1.2} />
                  <h4 className="font-display text-base text-luxury-charcoal">
                    {service.name}
                  </h4>
                  <p className="mt-2 text-xs leading-relaxed text-luxury-muted line-clamp-2">
                    {service.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
            <Link
              href={routes.spa}
              className="mt-8 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-luxury-gold"
            >
              Explore Wellness <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
        <SectionPreviewLink href={routes.spa} label="View Spa Services" />
      </div>
    </section>
  );
}
