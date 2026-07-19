"use client";

import { motion, useReducedMotion } from "framer-motion";
import { PremiumFloatingBookingBar } from "@/components/booking/PremiumFloatingBookingBar";
import { SafeImage } from "@/components/shared/SafeImage";
import { mediaUrl } from "@/lib/cms/media-url";
import { luxuryEase } from "@/lib/animations";
import type { HeroBuilderSettings } from "@/lib/cms/hero-builder-types";
import type { SiteContent } from "@/lib/cms/types";

interface PremiumHeroProps {
  hero: HeroBuilderSettings;
  rooms: SiteContent["rooms"];
  preview?: boolean;
}

function videoMime(src: string): string {
  const clean = src.split("?")[0].toLowerCase();
  if (clean.endsWith(".webm")) return "video/webm";
  if (clean.endsWith(".mov")) return "video/quicktime";
  return "video/mp4";
}

/**
 * Clean ultra-luxury hero: no headings, no copy, no CTA — the booking bar is
 * the focus. Background is a soft cream/green/gold gradient by default, or a
 * full-bleed image / autoplay video chosen from Orbit (rendered at original
 * quality, GPU-composited, no forced zoom).
 */
export function PremiumHero({ hero, rooms }: PremiumHeroProps) {
  const reducedMotion = useReducedMotion();

  const mode = hero.mediaMode ?? "none";
  const imageSrc = hero.image?.src || hero.imageSrc;
  const showVideo = mode === "video" && Boolean(hero.videoSrc);
  const showImage = mode === "image" && Boolean(imageSrc) && !showVideo;
  const hasMedia = showVideo || showImage;

  const overlayOpacity = Math.min(Math.max(hero.overlayOpacity ?? 0.35, 0), 0.85);
  const overlayColor = hero.overlayColor || "#0E1F16";

  return (
    <section
      id="hero"
      className={
        hasMedia
          ? "relative isolate flex w-full flex-col justify-end overflow-hidden bg-[#12271C] py-0 min-h-[440px] lg:h-[min(100svh,760px)] lg:min-h-[560px]"
          : "relative isolate flex w-full flex-col justify-center overflow-hidden bg-[#F7F4EA] pt-[104px] pb-14 sm:pt-[116px] sm:pb-16 lg:pt-[72px] lg:pb-0 lg:h-[min(58svh,520px)] lg:min-h-[430px]"
      }
    >
      {hasMedia ? (
        <>
          {/* ---- Full-bleed media, original quality, GPU-composited ---- */}
          <motion.div
            className="absolute inset-0 -z-10 transform-gpu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, ease: luxuryEase }}
          >
            {showVideo ? (
              <video
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                poster={mediaUrl(hero.poster, hero.poster) || undefined}
                className="absolute inset-0 h-full w-full object-cover"
                style={{ objectPosition: hero.image?.position || "center" }}
              >
                <source src={mediaUrl(hero.videoSrc, hero.videoSrc)} type={videoMime(hero.videoSrc)} />
              </video>
            ) : (
              <SafeImage
                src={imageSrc}
                alt={hero.image?.alt || hero.seo?.altText || "Hotel Thamel Park"}
                fill
                priority
                objectFit="cover"
                sizes="100vw"
                style={{ objectPosition: hero.image?.position || "center" }}
              />
            )}
          </motion.div>
          {/* Soft luxury overlay for booking bar legibility */}
          <div
            className="pointer-events-none absolute inset-0 -z-[5]"
            style={{ background: overlayColor, opacity: overlayOpacity }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 -z-[5] h-[40%]"
            style={{
              background: `linear-gradient(180deg, transparent 0%, ${overlayColor}66 60%, ${overlayColor}A6 100%)`,
            }}
            aria-hidden
          />
        </>
      ) : (
        <>
          {/* ---- Clean premium background: cream → soft green with gold accents ---- */}
          <div
            className="absolute inset-0 -z-10"
            style={{
              background:
                "linear-gradient(180deg, #FBF8F0 0%, #F5F2E6 38%, #EDF0E3 72%, #E6EDDF 100%)",
            }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 -z-[9]"
            style={{
              background:
                "radial-gradient(ellipse 60% 55% at 18% 18%, rgba(201,164,76,0.10) 0%, transparent 60%)," +
                "radial-gradient(ellipse 55% 60% at 84% 78%, rgba(24,77,61,0.08) 0%, transparent 60%)," +
                "radial-gradient(ellipse 45% 40% at 62% 8%, rgba(233,197,125,0.08) 0%, transparent 55%)",
            }}
            aria-hidden
          />
          {/* Hairline gold accents — very soft, no artwork */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 -z-[8] h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(201,164,76,0.35) 50%, transparent 100%)",
            }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -left-32 top-1/2 -z-[8] h-[420px] w-[420px] -translate-y-1/2 rounded-full blur-3xl"
            style={{ background: "rgba(238,216,179,0.22)" }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -right-32 top-1/3 -z-[8] h-[380px] w-[380px] rounded-full blur-3xl"
            style={{ background: "rgba(24,77,61,0.07)" }}
            aria-hidden
          />
        </>
      )}

      {/* ---- Booking bar: the hero's focus, full width, no side gaps ---- */}
      {hero.showBookingBar && hero.bookingBar.enabled ? (
        <motion.div
          className={hasMedia ? "relative z-20 w-full pb-4 pt-24 sm:pb-5" : "relative z-20 w-full"}
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1, ease: luxuryEase }}
        >
          <PremiumFloatingBookingBar rooms={rooms} bookingBar={hero.bookingBar} variant="inline" />
        </motion.div>
      ) : null}
    </section>
  );
}
