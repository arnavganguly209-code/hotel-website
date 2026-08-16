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

/**
 * Homepage hero — video mode keeps the <video> mounted at all times (no poster,
 * no image flash, no error→gradient blank). Soft-retries playback in place.
 */
export function PremiumHero({ hero, rooms }: PremiumHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const perf = usePerformanceSettings();
  const revision = perf.mediaRevision || "";
  const retryTimer = useRef<number | null>(null);
  const retryCount = useRef(0);

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

  // SSR + first paint: prefer desktop (or only available). Client may switch to mobile.
  const [playUrl, setPlayUrl] = useState(
    () => desktopVideoUrl || mobileVideoUrl
  );

  useEffect(() => {
    const desktop = desktopVideoUrl;
    const mobile = mobileVideoUrl;
    const pick = () => {
      if (typeof window === "undefined") return desktop || mobile;
      if (window.matchMedia("(max-width: 900px)").matches && mobile) return mobile;
      return desktop || mobile;
    };
    setPlayUrl(pick());
    const mq = window.matchMedia("(max-width: 900px)");
    const onChange = () => setPlayUrl(pick());
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [desktopVideoUrl, mobileVideoUrl]);

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

  useEffect(() => {
    retryCount.current = 0;
    if (retryTimer.current) {
      window.clearTimeout(retryTimer.current);
      retryTimer.current = null;
    }
  }, [playUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || mode !== "video" || !playUrl) return;

    const clearRetry = () => {
      if (retryTimer.current) {
        window.clearTimeout(retryTimer.current);
        retryTimer.current = null;
      }
    };

    const forceMuted = () => {
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      video.setAttribute("playsinline", "true");
      video.setAttribute("webkit-playsinline", "true");
      video.setAttribute("muted", "");
    };

    const tryPlay = () => {
      forceMuted();
      const p = video.play();
      if (p && typeof p.catch === "function") {
        p.catch(() => undefined);
      }
    };

    const scheduleRetry = () => {
      if (retryCount.current >= 8) return;
      clearRetry();
      const delay = Math.min(800 * 2 ** retryCount.current, 6000);
      retryTimer.current = window.setTimeout(() => {
        retryCount.current += 1;
        const bust = `${playUrl}${playUrl.includes("?") ? "&" : "?"}r=${Date.now()}`;
        forceMuted();
        // In-place retry — never unmount the video element
        video.setAttribute("src", bust);
        video.load();
        tryPlay();
      }, delay);
    };

    forceMuted();
    // JSX already sets `src={playUrl}` — do NOT call load() on mount (aborts
    // the first request and was wiping the hero to a blank gradient).
    tryPlay();

    const onPlaying = () => {
      retryCount.current = 0;
      clearRetry();
    };
    const onCanPlay = () => tryPlay();
    const onError = () => scheduleRetry();

    video.addEventListener("playing", onPlaying);
    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("error", onError);

    return () => {
      clearRetry();
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("error", onError);
    };
  }, [mode, playUrl]);

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

  const gracefulEmpty = (
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

      {mode === "video" && playUrl ? (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <video
          ref={videoRef}
          src={playUrl}
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
          {...({ fetchPriority: "high" } as Record<string, string>)}
        />
      ) : null}

      {mode === "none" ? gracefulEmpty : null}
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
          data-active-hero-media={
            mode === "video"
              ? `video:${playUrl}`
              : mode === "image"
                ? `image:${activeImageUrl}`
                : "none"
          }
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
