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

function TitleBlock({ title, heading, gold }: { title: string; heading: string; gold: string }) {
  const parts = title.trim().split(/\s+/);
  if (parts.length < 2) {
    return <span style={{ color: heading }}>{title}</span>;
  }
  const last = parts.pop()!;
  return (
    <>
      <span className="block" style={{ color: heading }}>
        {parts.join(" ")}
      </span>
      <span className="mt-0.5 block text-[1.05em]" style={{ color: gold }}>
        {last}
      </span>
    </>
  );
}

/**
 * Authentic Cultural Experience — reference-matched luxury layout.
 * Desktop: left image height = right column height (top + bottom flush).
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
    .slice(0, 3);

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

      <div className="relative mx-auto max-w-[1200px] px-4 py-8 sm:px-6 sm:py-9 lg:px-8 lg:py-11">
        {/* items-stretch: left image grows to right column height */}
        <div className="grid items-start gap-8 lg:grid-cols-2 lg:items-stretch lg:gap-10 xl:gap-12">
          {/* LEFT — stretches with right on desktop */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.7, ease: luxuryEase }}
            className="relative order-1 h-auto w-full lg:h-full lg:min-h-[520px]"
          >
            <HeritageImageStack
              mainSrc={mainSrc}
              mainAlt={mainAlt}
              circularSrc={content.circularImage}
              circularAlt={content.circularImageAlt}
              badge={content.badge}
              goldColor={gold}
              headingColor={heading}
              href={cardHref}
              className="h-full min-h-[480px] lg:min-h-full"
            />
          </motion.div>

          {/* RIGHT — defines column height */}
          <motion.div
            variants={luxuryStagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            className="order-2 flex min-w-0 flex-col"
          >
            <motion.div
              variants={luxuryFadeUp}
              className="mb-3 flex items-center justify-center gap-2.5 lg:justify-start"
            >
              <span className="h-1 w-1 rotate-45" style={{ backgroundColor: gold }} aria-hidden />
              <p
                className="font-display text-[10px] font-semibold uppercase sm:text-[11px]"
                style={{ color: gold, letterSpacing: "0.32em" }}
              >
                {content.eyebrow}
              </p>
              <span className="h-1 w-1 rotate-45" style={{ backgroundColor: gold }} aria-hidden />
            </motion.div>

            <motion.h2
              variants={luxuryFadeUp}
              className="text-center font-display text-[1.65rem] font-semibold uppercase leading-[1.15] tracking-[0.03em] sm:text-[1.9rem] md:text-[2.15rem] lg:text-left lg:text-[2.25rem]"
            >
              <TitleBlock title={content.title} heading={heading} gold={gold} />
            </motion.h2>

            <motion.p
              variants={luxuryFadeUp}
              className="mx-auto mt-3.5 max-w-xl text-center font-body text-[14px] leading-[1.7] md:text-[15px] lg:mx-0 lg:text-left"
              style={{ color: body }}
            >
              {description}
            </motion.p>

            {content.quote ? (
              <motion.blockquote
                variants={luxuryFadeUp}
                className="relative mx-auto mt-5 w-full rounded-xl px-5 py-4 lg:mx-0"
                style={{
                  background: "#FBF8F1",
                  border: `1px solid ${gold}55`,
                }}
              >
                <span
                  className="font-display absolute left-3.5 top-2 text-[28px] leading-none"
                  style={{ color: gold }}
                  aria-hidden
                >
                  “
                </span>
                <p
                  className="pl-4 text-center font-accent text-[14px] italic leading-relaxed md:text-[15px] lg:text-left"
                  style={{ color: heading }}
                >
                  {content.quote}
                </p>
                {content.quoteAuthor ? (
                  <footer
                    className="mt-2.5 text-center text-[9px] font-semibold uppercase tracking-[0.2em] lg:text-left"
                    style={{ color: gold }}
                  >
                    — {content.quoteAuthor}
                  </footer>
                ) : null}
              </motion.blockquote>
            ) : null}

            {/* Stats — 3-column row with gold dividers (reference style) */}
            {stats.length > 0 ? (
              <motion.div
                variants={luxuryFadeUp}
                className="mx-auto mt-5 grid w-full grid-cols-3 gap-0 lg:mx-0"
                style={{
                  borderTop: `1px solid ${gold}33`,
                  borderBottom: `1px solid ${gold}33`,
                }}
              >
                {stats.map((stat, i) => (
                  <div
                    key={stat.id || stat.label}
                    className="relative px-2 py-4 text-center sm:px-3 sm:py-5"
                    style={
                      i > 0
                        ? { borderLeft: `1px solid ${gold}44` }
                        : undefined
                    }
                  >
                    <div style={{ color: gold }}>
                      <DynamicIcon name={stat.icon} className="mx-auto mb-2 h-5 w-5" />
                    </div>
                    <p
                      className="font-display text-xl font-semibold leading-none tracking-wide sm:text-2xl"
                      style={{ color: heading }}
                    >
                      {stat.value.replace(/\s*Nearby$/i, "").replace(/\s*Years$/i, "").trim() ||
                        stat.value}
                    </p>
                    <p
                      className="mt-2 text-[8px] font-semibold uppercase leading-snug tracking-[0.12em] sm:text-[9px]"
                      style={{ color: body }}
                    >
                      {stat.label}
                    </p>
                  </div>
                ))}
              </motion.div>
            ) : null}

            {/* Culture cards — compact, fill remaining; bottoms align with image */}
            {imageCards.length > 0 ? (
              <motion.div
                variants={luxuryFadeUp}
                className="mt-5 grid flex-1 grid-cols-1 content-end gap-3 sm:grid-cols-3"
              >
                {imageCards.map((card) => {
                  const src = card.media?.imageSrc || "";
                  const href = card.href || cardHref;
                  return (
                    <Link
                      key={card.id}
                      href={href}
                      prefetch
                      className="group/card flex h-full flex-col overflow-hidden rounded-[14px] transition-all duration-500 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]/50"
                      style={{
                        backgroundColor: "#FBF8F1",
                        border: `1px solid ${gold}55`,
                        boxShadow: "0 10px 24px rgba(15, 42, 34, 0.08)",
                      }}
                      aria-label={card.title}
                    >
                      <div className="relative aspect-[16/10] overflow-hidden">
                        {src ? (
                          <SafeImage
                            src={src}
                            alt={card.media?.alt || card.title}
                            fill
                            objectFit="cover"
                            className="object-cover object-center transition-transform duration-700 ease-out group-hover/card:scale-105"
                            sizes="(max-width: 640px) 100vw, 180px"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-[#EFE8DA]">
                            <p
                              className="px-2 text-center font-display text-[9px] uppercase tracking-[0.16em]"
                              style={{ color: gold }}
                            >
                              {card.title}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col px-2.5 pb-3 pt-2.5">
                        <p
                          className="font-body text-[8px] font-semibold uppercase tracking-[0.16em]"
                          style={{ color: gold }}
                        >
                          {card.label}
                        </p>
                        <h3
                          className="mt-1 font-display text-[12px] font-semibold leading-snug sm:text-[13px]"
                          style={{ color: heading }}
                        >
                          {card.title}
                        </h3>
                        <p
                          className="mt-1 line-clamp-2 flex-1 font-body text-[10px] leading-[1.5]"
                          style={{ color: body }}
                        >
                          {card.description}
                        </p>
                        <ArrowRight
                          className="mt-2 h-3.5 w-3.5 transition-transform duration-500 group-hover/card:translate-x-0.5"
                          style={{ color: gold }}
                          strokeWidth={1.8}
                        />
                      </div>
                    </Link>
                  );
                })}
              </motion.div>
            ) : null}
          </motion.div>
        </div>

        {highlights.length > 0 ? (
          <div className="relative mt-10 md:mt-12">
            <div className="mb-5 flex items-center justify-center gap-2.5">
              <span className="h-px w-8 sm:w-12" style={{ backgroundColor: `${gold}77` }} />
              <span className="h-1 w-1 rotate-45" style={{ backgroundColor: gold }} aria-hidden />
              <p
                className="font-display text-[10px] font-semibold uppercase sm:text-[11px]"
                style={{ color: gold, letterSpacing: "0.26em" }}
              >
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
              className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
            >
              {highlights.map((item) => (
                <motion.div
                  key={item.id}
                  variants={luxuryFadeUp}
                  className="rounded-[16px] px-4 py-4 text-center transition-all duration-500 hover:-translate-y-0.5"
                  style={{
                    background: "#FBF8F1",
                    border: `1px solid ${gold}44`,
                    boxShadow: "0 8px 22px rgba(15,42,34,0.06)",
                  }}
                >
                  <div
                    className="mx-auto mb-2.5 flex h-9 w-9 items-center justify-center rounded-full"
                    style={{ color: gold, border: `1px solid ${gold}66` }}
                  >
                    <DynamicIcon name={item.icon} className="h-4 w-4" />
                  </div>
                  <h4
                    className="font-display text-[12px] font-semibold uppercase tracking-[0.1em]"
                    style={{ color: heading }}
                  >
                    {item.title}
                  </h4>
                  <p className="mt-1.5 font-body text-[12px] leading-relaxed" style={{ color: body }}>
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        ) : null}

        {content.ctaVisible !== false && content.ctaText ? (
          <div className="relative mt-8 flex justify-center">
            <Link
              href={content.ctaHref || "/cultural-experience"}
              prefetch
              className="inline-flex min-h-11 items-center gap-2 rounded-full px-8 py-2.5 font-body text-[11px] font-semibold uppercase tracking-[0.18em] transition-all duration-500 hover:-translate-y-0.5 sm:text-[12px]"
              style={{
                backgroundColor: heading,
                color: gold,
                boxShadow: "0 10px 26px rgba(6, 44, 36, 0.22)",
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
