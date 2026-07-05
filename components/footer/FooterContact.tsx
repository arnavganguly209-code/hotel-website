"use client";

import { motion } from "framer-motion";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { fadeUp } from "@/lib/animations";
import type { SiteContent } from "@/lib/cms/types";

interface FooterContactProps {
  contact: SiteContent["footer"]["contact"];
}

export function FooterContact({ contact }: FooterContactProps) {
  const items = [
    { icon: Phone, label: "Phone", value: contact.phone, href: `tel:${contact.phone.replace(/\s/g, "")}` },
    { icon: Mail, label: "Email", value: contact.email, href: `mailto:${contact.email}` },
    { icon: MapPin, label: "Location", value: contact.location },
    { icon: Clock, label: "Front Desk", value: contact.frontDesk },
  ];

  return (
    <motion.div variants={fadeUp}>
      <h3 className="mb-5 font-display text-xs font-medium uppercase tracking-[0.28em] text-luxury-gold">
        Contact Us
      </h3>
      <ul className="space-y-4">
        {items.map((item) => (
          <li key={item.label} className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-luxury-gold/25 bg-luxury-cream-light/80">
              <item.icon className="h-4 w-4 text-luxury-gold" strokeWidth={1.3} />
            </span>
            <div className="pt-1.5">
              {"href" in item && item.href ? (
                <a href={item.href} className="text-sm text-luxury-muted transition-colors hover:text-luxury-gold">
                  {item.value}
                </a>
              ) : (
                <span className="text-sm text-luxury-muted">{item.value}</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
