"use client";

import { PremiumHero } from "@/components/hero/PremiumHero";
import { PremiumFloatingBookingBar } from "@/components/booking/PremiumFloatingBookingBar";
import { LuxuryHeroBackground } from "@/components/shared/LuxuryHeroBackground";
import type { SiteContent } from "@/lib/cms/types";

interface HeroProps {
  content: SiteContent["hero"];
  theme: SiteContent["theme"];
  rooms: SiteContent["rooms"];
}

export function Hero({ content, theme, rooms }: HeroProps) {
  if (content.layout === "premium" || content.type === "premium") {
    return <PremiumHero hero={content} rooms={rooms} />;
  }

  return (
    <section id="hero" className="relative h-screen overflow-hidden bg-luxury-cream-light">
      <LuxuryHeroBackground animation={content.animation} colors={content.colors} champagne={theme.champagne} />
      {content.showBookingBar && content.bookingBar.enabled && (
        <PremiumFloatingBookingBar rooms={rooms} bookingBar={content.bookingBar} variant="hero" />
      )}
    </section>
  );
}
