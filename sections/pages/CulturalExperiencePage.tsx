"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { DynamicIcon } from "@/components/shared/DynamicIcon";
import { LuxuryMediaFrame } from "@/components/shared/LuxuryMediaFrame";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { fadeUp, luxuryStagger, luxuryEase } from "@/lib/animations";
import type { SiteContent } from "@/lib/cms/types";

interface CulturalExperiencePageProps {
  content: SiteContent["culturalExperiencePage"];
}

export function CulturalExperiencePage({ content }: CulturalExperiencePageProps) {
  const [openFaq, setOpenFaq] = useState<string | null>(content.faq[0]?.id ?? null);
  const storyParagraphs = content.story.content.split(/\n\n+/).filter(Boolean);

  return (
    <section className="section-padding bg-gradient-to-b from-luxury-cream-light via-white to-luxury-sage/25">
      <div className="mx-auto max-w-7xl space-y-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: luxuryEase }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-luxury-gold">Culture Story</p>
          <h2 className="mt-4 font-display text-3xl font-light text-luxury-forest md:text-5xl">
            {content.story.title}
          </h2>
          <div className="mx-auto mt-6 h-px w-20 bg-gradient-to-r from-transparent via-luxury-gold to-transparent" />
          <div className="mt-8 space-y-5 text-left text-base leading-[1.85] text-luxury-muted">
            {storyParagraphs.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </motion.div>

        {content.gallery.length > 0 ? (
          <div>
            <SectionHeading eyebrow="Gallery" title="Moments of Heritage" />
            <motion.div
              variants={luxuryStagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
            >
              {content.gallery.map((item, index) => (
                <motion.div key={item.id} variants={fadeUp}>
                  <LuxuryMediaFrame
                    media={{
                      type: "image",
                      imageSrc: item.src,
                      videoSrc: "",
                      poster: "",
                      alt: item.alt || item.title,
                      caption: item.title,
                    }}
                    roundedClass={index % 3 === 1 ? "rounded-[28px]" : "rounded-[24px]"}
                    aspectClass="aspect-[4/3]"
                    className="min-h-[220px]"
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        ) : null}

        {content.experienceCards.length > 0 ? (
          <div>
            <SectionHeading eyebrow="Curated" title="Experience Highlights" />
            <motion.div
              variants={luxuryStagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
            >
              {content.experienceCards.map((card) => (
                <motion.div
                  key={card.id}
                  variants={fadeUp}
                  className="rounded-[24px] border border-white/60 bg-white/50 p-8 backdrop-blur-[22px] transition-all duration-700 hover:-translate-y-1 hover:shadow-glass-luxury"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-luxury-gold/35 bg-luxury-cream/80">
                    <DynamicIcon name={card.icon} className="h-5 w-5 text-luxury-gold" />
                  </div>
                  <h3 className="font-display text-xl text-luxury-forest">{card.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-luxury-muted">{card.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        ) : null}

        {content.timeline.length > 0 ? (
          <div>
            <SectionHeading eyebrow="Itinerary" title="Suggested Cultural Journey" />
            <div className="relative mt-14">
              <div className="absolute left-4 top-0 hidden h-full w-px bg-luxury-gold/25 md:left-1/2 md:block" />
              <div className="space-y-10">
                {content.timeline.map((item, i) => (
                  <motion.div
                    key={`${item.year}-${item.title}`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className={`relative md:flex ${i % 2 === 0 ? "md:justify-start" : "md:justify-end"}`}
                  >
                    <div className="rounded-[24px] border border-white/55 bg-white/45 p-8 backdrop-blur-[20px] md:w-[calc(50%-2rem)]">
                      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-luxury-gold">{item.year}</p>
                      <h4 className="mt-2 font-display text-2xl text-luxury-forest">{item.title}</h4>
                      <p className="mt-3 text-sm leading-relaxed text-luxury-muted">{item.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {content.faq.length > 0 ? (
          <div>
            <SectionHeading eyebrow="Questions" title="Frequently Asked" />
            <div className="mx-auto mt-12 max-w-3xl space-y-3">
              {content.faq.map((item) => {
                const open = openFaq === item.id;
                return (
                  <div
                    key={item.id}
                    className="overflow-hidden rounded-[20px] border border-white/60 bg-white/50 backdrop-blur-[18px]"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(open ? null : item.id)}
                      className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                    >
                      <span className="font-display text-base text-luxury-forest md:text-lg">{item.question}</span>
                      <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.45, ease: luxuryEase }}>
                        <ChevronDown className="h-5 w-5 shrink-0 text-luxury-gold" />
                      </motion.span>
                    </button>
                    <AnimatePresence initial={false}>
                      {open ? (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.5, ease: luxuryEase }}
                          className="overflow-hidden border-t border-luxury-gold/10"
                        >
                          <p className="px-6 pb-5 pt-2 text-sm leading-relaxed text-luxury-muted">{item.answer}</p>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
