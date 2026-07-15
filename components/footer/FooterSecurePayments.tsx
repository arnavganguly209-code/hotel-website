"use client";

import { motion } from "framer-motion";
import { FooterAccordion } from "@/components/footer/FooterAccordion";
import { PaymentBrandLogos } from "@/components/footer/PaymentBrandLogos";
import { fadeUp } from "@/lib/animations";
import type { SiteContent } from "@/lib/cms/types";

interface FooterSecurePaymentsProps {
  label: string;
  paymentLogos: SiteContent["footer"]["paymentLogos"];
}

export function FooterSecurePayments({ label, paymentLogos }: FooterSecurePaymentsProps) {
  return (
    <motion.div variants={fadeUp} className="w-full">
      <FooterAccordion title={label || "Secure Payments"} centerMobile>
        <div className="flex justify-center md:justify-start">
          <PaymentBrandLogos logos={paymentLogos} />
        </div>
      </FooterAccordion>
    </motion.div>
  );
}
