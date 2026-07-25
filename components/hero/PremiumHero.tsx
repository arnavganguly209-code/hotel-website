"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { PremiumFloatingBookingBar } from "@/components/booking/PremiumFloatingBookingBar";
import { SafeImage } from "@/components/shared/SafeImage";
import { hasMediaSrc, mediaUrl, stripMediaQuery } from "@/lib/cms/media-url";
import { usePerformanceSettings } from "@/components/shared/PerformanceProvider";
import type { HeroBuilderSettings } from "@/lib/cms/hero-builder-types";
import type { SiteContent } from "@/lib/cms/types";

interface PremiumHeroProps {
  hero: HeroBuilderSettings;
  rooms: SiteContent["rooms"];
  preview?: boolean;
}

function videoMime(src: string) {
  const path = stripMediaQuery(src).toLowerCase();
  if (path.endsWith(".webm")) return "video/webm";
  if (path.endsWith(".mov")) return "video/quicktime";
  return "video/mp4";
}

/**
 * Homepage hero layout correction:
 * - Full-bleed Orbit media always fills the hero (no green empty plane)
 * - Desktop booking floats at the bottom, covering ~15–20% of the hero only
 * - Mobile: media first, booking card below with no overlap
 */
export function PremiumHero({ hero, rooms }: PremiumHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const perf = usePerformanceSettings();
  const revision = perf.mediaRevision || "";
  const [videoReady, setVideoReady] = useState(false);

  const imageSrc = (hero.image?.src || hero.imageSrc || "").trim();
  const videoSrc = (hero.videoSrc || "").trim();
  const posterSrc = (hero.poster || "").trim();
  const hasImage = hasMediaSrc(imageSrc);
  const hasVideo = hasMediaSrc(videoSrc);
  const mode =
    hero.mediaMode === "none"
      ? "none"
      : hero.mediaMode === "image" && hasImage
        ? "image"
        : hasVideo
          ? "video"
          : hasImage
            ? "image"
            : "none";

  const activeVideoUrl = mode === "video" ? mediaUrl(videoSrc, revision || videoSrc) : "";
  const posterCandidate = hasMediaSrc(posterSrc)
    ? posterSrc
    : hasImage
      ? imageSrc
      : "";
  const activePosterUrl = hasMediaSrc(posterCandidate)
    ? mediaUrl(posterCandidate, revision || posterCandidate)
    : "";
  const activeImageUrl =
    mode === "image" ? mediaUrl(imageSrc, revision || imageSrc) : "";
  const activeMediaKey =
    mode === "image"
      ? `image:${activeImageUrl}`
      : mode === "video"
        ? `video:${activeVideoUrl}:${activePosterUrl}`
        : "none";

  useEffect(() => {
    setVideoReady(false);
    const video = videoRef.current;
    if (!video || mode !== "video") return;
    try {
      video.load();
      const play = video.play();
      if (play && typeof play.catch === "function") {
        play.catch(() => undefined);
      }
    } catch {
      /* ignore abort while swapping Orbit media */
    }
  }, [activeMediaKey, mode]);

  const overlayOpacity = Math.min(Math.max(hero.overlayOpacity ?? 0.18, 0), 0.85);
  const overlayColor = hero.overlayColor || "#000000";
  const showBooking = hero.showBookingBar !== false && hero.bookingBar.enabled;

  // Keep ~80–90vh desktop proportion (CMS height respected when set).
  const heroStyle = {
    "--hero-desktop-height": hero.desktopHeight?.trim() || "85vh",
    "--hero-mobile-height": hero.mobileHeight?.trim() || "70vh",
  } as CSSProperties;

  // Size/position only — preserve Orbit color settings.
  const bookingSettings = {
    ...hero.bookingBar,
    borderRadius: hero.bookingBar.borderRadius || "18px",
    responsive: {
      ...hero.bookingBar.responsive,
      desktopMaxWidth: "none",
      desktopWidth: "calc(100% - 48px)",
      mobileRadius: hero.bookingBar.responsive?.mobileRadius || "16px",
      mobilePadding: hero.bookingBar.responsive?.mobilePadding || "10px",
    },
  };

  const mediaLayer = (
    <>
      {mode === "image" && activeImageUrl ? (
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
      ) : null}

      {mode === "video" && activeVideoUrl ? (
        <>
          {/* Poster stays visible until video is ready — prevents green flash */}
          {activePosterUrl || hasImage ? (
            <SafeImage
              src={posterCandidate || imageSrc}
              alt=""
              fill
              priority
              fadeIn={false}
              objectFit="cover"
              sizes="100vw"
              className="transform-gpu"
              style={{ objectPosition: hero.image?.position || "center" }}
            />
          ) : null}
          <video
            ref={videoRef}
            key={activeVideoUrl}
            autoPlay={hero.videoAutoplay !== false}
            loop={hero.videoLoop !== false}
            muted={hero.videoMuted !== false}
            playsInline
            preload="auto"
            poster={activePosterUrl || undefined}
            className={`absolute inset-0 h-full w-full transform-gpu object-cover transition-opacity duration-500 will-change-transform ${
              videoReady ? "opacity-100" : "opacity-0"
            }`}
            style={{ objectPosition: hero.image?.position || "center" }}
            aria-label="Hotel ambience"
            onLoadedData={() => setVideoReady(true)}
            onCanPlay={() => setVideoReady(true)}
            onPlaying={() => setVideoReady(true)}
            onError={() => setVideoReady(false)}
          >
            <source src={activeVideoUrl} type={videoMime(videoSrc)} />
          </video>
        </>
      ) : null}

      {mode === "none" ? (
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(201,169,110,0.14)_0%,transparent_55%),linear-gradient(160deg,#162A20_0%,#0f1f18_100%)]"
          aria-hidden
        />
      ) : null}
    </>
  );

  return (
    <>
      <section
        ref={sectionRef}
        id="hero"
        className="relative isolate w-full overflow-visible bg-[#0f1f18] h-[var(--hero-mobile-height)] min-h-[460px] max-h-[720px] lg:h-[var(--hero-desktop-height)] lg:min-h-[680px] lg:max-h-none"
        style={heroStyle}
      >
        {/* Full-bleed media — fills the entire hero, never pushed away */}
        <div
          key={activeMediaKey}
          data-active-hero-media={activeMediaKey}
          className="absolute inset-0 z-0 overflow-hidden"
        >
          {mediaLayer}
        </div>

        <div
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{ backgroundColor: overlayColor, opacity: overlayOpacity }}
          aria-hidden
        />

        {/* Soft bottom vignette only — no cream wash that looks like a second section */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-[22%] bg-gradient-to-t from-black/45 via-black/15 to-transparent"
          aria-hidden
        />

        {/* Desktop: nearly full-width slim bar with elegant page padding (~24px) */}
        {showBooking ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-[3.5%] z-20 hidden lg:block">
            <div className="pointer-events-auto mx-auto w-[calc(100%-48px)] max-w-none xl:w-[calc(100%-56px)]">
              <PremiumFloatingBookingBar
                rooms={rooms}
                bookingBar={bookingSettings}
                variant="hero"
              />
            </div>
          </div>
        ) : null}
      </section>

      {/* Mobile / tablet: media first, booking below — no overlap */}
      {showBooking ? (
        <div className="relative z-20 px-4 pb-6 pt-4 sm:px-6 lg:hidden">
          <PremiumFloatingBookingBar
            rooms={rooms}
            bookingBar={bookingSettings}
            variant="hero"
          />
        </div>
      ) : null}
    </>
  );
}
