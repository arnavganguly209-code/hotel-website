"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FooterAccordion } from "@/components/footer/FooterAccordion";
import { fadeUp } from "@/lib/animations";
import { routes } from "@/lib/navigation";
import type { SiteContent } from "@/lib/cms/types";

interface FooterGuestServicesProps {
  contact: SiteContent["footer"]["contact"];
}

export function FooterGuestServices({ contact }: FooterGuestServicesProps) {
  const phoneHref = `tel:${contact.phone.replace(/\s/g, "")}`;

  const rows: Array<{ label: string; value: string; href?: string }> = [
    { label: "Phone", value: contact.phone, href: phoneHref },
    { label: "Email", value: contact.email, href: `mailto:${contact.email}` },
    { label: "Location", value: contact.location },
    { label: "24/7 Reception", value: contact.frontDesk },
  ];

  const legal = [
    { label: "Privacy Policy", href: routes.privacy },
    { label: "Terms & Conditions", href: routes.terms },
  ];

  return (
    <motion.div variants={fadeUp}>
      <FooterAccordion title="Guest Services">
        <ul className="space-y-4">
          {rows.map((item) => (
            <li key={item.label}>
              <p className="mb-1 font-display text-[10px] uppercase tracking-[0.22em] text-luxury-gold/75">
                {item.label}
              </p>
              {item.href ? (
                <a
                  href={item.href}
                  className="text-[13px] leading-relaxed tracking-wide text-luxury-muted transition-colors duration-300 hover:text-luxury-gold"
                >
                  {item.value}
                </a>
              ) : (
                <span className="text-[13px] leading-relaxed tracking-wide text-luxury-muted">
                  {item.value}
                </span>
              )}
            </li>
          ))}
        </ul>

        <ul className="mt-6 space-y-3 border-t border-luxury-gold/15 pt-5">
          {legal.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="group relative inline-block text-[13px] tracking-wide text-luxury-muted transition-colors duration-300 hover:text-luxury-gold"
              >
                {item.label}
                <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-luxury-gold/70 transition-all duration-500 group-hover:w-full" />
              </Link>
            </li>
          ))}
        </ul>
      </FooterAccordion>
    </motion.div>
  );
}
