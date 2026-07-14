"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FooterLuxuryDivider } from "@/components/footer/FooterLuxuryDivider";
import { fadeUp } from "@/lib/animations";
import { routes } from "@/lib/navigation";

interface FooterBrandProps {
  logoSrc: string;
  brandName: string;
  description: string;
}

/**
 * Official hotel logo only — transparent, unaltered, no box/background/name.
 * Widths: 240 desktop · 200 tablet · 180 mobile
 */
export function FooterBrand({ logoSrc, brandName, description }: FooterBrandProps) {
  return (
    <motion.div
      variants={fadeUp}
      className="flex flex-col items-center text-center md:items-start md:text-left"
    >
      {logoSrc ? (
        <Link
          href={routes.home}
          className="mb-6 inline-block bg-transparent transition-opacity duration-500 hover:opacity-90"
          aria-label={`${brandName} — Home`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- respect CMS logo transparency exactly */}
          <img
            src={logoSrc}
            alt={brandName}
            width={240}
            height={96}
            className="block h-auto w-[180px] bg-transparent object-contain md:w-[200px] lg:w-[240px]"
            decoding="async"
            loading="eager"
          />
        </Link>
      ) : null}

      <FooterLuxuryDivider variant="brand" className="mx-auto mb-6 md:mx-0" />

      <p className="max-w-[272px] font-body text-[13.5px] font-light leading-[1.9] tracking-[0.02em] text-luxury-forest/85 md:max-w-[250px]">
        {description}
      </p>

      <FooterLuxuryDivider variant="brand" className="mx-auto mt-7 md:mx-0" />
    </motion.div>
  );
}
