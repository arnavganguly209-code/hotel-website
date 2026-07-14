"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { SafeImage } from "@/components/shared/SafeImage";
import { fadeUp } from "@/lib/animations";
import { routes } from "@/lib/navigation";

interface FooterBrandProps {
  logoSrc: string;
  brandName: string;
  description: string;
}

const LOGO_WIDTH = 240;

export function FooterBrand({ logoSrc, brandName, description }: FooterBrandProps) {
  return (
    <motion.div
      variants={fadeUp}
      className="flex flex-col items-center text-center md:items-start md:text-left"
    >
      {logoSrc ? (
        <Link
          href={routes.home}
          className="mb-7 inline-block transition-opacity duration-500 hover:opacity-90"
          aria-label={`${brandName} — Home`}
        >
          <SafeImage
            src={logoSrc}
            alt={brandName}
            width={LOGO_WIDTH}
            height={90}
            className="h-auto object-contain object-left"
            style={{ width: LOGO_WIDTH, maxWidth: "100%" }}
            priority
          />
        </Link>
      ) : null}

      <p className="max-w-[280px] text-[13px] leading-[1.85] tracking-wide text-luxury-muted/95 md:max-w-[260px]">
        {description}
      </p>
    </motion.div>
  );
}
