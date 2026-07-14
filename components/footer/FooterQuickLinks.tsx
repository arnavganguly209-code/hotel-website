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
            className="group relative inline-block text-[13px] tracking-wide text-luxury-muted transition-colors duration-300 hover:text-luxury-gold"
          >
            {link.label}
            <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-luxury-gold/70 transition-all duration-500 group-hover:w-full" />
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
