"use client";

import { cn } from "@/lib/utils";

interface FooterSectionHeadingProps {
  title: string;
  className?: string;
  align?: "left" | "center";
}

/** Serif heading with a tiny gold ornament — used on every footer column. */
export function FooterSectionHeading({
  title,
  className,
  align = "left",
}: FooterSectionHeadingProps) {
  return (
    <div
      className={cn(
        "mb-6",
        align === "center" && "flex flex-col items-center text-center",
        className
      )}
    >
      <h3
        className={cn(
          "font-display text-[12px] font-medium uppercase leading-none",
          "tracking-[0.34em] text-luxury-gold"
        )}
      >
        {title}
      </h3>
      <span className="mt-3.5 flex items-center gap-2" aria-hidden>
        <span className="h-px w-5 bg-gradient-to-r from-transparent to-luxury-gold/55" />
        <span className="h-[3px] w-[3px] rotate-45 border border-luxury-gold/70 bg-luxury-gold/25" />
        <span className="h-px w-5 bg-gradient-to-l from-transparent to-luxury-gold/55" />
      </span>
    </div>
  );
}
