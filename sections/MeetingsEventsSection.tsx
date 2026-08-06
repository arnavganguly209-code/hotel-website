"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Heart,
  LayoutGrid,
  Users,
  UtensilsCrossed,
} from "lucide-react";
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

const statIcons = [LayoutGrid, Users, LayoutGrid];

function resolveCardIcon(iconKey: string) {
  return cardIconMap[iconKey] || Users;
}

/**
 * Meetings & Events — shared cream frame; left (copy+image+cards)
 * and right capacities panel top/bottom flush.
 */
export function MeetingsEventsSection({ section }: MeetingsEventsSectionProps) {
  const gold = section.goldColor || "#C5A059";
  const heading = section.headingColor || "#062C24";
  const body = section.bodyColor || "#5A635C";
  const topBg = section.backgroundTop || "#F9F6EF";
  const bottomBg = section.backgroundBottom || "#E8F0E9";

  const stats = [...(section.stats ?? [])]
    .filter((s) => s.enabled !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .slice(0, 3);

  const checklist = [...(section.checklist ?? [])]
    .filter((c) => c.enabled !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const featureCards = [...(section.featureCards ?? [])]
    .filter((c) => c.enabled !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .slice(0, 3);

  const imageSrc = section.media?.imageSrc || "";
  const imageAlt = section.media?.alt || section.featuredTitle || section.title;

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

      <div className="relative mx-auto max-w-[1200px] px-4 py-8 sm:px-6 md:py-10 lg:px-8 lg:py-12">
        {/* Shared outer frame */}
        <div
          className="rounded-[22px] p-4 sm:rounded-[26px] sm:p-5 md:p-6 lg:p-7"
          style={{
            backgroundColor: "#FBF8F1",
            border: `1px solid ${gold}55`,
            boxShadow: "0 18px 44px rgba(15, 42, 34, 0.08)",
          }}
        >
          <div className="grid items-start gap-6 lg:grid-cols-2 lg:items-stretch lg:gap-7 xl:gap-8">
            {/* LEFT — header + image + feature cards (defines height) */}
            <motion.div
              variants={luxuryStagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              className="flex min-w-0 flex-col"
            >
              <motion.div
                variants={luxuryFadeUp}
                className="mb-3 flex items-center justify-center gap-3 lg:justify-start"
              >
                <span className="h-px w-8" style={{ backgroundColor: `${gold}88` }} aria-hidden />
                <p
                  className="font-body text-[10px] font-semibold uppercase sm:text-[11px]"
                  style={{ color: gold, letterSpacing: "0.28em" }}
                >
                  {section.eyebrow}
                </p>
                <span className="h-px w-8" style={{ backgroundColor: `${gold}88` }} aria-hidden />
              </motion.div>

              <motion.h2
                variants={luxuryFadeUp}
                className="text-center font-display text-[1.65rem] font-semibold uppercase leading-[1.15] tracking-[0.03em] sm:text-[1.9rem] md:text-[2.15rem] lg:text-left lg:text-[2.25rem]"
                style={{ color: heading }}
              >
                {section.title}
              </motion.h2>

              <motion.div
                variants={luxuryFadeUp}
                className="mt-3 flex items-center justify-center gap-3 lg:justify-start"
                aria-hidden
              >
                <span className="h-1.5 w-1.5 rotate-45" style={{ backgroundColor: gold }} />
              </motion.div>

              <motion.p
                variants={luxuryFadeUp}
                className="mt-3 text-center font-body text-[13px] leading-[1.7] sm:text-[14px] lg:text-left"
                style={{ color: body }}
              >
                {section.description}
              </motion.p>

              {/* Main event image */}
              <motion.div
                variants={luxuryFadeUp}
                className="relative mt-5 aspect-[16/10] w-full overflow-hidden rounded-[16px] sm:rounded-[18px] lg:min-h-0 lg:flex-1"
                style={{
                  border: `1px solid ${gold}88`,
                  boxShadow: "0 14px 32px rgba(15, 42, 34, 0.12)",
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
                  <div className="flex h-full min-h-[200px] w-full items-center justify-center bg-[#EFE8DA]">
                    <p
                      className="font-display text-xs uppercase tracking-[0.28em]"
                      style={{ color: `${gold}99` }}
                    >
                      {section.featuredTitle || "Grand Ballroom"}
                    </p>
                  </div>
                )}
              </motion.div>

              {/* Three dark-green feature cards */}
              <motion.div
                variants={luxuryFadeUp}
                className="mt-3.5 grid grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-2.5"
              >
                {featureCards.map((card) => {
                  const Icon = resolveCardIcon(card.icon);
                  return (
                    <article
                      key={card.id}
                      className="flex flex-col items-center rounded-[14px] px-3 py-4 text-center"
                      style={{
                        backgroundColor: heading,
                        border: `1px solid ${gold}44`,
                        boxShadow: "0 10px 24px rgba(6, 44, 36, 0.2)",
                      }}
                    >
                      <div
                        className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-full"
                        style={{
                          border: `1px solid ${gold}99`,
                          color: gold,
                          backgroundColor: "rgba(197,160,89,0.12)",
                        }}
                      >
                        <Icon className="h-4 w-4" strokeWidth={1.5} />
                      </div>
                      <h3
                        className="font-body text-[9px] font-bold uppercase leading-snug tracking-[0.1em] sm:text-[10px]"
                        style={{ color: gold }}
                      >
                        {card.title}
                      </h3>
                      <p className="mt-1.5 line-clamp-2 font-body text-[10px] leading-[1.45] text-white/85 sm:text-[11px]">
                        {card.description}
                      </p>
                      <ArrowRight
                        className="mt-2.5 h-3.5 w-3.5"
                        strokeWidth={1.8}
                        style={{ color: gold }}
                      />
                    </article>
                  );
                })}
              </motion.div>
            </motion.div>

            {/* RIGHT — Event Capacities (same top/bottom as left) */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.75, ease: luxuryEase }}
              className="flex min-w-0 lg:h-full"
            >
              <div
                className="flex h-full w-full flex-col rounded-[18px] p-5 sm:rounded-[20px] sm:p-6 md:p-7"
                style={{
                  backgroundColor: "#FFFFFF",
                  border: `1px solid ${gold}44`,
                  boxShadow: "0 14px 36px rgba(15, 42, 34, 0.08)",
                }}
              >
                {/* Pill badge header */}
                <div className="flex items-center justify-center gap-2.5">
                  <span className="h-px w-6" style={{ backgroundColor: `${gold}88` }} aria-hidden />
                  <span className="h-1 w-1 rotate-45" style={{ backgroundColor: gold }} aria-hidden />
                  <span
                    className="inline-flex rounded-full px-4 py-1.5 font-body text-[9px] font-semibold uppercase tracking-[0.2em] sm:text-[10px]"
                    style={{
                      backgroundColor: heading,
                      color: gold,
                      border: `1px solid ${gold}66`,
                    }}
                  >
                    {section.statsEyebrow}
                  </span>
                  <span className="h-1 w-1 rotate-45" style={{ backgroundColor: gold }} aria-hidden />
                  <span className="h-px w-6" style={{ backgroundColor: `${gold}88` }} aria-hidden />
                </div>

                {/* Stats */}
                <div className="mt-6 grid grid-cols-3 gap-2 text-center sm:gap-3">
                  {stats.map((stat, i) => {
                    const StatIcon = statIcons[i] || Users;
                    return (
                      <div key={stat.id} className="min-w-0">
                        <StatIcon
                          className="mx-auto mb-2 h-4 w-4"
                          strokeWidth={1.5}
                          style={{ color: gold }}
                        />
                        <p
                          className="font-display text-xl font-semibold leading-none sm:text-2xl"
                          style={{ color: gold }}
                        >
                          {stat.value}
                        </p>
                        <p
                          className="mt-1.5 font-body text-[8px] font-semibold uppercase leading-snug tracking-[0.1em] sm:text-[9px]"
                          style={{ color: heading }}
                        >
                          {stat.label}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="my-5 flex items-center justify-center gap-2.5" aria-hidden>
                  <span className="h-px flex-1" style={{ backgroundColor: `${gold}55` }} />
                  <span className="h-1.5 w-1.5 rotate-45" style={{ backgroundColor: gold }} />
                  <span className="h-px flex-1" style={{ backgroundColor: `${gold}55` }} />
                </div>

                <ul className="space-y-0">
                  {checklist.map((item, idx) => (
                    <li
                      key={item.id}
                      className="flex items-start gap-3 py-2.5"
                      style={
                        idx < checklist.length - 1
                          ? { borderBottom: `1px solid ${gold}22` }
                          : undefined
                      }
                    >
                      <span
                        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                        style={{
                          backgroundColor: heading,
                          border: `1px solid ${gold}66`,
                        }}
                      >
                        <Check className="h-3 w-3" strokeWidth={2.2} style={{ color: gold }} />
                      </span>
                      <span
                        className="pt-0.5 font-body text-[13px] leading-[1.5] sm:text-[14px]"
                        style={{ color: body }}
                      >
                        {item.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {section.ctaVisible !== false && section.ctaText ? (
                  <div className="mt-auto pt-6">
                    <Link
                      href={section.ctaHref || "/meetings-events"}
                      prefetch
                      className="inline-flex w-full min-h-12 items-center justify-center gap-2.5 rounded-xl px-6 py-3.5 font-body text-[11px] font-semibold uppercase tracking-[0.16em] transition-all duration-500 hover:-translate-y-0.5 sm:text-[12px]"
                      style={{
                        backgroundColor: heading,
                        color: gold,
                        border: `1px solid ${gold}66`,
                        boxShadow: `0 12px 28px rgba(6, 44, 36, 0.28), 0 0 0 1px ${gold}22`,
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
      </div>
    </section>
  );
}
