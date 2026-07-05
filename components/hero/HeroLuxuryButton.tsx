"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import type { HeroButtonStyle } from "@/lib/cms/hero-builder-types";
import { cn } from "@/lib/utils";

interface HeroLuxuryButtonProps {
  button: HeroButtonStyle;
  variant?: "primary" | "secondary";
}

export function HeroLuxuryButton({ button, variant = "primary" }: HeroLuxuryButtonProps) {
  if (!button.visible) return null;

  const isSecondary = variant === "secondary" || button.backgroundColor === "transparent";

  return (
    <motion.div whileHover={{ y: -3, scale: 1.02 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
      <Link
        href={button.href}
        className={cn(
          "group inline-flex items-center gap-3 border transition-all duration-500",
          isSecondary
            ? "border-[#C89A3D]/60 bg-white/80 hover:border-[#C89A3D] hover:shadow-[0_8px_32px_rgba(200,154,61,0.2)]"
            : "border-transparent hover:shadow-[0_12px_40px_rgba(24,77,61,0.28)]"
        )}
        style={{
          background: isSecondary
            ? button.backgroundColor === "transparent"
              ? "rgba(255,255,255,0.85)"
              : button.backgroundColor
            : button.backgroundGradient || button.backgroundColor,
          color: isSecondary ? button.color || "#184D3D" : button.color,
          borderRadius: button.borderRadius,
          padding: button.padding,
          boxShadow: isSecondary ? undefined : button.shadow,
          fontFamily: button.fontFamily,
          fontSize: button.fontSize,
          fontWeight: button.fontWeight,
          letterSpacing: button.letterSpacing,
          borderColor: isSecondary ? button.borderColor || "#C89A3D" : undefined,
        }}
      >
        {button.text}
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C89A3D] text-white shadow-[0_4px_16px_rgba(200,154,61,0.35)] transition-transform group-hover:translate-x-0.5">
          <ChevronRight className="h-4 w-4" />
        </span>
      </Link>
    </motion.div>
  );
}
