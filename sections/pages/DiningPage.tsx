"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Star } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { DiningReservationForm } from "@/components/dining/DiningReservationForm";
import { ImageViewer, type ImageViewerItem } from "@/components/shared/ImageViewer";
import { SafeImage } from "@/components/shared/SafeImage";
import { luxuryEase, luxuryFadeUp, luxuryStagger } from "@/lib/animations";
import type { SiteContent } from "@/lib/cms/types";

interface DiningPageProps {
  content: SiteContent["diningPage"];
}

const gold = "#C5A059";
const heading = "#062C24";
const body = "#5A635C";

function GoldDivider() {
  return (
    <div className="my-5 flex items-center gap-3" aria-hidden>
      <span className="h-px w-10" style={{ backgroundColor: `${gold}77` }} />
      <span className="h-1.5 w-1.5 rotate-45" style={{ backgroundColor: gold }} />
      <span className="h-px w-10" style={{ backgroundColor: `${gold}77` }} />
    </div>
  );
}

export function DiningPage({ content }: DiningPageProps) {
  const venues = [...content.venues]
    .filter((v) => v.enabled !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const categories = [...content.menu.categories]
    .filter((c) => c.enabled !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const [activeCategory, setActiveCategory] = useState(categories[0]?.id || "");

  useEffect(() => {
    if (categories.length && !categories.find((c) => c.id === activeCategory)) {
      setActiveCategory(categories[0].id);
    }
  }, [categories, activeCategory]);

  const activeItems = (
    categories.find((c) => c.id === activeCategory)?.items ?? []
  )
    .filter((i) => i.enabled !== false && (i.imageSrc?.trim() || i.title?.trim()))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const chefDishes = [...content.chefRecommendation.dishes]
    .filter((d) => d.enabled !== false && (d.title?.trim() || d.imageSrc?.trim()))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const chefPortraits = [...(content.chefRecommendation.portraits || [])]
    .filter((p) => p.enabled !== false && p.imageSrc)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const gallery = [...content.gallery]
    .filter((g) => g.enabled !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const reviews = [...content.reviews.items]
    .filter((r) => r.enabled !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const [reviewIndex, setReviewIndex] = useState(0);
  const [viewerItems, setViewerItems] = useState<ImageViewerItem[]>([]);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const openViewer = (items: ImageViewerItem[], index = 0) => {
    const usable = items.filter((item) => item.src);
    if (!usable.length) return;
    setViewerItems(usable);
    setViewerIndex(Math.min(index, usable.length - 1));
  };

  useEffect(() => {
    if (reviews.length <= 1) return;
    const t = setInterval(() => {
      setReviewIndex((i) => (i + 1) % reviews.length);
    }, 6500);
    return () => clearInterval(t);
  }, [reviews.length]);

  const faqs = [...content.faq.items]
    .filter((f) => f.enabled !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <div className="bg-[#F9F6EF]">
      {/* Welcome */}
      <section id="dining-welcome" className="scroll-mt-24 px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <div className="mx-auto grid max-w-[1200px] items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.9, ease: luxuryEase }}
            className="relative"
          >
            <div
              className="relative aspect-[4/5] overflow-hidden rounded-[28px] sm:aspect-[5/6]"
              style={{
                border: `1px solid ${gold}88`,
                boxShadow: "0 28px 60px rgba(15, 42, 34, 0.16)",
              }}
            >
              {content.welcome.imageSrc ? (
                <button
                  type="button"
                  className="absolute inset-0"
                  onClick={() =>
                    openViewer(
                      [
                        {
                          src: content.welcome.imageSrc,
                          alt: content.welcome.imageAlt || content.welcome.title,
                          title: content.welcome.title,
                        },
                      ],
                      0
                    )
                  }
                  aria-label="View restaurant welcome image"
                >
                  <SafeImage
                    src={content.welcome.imageSrc}
                    alt={content.welcome.imageAlt || content.welcome.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 520px"
                  />
                </button>
              ) : (
                <div className="h-full w-full bg-[#EFE8DA]" />
              )}
            </div>
          </motion.div>

          <motion.div
            variants={luxuryStagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
          >
            <motion.p
              variants={luxuryFadeUp}
              className="font-display text-[11px] font-semibold uppercase tracking-[0.32em]"
              style={{ color: gold }}
            >
              {content.welcome.eyebrow}
            </motion.p>
            <motion.h2
              variants={luxuryFadeUp}
              className="mt-4 font-display text-3xl font-light leading-tight md:text-4xl lg:text-[2.75rem]"
              style={{ color: heading }}
            >
              {content.welcome.title}
            </motion.h2>
            <GoldDivider />
            <motion.p
              variants={luxuryFadeUp}
              className="font-body text-[15px] leading-[1.85] md:text-base"
              style={{ color: body }}
            >
              {content.welcome.content}
            </motion.p>
            {content.welcome.quote ? (
              <motion.blockquote
                variants={luxuryFadeUp}
                className="mt-8 border-l-2 pl-5"
                style={{ borderColor: `${gold}99` }}
              >
                <p
                  className="font-display text-lg italic leading-relaxed md:text-xl"
                  style={{ color: heading }}
                >
                  “{content.welcome.quote}”
                </p>
                {content.welcome.quoteAuthor ? (
                  <footer className="mt-3 font-body text-xs uppercase tracking-[0.2em]" style={{ color: gold }}>
                    — {content.welcome.quoteAuthor}
                  </footer>
                ) : null}
              </motion.blockquote>
            ) : null}
          </motion.div>
        </div>
      </section>

      {/* Destinations */}
      <section className="px-4 py-8 sm:px-6 md:py-12 lg:px-8">
        <div className="mx-auto max-w-[1200px]">
          <div className="mx-auto max-w-2xl text-center">
            <p
              className="font-display text-[11px] font-semibold uppercase tracking-[0.32em]"
              style={{ color: gold }}
            >
              {content.destinations.eyebrow}
            </p>
            <h2
              className="mt-4 font-display text-3xl font-light md:text-4xl"
              style={{ color: heading }}
            >
              {content.destinations.title}
            </h2>
            <p className="mt-4 font-body text-sm leading-relaxed md:text-base" style={{ color: body }}>
              {content.destinations.description}
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 items-stretch gap-6 md:grid-cols-3 md:gap-6">
            {venues.map((venue, i) => (
              <motion.article
                key={venue.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.08, ease: luxuryEase }}
                className="group flex h-full min-h-0 flex-col overflow-hidden rounded-[22px] border bg-[#FBF8F1] transition duration-[350ms] hover:-translate-y-1"
                style={{
                  borderColor: `${gold}66`,
                  boxShadow: "0 18px 44px rgba(15, 42, 34, 0.1)",
                }}
              >
                <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden">
                  {venue.imageSrc ? (
                    <button
                      type="button"
                      className="absolute inset-0"
                      onClick={() =>
                        openViewer(
                          venues
                            .filter((entry) => entry.imageSrc)
                            .map((entry) => ({
                              src: entry.imageSrc,
                              alt: entry.imageAlt || entry.name,
                              title: entry.name,
                            })),
                          Math.max(
                            0,
                            venues.filter((entry) => entry.imageSrc).findIndex((entry) => entry.id === venue.id)
                          )
                        )
                      }
                      aria-label={`View ${venue.name} photo`}
                    >
                      <SafeImage
                        src={venue.imageSrc}
                        alt={venue.imageAlt || venue.name}
                        fill
                        className="object-cover transition duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </button>
                  ) : (
                    <div className="h-full w-full bg-[#EFE8DA]" />
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5 md:p-6">
                  <p className="min-h-[1.25rem] font-body text-xs italic leading-snug" style={{ color: gold }}>
                    {venue.tagline}
                  </p>
                  <h3
                    className="mt-2 line-clamp-2 min-h-[3.4rem] font-display text-xl font-light leading-snug md:text-[1.35rem]"
                    style={{ color: heading }}
                  >
                    {venue.name}
                  </h3>
                  <p className="mt-3 line-clamp-3 min-h-[4.2rem] font-body text-sm leading-relaxed" style={{ color: body }}>
                    {venue.description}
                  </p>
                  <dl className="mt-5 grid min-h-[4.75rem] gap-3 text-sm">
                    {[
                      ["Cuisine", venue.cuisine],
                      ["Hours", venue.hours],
                    ].map(([label, value]) =>
                      value ? (
                        <div key={label}>
                          <dt
                            className="font-body text-[10px] uppercase tracking-[0.18em]"
                            style={{ color: gold }}
                          >
                            {label}
                          </dt>
                          <dd className="mt-1 font-body" style={{ color: heading }}>
                            {value}
                          </dd>
                        </div>
                      ) : null
                    )}
                  </dl>
                  <div className="mt-4 min-h-[4.5rem]">
                    {venue.signatures?.length ? (
                      <>
                        <p
                          className="font-body text-[10px] uppercase tracking-[0.18em]"
                          style={{ color: gold }}
                        >
                          {venue.signaturesLabel}
                        </p>
                        <ul className="mt-2 flex flex-wrap gap-2">
                          {venue.signatures.slice(0, 3).map((s) => (
                            <li
                              key={s}
                              className="rounded-full border px-3 py-1 font-body text-xs"
                              style={{ borderColor: `${gold}55`, color: heading }}
                            >
                              {s}
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : null}
                  </div>
                  <a
                    href={`/dining?restaurant=${encodeURIComponent(venue.name)}#reserve-table`}
                    className="mt-auto inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full px-6 py-3 font-body text-[11px] font-semibold uppercase tracking-[0.18em] transition hover:-translate-y-0.5"
                    style={{ backgroundColor: heading, color: gold }}
                  >
                    {venue.ctaText || "Reserve Table"}
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Menu highlights */}
      <section className="px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <div className="mx-auto max-w-[1200px]">
          <div className="mx-auto max-w-2xl text-center">
            <p
              className="font-display text-[11px] font-semibold uppercase tracking-[0.32em]"
              style={{ color: gold }}
            >
              {content.menu.eyebrow}
            </p>
            <h2
              className="mt-4 font-display text-3xl font-light md:text-4xl"
              style={{ color: heading }}
            >
              {content.menu.title}
            </h2>
            <p className="mt-4 font-body text-sm leading-relaxed" style={{ color: body }}>
              {content.menu.description}
            </p>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className="min-h-11 rounded-full px-5 py-2.5 font-body text-[11px] font-semibold uppercase tracking-[0.16em] transition"
                style={
                  activeCategory === cat.id
                    ? { backgroundColor: heading, color: gold }
                    : {
                        backgroundColor: "transparent",
                        color: heading,
                        border: `1px solid ${gold}66`,
                      }
                }
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {activeItems.length === 0 ? (
              <p className="col-span-full text-center font-body text-sm" style={{ color: body }}>
                Add dishes and images for this category in Orbit — they appear here when guests open the tab.
              </p>
            ) : null}
            {activeItems.map((item, i) => (
              <motion.article
                key={`${activeCategory}-${item.id}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: i * 0.04 }}
                className="flex h-full flex-col overflow-hidden rounded-[20px] border bg-white/50"
                style={{ borderColor: `${gold}44` }}
              >
                <div className="relative aspect-[4/5] w-full shrink-0 overflow-hidden">
                  {item.imageSrc ? (
                    <button
                      type="button"
                      className="absolute inset-0"
                      onClick={() =>
                        openViewer(
                          activeItems
                            .filter((entry) => entry.imageSrc)
                            .map((entry) => ({
                              src: entry.imageSrc,
                              alt: entry.imageAlt || entry.title,
                              title: entry.title,
                            })),
                          Math.max(
                            0,
                            activeItems
                              .filter((entry) => entry.imageSrc)
                              .findIndex((entry) => entry.id === item.id)
                          )
                        )
                      }
                      aria-label={`View ${item.title}`}
                    >
                      <SafeImage
                        src={item.imageSrc}
                        alt={item.imageAlt || item.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </button>
                  ) : (
                    <div className="h-full w-full bg-[#EFE8DA]" />
                  )}
                  {item.chefRecommended ? (
                    <span
                      className="absolute left-3 top-3 rounded-full px-3 py-1 font-body text-[10px] font-semibold uppercase tracking-[0.14em]"
                      style={{ backgroundColor: heading, color: gold }}
                    >
                      Chef’s Pick
                    </span>
                  ) : null}
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-lg" style={{ color: heading }}>
                      {item.title}
                    </h3>
                    <span className="shrink-0 font-body text-sm" style={{ color: gold }}>
                      {item.price}
                    </span>
                  </div>
                  <p className="mt-2 font-body text-sm leading-relaxed" style={{ color: body }}>
                    {item.description}
                  </p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Chef recommendation */}
      {content.chefRecommendation.enabled !== false &&
      (chefDishes.length > 0 || chefPortraits.length > 0) ? (
        <section
          className="relative overflow-hidden px-4 py-16 sm:px-6 md:py-24 lg:px-8"
          style={{
            background: "linear-gradient(180deg, #E8F0E9 0%, #F9F6EF 100%)",
          }}
        >
          <div className="mx-auto max-w-[1200px]">
            {chefPortraits.length ? (
              <div className="mx-auto mb-14 grid max-w-[720px] grid-cols-2 gap-3 sm:mb-16 sm:gap-6 md:mb-20 md:gap-8">
                {chefPortraits.map((portrait, index) => (
                  <figure key={portrait.id} className="min-w-0">
                    <button
                      type="button"
                      onClick={() =>
                        openViewer(
                          chefPortraits.map((entry) => ({
                            src: entry.imageSrc,
                            alt: entry.imageAlt || entry.caption,
                            title: entry.caption,
                          })),
                          index
                        )
                      }
                      className="relative aspect-[9/16] w-full overflow-hidden rounded-[22px]"
                      style={{
                        border: `1px solid ${gold}77`,
                        boxShadow: "0 22px 48px rgba(15, 42, 34, 0.14)",
                      }}
                      aria-label={portrait.imageAlt || "Chef portrait"}
                    >
                      <SafeImage
                        src={portrait.imageSrc}
                        alt={portrait.imageAlt || portrait.caption || "Chef in the kitchen"}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 360px"
                      />
                    </button>
                    {portrait.caption ? (
                      <figcaption
                        className="mt-3 text-center font-body text-[10px] uppercase tracking-[0.2em] sm:text-[11px]"
                        style={{ color: gold }}
                      >
                        {portrait.caption}
                      </figcaption>
                    ) : null}
                  </figure>
                ))}
              </div>
            ) : null}
            <div className="mx-auto max-w-2xl text-center">
              <p
                className="font-display text-[11px] font-semibold uppercase tracking-[0.32em]"
                style={{ color: gold }}
              >
                {content.chefRecommendation.eyebrow}
              </p>
              <h2
                className="mt-4 font-display text-3xl font-light md:text-4xl"
                style={{ color: heading }}
              >
                {content.chefRecommendation.title}
              </h2>
              <p className="mt-4 font-body text-sm leading-relaxed" style={{ color: body }}>
                {content.chefRecommendation.description}
              </p>
            </div>

            <div className="relative mt-14 space-y-16 md:space-y-24">
              {chefDishes.map((dish, i) => (
                <motion.div
                  key={dish.id}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, ease: luxuryEase }}
                  className={`grid items-center gap-8 md:grid-cols-12 md:gap-6 ${
                    i % 2 === 1 ? "" : ""
                  }`}
                >
                  <div
                    className={`relative md:col-span-7 ${
                      i % 2 === 1 ? "md:order-2 md:col-start-6" : ""
                    }`}
                  >
                    <div
                      className="relative aspect-[16/11] overflow-hidden rounded-[24px] bg-[#EFE8DA]"
                      style={{
                        border: `1px solid ${gold}77`,
                        boxShadow: "0 24px 50px rgba(15, 42, 34, 0.14)",
                      }}
                    >
                      {dish.imageSrc ? (
                        <button
                          type="button"
                          className="absolute inset-0"
                          onClick={() =>
                            openViewer(
                              chefDishes
                                .filter((entry) => entry.imageSrc)
                                .map((entry) => ({
                                  src: entry.imageSrc,
                                  alt: entry.imageAlt || entry.title,
                                  title: entry.title,
                                })),
                              Math.max(
                                0,
                                chefDishes
                                  .filter((entry) => entry.imageSrc)
                                  .findIndex((entry) => entry.id === dish.id)
                              )
                            )
                          }
                          aria-label={`View ${dish.title}`}
                        >
                          <SafeImage
                            src={dish.imageSrc}
                            alt={dish.imageAlt || dish.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 60vw"
                          />
                        </button>
                      ) : null}
                    </div>
                  </div>
                  <div
                    className={`rounded-[22px] border bg-[#FBF8F1]/95 p-6 md:col-span-5 md:p-8 ${
                      i % 2 === 1
                        ? "md:order-1 md:col-start-1 md:-mr-8 md:self-center"
                        : "md:-ml-8 md:self-center"
                    }`}
                    style={{
                      borderColor: `${gold}55`,
                      boxShadow: "0 18px 40px rgba(15, 42, 34, 0.1)",
                    }}
                  >
                    <h3
                      className="font-display text-2xl font-light uppercase tracking-[0.04em]"
                      style={{ color: heading }}
                    >
                      {dish.title}
                    </h3>
                    <p className="mt-3 font-body text-sm leading-relaxed" style={{ color: body }}>
                      {dish.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Reservation */}
      <section className="px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <div className="mx-auto max-w-[900px]">
          <DiningReservationForm
            form={{
              ...content.form,
              restaurantOptions: venues.length
                ? venues.map((venue) => venue.name)
                : content.form.restaurantOptions,
            }}
          />
        </div>
      </section>

      {/* Gallery */}
      {gallery.length > 0 ? (
        <section className="px-4 py-12 sm:px-6 md:py-20 lg:px-8">
          <div className="mx-auto max-w-[1200px]">
            <div className="mx-auto max-w-2xl text-center">
              <p
                className="font-display text-[11px] font-semibold uppercase tracking-[0.32em]"
                style={{ color: gold }}
              >
                {content.gallerySection.eyebrow}
              </p>
              <h2
                className="mt-4 font-display text-3xl font-light md:text-4xl"
                style={{ color: heading }}
              >
                {content.gallerySection.title}
              </h2>
              <p className="mt-4 font-body text-sm leading-relaxed" style={{ color: body }}>
                {content.gallerySection.description}
              </p>
            </div>
            <div className="mt-12 columns-1 gap-4 sm:columns-2 lg:columns-3">
              {gallery.map((img, index) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() =>
                    openViewer(
                      gallery.map((entry) => ({
                        src: entry.src,
                        alt: entry.alt || entry.title,
                        title: entry.title,
                      })),
                      index
                    )
                  }
                  className="group mb-4 block w-full break-inside-avoid overflow-hidden rounded-[18px] text-left"
                  style={{
                    border: `1px solid ${gold}77`,
                    boxShadow: "0 12px 28px rgba(15, 42, 34, 0.08)",
                  }}
                >
                  <div className="relative aspect-[4/5] overflow-hidden sm:aspect-auto sm:min-h-[220px]">
                    <SafeImage
                      src={img.src}
                      alt={img.alt || img.title}
                      fill
                      className="object-cover transition duration-700 group-hover:scale-110"
                      sizes="(max-width: 640px) 100vw, 33vw"
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Reviews */}
      {reviews.length > 0 ? (
        <section className="px-4 py-16 sm:px-6 md:py-24 lg:px-8">
          <div className="mx-auto max-w-[900px]">
            <div className="text-center">
              <p
                className="font-display text-[11px] font-semibold uppercase tracking-[0.32em]"
                style={{ color: gold }}
              >
                {content.reviews.eyebrow}
              </p>
              <h2
                className="mt-4 font-display text-3xl font-light md:text-4xl"
                style={{ color: heading }}
              >
                {content.reviews.title}
              </h2>
            </div>

            <div className="relative mt-12">
              <AnimatePresence mode="wait">
                <motion.article
                  key={reviews[reviewIndex]?.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.4 }}
                  className="rounded-[24px] border bg-[#FBF8F1] p-8 text-center md:p-12"
                  style={{
                    borderColor: `${gold}55`,
                    boxShadow: "0 20px 48px rgba(15, 42, 34, 0.1)",
                  }}
                >
                  <div className="mx-auto flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border"
                    style={{ borderColor: gold }}
                  >
                    {reviews[reviewIndex]?.photoSrc ? (
                      <SafeImage
                        src={reviews[reviewIndex].photoSrc}
                        alt={reviews[reviewIndex].name}
                        width={64}
                        height={64}
                        className="h-16 w-16 object-cover"
                      />
                    ) : (
                      <span className="font-display text-xl" style={{ color: gold }}>
                        {reviews[reviewIndex]?.name?.charAt(0) || "G"}
                      </span>
                    )}
                  </div>
                  <div className="mt-4 flex justify-center gap-1">
                    {Array.from({ length: 5 }).map((_, si) => (
                      <Star
                        key={si}
                        className="h-4 w-4"
                        fill={si < (reviews[reviewIndex]?.rating || 0) ? gold : "transparent"}
                        color={gold}
                      />
                    ))}
                  </div>
                  <p
                    className="mx-auto mt-6 max-w-xl font-display text-lg italic leading-relaxed md:text-xl"
                    style={{ color: heading }}
                  >
                    “{reviews[reviewIndex]?.review}”
                  </p>
                  <p className="mt-6 font-display text-base" style={{ color: heading }}>
                    {reviews[reviewIndex]?.name}
                  </p>
                  <p className="mt-1 font-body text-xs uppercase tracking-[0.2em]" style={{ color: gold }}>
                    {reviews[reviewIndex]?.country}
                  </p>
                </motion.article>
              </AnimatePresence>
              {reviews.length > 1 ? (
                <div className="mt-6 flex justify-center gap-3">
                  <button
                    type="button"
                    aria-label="Previous review"
                    onClick={() =>
                      setReviewIndex((i) => (i - 1 + reviews.length) % reviews.length)
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-full border"
                    style={{ borderColor: `${gold}66`, color: heading }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next review"
                    onClick={() => setReviewIndex((i) => (i + 1) % reviews.length)}
                    className="flex h-10 w-10 items-center justify-center rounded-full border"
                    style={{ borderColor: `${gold}66`, color: heading }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {/* FAQ */}
      {faqs.length > 0 ? (
        <section className="px-4 py-12 sm:px-6 md:py-20 lg:px-8">
          <div className="mx-auto max-w-[800px]">
            <div className="text-center">
              <p
                className="font-display text-[11px] font-semibold uppercase tracking-[0.32em]"
                style={{ color: gold }}
              >
                {content.faq.eyebrow}
              </p>
              <h2
                className="mt-4 font-display text-3xl font-light md:text-4xl"
                style={{ color: heading }}
              >
                {content.faq.title}
              </h2>
              <p className="mt-4 font-body text-sm leading-relaxed" style={{ color: body }}>
                {content.faq.description}
              </p>
            </div>
            <Accordion type="single" collapsible className="mt-10 space-y-3">
              {faqs.map((item) => (
                <AccordionItem
                  key={item.id}
                  value={item.id}
                  className="rounded-[16px] border px-5 data-[state=open]:bg-[#FBF8F1]"
                  style={{ borderColor: `${gold}44` }}
                >
                  <AccordionTrigger className="font-display text-left text-base hover:no-underline" style={{ color: heading }}>
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="font-body text-sm leading-relaxed" style={{ color: body }}>
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      ) : null}

      {/* Final CTA */}
      <section className="relative overflow-hidden px-4 py-20 sm:px-6 md:py-28 lg:px-8">
        {content.cta.backgroundImage ? (
          <SafeImage
            src={content.cta.backgroundImage}
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
          />
        ) : null}
        <div className="absolute inset-0 bg-[#062C24]/78" aria-hidden />
        <div className="relative mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl font-light text-white md:text-4xl lg:text-5xl">
            {content.cta.title}
          </h2>
          <p className="mx-auto mt-5 max-w-xl font-body text-sm leading-relaxed text-white/75 md:text-base">
            {content.cta.description}
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href={content.cta.buttonHref || "#reserve-table"}
              className="inline-flex min-h-12 items-center gap-2 rounded-full px-8 py-3.5 font-body text-[11px] font-semibold uppercase tracking-[0.18em] transition hover:-translate-y-0.5"
              style={{ backgroundColor: gold, color: heading }}
            >
              {content.cta.buttonText}
              <ArrowRight className="h-4 w-4" />
            </a>
            {content.cta.secondaryText ? (
              <Link
                href={content.cta.secondaryHref || "/contact"}
                className="inline-flex min-h-12 items-center rounded-full border border-white/40 px-8 py-3.5 font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:border-[#C5A059] hover:text-[#C5A059]"
              >
                {content.cta.secondaryText}
              </Link>
            ) : null}
          </div>
        </div>
      </section>
      <ImageViewer
        items={viewerItems}
        index={viewerIndex}
        onClose={() => setViewerIndex(null)}
        onChangeIndex={setViewerIndex}
      />
    </div>
  );
}
