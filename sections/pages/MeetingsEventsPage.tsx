"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { DynamicIcon } from "@/components/shared/DynamicIcon";
import { SafeImage } from "@/components/shared/SafeImage";
import { EventInquiryForm } from "@/components/meetings/EventInquiryForm";
import { luxuryEase, luxuryFadeUp, luxuryStagger } from "@/lib/animations";
import type { SiteContent } from "@/lib/cms/types";

interface MeetingsEventsPageProps {
  content: SiteContent["meetingsEventsPage"];
}

export function MeetingsEventsPage({ content }: MeetingsEventsPageProps) {
  const gold = content.goldColor || "#C5A059";
  const heading = content.headingColor || "#062C24";
  const body = content.bodyColor || "#5A635C";
  const topBg = content.backgroundTop || "#F9F6EF";
  const bottomBg = content.backgroundBottom || "#E8F0E9";

  const [openFaq, setOpenFaq] = useState<string | null>(content.faq[0]?.id ?? null);

  const spaces = [...content.spaces]
    .filter((s) => s.enabled !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const facilities = [...content.facilities]
    .filter((f) => f.enabled !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const gallery = [...content.gallery]
    .filter((g) => g.enabled !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const whyChooseUs = [...content.whyChooseUs]
    .filter((w) => w.enabled !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const faq = [...content.faq]
    .filter((f) => f.enabled !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const aboutParagraphs = content.about.content.split(/\n\n+/).filter(Boolean);

  return (
    <section
      className="relative overflow-x-clip"
      style={{
        background: `linear-gradient(180deg, ${topBg} 0%, ${topBg} 40%, ${bottomBg} 100%)`,
      }}
    >
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-12 xl:gap-16">
          <div className="min-w-0 space-y-24 lg:space-y-28">
            {/* About */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: luxuryEase }}
              className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14"
            >
              <div
                className="relative aspect-[4/3] overflow-hidden rounded-[24px]"
                style={{
                  border: `1px solid ${gold}88`,
                  boxShadow: "0 28px 60px rgba(15, 42, 34, 0.14)",
                }}
              >
                {content.about.media.imageSrc ? (
                  <SafeImage
                    src={content.about.media.imageSrc}
                    alt={content.about.media.alt || content.about.title}
                    fill
                    objectFit="cover"
                    sizes="(max-width: 1024px) 100vw, 480px"
                  />
                ) : null}
              </div>
              <div>
                <p
                  className="font-body text-[11px] font-semibold uppercase tracking-[0.32em]"
                  style={{ color: gold }}
                >
                  {content.about.eyebrow}
                </p>
                <h2
                  className="mt-4 font-display text-3xl font-semibold uppercase tracking-[0.02em] md:text-4xl"
                  style={{ color: heading }}
                >
                  {content.about.title}
                </h2>
                <div className="mt-5 space-y-4 font-body text-[15px] leading-[1.85]" style={{ color: body }}>
                  {aboutParagraphs.map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Event spaces */}
            {spaces.map((space, index) => (
              <motion.article
                key={space.id}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.9, ease: luxuryEase }}
                className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-14 ${
                  index % 2 === 1 ? "" : ""
                }`}
              >
                <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                  <div
                    className="relative aspect-[4/3] overflow-hidden rounded-[24px]"
                    style={{
                      border: `1px solid ${gold}88`,
                      boxShadow: "0 28px 60px rgba(15, 42, 34, 0.14)",
                    }}
                  >
                    {space.media.imageSrc ? (
                      <SafeImage
                        src={space.media.imageSrc}
                        alt={space.media.alt || space.title}
                        fill
                        objectFit="cover"
                        sizes="(max-width: 1024px) 100vw, 480px"
                      />
                    ) : null}
                  </div>
                </div>
                <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                  <p
                    className="font-body text-[11px] font-semibold uppercase tracking-[0.28em]"
                    style={{ color: gold }}
                  >
                    {space.subtitle}
                  </p>
                  <h3
                    className="mt-3 font-display text-2xl font-semibold uppercase tracking-[0.02em] md:text-3xl"
                    style={{ color: heading }}
                  >
                    {space.title}
                  </h3>
                  <p
                    className="mt-2 font-body text-sm font-semibold uppercase tracking-[0.12em]"
                    style={{ color: gold }}
                  >
                    {space.capacity}
                  </p>
                  <p className="mt-5 font-body text-[15px] leading-[1.85]" style={{ color: body }}>
                    {space.description}
                  </p>
                  <ul className="mt-6 space-y-2.5">
                    {space.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 font-body text-sm" style={{ color: body }}>
                        <span style={{ color: gold }}>—</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.article>
            ))}

            {/* Facilities */}
            <div>
              <SectionLabel gold={gold} heading={heading} eyebrow="Amenities" title="Event Facilities" />
              <motion.div
                variants={luxuryStagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              >
                {facilities.map((item) => (
                  <motion.div
                    key={item.id}
                    variants={luxuryFadeUp}
                    className="rounded-[20px] border p-5 transition duration-500 hover:-translate-y-1"
                    style={{
                      backgroundColor: "#FBF8F1",
                      borderColor: `${gold}44`,
                      boxShadow: "0 16px 36px rgba(15, 42, 34, 0.08)",
                    }}
                  >
                    <span style={{ color: gold }}>
                      <DynamicIcon name={item.icon} className="h-5 w-5" />
                    </span>
                    <h4 className="mt-3 font-display text-lg font-semibold" style={{ color: heading }}>
                      {item.title}
                    </h4>
                    <p className="mt-2 font-body text-sm leading-relaxed" style={{ color: body }}>
                      {item.description}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Gallery */}
            {gallery.length > 0 ? (
              <div>
                <SectionLabel gold={gold} heading={heading} eyebrow="Gallery" title="Event Moments" />
                <motion.div
                  variants={luxuryStagger}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="mt-10 grid gap-5 sm:grid-cols-2"
                >
                  {gallery.map((item, index) => (
                    <motion.div
                      key={item.id}
                      variants={luxuryFadeUp}
                      className={`group relative min-h-[220px] overflow-hidden rounded-[22px] ${
                        index === 0 ? "sm:col-span-2 sm:min-h-[280px]" : "aspect-[4/3]"
                      }`}
                      style={{
                        border: `1px solid ${gold}66`,
                        boxShadow: "0 20px 44px rgba(15, 42, 34, 0.12)",
                      }}
                    >
                      <SafeImage
                        src={item.src}
                        alt={item.alt || item.title}
                        fill
                        objectFit="cover"
                        className="transition duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 560px"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-5">
                        <p className="font-display text-lg text-white">{item.title}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            ) : null}

            {/* Why choose us */}
            <div>
              <SectionLabel gold={gold} heading={heading} eyebrow="Excellence" title="Why Choose Us" />
              <motion.div
                variants={luxuryStagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="mt-10 grid gap-5 md:grid-cols-2"
              >
                {whyChooseUs.map((item) => (
                  <motion.div
                    key={item.id}
                    variants={luxuryFadeUp}
                    className="rounded-[20px] border p-6 md:p-7"
                    style={{
                      backgroundColor: "#FBF8F1",
                      borderColor: `${gold}44`,
                    }}
                  >
                    <h4 className="font-display text-xl font-semibold" style={{ color: heading }}>
                      {item.title}
                    </h4>
                    <p className="mt-3 font-body text-sm leading-[1.8]" style={{ color: body }}>
                      {item.description}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* FAQ */}
            <div>
              <SectionLabel gold={gold} heading={heading} eyebrow="Questions" title="Frequently Asked" />
              <div className="mt-8 space-y-3">
                {faq.map((item) => {
                  const open = openFaq === item.id;
                  return (
                    <div
                      key={item.id}
                      className="overflow-hidden rounded-[18px] border"
                      style={{ borderColor: `${gold}44`, backgroundColor: "#FBF8F1" }}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaq(open ? null : item.id)}
                        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                      >
                        <span className="font-display text-base font-semibold md:text-lg" style={{ color: heading }}>
                          {item.question}
                        </span>
                        <ChevronDown
                          className={`h-5 w-5 shrink-0 transition ${open ? "rotate-180" : ""}`}
                          style={{ color: gold }}
                        />
                      </button>
                      <AnimatePresence initial={false}>
                        {open ? (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.35, ease: luxuryEase }}
                          >
                            <p className="px-5 pb-5 font-body text-sm leading-[1.85]" style={{ color: body }}>
                              {item.answer}
                            </p>
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mobile form */}
            <div className="lg:hidden">
              <EventInquiryForm
                form={content.form}
                goldColor={gold}
                headingColor={heading}
                bodyColor={body}
              />
            </div>
          </div>

          {/* Sticky desktop form */}
          <aside className="hidden lg:block">
            <div className="sticky top-28">
              <EventInquiryForm
                form={content.form}
                goldColor={gold}
                headingColor={heading}
                bodyColor={body}
              />
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function SectionLabel({
  eyebrow,
  title,
  gold,
  heading,
}: {
  eyebrow: string;
  title: string;
  gold: string;
  heading: string;
}) {
  return (
    <div>
      <p className="font-body text-[11px] font-semibold uppercase tracking-[0.32em]" style={{ color: gold }}>
        {eyebrow}
      </p>
      <h2
        className="mt-3 font-display text-2xl font-semibold uppercase tracking-[0.02em] md:text-3xl"
        style={{ color: heading }}
      >
        {title}
      </h2>
      <div className="mt-4 flex items-center gap-3" aria-hidden>
        <span className="h-px w-10" style={{ backgroundColor: `${gold}77` }} />
        <span className="h-1.5 w-1.5 rotate-45" style={{ backgroundColor: gold }} />
        <span className="h-px w-10" style={{ backgroundColor: `${gold}77` }} />
      </div>
    </div>
  );
}
