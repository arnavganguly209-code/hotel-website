"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FooterAccordion } from "@/components/footer/FooterAccordion";
import { FOOTER } from "@/components/footer/footer-theme";
import { fadeUp } from "@/lib/animations";
import type { SiteContent } from "@/lib/cms/types";

interface FooterQuickLinksProps {
  links: SiteContent["footer"]["quickLinks"];
}

function LinkList({ links }: { links: SiteContent["footer"]["quickLinks"] }) {
  return (
    <ul className="space-y-4">
      {links.map((link) => (
        <li key={link.href}>
          <Link
            href={link.href}
            className="group inline-flex items-center gap-2.5 font-body text-[14px] font-medium tracking-[0.03em] text-[#F8F5EE] transition-all duration-500 hover:text-[#D4AF37]"
          >
            <span
              className="inline-block text-[11px] transition-transform duration-500 group-hover:translate-x-0.5"
              style={{ color: FOOTER.gold }}
              aria-hidden
            >
              ›
            </span>
            <span className="relative">
              {link.label}
              <span
                className="absolute -bottom-0.5 left-0 h-px w-0 transition-all duration-500 group-hover:w-full"
                style={{ backgroundColor: FOOTER.gold }}
              />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function FooterQuickLinks({ links }: FooterQuickLinksProps) {
  return (
    <motion.div variants={fadeUp}>
      <FooterAccordion title="Quick Links">
        <LinkList links={links} />
      </FooterAccordion>
    </motion.div>
  );
}
