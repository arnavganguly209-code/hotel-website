"use client";

import { PremiumFloatingBookingBar } from "@/components/booking/PremiumFloatingBookingBar";
import { LuxuryHeroPlaceholder } from "@/components/shared/LuxuryHeroPlaceholder";
import type { HeroBuilderSettings } from "@/lib/cms/hero-builder-types";
import type { SiteContent } from "@/lib/cms/types";

interface PremiumHeroProps {
  hero: HeroBuilderSettings;
  rooms: SiteContent["rooms"];
  preview?: boolean;
}

const HERO_OVERLAY_VIDEO =
  "linear-gradient(180deg, rgba(255,249,242,0.08) 0%, rgba(24,56,47,0.22) 100%)";

const HERO_OVERLAY_PLACEHOLDER =
  "linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(246,236,215,0.25) 100%)";

export function PremiumHero({ hero, rooms }: PremiumHeroProps) {
  const videoSrc = hero.videoSrc;

  return (
    <section id="hero" className="relative isolate h-screen w-full overflow-hidden">
      {videoSrc ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          poster={hero.poster || undefined}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ width: "100vw", height: "100vh" }}
        >
          <source src={videoSrc} type={videoSrc.endsWith(".webm") ? "video/webm" : "video/mp4"} />
        </video>
      ) : (
        <LuxuryHeroPlaceholder />
      )}

      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: videoSrc ? HERO_OVERLAY_VIDEO : HERO_OVERLAY_PLACEHOLDER }}
        aria-hidden
      />

      {hero.showBookingBar && hero.bookingBar.enabled ? (
        <PremiumFloatingBookingBar rooms={rooms} bookingBar={hero.bookingBar} variant="hero" />
      ) : null}
    </section>
  );
}
