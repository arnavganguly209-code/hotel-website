"use client";

import { useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { LuxuryImageBox } from "@/components/shared/LuxuryImageBox";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { MotionSection } from "@/components/shared/MotionSection";
import { luxuryStagger, luxuryFadeUp, luxuryEase } from "@/lib/animations";
import type { SiteContent } from "@/lib/cms/types";

interface OverviewProps {
  content: SiteContent["overview"];
}

export function Overview({ content }: OverviewProps) {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const images = content.galleryImages;
  const paragraphs = content.content.split(/\n\n+/).filter(Boolean);
  const { scrollYProgress } = useScroll();
  const parallaxY = useTransform(scrollYProgress, [0, 0.3], [0, -40]);

  return (
    <MotionSection
      id="overview"
      stagger
      className="section-padding section-glow relative overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #FFF9F2 0%, #FAF6EE 50%, #EAF2E8 100%)",
      }}
    >
      <motion.div
        style={{ y: parallaxY }}
        className="pointer-events-none absolute -right-24 top-20 h-80 w-80 rounded-full blur-[100px]"
        aria-hidden
      >
        <div className="h-full w-full rounded-full bg-luxury-gold/10" />
      </motion.div>

      <motion.div
        variants={luxuryStagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="relative mx-auto max-w-4xl text-center"
      >
        <motion.p
          variants={luxuryFadeUp}
          className="mb-5 text-[11px] font-semibold uppercase tracking-[0.38em] text-luxury-gold-label"
        >
          {content.eyebrow}
        </motion.p>
        <motion.h2
          variants={luxuryFadeUp}
          className="font-display text-3xl font-normal leading-[1.15] text-luxury-forest md:text-4xl lg:text-[2.75rem]"
        >
          {content.title}
        </motion.h2>
        <motion.div variants={luxuryFadeUp} className="mx-auto mt-7 flex items-center justify-center gap-4">
          <span className="h-px w-16 bg-luxury-gold/35" />
          <span className="h-1.5 w-1.5 rotate-45 bg-luxury-gold/50" />
          <span className="h-px w-16 bg-luxury-gold/35" />
        </motion.div>
        <motion.div variants={luxuryFadeUp} className="mx-auto mt-8 max-w-2xl space-y-4 text-base leading-[1.85] text-luxury-muted md:text-lg">
          {paragraphs.slice(0, 3).map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </motion.div>
      </motion.div>

      {images.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 56 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 1.1, ease: luxuryEase }}
          className="relative mx-auto mt-20 max-w-5xl px-4 md:px-6"
        >
          <div className="luxury-glass-card rounded-[28px] p-3 md:p-4">
            <div className="relative aspect-[16/9] max-h-[420px] overflow-hidden rounded-[20px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={carouselIndex}
                  initial={{ opacity: 0, scale: 1.06 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 1, ease: luxuryEase }}
                  className="absolute inset-0"
                >
                  <LuxuryImageBox
                    src={images[carouselIndex]}
                    alt={`Gallery ${carouselIndex + 1}`}
                    label="Hotel Thamel Park"
                    variant="gallery"
                    className="h-full max-h-[420px] min-h-[220px] w-full"
                  />
                </motion.div>
              </AnimatePresence>

              <button
                onClick={() => setCarouselIndex((i) => (i - 1 + images.length) % images.length)}
                className="absolute left-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-white/25 text-luxury-forest backdrop-blur-md transition-all duration-500 hover:scale-105 hover:bg-white/45"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => setCarouselIndex((i) => (i + 1) % images.length)}
                className="absolute right-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-white/25 text-luxury-forest backdrop-blur-md transition-all duration-500 hover:scale-105 hover:bg-white/45"
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="mt-5 flex justify-center gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCarouselIndex(i)}
                className={`h-1 rounded-full transition-all duration-500 ${
                  i === carouselIndex ? "w-10 bg-luxury-gold" : "w-1.5 bg-luxury-gold/25"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </motion.div>
      )}

      <motion.div
        variants={luxuryStagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        className="relative mx-auto mt-24 grid max-w-5xl gap-6 md:grid-cols-3"
      >
        {content.stats.map((stat) => (
          <motion.div
            key={stat.label}
            variants={luxuryFadeUp}
            className="luxury-glass-card rounded-[24px] px-6 py-10 text-center"
          >
            <AnimatedCounter value={stat.value} suffix={stat.suffix} label={stat.label} />
            <div className="mx-auto mt-5 h-px w-12 bg-gradient-to-r from-transparent via-luxury-gold/40 to-transparent" />
          </motion.div>
        ))}
      </motion.div>
    </MotionSection>
  );
}
