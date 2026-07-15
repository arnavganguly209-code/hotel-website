"use client";

import { cn } from "@/lib/utils";

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
      <h3 className="font-display text-[12px] font-semibold uppercase tracking-[0.36em] text-[#C8A145]">
        {title}
      </h3>
      <span className="mt-3.5 flex items-center gap-2.5" aria-hidden>
        <span className="h-px w-7 bg-gradient-to-r from-transparent to-[#C8A145]/65" />
        <span className="h-[4px] w-[4px] rotate-45 border border-[#C8A145]/80 bg-[#C8A145]/30" />
        <span className="h-px w-7 bg-gradient-to-l from-transparent to-[#C8A145]/65" />
      </span>
    </div>
  );
}
