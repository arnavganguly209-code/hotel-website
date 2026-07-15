"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FooterLuxuryDivider } from "@/components/footer/FooterLuxuryDivider";
import { FOOTER } from "@/components/footer/footer-theme";
import { fadeUp } from "@/lib/animations";
import { routes } from "@/lib/navigation";

interface FooterBrandProps {
  logoSrc: string;
  brandName: string;
  description: string;
}

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
          style={{ background: "none", backgroundColor: "transparent" }}
        >
          {/* Transparent PNG only — never wrap in a filled box */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoSrc}
            alt={brandName}
            width={240}
            height={96}
            className="block h-auto w-[170px] object-contain md:w-[200px] lg:w-[240px]"
            style={{
              background: "none",
              backgroundColor: "transparent",
              boxShadow: "none",
              border: "none",
              padding: 0,
            }}
            decoding="async"
            loading="eager"
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
