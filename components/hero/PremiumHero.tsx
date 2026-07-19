"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { PremiumFloatingBookingBar } from "@/components/booking/PremiumFloatingBookingBar";
import { SafeImage } from "@/components/shared/SafeImage";
import { mediaUrl } from "@/lib/cms/media-url";
import type { HeroBuilderSettings } from "@/lib/cms/hero-builder-types";
import type { SiteContent } from "@/lib/cms/types";

interface PremiumHeroProps {
  hero: HeroBuilderSettings;
  rooms: SiteContent["rooms"];
  preview?: boolean;
}

const DEMO_VIDEO = "/media/hero/demo-luxury-lobby.mp4";
const DEMO_POSTER = "/media/hero/demo-luxury-lobby-poster.png";

function videoMime(src: string) {
  const path = src.split("?")[0].toLowerCase();
  if (path.endsWith(".webm")) return "video/webm";
  if (path.endsWith(".mov")) return "video/quicktime";
  return "video/mp4";
}

/**
 * Homepage hero rebuilt from zero: one cinematic media layer and one booking
 * bar. No copy, CTA, badge, icon row, card or decorative content is rendered.
 */
export function PremiumHero({ hero, rooms }: PremiumHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [mediaVisible, setMediaVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMediaVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "160px" }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const imageSrc = hero.image?.src || hero.imageSrc;
  const mode = hero.mediaMode === "image" && imageSrc ? "image" : "video";
  const videoSrc = hero.videoSrc?.trim() || DEMO_VIDEO;
  const poster = hero.poster?.trim() || DEMO_POSTER;
  const overlayOpacity = Math.min(Math.max(hero.overlayOpacity ?? 0.18, 0), 0.85);
  const overlayColor = hero.overlayColor || "#000000";
  const bookingBottom = hero.bookingPosition?.trim() || "32px";

  const heroStyle = {
    "--hero-desktop-height": hero.desktopHeight?.trim() || "72vh",
    "--hero-mobile-height": hero.mobileHeight?.trim() || "540px",
  } as CSSProperties;

  const bookingSettings = {
    ...hero.bookingBar,
    responsive: {
      ...hero.bookingBar.responsive,
      desktopBottom: bookingBottom,
      desktopWidth: "calc(100% - 48px)",
      desktopMaxWidth: "1450px",
      mobileHorizontalInset: "24px",
    },
  };

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative isolate h-[var(--hero-mobile-height)] min-h-[500px] max-h-[560px] w-full overflow-hidden bg-[#162A20] lg:h-[var(--hero-desktop-height)] lg:min-h-[640px] lg:max-h-[760px]"
      style={heroStyle}
    >
      <div className="absolute inset-0 -z-10 overflow-hidden bg-[#162A20]">
        {mode === "image" ? (
          <SafeImage
            src={imageSrc}
            alt={hero.image?.alt || hero.seo?.altText || "Hotel Thamel Park"}
            fill
            priority
            fadeIn={false}
            objectFit="cover"
            sizes="100vw"
            className="transform-gpu"
            style={{ objectPosition: hero.image?.position || "center" }}
          />
        ) : (
          <>
            <SafeImage
              src={poster}
              alt=""
              fill
              priority
              fadeIn={false}
              objectFit="cover"
              sizes="100vw"
            />
            {mediaVisible ? (
              <video
                key={videoSrc}
                autoPlay={hero.videoAutoplay !== false}
                loop={hero.videoLoop !== false}
                muted={hero.videoMuted !== false}
                playsInline
                preload="metadata"
                poster={mediaUrl(poster, poster) || undefined}
                className="absolute inset-0 h-full w-full transform-gpu object-cover will-change-transform"
                style={{ objectPosition: hero.image?.position || "center" }}
                aria-label="Hotel ambience"
              >
                <source src={mediaUrl(videoSrc, videoSrc)} type={videoMime(videoSrc)} />
              </video>
            ) : null}
          </>
        )}
      </div>

      <div
        className="pointer-events-none absolute inset-0 -z-[5]"
        style={{ backgroundColor: overlayColor, opacity: overlayOpacity }}
        aria-hidden
      />

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-24 bg-gradient-to-b from-transparent to-[#F8F3EA]/55"
        aria-hidden
      />

      {hero.showBookingBar !== false && hero.bookingBar.enabled ? (
        <PremiumFloatingBookingBar
          rooms={rooms}
          bookingBar={bookingSettings}
          variant="hero"
        />
      ) : null}
    </section>
  );
}
