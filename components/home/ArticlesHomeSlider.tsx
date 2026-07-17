"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { SafeImage } from "@/components/shared/SafeImage";
import { articleDetailPath } from "@/lib/navigation";
import type { SiteContent } from "@/lib/cms/types";

type Article = SiteContent["articles"][number];
type Section = SiteContent["articlesHomeSection"];

interface ArticlesHomeSliderProps {
  articles: Article[];
  section: Section;
  categoryMap: Record<string, string>;
  authorMap: Record<string, string>;
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function useVisibleCount() {
  const [count, setCount] = useState(3);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 768) setCount(1);
      else if (w < 1024) setCount(2);
      else setCount(3);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return count;
}

export function ArticlesHomeSlider({
  articles,
  section,
  categoryMap,
  authorMap,
}: ArticlesHomeSliderProps) {
  const visibleCount = useVisibleCount();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [stepPx, setStepPx] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  const gold = section.goldColor || "#D4AF37";
  const heading = section.headingColor || "#0F2420";
  const body = section.bodyColor || "#5A6B60";
  const border = section.borderColor || `${gold}88`;
  const radius = section.cardRadiusPx ?? 18;
  const gap = section.cardGapPx ?? 24;
  const speed = Math.max(0.35, (section.transitionSpeedMs || 700) / 1000);

  const count = articles.length;
  const canSlide = count > visibleCount;

  const measure = useCallback(() => {
    const el = containerRef.current;
    if (!el || !visibleCount) return;
    const width = el.offsetWidth;
    const cardWidth = (width - gap * (visibleCount - 1)) / visibleCount;
    setStepPx(cardWidth + gap);
  }, [gap, visibleCount]);

  useEffect(() => {
    measure();
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure, visibleCount, count]);

  useEffect(() => {
    setIndex(0);
  }, [visibleCount, count]);

  const go = useCallback(
    (dir: -1 | 1) => {
      if (!count) return;
      setIndex((current) => (current + dir + count) % count);
    },
    [count]
  );

  useEffect(() => {
    if (!section.autoSlide || paused || !canSlide) return;
    const ms = Math.max(2000, section.slideIntervalMs || 5000);
    const id = window.setInterval(() => go(1), ms);
    return () => window.clearInterval(id);
  }, [section.autoSlide, section.slideIntervalMs, paused, canSlide, go]);

  if (!count) return null;

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => {
        touchStartX.current = e.changedTouches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        if (touchStartX.current == null) return;
        const endX = e.changedTouches[0]?.clientX ?? touchStartX.current;
        const delta = endX - touchStartX.current;
        if (Math.abs(delta) > 48) go(delta > 0 ? -1 : 1);
        touchStartX.current = null;
      }}
    >
      <div ref={containerRef} className="overflow-hidden">
        <div
          className="flex will-change-transform"
          style={{
            gap,
            transform: stepPx ? `translateX(-${index * stepPx}px)` : undefined,
            transition: stepPx
              ? `transform ${speed}s cubic-bezier(0.22, 1, 0.36, 1)`
              : undefined,
          }}
          role="list"
          aria-label="Latest articles carousel"
        >
          {articles.map((article) => {
            const category = categoryMap[article.categoryId];
            const author = authorMap[article.authorId];
            const href = articleDetailPath(article.slug);

            return (
              <article
                key={article.id}
                role="listitem"
                className="group flex-shrink-0 overflow-hidden bg-[#FAF6EE] shadow-[0_16px_40px_rgba(15,36,32,0.1)] transition-shadow duration-500 hover:shadow-[0_22px_50px_rgba(15,36,32,0.16)]"
                style={{
                  width: stepPx
                    ? stepPx - gap
                    : `calc((100% - ${(visibleCount - 1) * gap}px) / ${visibleCount})`,
                  borderRadius: radius,
                  border: `1px solid ${border}`,
                }}
              >
                <Link href={href} className="flex h-full flex-col">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <SafeImage
                      src={article.coverImage}
                      alt={article.coverAlt || article.title}
                      fill
                      className="object-cover transition duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      loading="lazy"
                    />
                    <div
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0F2420]/55 via-transparent to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100"
                      aria-hidden
                    />
                    {section.showCategory !== false && category ? (
                      <span
                        className="absolute left-4 top-4 rounded-full border px-3 py-1 font-body text-[9px] font-semibold uppercase tracking-[0.2em] backdrop-blur-sm"
                        style={{
                          borderColor: `${gold}AA`,
                          backgroundColor: "rgba(250, 246, 238, 0.92)",
                          color: gold,
                        }}
                      >
                        {category}
                      </span>
                    ) : null}
                  </div>

                  <div className="flex flex-1 flex-col p-5 md:p-6">
                    <h3
                      className="font-display text-xl font-light leading-snug md:text-[1.35rem]"
                      style={{ color: heading }}
                    >
                      {article.title}
                    </h3>

                    {section.showExcerpt !== false && article.excerpt ? (
                      <p
                        className="mt-3 line-clamp-3 font-body text-sm leading-relaxed"
                        style={{ color: body }}
                      >
                        {article.excerpt}
                      </p>
                    ) : null}

                    {(section.showAuthor !== false ||
                      section.showReadingTime !== false ||
                      section.showDate !== false) && (
                      <div
                        className="mt-4 flex flex-wrap gap-x-3 gap-y-1 font-body text-[11px]"
                        style={{ color: body }}
                      >
                        {section.showAuthor !== false && author ? <span>{author}</span> : null}
                        {section.showReadingTime !== false ? (
                          <span>{article.readingTime} min read</span>
                        ) : null}
                        {section.showDate !== false ? (
                          <span>{formatDate(article.publishedAt)}</span>
                        ) : null}
                      </div>
                    )}

                    <span
                      className="mt-auto inline-flex items-center gap-2 pt-5 font-body text-[10px] font-semibold uppercase tracking-[0.2em] transition-transform duration-300 group-hover:translate-x-1"
                      style={{ color: gold }}
                    >
                      {section.readMoreText || "Read Article"}
                      <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </span>
                  </div>
                </Link>
              </article>
            );
          })}
        </div>
      </div>

      {canSlide ? (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous articles"
            className="absolute -left-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border backdrop-blur-md transition-all duration-500 hover:scale-105 md:-left-5 md:h-12 md:w-12"
            style={{
              borderColor: `${gold}AA`,
              backgroundColor: "rgba(250, 246, 238, 0.92)",
              color: gold,
              boxShadow: "0 8px 24px rgba(15, 36, 32, 0.12)",
            }}
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next articles"
            className="absolute -right-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border backdrop-blur-md transition-all duration-500 hover:scale-105 md:-right-5 md:h-12 md:w-12"
            style={{
              borderColor: `${gold}AA`,
              backgroundColor: "rgba(250, 246, 238, 0.92)",
              color: gold,
              boxShadow: "0 8px 24px rgba(15, 36, 32, 0.12)",
            }}
          >
            <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </>
      ) : null}
    </div>
  );
}
