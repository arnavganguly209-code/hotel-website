"use client";

import type { SiteContent } from "@/lib/cms/types";

interface ThemeProviderProps {
  theme: SiteContent["theme"];
  children: React.ReactNode;
}

export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  const speed =
    theme.animationSpeed === "slow" ? "0.8s" : theme.animationSpeed === "fast" ? "0.35s" : "0.55s";

  return (
    <div
      style={
        {
          "--luxury-primary": theme.primary,
          "--luxury-secondary": theme.secondary,
          "--luxury-accent": theme.accent,
          "--luxury-champagne": theme.champagne,
          "--luxury-background": theme.background,
          "--luxury-radius": theme.borderRadius,
          "--luxury-transition": speed,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
