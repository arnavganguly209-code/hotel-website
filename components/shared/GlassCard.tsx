"use client";

import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({ children, className, hover = true }: GlassCardProps) {
  return (
    <div
      className={cn(
        "rounded-sm border border-luxury-gold/10 bg-white/60 p-6 shadow-glass backdrop-blur-xl md:p-8",
        hover &&
          "transition-all duration-500 hover:-translate-y-1 hover:border-luxury-gold/20 hover:shadow-luxury-lg",
        className
      )}
    >
      {children}
    </div>
  );
}
