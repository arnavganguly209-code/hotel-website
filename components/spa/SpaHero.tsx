"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useRef } from "react";
import { SafeImage } from "@/components/shared/SafeImage";
import type { SiteContent } from "@/lib/cms/types";

interface SpaHeroProps {
  hero: SiteContent["spaPage"]["hero"];
}

export function SpaHero({ hero }: SpaHeroProps) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const overlay = Math.min(Math.max(hero.overlayOpacity ?? 0.45, 0.2), 0.75);

  return (
    <section
      ref={ref}
      className="relative flex min-h-[78vh] items-end overflow-hidden md:min-h-[85vh]"
    >
      <motion.div style={{ y }} className="absolute inset-0 scale-110">
        {hero.imageSrc ? (
          <SafeImage
            src={hero.imageSrc}
            alt={hero.title}
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
        ) : (
          <div className="h-full w-full bg-[#1A2E26]" />
        )}
        <div
          className="absolute inset-0"
          style={{ backgroundColor: `rgba(10, 22, 18, ${overlay})` }}
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/55"
          aria-hidden
        />
      </motion.div>

      <motion.div
        style={{ opacity }}
        className="relative z-10 w-full px-4 pb-20 pt-32 sm:px-6 sm:pb-24 lg:px-8 lg:pb-28"
      >
        <div className="mx-auto max-w-5xl text-center">
          <nav
            aria-label="Breadcrumb"
            className="mb-8 flex items-center justify-center gap-2 font-body text-[11px] uppercase tracking-[0.28em] text-white/65"
          >
            <Link href="/" className="transition hover:text-[#C5A059]">
              {hero.breadcrumbHome || "Home"}
            </Link>
            <span className="text-[#C5A059]" aria-hidden>
              ›
            </span>
            <span className="text-white/90">{hero.breadcrumbCurrent || "Spa & Wellness"}</span>
          </nav>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="font-display text-[11px] font-semibold uppercase tracking-[0.4em] text-[#C5A059]"
          >
            {hero.subtitle}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.08 }}
            className="mt-5 font-display text-4xl font-light leading-[1.15] text-white sm:text-5xl md:text-6xl lg:text-[4.25rem]"
          >
            {hero.title}
          </motion.h1>

          {hero.description ? (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.18 }}
              className="mx-auto mt-7 max-w-2xl font-body text-base leading-relaxed text-white/75 md:text-lg"
            >
              {hero.description}
            </motion.p>
          ) : null}
        </div>
      </motion.div>

      <a
        href="#spa-introduction"
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-white/60 transition hover:text-[#C5A059]"
        aria-label={hero.scrollHint || "Scroll"}
      >
        <span className="font-body text-[10px] uppercase tracking-[0.3em]">
          {hero.scrollHint || "Discover"}
        </span>
        <motion.span
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="h-5 w-5" strokeWidth={1.4} />
        </motion.span>
      </a>
    </section>
  );
}
