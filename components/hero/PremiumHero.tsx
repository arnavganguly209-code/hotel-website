"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  BedDouble,
  Clock,
  ConciergeBell,
  Headphones,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
  Wifi,
} from "lucide-react";
import { PremiumFloatingBookingBar } from "@/components/booking/PremiumFloatingBookingBar";
import { SafeImage } from "@/components/shared/SafeImage";
import { luxuryEase } from "@/lib/animations";
import type { HeroBuilderSettings, HeroFeatureItem } from "@/lib/cms/hero-builder-types";
import type { SiteContent } from "@/lib/cms/types";

interface PremiumHeroProps {
  hero: HeroBuilderSettings;
  rooms: SiteContent["rooms"];
  preview?: boolean;
}

const FEATURE_ICONS: Record<string, LucideIcon> = {
  "map-pin": MapPin,
  "badge-check": BadgeCheck,
  headphones: Headphones,
  star: Star,
  "shield-check": ShieldCheck,
  clock: Clock,
  phone: Phone,
  wifi: Wifi,
  award: Award,
  sparkles: Sparkles,
  "bed-double": BedDouble,
  "concierge-bell": ConciergeBell,
};

function resolveFeatureIcon(name: string): LucideIcon {
  return FEATURE_ICONS[name?.toLowerCase?.() ?? ""] ?? Star;
}

function clampFont(mobile: string, desktop: string, vw: string) {
  return `clamp(${mobile || "1rem"}, ${vw}, ${desktop || "2rem"})`;
}

const fadeUp = (delay: number, reduced: boolean | null) => ({
  initial: reduced ? { opacity: 0 } : { opacity: 0, y: 34 },
  animate: reduced ? { opacity: 1 } : { opacity: 1, y: 0 },
  transition: { duration: 1, delay, ease: luxuryEase },
});

function FeatureItem({
  feature,
  divider,
}: {
  feature: HeroFeatureItem;
  divider: boolean;
}) {
  const Icon = resolveFeatureIcon(feature.icon);
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-3">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
          style={{
            background: "linear-gradient(180deg, #E8C878 0%, #C9A44C 60%, #B08A34 100%)",
            boxShadow: "0 8px 24px rgba(190,150,50,0.35)",
          }}
        >
          <Icon className="h-5 w-5 text-[#1E3A2A]" strokeWidth={2} />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white sm:text-xs">
            {feature.title}
          </p>
          <p className="mt-0.5 truncate text-[11px] text-white/70 sm:text-xs">
            {feature.description}
          </p>
        </div>
      </div>
      {divider ? (
        <span
          className="ml-2 hidden h-9 w-px shrink-0 lg:block"
          style={{ background: "rgba(201,164,76,0.35)" }}
          aria-hidden
        />
      ) : null}
    </div>
  );
}

export function PremiumHero({ hero, rooms, preview }: PremiumHeroProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);

  const videoSrc = hero.videoSrc;
  const imageSrc = hero.image?.src || hero.imageSrc;
  const overlayOpacity = Math.min(Math.max(hero.overlayOpacity ?? 0.4, 0), 0.85);
  const overlayColor = hero.overlayColor || "#0E1F16";
  const enableParallax = hero.image?.parallax !== false && !reducedMotion && !preview;

  const features = (hero.features ?? []).filter((f) => f.enabled !== false);
  const showFeatures = hero.showFeatures !== false && features.length > 0;
  const cta = hero.primaryButton;

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative isolate flex min-h-[100svh] w-full flex-col overflow-hidden bg-[#12271C] lg:h-[92vh] lg:min-h-[880px] lg:max-h-[950px]"
    >
      {/* ---- Background: full-bleed image (or video) with parallax + fade ---- */}
      <motion.div
        className="absolute inset-0 -z-10"
        style={enableParallax ? { y: parallaxY, scale: 1.12 } : undefined}
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: enableParallax ? 1.16 : 1.04 }}
        animate={{ opacity: 1, scale: enableParallax ? 1.12 : 1 }}
        transition={{ duration: 1.6, ease: luxuryEase }}
      >
        {videoSrc ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            poster={hero.poster || undefined}
            className="absolute inset-0 h-full w-full object-cover"
          >
            <source src={videoSrc} type={videoSrc.endsWith(".webm") ? "video/webm" : "video/mp4"} />
          </video>
        ) : imageSrc ? (
          <SafeImage
            src={imageSrc}
            alt={hero.image?.alt || hero.seo?.altText || "Hotel exterior at dusk"}
            fill
            priority
            objectFit="cover"
            sizes="100vw"
            style={{
              objectPosition: hero.image?.position || "center",
              filter: `brightness(${hero.image?.brightness ?? 100}%) contrast(${hero.image?.contrast ?? 100}%) saturate(${hero.image?.saturation ?? 100}%)`,
            }}
          />
        ) : null}
      </motion.div>

      {/* ---- Luxury dark overlay (35–45%) + legibility gradients ---- */}
      <div
        className="pointer-events-none absolute inset-0 -z-[5]"
        style={{
          background: `linear-gradient(90deg, ${overlayColor}E6 0%, ${overlayColor}66 42%, ${overlayColor}26 72%, ${overlayColor}1A 100%)`,
          opacity: overlayOpacity + 0.18,
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-[5] h-[45%]"
        style={{
          background: `linear-gradient(180deg, transparent 0%, ${overlayColor}59 55%, ${overlayColor}B3 100%)`,
        }}
        aria-hidden
      />

      {/* ---- Hero content (left) ---- */}
      <div className="relative z-10 flex flex-1 items-center">
        <div className="w-full px-5 pb-8 pt-28 sm:px-8 lg:px-14 lg:pt-32 xl:px-20">
          <div className="max-w-3xl">
            {hero.welcomeText ? (
              <motion.p
                {...fadeUp(0.15, reducedMotion)}
                className="text-[11px] font-semibold uppercase sm:text-xs"
                style={{
                  color: hero.welcomeStyle?.color || "#E3C685",
                  letterSpacing: hero.welcomeStyle?.letterSpacing || "0.3em",
                }}
              >
                {hero.welcomeText}
              </motion.p>
            ) : null}

            <motion.h1
              {...fadeUp(0.3, reducedMotion)}
              className="mt-4 font-display uppercase"
              style={{ lineHeight: hero.titleStyle?.lineHeight || "1.12" }}
            >
              {hero.title ? (
                <span
                  className="block"
                  style={{
                    color: hero.titleStyle?.color || "#FFFFFF",
                    letterSpacing: hero.titleStyle?.letterSpacing || "0.06em",
                    fontSize: clampFont(
                      hero.titleStyle?.mobileFontSize || "2rem",
                      hero.titleStyle?.desktopFontSize || "3.5rem",
                      "5vw"
                    ),
                    fontWeight: hero.titleStyle?.fontWeight || 500,
                    textShadow: "0 2px 30px rgba(0,0,0,0.35)",
                  }}
                >
                  {hero.title}
                </span>
              ) : null}
              {hero.subtitle ? (
                <span
                  className="block"
                  style={{
                    color: hero.subtitleStyle?.color || "#D9B45C",
                    letterSpacing: hero.subtitleStyle?.letterSpacing || "0.06em",
                    fontSize: clampFont(
                      hero.subtitleStyle?.mobileFontSize || "2rem",
                      hero.subtitleStyle?.desktopFontSize || "3.5rem",
                      "5vw"
                    ),
                    fontWeight: hero.subtitleStyle?.fontWeight || 500,
                    textShadow: "0 2px 30px rgba(0,0,0,0.35)",
                  }}
                >
                  {hero.subtitle}
                </span>
              ) : null}
            </motion.h1>

            {hero.description ? (
              <motion.p
                {...fadeUp(0.45, reducedMotion)}
                className="mt-6 max-w-xl whitespace-pre-line"
                style={{
                  color: hero.descriptionStyle?.color || "#F1E9DA",
                  fontSize: clampFont(
                    hero.descriptionStyle?.mobileFontSize || "0.9375rem",
                    hero.descriptionStyle?.desktopFontSize || "1.0625rem",
                    "1.4vw"
                  ),
                  lineHeight: hero.descriptionStyle?.lineHeight || "1.75",
                  letterSpacing: hero.descriptionStyle?.letterSpacing || "0.02em",
                }}
              >
                {hero.description.replace(/<[^>]*>/g, "")}
              </motion.p>
            ) : null}

            {cta?.visible && cta.text ? (
              <motion.div {...fadeUp(0.6, reducedMotion)} className="mt-9">
                <Link
                  href={cta.href || "/#overview"}
                  className="group inline-flex items-center gap-3 rounded-full border px-8 py-4 text-[11px] font-bold uppercase tracking-[0.22em] transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(201,164,76,0.35)] sm:text-xs"
                  style={{
                    borderColor: cta.borderColor || "#C9A44C",
                    color: cta.color || "#F6ECD7",
                    background: cta.backgroundColor && cta.backgroundColor !== "transparent"
                      ? cta.backgroundColor
                      : "rgba(14,31,22,0.25)",
                    backdropFilter: "blur(6px)",
                  }}
                >
                  {cta.text}
                  <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
                </Link>
              </motion.div>
            ) : null}
          </div>
        </div>
      </div>

      {/* ---- Feature icon row ---- */}
      {showFeatures ? (
        <motion.div
          {...fadeUp(0.7, reducedMotion)}
          className="relative z-10 w-full px-5 pb-6 sm:px-8 lg:px-14 xl:px-20"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-8 lg:gap-x-10">
            {features.map((feature, i) => (
              <FeatureItem key={feature.id || i} feature={feature} divider={i < features.length - 1} />
            ))}
          </div>
        </motion.div>
      ) : null}

      {/* ---- Booking bar: stretches nearly full width (20px luxury margin) ---- */}
      {hero.showBookingBar && hero.bookingBar.enabled ? (
        <div className="relative z-20 w-full px-5 pb-5 sm:px-6 sm:pb-6">
          <PremiumFloatingBookingBar rooms={rooms} bookingBar={hero.bookingBar} variant="inline" />
        </div>
      ) : null}
    </section>
  );
}
