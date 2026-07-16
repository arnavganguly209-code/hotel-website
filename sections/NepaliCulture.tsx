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

/**
 * Premium Heritage / Cultural Experience — second homepage content section
 * (below Welcome / Luxury Showcase). Not a hero/banner.
 */
export function NepaliCulture({ content }: NepaliCultureProps) {
  const gold = content.goldColor || "#C5A059";
  const heading = content.headingColor || "#062C24";
  const body = content.bodyColor || "#5A635C";
  const topBg = content.backgroundTop || "#F9F6EF";
  const bottomBg = content.backgroundBottom || "#E8F0E9";

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

      <div className="relative mx-auto max-w-[1200px] px-4 pb-16 pt-16 sm:px-6 md:pb-20 md:pt-20 lg:px-8 lg:pb-24 lg:pt-24">
        <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-14 xl:gap-16">
          {/* Left — overlapping image composition */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.9, ease: luxuryEase }}
            className="relative overflow-visible pt-2 lg:pt-10 lg:pl-4"
          >
            <HeritageImageStack
              mainSrc={mainSrc}
              mainAlt={mainAlt}
              circularSrc={content.circularImage}
              circularAlt={content.circularImageAlt}
              badge={content.badge}
              goldColor={gold}
            />
          </motion.div>

          {/* Right — copy, quote, stats */}
          <motion.div
            variants={luxuryStagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="flex min-w-0 flex-col lg:pt-4"
          >
            <motion.div variants={luxuryFadeUp} className="mb-5 flex items-center justify-center gap-3 lg:justify-start">
              <span className="hidden h-px w-10 sm:block" style={{ backgroundColor: `${gold}88` }} />
              <span className="h-1 w-1 rotate-45" style={{ backgroundColor: gold }} aria-hidden />
              <p
                className="font-display text-[11px] font-semibold uppercase"
                style={{ color: gold, letterSpacing: "0.32em" }}
              >
                {content.eyebrow}
              </p>
              <span className="h-1 w-1 rotate-45" style={{ backgroundColor: gold }} aria-hidden />
              <span className="hidden h-px w-10 sm:block" style={{ backgroundColor: `${gold}88` }} />
            </motion.div>

            <motion.h2
              variants={luxuryFadeUp}
              className="text-center font-display text-[1.85rem] font-semibold uppercase leading-[1.2] tracking-[0.04em] sm:text-3xl md:text-[2.35rem] lg:text-left lg:text-[2.55rem]"
              style={{ color: heading }}
            >
              {content.title}
            </motion.h2>

            <motion.p
              variants={luxuryFadeUp}
              className="mx-auto mt-5 max-w-xl text-center font-body text-[15px] leading-[1.85] md:text-base lg:mx-0 lg:text-left"
              style={{ color: body }}
            >
              {description}
            </motion.p>

            {content.quote ? (
              <motion.blockquote
                variants={luxuryFadeUp}
                className="relative mx-auto mt-8 w-full max-w-xl rounded-2xl px-6 py-6 shadow-[0_14px_36px_rgba(15,42,34,0.08)] lg:mx-0"
                style={{ backgroundColor: "#FBF8F1" }}
              >
                <span
                  className="font-display absolute left-4 top-2 text-4xl leading-none"
                  style={{ color: gold }}
                  aria-hidden
                >
                  “
                </span>
                <span
                  className="font-display absolute bottom-1 right-4 text-4xl leading-none"
                  style={{ color: gold }}
                  aria-hidden
                >
                  ”
                </span>
                <p
                  className="px-2 text-center font-accent text-[15px] italic leading-relaxed md:text-base lg:text-left"
                  style={{ color: heading }}
                >
                  {content.quote}
                </p>
                {content.quoteAuthor ? (
                  <footer
                    className="mt-4 text-center text-[10px] font-semibold uppercase tracking-[0.22em] lg:text-left"
                    style={{ color: gold }}
                  >
                    — {content.quoteAuthor}
                  </footer>
                ) : null}
              </motion.blockquote>
            ) : null}

            {stats.length > 0 ? (
              <motion.div
                variants={luxuryFadeUp}
                className="mt-9 grid grid-cols-3 gap-2 sm:gap-3"
              >
                {stats.map((stat, i) => (
                  <div
                    key={stat.id || stat.label}
                    className="relative px-1 text-center"
                  >
                    {i > 0 ? (
                      <span
                        className="absolute left-0 top-2 hidden h-[68%] w-px sm:block"
                        style={{ backgroundColor: `${gold}55` }}
                        aria-hidden
                      />
                    ) : null}
                    <div style={{ color: gold }}>
                      <DynamicIcon
                        name={stat.icon}
                        className="mx-auto mb-2 h-5 w-5"
                      />
                    </div>
                    <p
                      className="font-display text-2xl font-semibold leading-none tracking-wide md:text-[1.85rem]"
                      style={{ color: heading }}
                    >
                      {stat.value}
                    </p>
                    <p
                      className="mt-2 text-[9px] font-medium uppercase leading-snug tracking-[0.14em] md:text-[10px]"
                      style={{ color: body }}
                    >
                      {stat.label}
                    </p>
                  </div>
                ))}
              </motion.div>
            ) : null}
          </motion.div>
        </div>

        {/* Premium image cards — fills space below statistics, full-width aligned */}
        {(() => {
          const imageCards = [...(content.imageCards || [])]
            .filter((c) => c.enabled !== false)
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
          if (imageCards.length === 0) return null;
          return (
            <motion.div
              variants={luxuryStagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3 lg:gap-6"
            >
              {imageCards.map((card) => {
                const src = card.media?.imageSrc || "";
                return (
                  <motion.article
                    key={card.id}
                    variants={luxuryFadeUp}
                    className="group flex h-full flex-col overflow-hidden rounded-[20px] transition-all duration-500 hover:-translate-y-1.5"
                    style={{
                      backgroundColor: "#FBF8F1",
                      border: `1px solid ${gold}66`,
                      boxShadow: "0 18px 40px rgba(15, 42, 34, 0.10)",
                    }}
                  >
                    <div className="relative aspect-[16/10] overflow-hidden">
                      {src ? (
                        <SafeImage
                          src={src}
                          alt={card.media?.alt || card.title}
                          fill
                          objectFit="cover"
                          className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-[#EFE8DA]">
                          <p
                            className="font-display text-[10px] uppercase tracking-[0.2em]"
                            style={{ color: gold }}
                          >
                            {card.title}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col px-5 pb-5 pt-5">
                      <p
                        className="font-body text-[10px] font-semibold uppercase tracking-[0.24em]"
                        style={{ color: gold }}
                      >
                        {card.label}
                      </p>
                      <h3
                        className="mt-2 font-display text-lg font-semibold leading-snug md:text-xl"
                        style={{ color: heading }}
                      >
                        {card.title}
                      </h3>
                      <p
                        className="mt-2.5 flex-1 font-body text-[13px] leading-[1.7] md:text-sm"
                        style={{ color: body }}
                      >
                        {card.description}
                      </p>
                      <div className="mt-5 flex items-center gap-3">
                        <span
                          className="h-px flex-1 max-w-[2.5rem]"
                          style={{ backgroundColor: `${gold}77` }}
                          aria-hidden
                        />
                        {card.href ? (
                          <Link
                            href={card.href}
                            prefetch
                            className="inline-flex items-center gap-1.5 font-body text-[11px] font-semibold uppercase tracking-[0.16em] transition-transform duration-500 group-hover:translate-x-0.5"
                            style={{ color: gold }}
                            aria-label={card.title}
                          >
                            <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.8} />
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </motion.div>
          );
        })()}

        {/* Experience highlights — full width under the two columns */}
        {highlights.length > 0 ? (
          <div className="relative mt-16 md:mt-20">
            <div className="mb-8 flex items-center justify-center gap-3">
              <span className="h-px w-8 sm:w-16" style={{ backgroundColor: `${gold}77` }} />
              <span className="h-1 w-1 rotate-45" style={{ backgroundColor: gold }} aria-hidden />
              <p
                className="font-display text-[11px] font-semibold uppercase"
                style={{ color: gold, letterSpacing: "0.28em" }}
              >
                {content.highlightsLabel || "Experience Highlights"}
              </p>
              <span className="h-1 w-1 rotate-45" style={{ backgroundColor: gold }} aria-hidden />
              <span className="h-px w-8 sm:w-16" style={{ backgroundColor: `${gold}77` }} />
            </div>

            <motion.div
              variants={luxuryStagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5"
            >
              {highlights.map((item) => (
                <motion.div
                  key={item.id}
                  variants={luxuryFadeUp}
                  className="group rounded-[22px] px-5 py-6 text-center shadow-[0_12px_32px_rgba(15,42,34,0.08)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,42,34,0.12)]"
                  style={{ backgroundColor: "#FBF8F1" }}
                >
                  <div
                    className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full transition-transform duration-500 group-hover:scale-105"
                    style={{ color: gold, border: `1px solid ${gold}66` }}
                  >
                    <DynamicIcon name={item.icon} className="h-5 w-5" />
                  </div>
                  <h4
                    className="font-display text-sm font-semibold uppercase tracking-[0.12em] md:text-[15px]"
                    style={{ color: heading }}
                  >
                    {item.title}
                  </h4>
                  <p
                    className="mt-2.5 font-body text-[13px] leading-relaxed md:text-sm"
                    style={{ color: body }}
                  >
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        ) : null}

        {content.ctaVisible !== false && content.ctaText ? (
          <div className="relative mt-12 flex justify-center md:mt-14">
            <Link
              href={content.ctaHref || "/cultural-experience"}
              prefetch
              className="inline-flex items-center gap-2.5 rounded-full px-8 py-3.5 font-body text-[12px] font-semibold uppercase tracking-[0.2em] transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(6,44,36,0.28)] sm:px-10 sm:text-[13px]"
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
