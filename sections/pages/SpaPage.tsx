"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, ChevronLeft, ChevronRight, Star } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { DynamicIcon } from "@/components/shared/DynamicIcon";
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
  const treatments = [...content.treatments.items]
    .filter((t) => t.enabled !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const experiences = [...content.experiences.items]
    .filter((e) => e.enabled !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const packages = [...content.packages.items]
    .filter((p) => p.enabled !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const gallery = [...content.gallery]
    .filter((g) => g.enabled !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const why = [...content.whyChoose.items]
    .filter((w) => w.enabled !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const testimonials = [...content.testimonials.items]
    .filter((t) => t.enabled !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const faqs = [...content.faq.items]
    .filter((f) => f.enabled !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const [reviewIndex, setReviewIndex] = useState(0);

  useEffect(() => {
    if (testimonials.length <= 1) return;
    const t = setInterval(() => {
      setReviewIndex((i) => (i + 1) % testimonials.length);
    }, 6500);
    return () => clearInterval(t);
  }, [testimonials.length]);

  return (
    <div className="bg-[#F9F6EF]">
      {/* Introduction */}
      <section id="spa-introduction" className="scroll-mt-24 px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <div className="mx-auto grid max-w-[1200px] items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.9, ease: luxuryEase }}
          >
            <div
              className="relative aspect-[4/5] overflow-hidden rounded-[28px] sm:aspect-[5/6]"
              style={{
                border: `1px solid ${gold}88`,
                boxShadow: "0 28px 60px rgba(15, 42, 34, 0.16)",
              }}
            >
              {content.introduction.imageSrc ? (
                <SafeImage
                  src={content.introduction.imageSrc}
                  alt={content.introduction.imageAlt || content.introduction.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 520px"
                />
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
              {content.introduction.eyebrow}
            </motion.p>
            <motion.h2
              variants={luxuryFadeUp}
              className="mt-4 font-display text-3xl font-light leading-tight md:text-4xl lg:text-[2.75rem]"
              style={{ color: heading }}
            >
              {content.introduction.title}
            </motion.h2>
            <GoldDivider />
            <motion.p
              variants={luxuryFadeUp}
              className="font-body text-[15px] leading-[1.85] md:text-base"
              style={{ color: body }}
            >
              {content.introduction.content}
            </motion.p>
            {content.introduction.quote ? (
              <motion.blockquote
                variants={luxuryFadeUp}
                className="mt-8 border-l-2 pl-5"
                style={{ borderColor: `${gold}99` }}
              >
                <p
                  className="font-display text-lg italic leading-relaxed md:text-xl"
                  style={{ color: heading }}
                >
                  “{content.introduction.quote}”
                </p>
                {content.introduction.quoteAuthor ? (
                  <footer
                    className="mt-3 font-body text-xs uppercase tracking-[0.2em]"
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

      {/* Signature treatments */}
      <section className="px-4 py-12 sm:px-6 md:py-20 lg:px-8">
        <div className="mx-auto max-w-[1200px]">
          <div className="mx-auto max-w-2xl text-center">
            <p
              className="font-display text-[11px] font-semibold uppercase tracking-[0.32em]"
              style={{ color: gold }}
            >
              {content.treatments.eyebrow}
            </p>
            <h2
              className="mt-4 font-display text-3xl font-light md:text-4xl"
              style={{ color: heading }}
            >
              {content.treatments.title}
            </h2>
            <p className="mt-4 font-body text-sm leading-relaxed" style={{ color: body }}>
              {content.treatments.description}
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {treatments.map((item, i) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: i * 0.04, ease: luxuryEase }}
                className="group rounded-[22px] border bg-[#FBF8F1] p-6 text-center transition duration-[350ms] hover:-translate-y-1.5"
                style={{
                  borderColor: `${gold}55`,
                  boxShadow: "0 14px 36px rgba(15, 42, 34, 0.08)",
                }}
              >
                <div
                  className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full transition group-hover:scale-105"
                  style={{
                    border: `1px solid ${gold}`,
                    background:
                      "radial-gradient(circle at 32% 28%, #FFFDF8 0%, #F5EBD8 55%, #E8D9BC 100%)",
                    color: gold,
                  }}
                >
                  <DynamicIcon name={item.icon || "Flower2"} className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg" style={{ color: heading }}>
                  {item.name}
                </h3>
                <p className="mt-2.5 font-body text-sm leading-relaxed" style={{ color: body }}>
                  {item.description}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Wellness experiences */}
      <section
        className="px-4 py-16 sm:px-6 md:py-24 lg:px-8"
        style={{ background: "linear-gradient(180deg, #E8F0E9 0%, #F9F6EF 100%)" }}
      >
        <div className="mx-auto max-w-[1200px]">
          <div className="mx-auto max-w-2xl text-center">
            <p
              className="font-display text-[11px] font-semibold uppercase tracking-[0.32em]"
              style={{ color: gold }}
            >
              {content.experiences.eyebrow}
            </p>
            <h2
              className="mt-4 font-display text-3xl font-light md:text-4xl"
              style={{ color: heading }}
            >
              {content.experiences.title}
            </h2>
            <p className="mt-4 font-body text-sm leading-relaxed" style={{ color: body }}>
              {content.experiences.description}
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {experiences.map((item, i) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.05 }}
                className="group relative overflow-hidden rounded-[22px]"
                style={{ border: `1px solid ${gold}66` }}
              >
                <div className="relative aspect-[4/5]">
                  {item.imageSrc ? (
                    <SafeImage
                      src={item.imageSrc}
                      alt={item.imageAlt || item.title}
                      fill
                      className="object-cover transition duration-700 group-hover:scale-105"
                      sizes="(max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="h-full w-full bg-[#EFE8DA]" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#062C24]/80 via-[#062C24]/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <h3 className="font-display text-xl text-white">{item.title}</h3>
                    <p className="mt-1 font-body text-sm text-white/75">{item.description}</p>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <div className="mx-auto max-w-[1200px]">
          <div className="mx-auto max-w-2xl text-center">
            <p
              className="font-display text-[11px] font-semibold uppercase tracking-[0.32em]"
              style={{ color: gold }}
            >
              {content.packages.eyebrow}
            </p>
            <h2
              className="mt-4 font-display text-3xl font-light md:text-4xl"
              style={{ color: heading }}
            >
              {content.packages.title}
            </h2>
            <p className="mt-4 font-body text-sm leading-relaxed" style={{ color: body }}>
              {content.packages.description}
            </p>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            {packages.map((pkg, i) => (
              <motion.article
                key={pkg.id}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.65, delay: i * 0.06 }}
                className="flex h-full flex-col overflow-hidden rounded-[24px] border bg-[#FBF8F1]"
                style={{
                  borderColor: `${gold}66`,
                  boxShadow: "0 18px 44px rgba(15, 42, 34, 0.1)",
                }}
              >
                <div className="relative aspect-[16/10]">
                  {pkg.imageSrc ? (
                    <SafeImage
                      src={pkg.imageSrc}
                      alt={pkg.imageAlt || pkg.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 33vw"
                    />
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col p-6 md:p-7">
                  <p className="font-body text-xs uppercase tracking-[0.18em]" style={{ color: gold }}>
                    {pkg.duration}
                  </p>
                  <h3 className="mt-2 font-display text-2xl font-light" style={{ color: heading }}>
                    {pkg.name}
                  </h3>
                  <p className="mt-1 font-display text-lg" style={{ color: gold }}>
                    {pkg.price}
                  </p>
                  <p className="mt-3 font-body text-sm leading-relaxed" style={{ color: body }}>
                    {pkg.description}
                  </p>
                  {pkg.benefits?.length ? (
                    <ul className="mt-5 space-y-2">
                      {pkg.benefits.map((b) => (
                        <li key={b} className="flex items-start gap-2 text-sm" style={{ color: body }}>
                          <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: gold }} />
                          {b}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <a
                    href={spaHref(content.booking.buttonHref)}
                    className="mt-8 inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 py-3 font-body text-[11px] font-semibold uppercase tracking-[0.16em] transition hover:-translate-y-0.5"
                    style={{ backgroundColor: heading, color: gold }}
                  >
                    {pkg.ctaText || "Book Now"}
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </motion.article>
            ))}
          </div>
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
              {gallery.map((img) => (
                <div
                  key={img.id}
                  className="group mb-4 break-inside-avoid overflow-hidden rounded-[18px]"
                  style={{ border: `1px solid ${gold}77` }}
                >
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <SafeImage
                      src={img.src}
                      alt={img.alt || img.title}
                      fill
                      className="object-cover transition duration-700 group-hover:scale-110"
                      sizes="(max-width: 640px) 100vw, 33vw"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Why choose */}
      <section className="px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <div className="mx-auto max-w-[1200px]">
          <div className="mx-auto max-w-2xl text-center">
            <p
              className="font-display text-[11px] font-semibold uppercase tracking-[0.32em]"
              style={{ color: gold }}
            >
              {content.whyChoose.eyebrow}
            </p>
            <h2
              className="mt-4 font-display text-3xl font-light md:text-4xl"
              style={{ color: heading }}
            >
              {content.whyChoose.title}
            </h2>
            <p className="mt-4 font-body text-sm leading-relaxed" style={{ color: body }}>
              {content.whyChoose.description}
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {why.map((item) => (
              <div
                key={item.id}
                className="rounded-[20px] border bg-white/40 p-6 text-center"
                style={{ borderColor: `${gold}44` }}
              >
                <div
                  className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
                  style={{ color: gold, border: `1px solid ${gold}88` }}
                >
                  <DynamicIcon name={item.icon || "Sparkles"} className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg" style={{ color: heading }}>
                  {item.title}
                </h3>
                <p className="mt-2 font-body text-sm leading-relaxed" style={{ color: body }}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 ? (
        <section className="px-4 py-12 sm:px-6 md:py-20 lg:px-8">
          <div className="mx-auto max-w-[900px]">
            <div className="text-center">
              <p
                className="font-display text-[11px] font-semibold uppercase tracking-[0.32em]"
                style={{ color: gold }}
              >
                {content.testimonials.eyebrow}
              </p>
              <h2
                className="mt-4 font-display text-3xl font-light md:text-4xl"
                style={{ color: heading }}
              >
                {content.testimonials.title}
              </h2>
            </div>
            <div className="relative mt-12">
              <AnimatePresence mode="wait">
                <motion.article
                  key={testimonials[reviewIndex]?.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="rounded-[24px] border bg-[#FBF8F1] p-8 text-center md:p-12"
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
                    className="mx-auto mt-6 max-w-xl font-display text-lg italic leading-relaxed md:text-xl"
                    style={{ color: heading }}
                  >
                    “{testimonials[reviewIndex]?.review}”
                  </p>
                  <p className="mt-6 font-display text-base" style={{ color: heading }}>
                    {testimonials[reviewIndex]?.name}
                  </p>
                  <p
                    className="mt-1 font-body text-xs uppercase tracking-[0.2em]"
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

      {/* Booking CTA band */}
      <section id="spa-booking" className="scroll-mt-28 px-4 py-16 sm:px-6 md:py-20 lg:px-8">
        <div
          className="mx-auto max-w-[900px] rounded-[24px] border px-6 py-12 text-center md:px-12"
          style={{
            backgroundColor: "#FBF8F1",
            borderColor: `${gold}55`,
            boxShadow: "0 28px 60px rgba(15, 42, 34, 0.12)",
          }}
        >
          <p
            className="font-display text-[11px] font-semibold uppercase tracking-[0.32em]"
            style={{ color: gold }}
          >
            {content.booking.eyebrow}
          </p>
          <h2
            className="mt-4 font-display text-3xl font-light md:text-4xl"
            style={{ color: heading }}
          >
            {content.booking.title}
          </h2>
          <p className="mx-auto mt-4 max-w-xl font-body text-sm leading-relaxed" style={{ color: body }}>
            {content.booking.description}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={spaHref(content.booking.buttonHref)}
              className="inline-flex min-h-12 items-center gap-2 rounded-full px-8 py-3.5 font-body text-[11px] font-semibold uppercase tracking-[0.18em] transition hover:-translate-y-0.5"
              style={{ backgroundColor: gold, color: heading }}
            >
              {content.booking.buttonText}
              <ArrowRight className="h-4 w-4" />
            </a>
            {content.booking.secondaryText ? (
              <a
                href={spaHref(content.booking.secondaryHref)}
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
                  <AccordionTrigger
                    className="font-display text-left text-base hover:no-underline"
                    style={{ color: heading }}
                  >
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent
                    className="font-body text-sm leading-relaxed"
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
              href={spaHref(content.cta.buttonHref)}
              className="inline-flex min-h-12 items-center gap-2 rounded-full px-8 py-3.5 font-body text-[11px] font-semibold uppercase tracking-[0.18em] transition hover:-translate-y-0.5"
              style={{ backgroundColor: gold, color: heading }}
            >
              {content.cta.buttonText}
              <ArrowRight className="h-4 w-4" />
            </a>
            {content.cta.secondaryText ? (
              <a
                href={spaHref(content.cta.secondaryHref)}
                className="inline-flex min-h-12 items-center rounded-full border border-white/40 px-8 py-3.5 font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:border-[#C5A059] hover:text-[#C5A059]"
              >
                {content.cta.secondaryText}
              </a>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
