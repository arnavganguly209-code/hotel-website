"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { routes } from "@/lib/navigation";
import type { SiteContent } from "@/lib/cms/types";

interface FooterGalleryPreviewProps {
  images: SiteContent["footer"]["galleryPreview"];
}

export function FooterGalleryPreview({ images }: FooterGalleryPreviewProps) {
  const preview = images.slice(0, 6);

  return (
    <motion.div variants={fadeUp}>
      <h3 className="mb-5 font-display text-xs font-medium uppercase tracking-[0.28em] text-luxury-gold">
        Gallery
      </h3>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:gap-3"
      >
        {preview.map((img) => (
          <motion.div key={img.id} variants={fadeUp}>
            <Link
              href={routes.gallery}
              className="group relative block aspect-[4/3] overflow-hidden rounded-xl border border-luxury-gold/10 shadow-luxury"
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(max-width: 768px) 50vw, 120px"
                className="object-cover transition-transform duration-700 ease-[0.22,1,0.36,1] group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-luxury-green-dark/0 transition-colors duration-500 group-hover:bg-luxury-green-dark/15" />
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
