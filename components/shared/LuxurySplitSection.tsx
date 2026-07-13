"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { LuxuryImageBox } from "@/components/shared/LuxuryImageBox";
import { LuxuryMediaFrame } from "@/components/shared/LuxuryMediaFrame";
import { MotionSection } from "@/components/shared/MotionSection";
import { fadeUp, luxuryStagger } from "@/lib/animations";
import type { CmsMedia } from "@/lib/cms/types";

interface LuxurySplitSectionProps {
  id?: string;
  eyebrow: string;
  title: string;
  paragraphs: string[];
  imageSrc?: string;
  media?: CmsMedia;
  imageAlt?: string;
  imageVariant?: "dining" | "cafe" | "lounge" | "spa" | "culture" | "room" | "gallery";
  imageLeft?: boolean;
  ctaHref?: string;
  ctaText?: string;
  children?: React.ReactNode;
  className?: string;
}

export function LuxurySplitSection({
  id,
  eyebrow,
  title,
  paragraphs,
  imageSrc,
  media,
  imageAlt,
  imageVariant = "gallery",
  imageLeft = true,
  ctaHref,
  ctaText = "Explore More",
  children,
  className,
}: LuxurySplitSectionProps) {
  const copy = paragraphs.filter(Boolean).slice(0, 4);

  return (
    <MotionSection
      id={id}
      className={`section-padding relative overflow-hidden ${className ?? "bg-gradient-to-b from-luxury-cream-light via-white to-luxury-sage/25"}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_0%_0%,rgba(201,164,76,0.05)_0%,transparent_50%)]" />
      <div className="relative mx-auto max-w-7xl">
        <div className="grid items-stretch gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20">
          <motion.div
            variants={fadeUp}
            className={`relative min-h-[400px] lg:min-h-[580px] ${imageLeft ? "order-1" : "order-1 lg:order-2"}`}
          >
            {media?.imageSrc ? (
              <LuxuryMediaFrame
                media={media}
                className="h-full w-full"
                aspectClass="h-full min-h-[400px] lg:min-h-[580px]"
                roundedClass="rounded-[28px]"
              />
            ) : imageSrc ? (
              <LuxuryImageBox
                src={imageSrc}
                alt={imageAlt || title}
                label={title}
                variant={imageVariant}
                className="h-full min-h-[400px] w-full lg:min-h-[580px]"
              />
            ) : null}
          </motion.div>

          <motion.div
            variants={luxuryStagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className={`flex flex-col justify-center lg:min-h-[580px] ${imageLeft ? "order-2" : "order-2 lg:order-1"}`}
          >
            <motion.p variants={fadeUp} className="mb-4 text-[11px] font-semibold uppercase tracking-[0.32em] text-luxury-gold">
              {eyebrow}
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="font-display text-3xl font-medium leading-[1.12] text-luxury-forest md:text-4xl lg:text-[2.75rem]"
            >
              {title}
            </motion.h2>
            <motion.div variants={fadeUp} className="my-6 h-px w-20 bg-gradient-to-r from-luxury-gold via-luxury-gold/40 to-transparent" />
            <motion.div variants={fadeUp} className="space-y-5 text-[15px] leading-[1.85] text-luxury-muted md:text-base">
              {copy.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </motion.div>
            {children}
            {ctaHref ? (
              <motion.div variants={fadeUp}>
                <Link
                  href={ctaHref}
                  prefetch
                  className="group mt-10 inline-flex items-center gap-2.5 rounded-full border border-luxury-gold/30 bg-luxury-gold px-7 py-3.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white shadow-luxury-gold transition-all duration-500 hover:-translate-y-0.5 hover:shadow-lg"
                >
                  {ctaText}
                  <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
                </Link>
              </motion.div>
            ) : null}
          </motion.div>
        </div>
      </div>
    </MotionSection>
  );
}
