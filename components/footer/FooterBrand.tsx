"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FooterLuxuryDivider } from "@/components/footer/FooterLuxuryDivider";
import { SafeImage } from "@/components/shared/SafeImage";
import { FOOTER } from "@/components/footer/footer-theme";
import { fadeUp } from "@/lib/animations";
import { hasMediaSrc } from "@/lib/cms/media-url";
import { routes } from "@/lib/navigation";

interface FooterBrandProps {
  logoSrc: string;
  brandName: string;
  description: string;
}

export function FooterBrand({ logoSrc, brandName, description }: FooterBrandProps) {
  const showLogo = hasMediaSrc(logoSrc);

  return (
    <motion.div
      variants={fadeUp}
      className="flex flex-col items-center text-center md:items-start md:text-left"
    >
      {showLogo ? (
        <Link
          href={routes.home}
          className="relative mb-7 inline-block h-24 w-[170px] transition-opacity duration-500 hover:opacity-90 md:w-[200px] lg:w-[240px]"
          aria-label={`${brandName} — Home`}
          style={{ background: "none", backgroundColor: "transparent" }}
        >
          <SafeImage
            src={logoSrc}
            alt={brandName}
            fill
            priority
            fadeIn={false}
            objectFit="contain"
            skeleton={false}
            className="object-contain object-left"
            sizes="240px"
            style={{
              background: "none",
              backgroundColor: "transparent",
              boxShadow: "none",
              border: "none",
              padding: 0,
            }}
          />
        </Link>
      ) : null}

      <FooterLuxuryDivider variant="brand" className="mx-auto mb-6 md:mx-0" />

      <p
        className="max-w-[300px] font-body text-[14px] font-normal leading-[1.9] tracking-[0.02em] md:max-w-[280px]"
        style={{ color: FOOTER.description }}
      >
        {description}
      </p>
    </motion.div>
  );
}
