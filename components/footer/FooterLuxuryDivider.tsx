"use client";

import { cn } from "@/lib/utils";

interface FooterLuxuryDividerProps {
  className?: string;
  variant?: "horizontal" | "ornament";
}

export function FooterLuxuryDivider({ className, variant = "horizontal" }: FooterLuxuryDividerProps) {
  if (variant === "ornament") {
    return (
      <div className={cn("flex items-center justify-center gap-3", className)} aria-hidden>
        <span className="h-px w-12 bg-luxury-gold/50" />
        <span className="h-1.5 w-1.5 rotate-45 border border-luxury-gold/70 bg-luxury-champagne/30" />
        <span className="h-px w-12 bg-luxury-gold/50" />
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
