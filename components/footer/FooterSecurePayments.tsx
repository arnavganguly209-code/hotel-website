"use client";

import { motion } from "framer-motion";
import { FooterAccordion } from "@/components/footer/FooterAccordion";
import { PaymentBrandLogos } from "@/components/footer/PaymentBrandLogos";
import { fadeUp } from "@/lib/animations";

interface FooterSecurePaymentsProps {
  label: string;
  enabledPayments: string[];
}

export function FooterSecurePayments({ label, enabledPayments }: FooterSecurePaymentsProps) {
  return (
    <motion.div variants={fadeUp} className="w-full">
      <FooterAccordion title={label || "Secure Payments"}>
        <div className="mx-auto w-full max-w-[280px] md:mx-0 md:max-w-none">
          <PaymentBrandLogos
            enabled={enabledPayments}
            className="justify-items-center md:justify-items-stretch"
          />
        </div>
      </FooterAccordion>
    </motion.div>
  );
}
