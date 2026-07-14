"use client";

import { SafeImage } from "@/components/shared/SafeImage";
import { motion } from "framer-motion";
import { FooterLuxuryDivider } from "@/components/footer/FooterLuxuryDivider";
import { fadeUp } from "@/lib/animations";
import type { SiteContent } from "@/lib/cms/types";

interface FooterBrandProps {
  footer: SiteContent["footer"];
}

export function FooterBrand({ footer }: FooterBrandProps) {
  return (
    <motion.div
      variants={fadeUp}
      className="flex flex-col items-center text-center lg:items-start lg:text-left"
    >
      <div className="mb-4 flex flex-col items-center gap-3 lg:items-start">
        {footer.logoSrc ? (
          <SafeImage
            src={footer.logoSrc}
            alt={footer.brandName}
            width={56}
            height={56}
            className="h-14 w-auto object-contain"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-luxury-gold/30 bg-luxury-gold/10">
            <span className="font-display text-xl font-medium text-luxury-gold">T</span>
          </div>
        )}
        <h2 className="font-display text-sm font-medium leading-relaxed tracking-[0.18em] text-luxury-gold md:text-base">
          {footer.brandName}
        </h2>
      </div>

      <FooterLuxuryDivider className="mb-5 w-full max-w-[200px]" />

      <p className="max-w-xs text-sm leading-relaxed text-luxury-muted/90">
        {footer.description}
      </p>
    </motion.div>
  );
}
