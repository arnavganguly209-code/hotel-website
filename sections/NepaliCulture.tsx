"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Quote } from "lucide-react";
import { DynamicIcon } from "@/components/shared/DynamicIcon";
import { LuxuryMediaFrame } from "@/components/shared/LuxuryMediaFrame";
import { MotionSection } from "@/components/shared/MotionSection";
import { Button } from "@/components/ui/button";
import { fadeUp } from "@/lib/animations";
import type { CmsMedia, SiteContent } from "@/lib/cms/types";

interface NepaliCultureProps {
  content: SiteContent["culture"];
}

function resolveCultureMedia(content: SiteContent["culture"]): CmsMedia {
  return {
    ...content.media,
    imageSrc: content.media?.imageSrc || content.imageSrc || "",
    alt: content.media?.alt || content.title,
  };
}

export function NepaliCulture({ content }: NepaliCultureProps) {
  const media = resolveCultureMedia(content);
  const homeParagraph =
    content.content.split(/\n\n+/).filter(Boolean)[0] ??
    content.content;
  const highlights = content.highlights.slice(0, 4);
  const stats = content.stats.slice(0, 3);

  return (
    <MotionSection
      id="culture"
      className="section-padding relative overflow-hidden bg-gradient-to-b from-white via-luxury-cream-light to-luxury-sage/30"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_100%_50%,rgba(201,164,76,0.06)_0%,transparent_55%)]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-stretch lg:gap-16 xl:gap-20">
          {/* Left — premium image, fixed proportional height */}
          <motion.div variants={fadeUp} className="relative min-h-[420px] w-full lg:min-h-[640px]">
            <LuxuryMediaFrame
              media={media}
              label={media.caption || content.title}
              href={content.ctaHref}
              priority
              className="h-full w-full"
              aspectClass="h-full min-h-[420px] lg:min-h-[640px]"
              roundedClass="rounded-[28px]"
            />
          </motion.div>

          {/* Right — compact hierarchy matching image height */}
          <motion.div
            variants={fadeUp}
            className="flex min-w-0 flex-col justify-between lg:min-h-[640px]"
          >
            <div>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-luxury-gold-label">
                {content.eyebrow}
              </p>
              <h2 className="font-display text-3xl font-medium leading-tight text-luxury-forest md:text-4xl lg:text-[2.65rem]">
                {content.title}
              </h2>
              <div className="my-5 h-px w-16 bg-gradient-to-r from-luxury-gold via-luxury-gold/50 to-transparent" />

              <p className="text-[15px] leading-[1.8] text-luxury-muted md:text-base">
                {homeParagraph}
              </p>

              {content.quote ? (
                <blockquote className="relative mt-6 rounded-[20px] border border-white/60 bg-white/45 px-5 py-5 backdrop-blur-[18px]">
                  <Quote className="absolute right-4 top-4 h-6 w-6 text-luxury-gold/20" strokeWidth={1} />
                  <p className="font-accent text-base italic leading-relaxed text-luxury-forest/90 md:text-lg">
                    &ldquo;{content.quote}&rdquo;
                  </p>
                  {content.quoteAuthor ? (
                    <footer className="mt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-luxury-gold">
                      — {content.quoteAuthor}
                    </footer>
                  ) : null}
                </blockquote>
              ) : null}

              {stats.length > 0 ? (
                <div className="mt-6 grid grid-cols-3 gap-3 border-t border-luxury-gold/12 pt-6">
                  {stats.map((stat) => (
                    <div key={stat.label} className="text-center">
                      <DynamicIcon name={stat.icon} className="mx-auto mb-1.5 h-4 w-4 text-luxury-gold" />
                      <p className="font-display text-xl text-luxury-forest md:text-2xl">{stat.value}</p>
                      <p className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.16em] text-luxury-muted">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}

              {highlights.length > 0 ? (
                <div className="mt-6">
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-luxury-gold">
                    Experience Highlights
                  </p>
                  <div className="grid grid-cols-2 gap-2.5">
                    {highlights.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-[16px] border border-white/55 bg-white/40 p-3.5 backdrop-blur-[16px] transition-all duration-500 hover:-translate-y-0.5 hover:shadow-glass-luxury"
                      >
                        <DynamicIcon name={item.icon} className="mb-1.5 h-3.5 w-3.5 text-luxury-gold" />
                        <h4 className="line-clamp-1 font-display text-xs text-luxury-forest md:text-sm">
                          {item.title}
                        </h4>
                        <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-luxury-muted">
                          {item.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <Button
              variant="gold"
              size="lg"
              className="mt-8 gap-2 self-start uppercase tracking-[0.18em] lg:mt-6"
              asChild
            >
              <Link href={content.ctaHref}>
                {content.ctaText}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </MotionSection>
  );
}
