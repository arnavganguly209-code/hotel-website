"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MediaPlaceholder } from "@/components/shared/MediaPlaceholder";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { routes } from "@/lib/navigation";
import { fadeUp, staggerContainer } from "@/lib/animations";
import type { SiteContent } from "@/lib/cms/types";

interface SpaPageProps {
  content: SiteContent["spaPage"];
}

export function SpaPage({ content }: SpaPageProps) {
  return (
    <section className="section-padding bg-luxury-cream-light">
      <div className="mx-auto max-w-7xl space-y-24">
        <div className="grid gap-12 lg:grid-cols-2">
          <MediaPlaceholder
            src={content.philosophy.imageSrc}
            alt="Spa Treatment"
            variant="spa"
            aspect="portrait"
            className="luxury-card min-h-[500px]"
          />
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col justify-center"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-luxury-orange">Philosophy</p>
            <h2 className="mt-4 font-display text-4xl font-light text-luxury-green-dark">
              {content.philosophy.title}
            </h2>
            <p className="mt-6 text-base leading-relaxed text-luxury-muted">
              {content.philosophy.content}
            </p>
          </motion.div>
        </div>

        <div>
          <SectionHeading eyebrow="Treatments" title="Wellness Services" />
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {content.services.map((service) => (
              <motion.div
                key={service.id}
                variants={fadeUp}
                className="group luxury-card p-8 transition-all hover:-translate-y-1"
              >
                <Leaf className="mb-4 h-5 w-5 text-luxury-orange" strokeWidth={1.2} />
                <h3 className="font-display text-xl text-luxury-green-dark">{service.name}</h3>
                <p className="mt-3 text-sm leading-relaxed text-luxury-muted">{service.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {content.gallery.length > 0 && (
          <div>
            <SectionHeading eyebrow="Gallery" title="Spa Sanctuary" />
            <div className="mt-10 grid gap-5 sm:grid-cols-3">
              {content.gallery.map((img) => (
                <MediaPlaceholder
                  key={img.id}
                  src={img.src}
                  alt={img.title}
                  variant="spa"
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
          className="luxury-card bg-luxury-green p-10 text-center text-white md:p-16"
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
