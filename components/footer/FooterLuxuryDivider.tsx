"use client";

import { cn } from "@/lib/utils";

interface FooterLuxuryDividerProps {
  className?: string;
  variant?: "horizontal" | "ornament" | "brand";
}

export function FooterLuxuryDivider({
  className,
  variant = "horizontal",
}: FooterLuxuryDividerProps) {
  if (variant === "ornament") {
    return (
      <div className={cn("flex items-center justify-center gap-3", className)} aria-hidden>
        <span className="h-px w-10 bg-luxury-gold/40" />
        <span className="h-1.5 w-1.5 rotate-45 border border-luxury-gold/65 bg-luxury-champagne/40" />
        <span className="h-px w-10 bg-luxury-gold/40" />
      </div>
    );
  }

  if (variant === "brand") {
    return (
      <div className={cn("flex w-full max-w-[220px] items-center gap-3", className)} aria-hidden>
        <span className="h-px flex-1 bg-gradient-to-r from-transparent via-luxury-gold/45 to-luxury-gold/25" />
        <span className="relative flex h-3 w-3 items-center justify-center">
          <span className="absolute h-2.5 w-2.5 rotate-45 border border-luxury-gold/55" />
          <span className="h-1 w-1 rotate-45 bg-luxury-gold/70" />
        </span>
        <span className="h-px flex-1 bg-gradient-to-l from-transparent via-luxury-gold/45 to-luxury-gold/25" />
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-3", className)} aria-hidden>
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-luxury-gold/40 to-transparent" />
      <span className="h-1 w-1 rotate-45 border border-luxury-gold/60 bg-luxury-champagne/20" />
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-luxury-gold/40 to-transparent" />
    </div>
  );
}
