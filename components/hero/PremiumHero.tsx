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
 * Homepage hero — when Orbit media mode is VIDEO, only the video is ever shown.
 * No poster, no previous hero image, no image→video fade.
 */
export function PremiumHero({ hero, rooms }: PremiumHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const perf = usePerformanceSettings();
  const revision = perf.mediaRevision || "";
  const [videoFailed, setVideoFailed] = useState(false);
  const [videoAttempt, setVideoAttempt] = useState(0);

  const imageSrc = (hero.image?.src || hero.imageSrc || "").trim();
  const videoSrc = (hero.videoSrc || "").trim();
  const hasImage = hasMediaSrc(imageSrc);
  const hasVideo = hasMediaSrc(videoSrc);

  // Respect Orbit mediaMode explicitly — video mode never falls through to image.
  const mode =
    hero.mediaMode === "none"
      ? "none"
      : hero.mediaMode === "video" && hasVideo
        ? "video"
        : hero.mediaMode === "image" && hasImage
          ? "image"
          : hasVideo
            ? "video"
            : hasImage
              ? "image"
              : "none";

  const activeVideoUrl = mode === "video" ? mediaUrl(videoSrc, revision || videoSrc) : "";
  const activeImageUrl =
    mode === "image" ? mediaUrl(imageSrc, revision || imageSrc) : "";
  const activeMediaKey =
    mode === "image"
      ? `image:${activeImageUrl}`
      : mode === "video"
        ? `video:${activeVideoUrl}`
        : "none";

  useEffect(() => {
    setVideoFailed(false);
    setVideoAttempt(0);
  }, [activeMediaKey]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || mode !== "video" || !activeVideoUrl || videoFailed) return;

    const url =
      videoAttempt > 0
        ? `${activeVideoUrl}${activeVideoUrl.includes("?") ? "&" : "?"}r=${videoAttempt}`
        : activeVideoUrl;

    try {
      video.setAttribute("src", url);
      video.load();
      const play = video.play();
      if (play && typeof play.catch === "function") {
        play.catch(() => undefined);
      }
    } catch {
      /* ignore abort while swapping Orbit media */
    }
  }, [activeMediaKey, mode, activeVideoUrl, videoAttempt, videoFailed]);

  // Soft recover hero video forever while Orbit still has a video src.
  useEffect(() => {
    if (!videoFailed || mode !== "video" || !activeVideoUrl) return;
    const id = window.setTimeout(() => {
      setVideoFailed(false);
      setVideoAttempt((n) => n + 1);
    }, 2800);
    return () => window.clearTimeout(id);
  }, [videoFailed, mode, activeVideoUrl]);

  const overlayOpacity = Math.min(Math.max(hero.overlayOpacity ?? 0.18, 0), 0.85);
  const overlayColor = hero.overlayColor || "#000000";
  const showBooking = hero.showBookingBar !== false && hero.bookingBar.enabled;

  const heroStyle = {
    "--hero-desktop-height": hero.desktopHeight?.trim() || "85vh",
    "--hero-mobile-height": hero.mobileHeight?.trim() || "70vh",
  } as CSSProperties;

  const bookingSettings = {
    ...hero.bookingBar,
    borderRadius: hero.bookingBar.borderRadius || "18px",
    responsive: {
      ...hero.bookingBar.responsive,
      desktopMaxWidth: "none",
      desktopWidth: "calc(100% - 40px)",
      mobileRadius: hero.bookingBar.responsive?.mobileRadius || "16px",
      mobilePadding: hero.bookingBar.responsive?.mobilePadding || "10px",
    },
  };

  const gracefulVideoFallback = (
    <div
      className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(201,169,110,0.14)_0%,transparent_55%),linear-gradient(160deg,#162A20_0%,#0f1f18_100%)]"
      aria-hidden
    />
  );

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
        videoFailed ? (
          gracefulVideoFallback
        ) : (
          <>
            {/* Early fetch hint — no image/poster asset is ever requested in video mode */}
            <link rel="preload" as="video" href={activeVideoUrl} />
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video
              ref={videoRef}
              key={`${activeVideoUrl}-${videoAttempt}`}
              src={
                videoAttempt > 0
                  ? `${activeVideoUrl}${activeVideoUrl.includes("?") ? "&" : "?"}r=${videoAttempt}`
                  : activeVideoUrl
              }
              autoPlay={hero.videoAutoplay !== false}
              loop={hero.videoLoop !== false}
              muted={hero.videoMuted !== false}
              playsInline
              preload="auto"
              // Intentionally NO poster — Orbit video mode must never flash an image
              className="absolute inset-0 h-full w-full transform-gpu object-cover"
              style={{ objectPosition: hero.image?.position || "center" }}
              aria-label="Hotel ambience"
              onError={() => setVideoFailed(true)}
              {...({ fetchPriority: "high" } as Record<string, string>)}
            >
              <source
                src={
                  videoAttempt > 0
                    ? `${activeVideoUrl}${activeVideoUrl.includes("?") ? "&" : "?"}r=${videoAttempt}`
                    : activeVideoUrl
                }
                type={videoMime(videoSrc)}
              />
            </video>
          </>
        )
      ) : null}

      {mode === "none" ? gracefulVideoFallback : null}
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
        <div
          key={activeMediaKey}
          data-active-hero-media={activeMediaKey}
          className="absolute inset-0 z-0 overflow-hidden bg-[#0f1f18]"
        >
          {mediaLayer}
        </div>

        <div
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{ backgroundColor: overlayColor, opacity: overlayOpacity }}
          aria-hidden
        />

        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-[22%] bg-gradient-to-t from-black/45 via-black/15 to-transparent"
          aria-hidden
        />

        {showBooking ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-[3.5%] z-20 hidden lg:block">
            <div className="pointer-events-auto mx-auto w-[calc(100%-40px)] max-w-none">
              <PremiumFloatingBookingBar
                rooms={rooms}
                bookingBar={bookingSettings}
                variant="hero"
              />
            </div>
          </div>
        ) : null}
      </section>

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
