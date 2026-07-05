"use client";

import { motion } from "framer-motion";
import { PaymentBrandLogos } from "@/components/footer/PaymentBrandLogos";
import { FooterLuxuryDivider } from "@/components/footer/FooterLuxuryDivider";
import { fadeUp } from "@/lib/animations";
import type { SiteContent } from "@/lib/cms/types";

interface FooterPaymentBarProps {
  label: string;
  enabledPayments: string[];
}

export function FooterPaymentBar({ label, enabledPayments }: FooterPaymentBarProps) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="rounded-3xl border border-luxury-gold/20 bg-luxury-cream-light/90 px-6 py-6 shadow-luxury-lg backdrop-blur-sm md:px-10 md:py-7"
    >
      <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
        <div className="text-center md:text-left">
          <p className="font-display text-xs font-medium uppercase tracking-[0.32em] text-luxury-gold">
            {label}
          </p>
          <FooterLuxuryDivider className="mt-3 w-24" />
        </div>
        <PaymentBrandLogos enabled={enabledPayments} className="flex-1" />
      </div>
    </motion.div>
  );
}
