"use client";

import { cn } from "@/lib/utils";
import { FOOTER } from "@/components/footer/footer-theme";

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
        <span className="h-px w-12" style={{ backgroundColor: `${FOOTER.gold}80` }} />
        <span className="relative flex h-3.5 w-3.5 items-center justify-center">
          <span
            className="absolute h-2.5 w-2.5 rotate-45 border"
            style={{ borderColor: `${FOOTER.gold}CC` }}
          />
          <span className="h-1 w-1 rotate-45" style={{ backgroundColor: FOOTER.gold }} />
        </span>
        <span className="h-px w-12" style={{ backgroundColor: `${FOOTER.gold}80` }} />
      </div>
    );
  }

  if (variant === "brand") {
    return (
      <div className={cn("flex w-full max-w-[220px] items-center gap-3", className)} aria-hidden>
        <span
          className="h-px flex-1"
          style={{
            backgroundImage: `linear-gradient(to right, transparent, ${FOOTER.gold}90, ${FOOTER.gold}40)`,
          }}
        />
        <span className="relative flex h-3 w-3 items-center justify-center">
          <span
            className="absolute h-2.5 w-2.5 rotate-45 border"
            style={{ borderColor: `${FOOTER.gold}B0` }}
          />
          <span className="h-1 w-1 rotate-45" style={{ backgroundColor: FOOTER.gold }} />
        </span>
        <span
          className="h-px flex-1"
          style={{
            backgroundImage: `linear-gradient(to left, transparent, ${FOOTER.gold}90, ${FOOTER.gold}40)`,
          }}
        />
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-3", className)} aria-hidden>
      <span
        className="h-px flex-1"
        style={{
          backgroundImage: `linear-gradient(to right, transparent, ${FOOTER.gold}70, transparent)`,
        }}
      />
      <span className="h-1 w-1 rotate-45 border" style={{ borderColor: `${FOOTER.gold}A0` }} />
      <span
        className="h-px flex-1"
        style={{
          backgroundImage: `linear-gradient(to right, transparent, ${FOOTER.gold}70, transparent)`,
        }}
      />
    </div>
  );
}
