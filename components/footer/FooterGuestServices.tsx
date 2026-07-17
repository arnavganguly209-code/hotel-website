"use client";

import { motion } from "framer-motion";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { FooterAccordion } from "@/components/footer/FooterAccordion";
import { FOOTER } from "@/components/footer/footer-theme";
import { fadeUp } from "@/lib/animations";
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

  return (
    <motion.div variants={fadeUp}>
      <FooterAccordion title="Guest Services">
        <ul className="space-y-5">
          {rows.map((item) => (
            <li key={item.label} className="flex items-start gap-3">
              <item.Icon
                className="mt-0.5 h-3.5 w-3.5 shrink-0"
                style={{ color: FOOTER.gold }}
                strokeWidth={1.25}
                aria-hidden
              />
              <div className="min-w-0">
                <p
                  className="mb-1 font-display text-[10px] font-bold uppercase tracking-[0.28em]"
                  style={{ color: FOOTER.gold }}
                >
                  {item.label}
                </p>
                {"href" in item && item.href ? (
                  <a
                    href={item.href}
                    className="font-body text-[14px] font-medium leading-relaxed tracking-[0.02em] text-[#F8F5EE] transition-colors duration-400 hover:text-[#D4AF37]"
                  >
                    {item.value}
                  </a>
                ) : (
                  <span className="font-body text-[14px] font-medium leading-relaxed tracking-[0.02em] text-[#F8F5EE]">
                    {item.value}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </FooterAccordion>
    </motion.div>
  );
}
