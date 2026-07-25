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
 * Homepage hero: cinematic Orbit media first, luxury booking bar
 * straddling the hero/next-section edge on desktop and floating below media on mobile.
 */
export function PremiumHero({ hero, rooms }: PremiumHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const perf = usePerformanceSettings();
  const revision = perf.mediaRevision || "";
  const [mediaVisible, setMediaVisible] = useState(false);
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
  const activePosterUrl =
    mode === "video" && hasMediaSrc(posterSrc)
      ? mediaUrl(posterSrc, revision || posterSrc)
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
    if (video) {
      try {
        video.pause();
        video.removeAttribute("src");
        video.load();
      } catch {
        /* ignore abort errors while swapping Orbit media */
      }
    }
  }, [activeMediaKey]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || mode === "none") return;

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
  }, [mode, activeMediaKey]);

  const overlayOpacity = Math.min(Math.max(hero.overlayOpacity ?? 0.18, 0), 0.85);
  const overlayColor = hero.overlayColor || "#000000";
  const showBooking = hero.showBookingBar !== false && hero.bookingBar.enabled;

  const heroStyle = {
    "--hero-desktop-height": hero.desktopHeight?.trim() || "78vh",
    "--hero-mobile-height": hero.mobileHeight?.trim() || "62vh",
  } as CSSProperties;

  const bookingSettings = {
    ...hero.bookingBar,
    background:
      hero.bookingBar.background ||
      "linear-gradient(135deg, rgba(28,62,48,0.94) 0%, rgba(20,46,35,0.92) 48%, rgba(26,56,42,0.94) 100%)",
    borderColor: hero.bookingBar.borderColor || "rgba(212,176,106,0.32)",
    borderRadius: hero.bookingBar.borderRadius || "18px",
    blur: Math.min(hero.bookingBar.blur ?? 22, 28),
    shadow:
      hero.bookingBar.shadow ||
      "0 22px 56px rgba(8,20,14,0.32), 0 2px 0 rgba(255,255,255,0.06) inset",
    responsive: {
      ...hero.bookingBar.responsive,
      desktopMaxWidth: "1180px",
      desktopWidth: "calc(100% - 64px)",
      mobileRadius: "18px",
      mobilePadding: "14px",
    },
  };

  return (
    <section ref={sectionRef} id="hero" className="relative isolate w-full" style={heroStyle}>
      {/* Media plane — full cinematic view, never clipped by the booking card */}
      <div className="relative h-[var(--hero-mobile-height)] min-h-[420px] max-h-[560px] w-full overflow-hidden bg-[#162A20] lg:h-[var(--hero-desktop-height)] lg:min-h-[640px] lg:max-h-[820px]">
        <div
          key={activeMediaKey}
          data-active-hero-media={activeMediaKey}
          className="absolute inset-0 -z-10 overflow-hidden bg-[#162A20]"
        >
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
              {activePosterUrl ? (
                <SafeImage
                  src={posterSrc}
                  alt=""
                  fill
                  priority
                  fadeIn={false}
                  objectFit="cover"
                  sizes="100vw"
                />
              ) : null}
              {mediaVisible ? (
                <video
                  ref={videoRef}
                  key={activeVideoUrl}
                  autoPlay={hero.videoAutoplay !== false}
                  loop={hero.videoLoop !== false}
                  muted={hero.videoMuted !== false}
                  playsInline
                  preload="auto"
                  poster={activePosterUrl || undefined}
                  className={`absolute inset-0 h-full w-full transform-gpu object-cover transition-opacity duration-200 will-change-transform ${
                    videoReady ? "opacity-100" : "opacity-0"
                  }`}
                  style={{ objectPosition: hero.image?.position || "center" }}
                  aria-label="Hotel ambience"
                  onLoadedData={() => setVideoReady(true)}
                  onError={() => setVideoReady(false)}
                >
                  <source src={activeVideoUrl} type={videoMime(videoSrc)} />
                </video>
              ) : null}
            </>
          ) : null}

          {mode === "none" ? (
            <div
              className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(201,169,110,0.14)_0%,transparent_55%),linear-gradient(160deg,#162A20_0%,#0f1f18_100%)]"
              aria-hidden
            />
          ) : null}
        </div>

        <div
          className="pointer-events-none absolute inset-0 -z-[5]"
          style={{ backgroundColor: overlayColor, opacity: overlayOpacity }}
          aria-hidden
        />

        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-28 bg-gradient-to-b from-transparent via-[#F8F3EA]/25 to-[#F8F3EA]"
          aria-hidden
        />
      </div>

      {/* One booking widget: below media on mobile; straddles hero edge on desktop */}
      {showBooking ? (
        <div className="relative z-40 -mt-8 px-4 pb-5 sm:px-6 lg:pointer-events-none lg:absolute lg:inset-x-0 lg:bottom-0 lg:mt-0 lg:translate-y-1/2 lg:px-0 lg:pb-0">
          <div className="pointer-events-auto mx-auto w-full lg:w-[min(1180px,calc(100%-4.5rem))]">
            <PremiumFloatingBookingBar
              rooms={rooms}
              bookingBar={bookingSettings}
              variant="hero"
            />
          </div>
        </div>
      ) : null}

      {/* Desktop clearance for the hanging half of the booking bar */}
      {showBooking ? <div className="hidden h-[52px] bg-[#F8F3EA] lg:block" aria-hidden /> : null}
    </section>
  );
}
