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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoSrc}
            alt={brandName}
            width={240}
            height={96}
            className="block h-auto w-[170px] bg-transparent object-contain md:w-[200px] lg:w-[240px]"
            decoding="async"
            loading="eager"
          />
        </Link>
      ) : null}

      <FooterLuxuryDivider variant="brand" className="mx-auto mb-6 md:mx-0" />

      <p className="max-w-[280px] font-body text-[13.5px] font-normal leading-[1.9] tracking-[0.02em] text-[#F3EBD8]/88 md:max-w-[260px]">
        {description}
      </p>

      <FooterLuxuryDivider variant="brand" className="mx-auto mt-7 md:mx-0" />
    </motion.div>
  );
}
