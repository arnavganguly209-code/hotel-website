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
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-5 px-6 py-7 text-center md:flex-row md:justify-between md:gap-10 md:px-10 md:py-8 md:text-left">
        <p className="font-body text-[11px] font-light leading-relaxed tracking-[0.08em] text-luxury-cream/60">
          &copy; {year} {footer.copyrightText}
        </p>

        <FooterLuxuryDivider variant="ornament" className="hidden shrink-0 md:flex" />

        <p className="font-body text-[11px] font-light leading-relaxed tracking-[0.08em] text-luxury-cream/60">
          {developerPrefix}{" "}
          <a
            href={footer.developerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 tracking-[0.06em] text-luxury-champagne transition-colors duration-400 hover:text-luxury-gold"
          >
            The Global Orbit
            <ExternalLink className="h-3 w-3" strokeWidth={1.4} aria-hidden />
          </a>
        </p>
      </div>
    </motion.div>
  );
}
