"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRef } from "react";
import { MediaBackground } from "@/components/shared/MediaBackground";
import { cn } from "@/lib/utils";

interface InnerPageHeroProps {
  title: string;
  subtitle?: string;
  description?: string;
  imageSrc?: string;
  videoSrc?: string;
  mediaType?: "video" | "image";
  overlay?: "dark" | "light" | "gold";
  height?: "medium" | "large";
  ctaText?: string;
  ctaHref?: string;
}

export function InnerPageHero({
  title,
  subtitle,
  description,
  imageSrc,
  videoSrc,
  mediaType = "image",
  overlay = "dark",
  height = "large",
  ctaText,
  ctaHref,
}: InnerPageHeroProps) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      ref={ref}
      className={cn(
        "relative flex items-end overflow-hidden",
        height === "large" ? "min-h-[70vh]" : "min-h-[50vh]"
      )}
    >
      <motion.div style={{ y }} className="absolute inset-0 scale-110">
        <MediaBackground
          type={mediaType}
          imageSrc={imageSrc}
          videoSrc={videoSrc}
          overlay={overlay}
          parallax
        />
      </motion.div>

      <motion.div
        style={{ opacity }}
        className="relative z-10 w-full px-4 pb-16 pt-28 sm:px-6 sm:pb-20 sm:pt-32 lg:px-8 lg:pb-28"
      >
        <div className="mx-auto max-w-7xl">
          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-4 text-xs font-medium uppercase tracking-[0.35em] text-luxury-gold-light"
            >
              {subtitle}
            </motion.p>
          )}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-4xl font-light leading-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
          >
            {title}
          </motion.h1>
          {description && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 max-w-2xl text-base leading-relaxed text-white/70 md:text-lg"
            >
              {description}
            </motion.p>
          )}
          {ctaText && ctaHref ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="mt-8"
            >
              <Link
                href={ctaHref}
                className="inline-flex items-center gap-2.5 rounded-full bg-luxury-gold px-8 py-3.5 font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:-translate-y-0.5"
              >
                {ctaText}
                <ArrowRight className="h-4 w-4" strokeWidth={1.6} />
              </Link>
            </motion.div>
          ) : null}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-8 h-px w-20 origin-left bg-luxury-gold/60"
          />
        </div>
      </motion.div>
    </section>
  );
}
