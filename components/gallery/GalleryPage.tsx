"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { GalleryHero } from "@/components/gallery/GalleryHero";
import { LuxuryGalleryGrid } from "@/components/shared/LuxuryGalleryGrid";
import {
  GalleryLightbox,
  type GalleryLightboxItem,
} from "@/components/shared/GalleryLightbox";
import { SafeImage } from "@/components/shared/SafeImage";
import type { SiteContent } from "@/lib/cms/types";

interface GalleryPageProps {
  page: SiteContent["galleryPage"];
  items: GalleryLightboxItem[];
  categories: string[];
  hotelName: string;
}

export function GalleryPage({ page, items, categories, hotelName }: GalleryPageProps) {
  const gold = page.goldColor || "#C5A059";
  const heading = page.headingColor || "#062C24";
  const body = page.bodyColor || "#5A635C";
  const topBg = page.backgroundTop || "#F9F6EF";
  const bottomBg = page.backgroundBottom || "#E8F0E9";

  const featuredItems = useMemo(() => items.filter((i) => i.featured), [items]);

  const videoItems = useMemo(() => items.filter((i) => i.type === "video"), [items]);
  const imageItems = useMemo(() => items.filter((i) => i.type !== "video"), [items]);

  const [videoLightbox, setVideoLightbox] = useState<number | null>(null);
  const [featuredLightbox, setFeaturedLightbox] = useState<number | null>(null);

  const stripItems = imageItems.length >= 4 ? imageItems : items;

  return (
    <div className="overflow-x-clip">
      <GalleryHero hero={page.hero} />

      {/* Introduction */}
      <section
        className="relative px-6 py-20 lg:px-10 lg:py-24"
        style={{
          background: `linear-gradient(180deg, ${topBg} 0%, ${topBg} 55%, ${bottomBg} 100%)`,
        }}
      >
        <div className="mx-auto max-w-3xl text-center">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-body text-[12px] font-semibold uppercase"
            style={{ color: gold, letterSpacing: "0.34em" }}
          >
            {page.eyebrow}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="mt-4 font-display text-3xl font-light tracking-[0.02em] md:text-4xl lg:text-5xl"
            style={{ color: heading }}
          >
            {page.title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-6 max-w-xl font-body text-[15px] leading-[1.9]"
            style={{ color: body }}
          >
            {page.description}
          </motion.p>
          <div className="mx-auto mt-8 flex items-center justify-center gap-3" aria-hidden>
            <span className="h-px w-14" style={{ backgroundColor: `${gold}77` }} />
            <span className="h-1.5 w-1.5 rotate-45" style={{ backgroundColor: gold }} />
            <span className="h-px w-14" style={{ backgroundColor: `${gold}77` }} />
          </div>
        </div>
      </section>

      {/* Main gallery grid */}
      <section
        className="relative px-4 pb-20 sm:px-6 lg:px-8 lg:pb-24"
        style={{ background: bottomBg }}
      >
        <div className="mx-auto max-w-7xl">
          <LuxuryGalleryGrid
            items={items}
            categories={categories}
            showFilters={page.showFilters !== false}
            columns={page.gridColumns || 4}
            goldColor={gold}
            headingColor={heading}
            borderColor={page.borderColor}
            initialVisible={page.initialVisible ?? 8}
            loadMoreCount={page.loadMoreCount ?? 8}
          />
        </div>
      </section>

      {/* Featured collection */}
      {page.featured.enabled !== false && featuredItems.length > 0 ? (
        <section className="relative overflow-hidden bg-[#0A1F19] px-6 py-20 lg:px-10 lg:py-28">
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              background: `radial-gradient(ellipse at 20% 40%, ${gold}33 0%, transparent 55%)`,
            }}
            aria-hidden
          />
          <div className="relative z-10 mx-auto max-w-7xl">
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <p
                className="font-body text-[11px] uppercase tracking-[0.34em]"
                style={{ color: gold }}
              >
                {page.featured.eyebrow}
              </p>
              <h2 className="mt-3 font-display text-3xl font-light text-white md:text-4xl">
                {page.featured.title}
              </h2>
              <p className="mt-4 font-body text-sm leading-relaxed text-white/70">
                {page.featured.description}
              </p>
            </div>

            <div className="relative grid gap-5 md:grid-cols-12 md:gap-6">
              {featuredItems.slice(0, 4).map((item, i) => {
                const span =
                  i === 0
                    ? "md:col-span-7 md:row-span-2"
                    : i === 1
                      ? "md:col-span-5"
                      : "md:col-span-5";
                return (
                  <motion.button
                    key={item.id}
                    type="button"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    onClick={() => setFeaturedLightbox(i)}
                    className={`group relative overflow-hidden text-left ${span} ${
                      i === 0 ? "min-h-[320px] md:min-h-[480px]" : "min-h-[220px]"
                    } ${i === 2 ? "md:-mt-8" : ""} ${i === 3 ? "md:-ml-4" : ""}`}
                    style={{
                      borderRadius: 20,
                      border: `1.5px solid ${gold}55`,
                    }}
                  >
                    <SafeImage
                      src={item.type === "video" ? item.poster || item.src : item.src}
                      alt={item.alt || item.title}
                      fill
                      objectFit="cover"
                      className="object-cover transition duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 60vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-6">
                      <p
                        className="font-body text-[10px] uppercase tracking-[0.24em]"
                        style={{ color: gold }}
                      >
                        {item.category}
                      </p>
                      <p className="mt-1 font-display text-xl text-white md:text-2xl">
                        {item.title}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          <GalleryLightbox
            items={featuredItems.slice(0, 4)}
            index={featuredLightbox}
            onClose={() => setFeaturedLightbox(null)}
            onChangeIndex={setFeaturedLightbox}
            goldColor={gold}
          />
        </section>
      ) : null}

      {/* Video gallery */}
      {page.videos.enabled !== false && videoItems.length > 0 ? (
        <section
          className="px-6 py-20 lg:px-10 lg:py-24"
          style={{ background: topBg }}
        >
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <p
                className="font-body text-[11px] uppercase tracking-[0.34em]"
                style={{ color: gold }}
              >
                {page.videos.eyebrow}
              </p>
              <h2
                className="mt-3 font-display text-3xl font-light md:text-4xl"
                style={{ color: heading }}
              >
                {page.videos.title}
              </h2>
              <p className="mt-4 font-body text-sm leading-relaxed" style={{ color: body }}>
                {page.videos.description}
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {videoItems.map((item, i) => (
                <motion.button
                  key={item.id}
                  type="button"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => setVideoLightbox(i)}
                  className="group relative aspect-video overflow-hidden text-left"
                  style={{
                    borderRadius: 18,
                    border: `1.5px solid ${gold}66`,
                    boxShadow: "0 18px 40px rgba(15, 42, 34, 0.1)",
                  }}
                >
                  <SafeImage
                    src={item.poster || item.src}
                    alt={item.alt || item.title}
                    fill
                    objectFit="cover"
                    className="object-cover transition duration-700 group-hover:scale-105"
                    sizes="(max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-black/35 transition group-hover:bg-black/45" />
                  <span
                    className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 bg-black/40 backdrop-blur-sm transition group-hover:scale-110"
                    style={{ borderColor: gold }}
                  >
                    <Play className="ml-1 h-7 w-7 text-white" fill="white" />
                  </span>
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <p className="font-display text-lg text-white">{item.title}</p>
                    {item.description ? (
                      <p className="mt-0.5 line-clamp-1 font-body text-xs text-white/70">
                        {item.description}
                      </p>
                    ) : null}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          <GalleryLightbox
            items={videoItems}
            index={videoLightbox}
            onClose={() => setVideoLightbox(null)}
            onChangeIndex={setVideoLightbox}
            goldColor={gold}
          />
        </section>
      ) : null}

      {/* Instagram-style strip */}
      {page.strip.enabled !== false && stripItems.length > 0 ? (
        <InstagramStrip
          title={page.strip.title}
          items={stripItems}
          gold={gold}
          heading={heading}
          bg={bottomBg}
        />
      ) : null}

      {/* Final CTA */}
      <section className="relative overflow-hidden px-6 py-24 lg:px-10 lg:py-28">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${page.cta.backgroundImage})` }}
        />
        <div className="absolute inset-0 bg-[#0A1F19]/72" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10 mx-auto max-w-3xl text-center"
        >
          <h2 className="font-display text-3xl font-light text-white md:text-5xl">
            {page.cta.title}
          </h2>
          <p className="mx-auto mt-5 max-w-xl font-body text-sm text-white/80">
            {page.cta.description ||
              `Begin your stay with ${hotelName} — every moment awaits.`}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={page.cta.primaryHref}
              className="rounded-full px-8 py-3.5 font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0A1F19] transition hover:opacity-90"
              style={{ backgroundColor: gold }}
            >
              {page.cta.primaryText}
            </Link>
            <Link
              href={page.cta.secondaryHref}
              className="rounded-full border border-white/40 px-8 py-3.5 font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:border-[#D4AF37] hover:text-[#D4AF37]"
            >
              {page.cta.secondaryText}
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

function InstagramStrip({
  title,
  items,
  gold,
  heading,
  bg,
}: {
  title: string;
  items: GalleryLightboxItem[];
  gold: string;
  heading: string;
  bg: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const doubled = [...items, ...items];

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let raf = 0;
    let x = 0;
    const speed = 0.4;
    const tick = () => {
      if (!paused) {
        x -= speed;
        const half = el.scrollWidth / 2;
        if (Math.abs(x) >= half) x = 0;
        el.style.transform = `translateX(${x}px)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused, items.length]);

  return (
    <section className="overflow-hidden py-16" style={{ background: bg }}>
      <p
        className="mb-8 text-center font-body text-[11px] uppercase tracking-[0.34em]"
        style={{ color: gold }}
      >
        {title}
      </p>
      <div
        className="relative"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div ref={trackRef} className="flex w-max gap-3 will-change-transform">
          {doubled.map((item, i) => (
            <div
              key={`${item.id}-${i}`}
              className="relative h-36 w-36 shrink-0 overflow-hidden sm:h-44 sm:w-44"
              style={{
                borderRadius: 14,
                border: `1px solid ${gold}55`,
              }}
            >
              <SafeImage
                src={item.type === "video" ? item.poster || item.src : item.src}
                alt={item.alt || item.title}
                fill
                objectFit="cover"
                className="object-cover"
                sizes="176px"
              />
            </div>
          ))}
        </div>
        <p className="sr-only" style={{ color: heading }}>
          {title}
        </p>
      </div>
    </section>
  );
}
