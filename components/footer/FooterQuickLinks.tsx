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
            className="group inline-flex items-center gap-2.5 font-body text-[13.5px] font-normal tracking-[0.03em] text-[#F3EBD8]/78 transition-all duration-500 hover:text-[#C8A145]"
          >
            <span
              className="inline-block text-[10px] text-[#C8A145]/55 transition-all duration-500 group-hover:translate-x-0.5 group-hover:text-[#C8A145]"
              aria-hidden
            >
              ›
            </span>
            <span className="relative">
              {link.label}
              <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-[#C8A145]/75 transition-all duration-500 group-hover:w-full" />
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
