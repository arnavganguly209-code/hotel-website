"use client";

import { ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { FooterLuxuryDivider } from "@/components/footer/FooterLuxuryDivider";
import { fadeUp } from "@/lib/animations";
import type { SiteContent } from "@/lib/cms/types";

interface FooterBottomBarProps {
  footer: SiteContent["footer"];
}

export function FooterBottomBar({ footer }: FooterBottomBarProps) {
  const year = new Date().getFullYear();
  const developerPrefix =
    footer.developerLabel.replace(/\s*The Global Orbit\s*/i, "").trim() || "Developed By";

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="border-t border-luxury-gold/30 bg-luxury-green-dark"
      style={{ backgroundColor: footer.colors.bottomBackground }}
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-5 px-6 py-6 text-center md:flex-row md:justify-between md:gap-8 md:px-8 md:py-7 md:text-left lg:px-10">
        <p className="text-[11px] leading-relaxed tracking-[0.04em] text-luxury-cream/65">
          &copy; {year} {footer.copyrightText}
        </p>

        <FooterLuxuryDivider variant="ornament" className="hidden shrink-0 md:flex" />

        <p className="text-[11px] leading-relaxed tracking-[0.04em] text-luxury-cream/65">
          {developerPrefix}{" "}
          <a
            href={footer.developerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-luxury-champagne transition-colors duration-300 hover:text-luxury-gold"
          >
            The Global Orbit
            <ExternalLink className="h-3 w-3" strokeWidth={1.5} aria-hidden />
          </a>
        </p>
      </div>
    </motion.div>
  );
}
