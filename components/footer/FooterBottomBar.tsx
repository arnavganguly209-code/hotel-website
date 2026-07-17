"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { FooterLuxuryDivider } from "@/components/footer/FooterLuxuryDivider";
import { FOOTER } from "@/components/footer/footer-theme";
import { fadeUp } from "@/lib/animations";
import { defaultContent } from "@/lib/cms/default-content";
import type { SiteContent } from "@/lib/cms/types";

interface FooterBottomBarProps {
  footer: SiteContent["footer"];
}

export function FooterBottomBar({ footer }: FooterBottomBarProps) {
  const year = new Date().getFullYear();
  const developerPrefix =
    footer.developerLabel.replace(/\s*The Global Orbit\s*/i, "").trim() || "Developed By";
  const legalLinks =
    footer.legalLinks?.length > 0 ? footer.legalLinks : defaultContent.footer.legalLinks;

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="border-t"
      style={{
        backgroundColor: footer.colors.bottomBackground || FOOTER.bottomBg,
        borderColor: `${FOOTER.gold}55`,
      }}
    >
      {/* Legal links — centered, wrap on mobile */}
      <div className="mx-auto max-w-7xl px-6 pt-7 md:px-10 md:pt-8">
        <nav
          aria-label="Legal"
          className="flex flex-wrap items-center justify-center gap-x-0 gap-y-2 text-center"
        >
          {legalLinks.map((link, i) => (
            <span key={`${link.href}-${i}`} className="inline-flex items-center">
              {i > 0 ? (
                <span
                  className="mx-2.5 inline-block text-[11px] sm:mx-3"
                  style={{ color: `${FOOTER.gold}88` }}
                  aria-hidden
                >
                  |
                </span>
              ) : null}
              <Link
                href={link.href}
                className="font-body text-[11px] font-medium tracking-[0.1em] transition-colors duration-300 hover:opacity-90 sm:text-[12px]"
                style={{ color: FOOTER.body }}
              >
                {link.label}
              </Link>
            </span>
          ))}
        </nav>
        <div
          className="mx-auto mt-6 h-px w-full max-w-4xl"
          style={{
            backgroundImage: `linear-gradient(to right, transparent, ${FOOTER.gold}70, transparent)`,
          }}
        />
      </div>

      <div className="mx-auto flex max-w-7xl flex-col items-center gap-5 px-6 py-7 text-center md:flex-row md:justify-between md:gap-10 md:px-10 md:py-8 md:text-left">
        <p
          className="font-body text-[12px] font-medium leading-relaxed tracking-[0.08em]"
          style={{ color: FOOTER.muted }}
        >
          &copy; {year} {footer.copyrightText}
        </p>

        <FooterLuxuryDivider variant="ornament" className="hidden shrink-0 md:flex" />

        <p
          className="font-body text-[12px] font-medium leading-relaxed tracking-[0.08em]"
          style={{ color: FOOTER.muted }}
        >
          {developerPrefix}{" "}
          <a
            href={footer.developerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 tracking-[0.06em] transition-colors duration-400"
            style={{ color: FOOTER.gold }}
          >
            The Global Orbit
            <ExternalLink className="h-3 w-3" strokeWidth={1.4} aria-hidden />
          </a>
        </p>
      </div>
    </motion.div>
  );
}
