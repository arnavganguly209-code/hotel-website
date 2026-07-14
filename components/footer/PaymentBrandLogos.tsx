"use client";

import { cn } from "@/lib/utils";

const PAYMENT_BRANDS = {
  visa: {
    label: "Visa",
    content: (
      <svg viewBox="0 0 48 16" className="h-3.5 w-10" aria-hidden>
        <text
          x="0"
          y="13"
          fill="#1A1F71"
          fontSize="14"
          fontWeight="700"
          fontStyle="italic"
          fontFamily="Arial, sans-serif"
        >
          VISA
        </text>
      </svg>
    ),
  },
  mastercard: {
    label: "Mastercard",
    content: (
      <svg viewBox="0 0 32 20" className="h-4 w-7" aria-hidden>
        <circle cx="12" cy="10" r="8" fill="#EB001B" opacity="0.92" />
        <circle cx="20" cy="10" r="8" fill="#F79E1B" opacity="0.92" />
      </svg>
    ),
  },
  unionpay: {
    label: "UnionPay",
    content: (
      <span className="text-[9px] font-semibold tracking-tight text-[#E21836]">UnionPay</span>
    ),
  },
  alipay: {
    label: "Alipay",
    content: <span className="text-[9px] font-semibold text-[#1677FF]">Alipay</span>,
  },
  upi: {
    label: "UPI",
    content: <span className="text-[10px] font-bold tracking-wide text-[#097939]">UPI</span>,
  },
  esewa: {
    label: "eSewa",
    content: <span className="text-[9px] font-bold text-[#60BB46]">eSewa</span>,
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
    <ul
      className={cn(
        "grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-2",
        className
      )}
    >
      {brands.map((id) => (
        <li key={id}>
          <div
            title={PAYMENT_BRANDS[id].label}
            className={cn(
              "flex h-11 items-center justify-center rounded-sm px-2",
              "border border-luxury-gold/30 bg-luxury-cream",
              "shadow-[0_1px_2px_rgba(36,71,54,0.04)]",
              "transition-all duration-400 ease-[0.22,1,0.36,1]",
              "hover:-translate-y-0.5 hover:border-luxury-gold/55 hover:shadow-[0_4px_12px_rgba(36,71,54,0.06)]"
            )}
          >
            <span className="sr-only">{PAYMENT_BRANDS[id].label}</span>
            {PAYMENT_BRANDS[id].content}
          </div>
        </li>
      ))}
    </ul>
  );
}
