"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FooterAccordion } from "@/components/footer/FooterAccordion";
import { fadeUp } from "@/lib/animations";
import type { SiteContent } from "@/lib/cms/types";

interface FooterQuickLinksProps {
  links: SiteContent["footer"]["quickLinks"];
}

function LinkList({ links }: { links: SiteContent["footer"]["quickLinks"] }) {
  return (
    <ul className="space-y-3.5">
      {links.map((link) => (
        <li key={link.href}>
          <Link
            href={link.href}
            className="group inline-flex items-center gap-2 font-body text-[13.5px] font-light tracking-[0.03em] text-luxury-forest/80 transition-all duration-500 hover:text-luxury-gold"
          >
            <span
              className="inline-block text-[9px] text-luxury-gold/45 transition-all duration-500 group-hover:translate-x-0.5 group-hover:text-luxury-gold"
              aria-hidden
            >
              ▸
            </span>
            <span className="relative">
              {link.label}
              <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-luxury-gold/70 transition-all duration-500 group-hover:w-full" />
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
