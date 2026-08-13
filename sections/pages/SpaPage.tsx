"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Star } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { DynamicIcon } from "@/components/shared/DynamicIcon";
import { ImageViewer, type ImageViewerItem } from "@/components/shared/ImageViewer";
import { SafeImage } from "@/components/shared/SafeImage";
import { luxuryEase, luxuryFadeUp, luxuryStagger } from "@/lib/animations";
import type { SiteContent } from "@/lib/cms/types";

interface SpaPageProps {
  content: SiteContent["spaPage"];
}

const gold = "#C5A059";
const heading = "#062C24";
const body = "#5A635C";
const EXTERNAL_SPA = "https://hotelthamelparkspa.com/";

function spaHref(href?: string) {
  const value = (href || "").trim();
  if (!value) return EXTERNAL_SPA;
  return value;
}

function GoldDivider() {
  return (
    <div className="my-5 flex items-center gap-3" aria-hidden>
      <span className="h-px w-10" style={{ backgroundColor: `${gold}77` }} />
      <span className="h-1.5 w-1.5 rotate-45" style={{ backgroundColor: gold }} />
      <span className="h-px w-10" style={{ backgroundColor: `${gold}77` }} />
    </div>
  );
}

export function SpaPage({ content }: SpaPageProps) {
  const facilities = [...(content.facilities?.items ?? [])]
    .filter((f) => f.enabled !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const why = [...(content.whyChoose?.items ?? [])]
    .filter((w) => w.enabled !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const testimonials = [...(content.testimonials?.items ?? [])]
    .filter((t) => t.enabled !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const faqs = [...(content.faq?.items ?? [])]
    .filter((f) => f.enabled !== false)
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

  const facilityViewerItems: ImageViewerItem[] = facilities
    .filter((f) => f.imageSrc)
    .map((f) => ({
      src: f.imageSrc,
      alt: f.imageAlt || f.name,
      title: f.name,
    }));

  useEffect(() => {
    if (testimonials.length <= 1) return;
    const t = setInterval(() => {
      setReviewIndex((i) => (i + 1) % testimonials.length);
    }, 6500);
    return () => clearInterval(t);
  }, [testimonials.length]);

  const bookHref = spaHref(content.booking?.buttonHref);
  const bookLabel = content.booking?.buttonText?.trim() || "Book Now";
  const ctaHref = spaHref(content.cta?.buttonHref);
  const ctaLabel = content.cta?.buttonText?.trim() || "Book Now";

  return (
    <div className="overflow-x-hidden bg-[#F9F6EF]">
      {/* Introduction */}
      <section id="spa-introduction" className="scroll-mt-24 px-4 py-12 sm:px-6 sm:py-16 md:py-24 lg:px-8">
        <div className="mx-auto grid max-w-[1200px] items-center gap-8 sm:gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.9, ease: luxuryEase }}
            className="relative min-w-0"
          >
            <div
              className="relative aspect-[4/5] overflow-hidden rounded-[20px] sm:aspect-[5/6] sm:rounded-[28px]"
              style={{
                border: `1px solid ${gold}`,
                boxShadow: "0 28px 60px rgba(15, 42, 34, 0.16)",
              }}
            >
              {content.introduction.imageSrc ? (
                <button
                  type="button"
                  className="absolute inset-0"
                  onClick={() =>
                    openViewer(
                      [
                        {
                          src: content.introduction.imageSrc,
                          alt: content.introduction.imageAlt || content.introduction.title,
                          title: content.introduction.title,
                        },
                      ],
                      0
                    )
                  }
                  aria-label="View spa introduction image"
                >
                  <SafeImage
                    src={content.introduction.imageSrc}
                    alt={content.introduction.imageAlt || content.introduction.title}
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
            className="min-w-0"
          >
            <motion.p
              variants={luxuryFadeUp}
              className="break-words font-display text-[10px] font-semibold uppercase tracking-[0.2em] sm:text-[11px] sm:tracking-[0.32em]"
              style={{ color: gold }}
            >
              {content.introduction.eyebrow}
            </motion.p>
            <motion.h2
              variants={luxuryFadeUp}
              className="mt-3 break-words font-display text-[1.75rem] font-light leading-snug sm:mt-4 sm:text-3xl md:text-4xl lg:text-[2.75rem]"
              style={{ color: heading }}
            >
              {content.introduction.title}
            </motion.h2>
            <GoldDivider />
            <motion.p
              variants={luxuryFadeUp}
              className="break-words font-body text-[15px] leading-[1.85] md:text-base"
              style={{ color: body }}
            >
              {content.introduction.content}
            </motion.p>
            {content.introduction.quote ? (
              <motion.blockquote
                variants={luxuryFadeUp}
                className="mt-6 border-l-2 pl-4 sm:mt-8 sm:pl-5"
                style={{ borderColor: `${gold}99` }}
              >
                <p
                  className="break-words font-display text-base italic leading-relaxed sm:text-lg md:text-xl"
                  style={{ color: heading }}
                >
                  “{content.introduction.quote}”
                </p>
                {content.introduction.quoteAuthor ? (
                  <footer
                    className="mt-3 break-words font-body text-xs uppercase tracking-[0.16em] sm:tracking-[0.2em]"
                    style={{ color: gold }}
                  >
                    — {content.introduction.quoteAuthor}
                  </footer>
                ) : null}
              </motion.blockquote>
            ) : null}
          </motion.div>
        </div>
      </section>

      {/* Facilities — alternating like dining chef dishes */}
      {facilities.length > 0 ? (
        <section
          id="spa-facilities"
          className="scroll-mt-24 px-4 py-12 sm:px-6 sm:py-16 md:py-24 lg:px-8"
          style={{ background: "linear-gradient(180deg, #F3EEE3 0%, #F9F6EF 48%, #F9F6EF 100%)" }}
        >
          <div className="mx-auto max-w-[1200px]">
            <div className="mx-auto max-w-2xl text-center">
              <p
                className="break-words font-display text-[10px] font-semibold uppercase tracking-[0.2em] sm:text-[11px] sm:tracking-[0.32em]"
                style={{ color: gold }}
              >
                {content.facilities.eyebrow}
              </p>
              <h2
                className="mt-3 break-words font-display text-[1.75rem] font-light leading-snug sm:mt-4 sm:text-3xl md:text-4xl"
                style={{ color: heading }}
              >
                {content.facilities.title}
              </h2>
              {content.facilities.description ? (
                <p
                  className="mt-3 break-words font-body text-sm leading-relaxed sm:mt-4"
                  style={{ color: body }}
                >
                  {content.facilities.description}
                </p>
              ) : null}
            </div>

            <div className="relative mt-10 space-y-12 sm:mt-14 sm:space-y-16 md:space-y-24">
              {facilities.map((room, i) => (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, ease: luxuryEase }}
                  className="grid min-w-0 items-center gap-5 sm:gap-8 md:grid-cols-12 md:gap-6"
                >
                  <div
                    className={`relative min-w-0 md:col-span-7 ${
                      i % 2 === 1 ? "md:order-2 md:col-start-6" : ""
                    }`}
                  >
                    <div
                      className="relative aspect-[16/11] overflow-hidden rounded-[18px] bg-[#EFE8DA] sm:rounded-[24px]"
                      style={{
                        border: `1px solid ${gold}`,
                        boxShadow: "0 24px 50px rgba(15, 42, 34, 0.14)",
                      }}
                    >
                      {room.imageSrc ? (
                        <button
                          type="button"
                          className="absolute inset-0"
                          onClick={() =>
                            openViewer(
                              facilityViewerItems,
                              Math.max(
                                0,
                                facilityViewerItems.findIndex((entry) => entry.src === room.imageSrc)
                              )
                            )
                          }
                          aria-label={`View ${room.name}`}
                        >
                          <SafeImage
                            src={room.imageSrc}
                            alt={room.imageAlt || room.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 60vw"
                          />
                        </button>
                      ) : null}
                    </div>
                  </div>
                  <div
                    className={`min-w-0 rounded-[18px] border bg-[#FBF8F1]/95 p-5 sm:rounded-[22px] sm:p-6 md:col-span-5 md:p-8 ${
                      i % 2 === 1
                        ? "md:order-1 md:col-start-1 md:-mr-8 md:self-center"
                        : "md:-ml-8 md:self-center"
                    }`}
                    style={{
                      borderColor: `${gold}55`,
                      boxShadow: "0 18px 40px rgba(15, 42, 34, 0.1)",
                    }}
                  >
                    {room.tagline ? (
                      <p
                        className="break-words font-body text-[10px] uppercase tracking-[0.16em] sm:text-[11px] sm:tracking-[0.2em]"
                        style={{ color: gold }}
                      >
                        {room.tagline}
                      </p>
                    ) : null}
                    <h3
                      className="mt-2 break-words font-display text-xl font-light leading-snug sm:text-2xl"
                      style={{ color: heading }}
                    >
                      {room.name}
                    </h3>
                    <p
                      className="mt-3 break-words font-body text-sm leading-relaxed"
                      style={{ color: body }}
                    >
                      {room.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Why choose */}
      {why.length > 0 ? (
        <section className="px-4 py-12 sm:px-6 sm:py-16 md:py-24 lg:px-8">
          <div className="mx-auto max-w-[1200px]">
            <div className="mx-auto max-w-2xl text-center">
              <p
                className="break-words font-display text-[10px] font-semibold uppercase tracking-[0.2em] sm:text-[11px] sm:tracking-[0.32em]"
                style={{ color: gold }}
              >
                {content.whyChoose.eyebrow}
              </p>
              <h2
                className="mt-3 break-words font-display text-[1.75rem] font-light leading-snug sm:mt-4 sm:text-3xl md:text-4xl"
                style={{ color: heading }}
              >
                {content.whyChoose.title}
              </h2>
              {content.whyChoose.description ? (
                <p
                  className="mt-3 break-words font-body text-sm leading-relaxed sm:mt-4"
                  style={{ color: body }}
                >
                  {content.whyChoose.description}
                </p>
              ) : null}
            </div>
            <div className="mt-10 grid gap-5 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3">
              {why.map((item) => (
                <div
                  key={item.id}
                  className="min-w-0 rounded-[20px] border bg-white/40 p-5 text-center sm:p-6"
                  style={{ borderColor: `${gold}44` }}
                >
                  <div
                    className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
                    style={{ color: gold, border: `1px solid ${gold}88` }}
                  >
                    <DynamicIcon name={item.icon || "Sparkles"} className="h-5 w-5" />
                  </div>
                  <h3 className="break-words font-display text-lg" style={{ color: heading }}>
                    {item.title}
                  </h3>
                  <p
                    className="mt-2 break-words font-body text-sm leading-relaxed"
                    style={{ color: body }}
                  >
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Testimonials */}
      {testimonials.length > 0 ? (
        <section className="px-4 py-12 sm:px-6 md:py-20 lg:px-8">
          <div className="mx-auto max-w-[900px]">
            <div className="text-center">
              <p
                className="break-words font-display text-[10px] font-semibold uppercase tracking-[0.2em] sm:text-[11px] sm:tracking-[0.32em]"
                style={{ color: gold }}
              >
                {content.testimonials.eyebrow}
              </p>
              <h2
                className="mt-3 break-words font-display text-[1.75rem] font-light leading-snug sm:mt-4 sm:text-3xl md:text-4xl"
                style={{ color: heading }}
              >
                {content.testimonials.title}
              </h2>
            </div>
            <div className="relative mt-10 sm:mt-12">
              <AnimatePresence mode="wait">
                <motion.article
                  key={testimonials[reviewIndex]?.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="rounded-[24px] border bg-[#FBF8F1] p-6 text-center sm:p-8 md:p-12"
                  style={{ borderColor: `${gold}55` }}
                >
                  <div
                    className="mx-auto flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border"
                    style={{ borderColor: gold }}
                  >
                    {testimonials[reviewIndex]?.photoSrc ? (
                      <SafeImage
                        src={testimonials[reviewIndex].photoSrc}
                        alt={testimonials[reviewIndex].name}
                        width={64}
                        height={64}
                        className="h-16 w-16 object-cover"
                      />
                    ) : (
                      <span className="font-display text-xl" style={{ color: gold }}>
                        {testimonials[reviewIndex]?.name?.charAt(0) || "G"}
                      </span>
                    )}
                  </div>
                  <div className="mt-4 flex justify-center gap-1">
                    {Array.from({ length: 5 }).map((_, si) => (
                      <Star
                        key={si}
                        className="h-4 w-4"
                        fill={si < (testimonials[reviewIndex]?.rating || 0) ? gold : "transparent"}
                        color={gold}
                      />
                    ))}
                  </div>
                  <p
                    className="mx-auto mt-6 max-w-xl break-words font-display text-lg italic leading-relaxed md:text-xl"
                    style={{ color: heading }}
                  >
                    “{testimonials[reviewIndex]?.review}”
                  </p>
                  <p className="mt-6 break-words font-display text-base" style={{ color: heading }}>
                    {testimonials[reviewIndex]?.name}
                  </p>
                  <p
                    className="mt-1 break-words font-body text-xs uppercase tracking-[0.2em]"
                    style={{ color: gold }}
                  >
                    {testimonials[reviewIndex]?.country}
                  </p>
                </motion.article>
              </AnimatePresence>
              {testimonials.length > 1 ? (
                <div className="mt-6 flex justify-center gap-3">
                  <button
                    type="button"
                    aria-label="Previous"
                    onClick={() =>
                      setReviewIndex((i) => (i - 1 + testimonials.length) % testimonials.length)
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-full border"
                    style={{ borderColor: `${gold}66`, color: heading }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next"
                    onClick={() => setReviewIndex((i) => (i + 1) % testimonials.length)}
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

      {/* Booking band */}
      <section id="spa-booking" className="scroll-mt-28 px-4 py-12 sm:px-6 sm:py-16 md:py-20 lg:px-8">
        <div
          className="mx-auto max-w-[900px] rounded-[24px] border px-5 py-10 text-center sm:px-6 sm:py-12 md:px-12"
          style={{
            backgroundColor: "#FBF8F1",
            borderColor: `${gold}55`,
            boxShadow: "0 28px 60px rgba(15, 42, 34, 0.12)",
          }}
        >
          <p
            className="break-words font-display text-[10px] font-semibold uppercase tracking-[0.2em] sm:text-[11px] sm:tracking-[0.32em]"
            style={{ color: gold }}
          >
            {content.booking.eyebrow}
          </p>
          <h2
            className="mt-3 break-words font-display text-[1.75rem] font-light leading-snug sm:mt-4 sm:text-3xl md:text-4xl"
            style={{ color: heading }}
          >
            {content.booking.title}
          </h2>
          <p
            className="mx-auto mt-4 max-w-xl break-words font-body text-sm leading-relaxed"
            style={{ color: body }}
          >
            {content.booking.description}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={bookHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center gap-2 rounded-full px-8 py-3.5 font-body text-[11px] font-semibold uppercase tracking-[0.18em] transition hover:-translate-y-0.5"
              style={{ backgroundColor: gold, color: heading }}
            >
              {bookLabel}
              <ArrowRight className="h-4 w-4" />
            </a>
            {content.booking.secondaryText?.trim() ? (
              <a
                href={spaHref(content.booking.secondaryHref)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center rounded-full border px-8 py-3.5 font-body text-[11px] font-semibold uppercase tracking-[0.18em] transition hover:border-[#C5A059]"
                style={{ borderColor: `${gold}66`, color: heading }}
              >
                {content.booking.secondaryText}
              </a>
            ) : null}
          </div>
        </div>
      </section>

      {/* FAQ */}
      {faqs.length > 0 ? (
        <section className="px-4 py-12 sm:px-6 md:py-20 lg:px-8">
          <div className="mx-auto max-w-[800px]">
            <div className="text-center">
              <p
                className="break-words font-display text-[10px] font-semibold uppercase tracking-[0.2em] sm:text-[11px] sm:tracking-[0.32em]"
                style={{ color: gold }}
              >
                {content.faq.eyebrow}
              </p>
              <h2
                className="mt-3 break-words font-display text-[1.75rem] font-light leading-snug sm:mt-4 sm:text-3xl md:text-4xl"
                style={{ color: heading }}
              >
                {content.faq.title}
              </h2>
              {content.faq.description ? (
                <p
                  className="mt-3 break-words font-body text-sm leading-relaxed sm:mt-4"
                  style={{ color: body }}
                >
                  {content.faq.description}
                </p>
              ) : null}
            </div>
            <Accordion type="single" collapsible className="mt-10 space-y-3">
              {faqs.map((item) => (
                <AccordionItem
                  key={item.id}
                  value={item.id}
                  className="rounded-[16px] border px-4 data-[state=open]:bg-[#FBF8F1] sm:px-5"
                  style={{ borderColor: `${gold}44` }}
                >
                  <AccordionTrigger
                    className="break-words text-left font-display text-base hover:no-underline"
                    style={{ color: heading }}
                  >
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent
                    className="break-words font-body text-sm leading-relaxed"
                    style={{ color: body }}
                  >
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      ) : null}

      {/* Final CTA */}
      <section className="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-20 md:py-28 lg:px-8">
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
          <h2 className="break-words font-display text-[1.75rem] font-light text-white sm:text-3xl md:text-4xl lg:text-5xl">
            {content.cta.title}
          </h2>
          <p className="mx-auto mt-5 max-w-xl break-words font-body text-sm leading-relaxed text-white/75 md:text-base">
            {content.cta.description}
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href={ctaHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center gap-2 rounded-full px-8 py-3.5 font-body text-[11px] font-semibold uppercase tracking-[0.18em] transition hover:-translate-y-0.5"
              style={{ backgroundColor: gold, color: heading }}
            >
              {ctaLabel}
              <ArrowRight className="h-4 w-4" />
            </a>
            {content.cta.secondaryText?.trim() ? (
              <a
                href={spaHref(content.cta.secondaryHref)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center rounded-full border border-white/40 px-8 py-3.5 font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:border-[#C5A059] hover:text-[#C5A059]"
              >
                {content.cta.secondaryText}
              </a>
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
