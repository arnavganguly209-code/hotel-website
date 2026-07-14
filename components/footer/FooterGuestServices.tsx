"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { FooterAccordion } from "@/components/footer/FooterAccordion";
import { fadeUp } from "@/lib/animations";
import { routes } from "@/lib/navigation";
import type { SiteContent } from "@/lib/cms/types";

interface FooterGuestServicesProps {
  contact: SiteContent["footer"]["contact"];
}

export function FooterGuestServices({ contact }: FooterGuestServicesProps) {
  const rows = [
    {
      label: "Phone",
      value: contact.phone,
      href: `tel:${contact.phone.replace(/\s/g, "")}`,
      Icon: Phone,
    },
    {
      label: "Email",
      value: contact.email,
      href: `mailto:${contact.email}`,
      Icon: Mail,
    },
    {
      label: "Location",
      value: contact.location,
      Icon: MapPin,
    },
    {
      label: "24/7 Reception",
      value: contact.frontDesk,
      Icon: Clock,
    },
  ] as const;

  const legal = [
    { label: "Privacy Policy", href: routes.privacy },
    { label: "Terms & Conditions", href: routes.terms },
  ];

  return (
    <motion.div variants={fadeUp}>
      <FooterAccordion title="Guest Services">
        <ul className="space-y-5">
          {rows.map((item) => (
            <li key={item.label} className="flex items-start gap-3">
              <item.Icon
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-luxury-gold/80"
                strokeWidth={1.15}
                aria-hidden
              />
              <div className="min-w-0">
                <p className="mb-0.5 font-display text-[9.5px] uppercase tracking-[0.24em] text-luxury-gold/70">
                  {item.label}
                </p>
                {"href" in item && item.href ? (
                  <a
                    href={item.href}
                    className="font-body text-[13px] font-light leading-relaxed tracking-[0.02em] text-luxury-forest/80 transition-colors duration-400 hover:text-luxury-gold"
                  >
                    {item.value}
                  </a>
                ) : (
                  <span className="font-body text-[13px] font-light leading-relaxed tracking-[0.02em] text-luxury-forest/80">
                    {item.value}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>

        <ul className="mt-6 space-y-3 border-t border-luxury-gold/15 pt-5">
          {legal.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="group relative inline-block font-body text-[13px] font-light tracking-[0.03em] text-luxury-forest/80 transition-colors duration-400 hover:text-luxury-gold"
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
