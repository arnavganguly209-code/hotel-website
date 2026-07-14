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
      <FooterAccordion title={label || "Secure Payments"} centerMobile>
        <div className="flex justify-center md:justify-start">
          <PaymentBrandLogos enabled={enabledPayments} />
        </div>
      </FooterAccordion>
    </motion.div>
  );
}
