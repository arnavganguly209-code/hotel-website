"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { MediaPlaceholder } from "@/components/shared/MediaPlaceholder";
import { SectionPreviewLink } from "@/components/shared/SectionPreviewLink";
import { DINING_VENUES } from "@/lib/data";
import { diningImages } from "@/lib/media";
import { routes } from "@/lib/navigation";
import { fadeUp, staggerContainer } from "@/lib/animations";

const images = [diningImages.restaurant, diningImages.lounge];

export function DiningPreview() {
  return (
    <section id="dining" className="relative px-6 py-28 lg:px-8 lg:py-36">
      <div className="absolute inset-0 bg-white" />
      <div className="relative mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Culinary"
          title="Dining Experience"
          description="Two extraordinary venues where flavor and atmosphere converge."
        />
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-10 lg:grid-cols-2"
        >
          {DINING_VENUES.map((venue, i) => (
            <motion.article
              key={venue.name}
              variants={fadeUp}
              className="group overflow-hidden border border-luxury-gold/10 bg-white shadow-luxury transition-shadow hover:shadow-luxury-lg"
            >
              <MediaPlaceholder
                src={images[i]}
                alt={venue.name}
                variant="dining"
                aspect="landscape"
              />
              <div className="p-8">
                <h3 className="font-display text-2xl font-light text-luxury-charcoal">
                  {venue.name}
                </h3>
                <p className="mt-2 text-sm italic text-luxury-muted">{venue.tagline}</p>
                <ul className="mt-6 space-y-2">
                  {venue.features.slice(0, 3).map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-luxury-muted">
                      <Check className="h-3.5 w-3.5 text-luxury-gold" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={routes.dining}
                  className="mt-6 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-luxury-gold transition-colors hover:text-luxury-charcoal"
                >
                  Learn More <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </motion.article>
          ))}
        </motion.div>
        <SectionPreviewLink href={routes.dining} />
      </div>
    </section>
  );
}
