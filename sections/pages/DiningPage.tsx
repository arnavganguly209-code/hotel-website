"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MediaPlaceholder } from "@/components/shared/MediaPlaceholder";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { routes } from "@/lib/navigation";
import { fadeUp, staggerContainer } from "@/lib/animations";
import type { SiteContent } from "@/lib/cms/types";

interface DiningPageProps {
  content: SiteContent["diningPage"];
}

export function DiningPage({ content }: DiningPageProps) {
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
            {content.intro.title}
          </h2>
          <p className="mt-6 text-base leading-relaxed text-luxury-muted">
            {content.intro.content}
          </p>
        </motion.div>

        {content.venues.map((venue, i) => (
          <motion.article
            key={venue.id}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className={`grid items-center gap-12 lg:grid-cols-2 ${i % 2 === 1 ? "lg:flex-row-reverse" : ""}`}
          >
            <motion.div variants={fadeUp} className={i % 2 === 1 ? "lg:order-2" : ""}>
              <MediaPlaceholder
                src={venue.imageSrc}
                alt={venue.name}
                variant="dining"
                aspect="landscape"
                className="min-h-[400px] luxury-card"
              />
            </motion.div>
            <motion.div variants={fadeUp} className={i % 2 === 1 ? "lg:order-1" : ""}>
              <p className="text-xs uppercase tracking-[0.3em] text-luxury-orange">
                Restaurant
              </p>
              <h3 className="mt-4 font-display text-3xl font-light text-luxury-green-dark md:text-4xl">
                {venue.name}
              </h3>
              <p className="mt-3 text-lg italic text-luxury-muted">{venue.tagline}</p>
              <p className="mt-4 text-sm leading-relaxed text-luxury-muted">{venue.description}</p>
              <ul className="mt-8 space-y-3">
                {venue.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-luxury-muted">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full border border-luxury-orange/20 bg-luxury-orange/5">
                      <Check className="h-3.5 w-3.5 text-luxury-orange" />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.article>
        ))}

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-6 md:grid-cols-3"
        >
          {content.highlights.map((item) => (
            <motion.div key={item.title} variants={fadeUp} className="luxury-card p-8 text-center">
              <h4 className="font-display text-xl text-luxury-green-dark">{item.title}</h4>
              <p className="mt-3 text-sm leading-relaxed text-luxury-muted">{item.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {content.gallery.length > 0 && (
          <div>
            <SectionHeading eyebrow="Gallery" title="Dining Ambience" />
            <div className="mt-10 grid gap-5 sm:grid-cols-3">
              {content.gallery.map((img) => (
                <MediaPlaceholder
                  key={img.id}
                  src={img.src}
                  alt={img.title}
                  variant="dining"
                  aspect="landscape"
                  className="luxury-card min-h-[220px]"
                />
              ))}
            </div>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="luxury-card bg-luxury-green-dark p-10 text-center text-white md:p-16"
        >
          <h3 className="font-display text-3xl font-light">{content.cta.title}</h3>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/70">
            {content.cta.description}
          </p>
          <Button variant="gold" size="lg" className="mt-8 uppercase tracking-wider" asChild>
            <Link href={routes.contact}>
              {content.cta.buttonText}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
