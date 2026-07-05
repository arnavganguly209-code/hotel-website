"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const PAYMENT_BRANDS = {
  visa: {
    label: "Visa",
    content: (
      <svg viewBox="0 0 48 16" className="h-4 w-12" aria-hidden>
        <text x="0" y="13" fill="#1A1F71" fontSize="14" fontWeight="700" fontStyle="italic" fontFamily="Arial, sans-serif">
          VISA
        </text>
      </svg>
    ),
  },
  mastercard: {
    label: "Mastercard",
    content: (
      <svg viewBox="0 0 32 20" className="h-5 w-8" aria-hidden>
        <circle cx="12" cy="10" r="8" fill="#EB001B" opacity="0.9" />
        <circle cx="20" cy="10" r="8" fill="#F79E1B" opacity="0.9" />
      </svg>
    ),
  },
  unionpay: {
    label: "UnionPay",
    content: (
      <span className="text-[10px] font-bold tracking-tight text-[#E21836]">UnionPay</span>
    ),
  },
  alipay: {
    label: "Alipay",
    content: (
      <span className="text-[10px] font-semibold text-[#1677FF]">Alipay</span>
    ),
  },
  upi: {
    label: "UPI",
    content: (
      <span className="text-[11px] font-bold text-[#097939]">UPI</span>
    ),
  },
  esewa: {
    label: "eSewa",
    content: (
      <span className="text-[10px] font-bold text-[#60BB46]">eSewa</span>
    ),
  },
} as const;

export type PaymentBrandId = keyof typeof PAYMENT_BRANDS;

interface PaymentBrandLogosProps {
  enabled: string[];
  className?: string;
}

export function PaymentBrandLogos({ enabled, className }: PaymentBrandLogosProps) {
  const brands = enabled.filter((id): id is PaymentBrandId => id in PAYMENT_BRANDS);

  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-6 md:justify-end md:gap-8", className)}>
      {brands.map((id) => (
        <motion.div
          key={id}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="flex h-10 min-w-[4.5rem] items-center justify-center rounded-lg px-2"
          title={PAYMENT_BRANDS[id].label}
        >
          {PAYMENT_BRANDS[id].content}
        </motion.div>
      ))}
    </div>
  );
}
