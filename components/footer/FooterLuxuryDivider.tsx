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
        <span className="h-px w-12 bg-[#C8A145]/45" />
        <span className="relative flex h-3.5 w-3.5 items-center justify-center">
          <span className="absolute h-2.5 w-2.5 rotate-45 border border-[#C8A145]/70" />
          <span className="h-1 w-1 rotate-45 bg-[#C8A145]/85" />
        </span>
        <span className="h-px w-12 bg-[#C8A145]/45" />
      </div>
    );
  }

  if (variant === "brand") {
    return (
      <div className={cn("flex w-full max-w-[220px] items-center gap-3", className)} aria-hidden>
        <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#C8A145]/50 to-[#C8A145]/25" />
        <span className="relative flex h-3 w-3 items-center justify-center">
          <span className="absolute h-2.5 w-2.5 rotate-45 border border-[#C8A145]/60" />
          <span className="h-1 w-1 rotate-45 bg-[#C8A145]/75" />
        </span>
        <span className="h-px flex-1 bg-gradient-to-l from-transparent via-[#C8A145]/50 to-[#C8A145]/25" />
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-3", className)} aria-hidden>
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#C8A145]/40 to-transparent" />
      <span className="h-1 w-1 rotate-45 border border-[#C8A145]/60" />
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#C8A145]/40 to-transparent" />
    </div>
  );
}
