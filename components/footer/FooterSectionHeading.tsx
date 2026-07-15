"use client";

import { cn } from "@/lib/utils";
import { FOOTER } from "@/components/footer/footer-theme";

interface FooterSectionHeadingProps {
  title: string;
  className?: string;
  align?: "left" | "center";
  light?: boolean;
}

export function FooterSectionHeading({
  title,
  className,
  align = "left",
}: FooterSectionHeadingProps) {
  return (
    <div
      className={cn(
        "mb-7",
        align === "center" && "flex flex-col items-center text-center",
        className
      )}
    >
      <h3
        className="font-display text-[12px] font-bold uppercase tracking-[0.32em] md:tracking-[0.38em]"
        style={{ color: FOOTER.gold }}
      >
        {title}
      </h3>
      <span className="mt-3.5 flex items-center gap-2.5" aria-hidden>
        <span
          className="h-px w-7 bg-gradient-to-r from-transparent"
          style={{ backgroundImage: `linear-gradient(to right, transparent, ${FOOTER.gold})` }}
        />
        <span
          className="h-[4px] w-[4px] rotate-45 border"
          style={{ borderColor: FOOTER.gold, backgroundColor: `${FOOTER.gold}55` }}
        />
        <span
          className="h-px w-7"
          style={{ backgroundImage: `linear-gradient(to left, transparent, ${FOOTER.gold})` }}
        />
      </span>
    </div>
  );
}
