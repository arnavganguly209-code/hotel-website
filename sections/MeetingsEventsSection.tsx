"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check, Heart, Users, UtensilsCrossed } from "lucide-react";
import { HeritageMistBackdrop } from "@/components/home/HeritageMistBackdrop";
import { SafeImage } from "@/components/shared/SafeImage";
import type { SiteContent } from "@/lib/cms/types";
import { luxuryEase, luxuryFadeUp, luxuryStagger } from "@/lib/animations";

interface MeetingsEventsSectionProps {
  section: SiteContent["meetingsEventsSection"];
}

const cardIconMap: Record<
  string,
  React.ComponentType<{ className?: string; strokeWidth?: number }>
> = {
  users: Users,
  rings: Heart,
  cloche: UtensilsCrossed,
  heart: Heart,
};

function resolveCardIcon(iconKey: string) {
  return cardIconMap[iconKey] || Users;
}

export function MeetingsEventsSection({ section }: MeetingsEventsSectionProps) {
  const gold = section.goldColor || "#C5A059";
  const heading = section.headingColor || "#062C24";
  const body = section.bodyColor || "#5A635C";
  const topBg = section.backgroundTop || "#F9F6EF";
  const bottomBg = section.backgroundBottom || "#E8F0E9";
  const cardBg = section.cardBackgroundColor || "#FBF8F1";
  const cardBorder = section.cardBorderColor || `${gold}55`;

  const stats = [...(section.stats ?? [])]
    .filter((s) => s.enabled !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const checklist = [...(section.checklist ?? [])]
    .filter((c) => c.enabled !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const featureCards = [...(section.featureCards ?? [])]
    .filter((c) => c.enabled !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .slice(0, 3);

  const imageSrc = section.media?.imageSrc || "";
  const imageAlt =
    section.media?.alt || section.featuredTitle || section.title;
  const paddingY = section.sectionPaddingY ?? 96;

  return (
    <section
      id="meetings-events"
      aria-label="Meetings and Events"
      className="relative overflow-x-clip"
      style={{
        background: `linear-gradient(180deg, ${topBg} 0%, ${topBg} 48%, ${bottomBg} 100%)`,
      }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <HeritageMistBackdrop goldColor={gold} visible={section.showMist !== false} />
      </div>

      <div
        className="relative mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8"
        style={{ paddingTop: paddingY, paddingBottom: paddingY }}
      >
        <motion.div
          variants={luxuryStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="mb-10 max-w-2xl md:mb-12"
        >
          <motion.p
            variants={luxuryFadeUp}
            className="mb-5 font-body text-[12px] font-semibold uppercase sm:text-[13px]"
            style={{ color: gold, letterSpacing: "0.34em" }}
          >
            {section.eyebrow}
          </motion.p>

          <motion.h2
            variants={luxuryFadeUp}
            className="font-display text-[1.95rem] font-semibold uppercase leading-[1.18] tracking-[0.03em] sm:text-3xl md:text-[2.35rem] lg:text-[2.5rem]"
            style={{ color: heading }}
          >
            {section.title}
          </motion.h2>

          <motion.div
            variants={luxuryFadeUp}
            className="mt-4 flex items-center gap-3"
            aria-hidden
          >
            <span className="h-px w-10" style={{ backgroundColor: `${gold}77` }} />
            <span className="h-1.5 w-1.5 rotate-45" style={{ backgroundColor: gold }} />
            <span className="h-px w-10" style={{ backgroundColor: `${gold}77` }} />
          </motion.div>

          <motion.p
            variants={luxuryFadeUp}
            className="mt-6 max-w-xl font-body text-[15px] leading-[1.85] md:text-base"
            style={{ color: body }}
          >
            {section.description}
          </motion.p>
        </motion.div>

        {/* Two columns — left image composition + right capacities (equal visual height) */}
        <div className="grid items-stretch gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-14">
          {/* LEFT — large image + 3 feature cards */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.9, ease: luxuryEase }}
            className="flex h-full min-w-0 flex-col gap-4"
          >
            {/* Large premium event image */}
            <div
              className="relative aspect-[16/10] w-full overflow-hidden rounded-[20px] md:rounded-[22px] lg:flex-1 lg:aspect-auto lg:min-h-[280px]"
              style={{
                border: `1px solid ${gold}88`,
                boxShadow: "0 24px 52px rgba(15, 42, 34, 0.14)",
              }}
            >
              {imageSrc ? (
                <SafeImage
                  src={imageSrc}
                  alt={imageAlt}
                  fill
                  objectFit="cover"
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 560px"
                />
              ) : (
                <div className="flex h-full min-h-[220px] w-full items-center justify-center bg-[#EFE8DA]">
                  <p
                    className="font-display text-xs uppercase tracking-[0.28em]"
                    style={{ color: `${gold}99` }}
                  >
                    {section.featuredTitle || "Grand Ballroom"}
                  </p>
                </div>
              )}
            </div>

            {/* Three premium cards */}
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3 sm:gap-3.5">
              {featureCards.map((card) => {
                const Icon = resolveCardIcon(card.icon);
                const src = card.media?.imageSrc || "";
                return (
                  <article
                    key={card.id}
                    className="group relative overflow-hidden rounded-[16px] md:rounded-[18px]"
                    style={{
                      border: `1px solid ${gold}88`,
                      boxShadow: "0 16px 36px rgba(15, 42, 34, 0.12)",
                    }}
                  >
                    <div className="relative aspect-[3/4] overflow-hidden sm:aspect-[3/4] lg:min-h-[210px] lg:aspect-auto">
                      {src ? (
                        <SafeImage
                          src={src}
                          alt={card.media?.alt || card.title}
                          fill
                          objectFit="cover"
                          className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 180px"
                        />
                      ) : (
                        <div className="h-full min-h-[200px] w-full bg-[#EFE8DA]" />
                      )}

                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#062C24] via-[#062C24]/55 to-transparent opacity-90" />

                      <div className="absolute inset-x-0 bottom-0 p-3.5 sm:p-3.5">
                        <div
                          className="mb-2.5 flex h-8 w-8 items-center justify-center rounded-full"
                          style={{
                            backgroundColor: `${gold}DD`,
                            boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                          }}
                        >
                          <Icon className="h-3.5 w-3.5 text-white" strokeWidth={1.8} />
                        </div>
                        <h3
                          className="font-body text-[10px] font-bold uppercase leading-snug tracking-[0.06em] sm:text-[10px] md:text-[11px]"
                          style={{ color: gold }}
                        >
                          {card.title}
                        </h3>
                        <p className="mt-1 font-body text-[11px] leading-snug text-white/90 sm:text-[11px]">
                          {card.description}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </motion.div>

          {/* RIGHT — Event Capacities card (unchanged structure) */}
          <motion.div
            variants={luxuryStagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="flex min-w-0"
          >
            <div
              className="flex w-full flex-col rounded-[22px] p-6 sm:p-8 md:rounded-[24px] md:p-9"
              style={{
                backgroundColor: cardBg,
                border: `1px solid ${cardBorder}`,
                boxShadow: "0 24px 52px rgba(15, 42, 34, 0.12)",
              }}
            >
              <p
                className="font-body text-[11px] font-semibold uppercase tracking-[0.32em]"
                style={{ color: gold }}
              >
                {section.statsEyebrow}
              </p>

              <div className="mt-3 flex items-center gap-3" aria-hidden>
                <span className="h-px w-8" style={{ backgroundColor: `${gold}77` }} />
                <span className="h-1.5 w-1.5 rotate-45" style={{ backgroundColor: gold }} />
                <span className="h-px w-8" style={{ backgroundColor: `${gold}77` }} />
              </div>

              <div className="mt-8 grid grid-cols-3 gap-4 text-center sm:gap-6">
                {stats.map((stat) => (
                  <div key={stat.id}>
                    <p
                      className="font-display text-2xl font-semibold sm:text-3xl md:text-[2rem]"
                      style={{ color: gold }}
                    >
                      {stat.value}
                    </p>
                    <p
                      className="mt-1.5 font-body text-[11px] leading-snug sm:text-xs"
                      style={{ color: body }}
                    >
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              <div
                className="my-8 h-px w-full"
                style={{ backgroundColor: `${heading}14` }}
                aria-hidden
              />

              <ul className="space-y-3.5">
                {checklist.map((item) => (
                  <li key={item.id} className="flex items-start gap-3">
                    <Check
                      className="mt-0.5 h-4 w-4 shrink-0"
                      strokeWidth={1.8}
                      style={{ color: gold }}
                    />
                    <span
                      className="font-body text-[14px] leading-[1.65] md:text-[15px]"
                      style={{ color: body }}
                    >
                      {item.text}
                    </span>
                  </li>
                ))}
              </ul>

              {section.ctaVisible !== false && section.ctaText ? (
                <div className="mt-auto pt-9">
                  <Link
                    href={section.ctaHref || "/meetings-events"}
                    prefetch
                    className="inline-flex w-full items-center justify-center gap-2.5 rounded-full px-8 py-3.5 font-body text-[11px] font-semibold uppercase tracking-[0.18em] transition-all duration-500 hover:-translate-y-0.5"
                    style={{
                      backgroundColor: gold,
                      color: "#FFFFFF",
                      boxShadow: "0 12px 32px rgba(197, 160, 89, 0.38)",
                    }}
                  >
                    {section.ctaText}
                    <ArrowRight className="h-4 w-4" strokeWidth={1.6} />
                  </Link>
                </div>
              ) : null}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
