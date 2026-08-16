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
 * Homepage hero — video mode shows ONLY the configured video (no poster flash).
 * Always muted autoplay.
 */
export function PremiumHero({ hero, rooms }: PremiumHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const perf = usePerformanceSettings();
  const revision = perf.mediaRevision || "";
  const [videoFailed, setVideoFailed] = useState(false);
  const [videoAttempt, setVideoAttempt] = useState(0);

  const imageSrc = (hero.image?.src || hero.imageSrc || "").trim();
  const videoSrcDesktop = (hero.videoSrc || "").trim();
  const videoSrcMobile = (hero.videoSrcMobile || "").trim();
  const hasImage = hasMediaSrc(imageSrc);
  const hasDesktopVideo = hasMediaSrc(videoSrcDesktop);
  const hasMobileVideo = hasMediaSrc(videoSrcMobile);
  const hasVideo = hasDesktopVideo || hasMobileVideo;

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

  const desktopVideoUrl = hasDesktopVideo
    ? mediaUrl(videoSrcDesktop, revision || videoSrcDesktop)
    : "";
  const mobileVideoUrl = hasMobileVideo
    ? mediaUrl(videoSrcMobile, revision || videoSrcMobile)
    : "";
  /** Primary URL for play()/retry — desktop preferred; mobile-only setups use mobile. */
  const primaryVideoUrl = desktopVideoUrl || mobileVideoUrl;
  const activeImageUrl =
    mode === "image" ? mediaUrl(imageSrc, revision || imageSrc) : "";

  useEffect(() => {
    function goHero() {
      if (typeof window === "undefined") return;
      if (window.location.hash !== "#hero") return;
      requestAnimationFrame(() => {
        const el = sectionRef.current || document.getElementById("hero");
        el?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
    goHero();
    window.addEventListener("hashchange", goHero);
    return () => window.removeEventListener("hashchange", goHero);
  }, []);

  const activeMediaKey =
    mode === "image"
      ? `image:${activeImageUrl}`
      : mode === "video"
        ? `video:${primaryVideoUrl}|${mobileVideoUrl}`
        : "none";

  useEffect(() => {
    setVideoFailed(false);
    setVideoAttempt(0);
  }, [activeMediaKey]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || mode !== "video" || !primaryVideoUrl || videoFailed) return;

    try {
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      video.setAttribute("playsinline", "true");
      video.setAttribute("webkit-playsinline", "true");
      video.load();
      const play = video.play();
      if (play && typeof play.catch === "function") {
        play.catch(() => undefined);
      }
    } catch {
      /* ignore abort while swapping Orbit media */
    }
  }, [activeMediaKey, mode, primaryVideoUrl, videoAttempt, videoFailed]);

  useEffect(() => {
    if (!videoFailed || mode !== "video" || !primaryVideoUrl) return;
    const id = window.setTimeout(() => {
      setVideoFailed(false);
      setVideoAttempt((n) => n + 1);
    }, 2800);
    return () => window.clearTimeout(id);
  }, [videoFailed, mode, primaryVideoUrl]);

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

  const bust = (url: string) =>
    videoAttempt > 0 ? `${url}${url.includes("?") ? "&" : "?"}r=${videoAttempt}` : url;

  const mediaLayer = (
    <>
      {/* Image mode only — never show a still under video mode */}
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

      {mode === "video" && primaryVideoUrl ? (
        videoFailed ? (
          gracefulVideoFallback
        ) : (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video
            ref={videoRef}
            key={`${activeMediaKey}-${videoAttempt}`}
            autoPlay={hero.videoAutoplay !== false}
            loop={hero.videoLoop !== false}
            muted
            playsInline
            preload="auto"
            disablePictureInPicture
            controls={false}
            className="absolute inset-0 h-full w-full transform-gpu object-cover"
            style={{ objectPosition: hero.image?.position || "center center" }}
            aria-label="Hotel ambience"
            onError={() => setVideoFailed(true)}
            onPlaying={() => setVideoFailed(false)}
            {...({ fetchPriority: "high" } as Record<string, string>)}
          >
            {mobileVideoUrl ? (
              <source
                src={bust(mobileVideoUrl)}
                type={videoMime(videoSrcMobile)}
                media="(max-width: 900px)"
              />
            ) : null}
            {desktopVideoUrl ? (
              <source src={bust(desktopVideoUrl)} type={videoMime(videoSrcDesktop)} />
            ) : mobileVideoUrl ? (
              <source src={bust(mobileVideoUrl)} type={videoMime(videoSrcMobile)} />
            ) : null}
          </video>
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
