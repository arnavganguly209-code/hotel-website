"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { HeritageImageStack } from "@/components/home/HeritageImageStack";
import { HeritageMistBackdrop } from "@/components/home/HeritageMistBackdrop";
import { DynamicIcon } from "@/components/shared/DynamicIcon";
import { SafeImage } from "@/components/shared/SafeImage";
import { luxuryEase, luxuryFadeUp, luxuryStagger } from "@/lib/animations";
import type { SiteContent } from "@/lib/cms/types";

interface NepaliCultureProps {
  content: SiteContent["culture"];
}

function TitleWithGoldAccent({ title, heading, gold }: { title: string; heading: string; gold: string }) {
  const parts = title.trim().split(/\s+/);
  if (parts.length < 2) {
    return <span style={{ color: heading }}>{title}</span>;
  }
  const last = parts.pop()!;
  return (
    <>
      <span style={{ color: heading }}>{parts.join(" ")} </span>
      <span style={{ color: gold }}>{last}</span>
    </>
  );
}

/**
 * Premium Heritage / Cultural Experience — homepage section
 * Hyatt / JW Marriott style: top-aligned image + content, glass stats, full-card links.
 */
export function NepaliCulture({ content }: NepaliCultureProps) {
  const gold = content.goldColor || "#C5A059";
  const heading = content.headingColor || "#062C24";
  const body = content.bodyColor || "#5A635C";
  const topBg = content.backgroundTop || "#F9F6EF";
  const bottomBg = content.backgroundBottom || "#E8F0E9";
  const cardHref = content.ctaHref || "/cultural-experience";

  const mainSrc = content.media?.imageSrc || content.imageSrc || "";
  const mainAlt = content.media?.alt || content.title;
  const description =
    content.description?.trim() ||
    content.content.split(/\n\n+/).filter(Boolean)[0] ||
    "";

  const stats = [...(content.stats || [])]
    .filter((s) => s.enabled !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .slice(0, 4);

  const highlights = [...(content.highlights || [])]
    .filter((h) => h.enabled !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .slice(0, 4);

  const imageCards = [...(content.imageCards || [])]
    .filter((c) => c.enabled !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <section
      id="culture"
      aria-label="Cultural experience"
      className="relative overflow-x-clip"
      style={{
        background: `linear-gradient(180deg, ${topBg} 0%, ${topBg} 55%, ${bottomBg} 100%)`,
      }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <HeritageMistBackdrop goldColor={gold} visible={content.showMist !== false} />
      </div>

      <div className="relative mx-auto max-w-[1200px] px-4 py-7 sm:px-6 sm:py-8 md:py-9 lg:px-8 lg:py-10">
        {/* Desktop: image | content — items-start so tops align */}
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,1fr)] lg:gap-12 xl:gap-14">
          {/* Left — image (no extra top padding that drops the frame) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.75, ease: luxuryEase }}
            className="relative order-1 w-full pb-6 lg:order-1 lg:pb-8"
          >
            <HeritageImageStack
              mainSrc={mainSrc}
              mainAlt={mainAlt}
              circularSrc={content.circularImage}
              circularAlt={content.circularImageAlt}
              badge={content.badge}
              goldColor={gold}
              href={cardHref}
            />
          </motion.div>

          {/* Right — copy + stats + culture cards */}
          <motion.div
            variants={luxuryStagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="order-2 flex min-w-0 flex-col lg:order-2"
          >
            <motion.div variants={luxuryFadeUp} className="mb-3.5 flex items-center justify-center gap-2.5 lg:justify-start">
              <span className="hidden h-px w-8 sm:block" style={{ backgroundColor: `${gold}88` }} />
              <span className="h-1 w-1 rotate-45" style={{ backgroundColor: gold }} aria-hidden />
              <p
                className="font-display text-[10px] font-semibold uppercase sm:text-[11px]"
                style={{ color: gold, letterSpacing: "0.3em" }}
              >
                {content.eyebrow}
              </p>
              <span className="h-1 w-1 rotate-45" style={{ backgroundColor: gold }} aria-hidden />
              <span className="hidden h-px w-8 sm:block" style={{ backgroundColor: `${gold}88` }} />
            </motion.div>

            <motion.h2
              variants={luxuryFadeUp}
              className="text-center font-display text-[1.7rem] font-semibold uppercase leading-[1.18] tracking-[0.04em] sm:text-[1.95rem] md:text-[2.2rem] lg:text-left lg:text-[2.35rem]"
            >
              <TitleWithGoldAccent title={content.title} heading={heading} gold={gold} />
            </motion.h2>

            <motion.p
              variants={luxuryFadeUp}
              className="mx-auto mt-4 max-w-lg text-center font-body text-[14px] leading-[1.75] md:text-[15px] lg:mx-0 lg:text-left"
              style={{ color: body }}
            >
              {description}
            </motion.p>

            {/* Gold divider */}
            <motion.div variants={luxuryFadeUp} className="mx-auto mt-5 flex items-center gap-2.5 lg:mx-0" aria-hidden>
              <span className="h-px w-10" style={{ backgroundColor: `${gold}77` }} />
              <span className="h-1 w-1 rotate-45" style={{ backgroundColor: gold }} />
              <span className="h-px w-10" style={{ backgroundColor: `${gold}77` }} />
            </motion.div>

            {content.quote ? (
              <motion.blockquote
                variants={luxuryFadeUp}
                className="relative mx-auto mt-5 w-full max-w-lg rounded-2xl px-5 py-5 lg:mx-0"
                style={{
                  background: "rgba(251,248,241,0.92)",
                  border: `1px solid ${gold}55`,
                  boxShadow: "0 12px 28px rgba(15,42,34,0.07)",
                }}
              >
                <span className="font-display absolute left-3.5 top-1.5 text-3xl leading-none" style={{ color: gold }} aria-hidden>
                  “
                </span>
                <p className="px-2 text-center font-accent text-[14px] italic leading-relaxed md:text-[15px] lg:text-left" style={{ color: heading }}>
                  {content.quote}
                </p>
                {content.quoteAuthor ? (
                  <footer className="mt-3 text-center text-[9px] font-semibold uppercase tracking-[0.2em] lg:text-left" style={{ color: gold }}>
                    — {content.quoteAuthor}
                  </footer>
                ) : null}
              </motion.blockquote>
            ) : null}

            {/* Premium 2×2 glass stats — replaces old thin row */}
            {stats.length > 0 ? (
              <motion.div
                variants={luxuryFadeUp}
                className="mx-auto mt-6 grid w-full max-w-lg grid-cols-2 gap-2.5 sm:gap-3 lg:mx-0"
              >
                {stats.map((stat) => (
                  <div
                    key={stat.id || stat.label}
                    className="group/stat flex min-h-[88px] flex-col justify-center rounded-2xl px-3.5 py-3.5 transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(15,42,34,0.10)] sm:min-h-[96px] sm:px-4 sm:py-4"
                    style={{
                      background: "rgba(251,248,241,0.88)",
                      border: `1px solid ${gold}66`,
                      boxShadow: "0 8px 22px rgba(15,42,34,0.06)",
                    }}
                  >
                    <div className="mb-1.5 flex items-center gap-2" style={{ color: gold }}>
                      <DynamicIcon name={stat.icon} className="h-4 w-4 shrink-0 transition-transform duration-500 group-hover/stat:scale-110" />
                      <p className="font-body text-[9px] font-semibold uppercase tracking-[0.16em] sm:text-[10px]" style={{ color: gold }}>
                        {stat.label}
                      </p>
                    </div>
                    <p className="font-display text-lg font-semibold leading-tight tracking-wide sm:text-xl" style={{ color: heading }}>
                      {stat.value}
                    </p>
                  </div>
                ))}
              </motion.div>
            ) : null}

            {/* Culture cards — entire card clickable */}
            {imageCards.length > 0 ? (
              <motion.div
                variants={luxuryFadeUp}
                className="mt-6 -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 snap-x snap-mandatory sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-3 sm:overflow-visible sm:px-0 sm:pb-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {imageCards.map((card) => {
                  const src = card.media?.imageSrc || "";
                  const href = card.href || cardHref;
                  const inner = (
                    <>
                      <div className="relative aspect-[16/10] overflow-hidden">
                        {src ? (
                          <SafeImage
                            src={src}
                            alt={card.media?.alt || card.title}
                            fill
                            objectFit="cover"
                            className="object-cover object-center transition-transform duration-700 ease-out group-hover/card:scale-105"
                            sizes="(max-width: 640px) 70vw, (max-width: 1024px) 33vw, 180px"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-[#EFE8DA]">
                            <p className="px-2 text-center font-display text-[9px] uppercase tracking-[0.16em]" style={{ color: gold }}>
                              {card.title}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col px-3 pb-3.5 pt-3">
                        <p className="font-body text-[9px] font-semibold uppercase tracking-[0.18em]" style={{ color: gold }}>
                          {card.label}
                        </p>
                        <h3 className="mt-1.5 font-display text-[13px] font-semibold leading-snug sm:text-sm" style={{ color: heading }}>
                          {card.title}
                        </h3>
                        <p className="mt-1.5 line-clamp-3 flex-1 font-body text-[11px] leading-[1.55]" style={{ color: body }}>
                          {card.description}
                        </p>
                        <div className="mt-3 flex items-center gap-2" style={{ color: gold }}>
                          <span className="h-px w-6" style={{ backgroundColor: `${gold}77` }} aria-hidden />
                          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover/card:translate-x-0.5" strokeWidth={1.8} />
                        </div>
                      </div>
                    </>
                  );

                  return (
                    <Link
                      key={card.id}
                      href={href}
                      prefetch
                      className="group/card flex w-[78%] max-w-[260px] shrink-0 snap-start flex-col overflow-hidden rounded-[16px] transition-all duration-500 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]/50 sm:w-auto sm:max-w-none"
                      style={{
                        backgroundColor: "#FBF8F1",
                        border: `1px solid ${gold}66`,
                        boxShadow: "0 12px 28px rgba(15, 42, 34, 0.09)",
                      }}
                      aria-label={card.title}
                    >
                      {inner}
                    </Link>
                  );
                })}
              </motion.div>
            ) : null}
          </motion.div>
        </div>

        {/* Experience highlights — compact */}
        {highlights.length > 0 ? (
          <div className="relative mt-10 md:mt-12">
            <div className="mb-5 flex items-center justify-center gap-2.5">
              <span className="h-px w-8 sm:w-12" style={{ backgroundColor: `${gold}77` }} />
              <span className="h-1 w-1 rotate-45" style={{ backgroundColor: gold }} aria-hidden />
              <p className="font-display text-[10px] font-semibold uppercase sm:text-[11px]" style={{ color: gold, letterSpacing: "0.26em" }}>
                {content.highlightsLabel || "Experience Highlights"}
              </p>
              <span className="h-1 w-1 rotate-45" style={{ backgroundColor: gold }} aria-hidden />
              <span className="h-px w-8 sm:w-12" style={{ backgroundColor: `${gold}77` }} />
            </div>

            <motion.div
              variants={luxuryStagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-3.5"
            >
              {highlights.map((item) => (
                <motion.div
                  key={item.id}
                  variants={luxuryFadeUp}
                  className="group rounded-[18px] px-4 py-5 text-center transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(15,42,34,0.10)]"
                  style={{
                    background: "rgba(251,248,241,0.92)",
                    border: `1px solid ${gold}44`,
                    boxShadow: "0 10px 26px rgba(15,42,34,0.06)",
                  }}
                >
                  <div
                    className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full transition-transform duration-500 group-hover:scale-105"
                    style={{ color: gold, border: `1px solid ${gold}66` }}
                  >
                    <DynamicIcon name={item.icon} className="h-4 w-4" />
                  </div>
                  <h4 className="font-display text-[13px] font-semibold uppercase tracking-[0.1em]" style={{ color: heading }}>
                    {item.title}
                  </h4>
                  <p className="mt-2 font-body text-[12px] leading-relaxed md:text-[13px]" style={{ color: body }}>
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        ) : null}

        {content.ctaVisible !== false && content.ctaText ? (
          <div className="relative mt-8 flex justify-center md:mt-9">
            <Link
              href={content.ctaHref || "/cultural-experience"}
              prefetch
              className="inline-flex min-h-12 items-center gap-2.5 rounded-full px-8 py-3 font-body text-[11px] font-semibold uppercase tracking-[0.18em] transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(6,44,36,0.28)] sm:px-9 sm:text-[12px]"
              style={{
                backgroundColor: heading,
                color: gold,
                boxShadow: "0 10px 28px rgba(6, 44, 36, 0.22)",
              }}
            >
              {content.ctaText}
              <ArrowRight className="h-4 w-4" strokeWidth={1.6} />
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
