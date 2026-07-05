"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { MotionSection } from "@/components/shared/MotionSection";
import { staggerContainer, fadeUp } from "@/lib/animations";
import { routes } from "@/lib/navigation";
import { LuxuryImageBox } from "@/components/shared/LuxuryImageBox";
import { defaultContent } from "@/lib/cms/default-content";
import type { SiteContent } from "@/lib/cms/types";

interface GalleryHomeSectionProps {
  gallery: SiteContent["gallery"];
  section?: SiteContent["gallerySection"];
}

export function GalleryHomeSection({
  gallery,
  section = defaultContent.gallerySection,
}: GalleryHomeSectionProps) {
  const items = gallery.slice(0, 6);

  return (
    <MotionSection
      id="gallery"
      className="section-padding relative overflow-hidden bg-luxury-cream"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-3 text-[11px] font-medium uppercase tracking-[0.3em] text-luxury-gold"
          >
            {section.eyebrow}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl font-normal text-luxury-charcoal md:text-4xl lg:text-5xl"
          >
            {section.title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="mx-auto mt-4 max-w-xl text-luxury-muted"
          >
            {section.description}
          </motion.p>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              variants={fadeUp}
              className={`group relative overflow-hidden ${
                i === 0 || i === 3 ? "sm:row-span-1" : ""
              }`}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                {item.type === "video" ? (
                  <video
                    src={item.src}
                    muted
                    loop
                    playsInline
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <LuxuryImageBox
                    src={item.src}
                    alt={item.title}
                    label={item.title}
                    variant="gallery"
                    className="aspect-[4/3] lg:min-h-0"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-luxury-charcoal/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="absolute bottom-0 left-0 right-0 translate-y-full p-5 transition-transform duration-500 group-hover:translate-y-0">
                  <p className="text-[10px] uppercase tracking-wider text-luxury-gold-light">{item.category}</p>
                  <p className="font-display text-lg text-white">{item.title}</p>
                </div>
                <div className="pointer-events-none absolute inset-2 border border-luxury-gold/0 transition-all duration-500 group-hover:border-luxury-gold/40 group-hover:inset-3" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <Link
            href={routes.gallery}
            className="group inline-flex items-center gap-2 text-sm font-medium uppercase tracking-[0.15em] text-luxury-charcoal transition-colors hover:text-luxury-gold"
          >
            View Full Gallery
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </MotionSection>
  );
}
