"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { MediaBackground } from "@/components/shared/MediaBackground";
import type { SiteContent } from "@/lib/cms/types";
import { routes } from "@/lib/navigation";

interface AboutHeroProps {
  hero: SiteContent["aboutPage"]["hero"];
}

export function AboutHero({ hero }: AboutHeroProps) {
  const overlay = Math.min(0.65, Math.max(0.35, hero.overlayOpacity || 0.45));

  return (
    <section className="relative flex min-h-[72vh] items-end overflow-hidden md:min-h-[78vh]">
      <div className="absolute inset-0">
        <MediaBackground type="image" imageSrc={hero.imageSrc} overlay="dark" parallax />
        <div
          className="absolute inset-0"
          style={{ backgroundColor: `rgba(8, 18, 14, ${overlay})` }}
          aria-hidden
        />
        <div
          className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#F7F4EF] to-transparent opacity-90"
          aria-hidden
        />
      </div>

      <div className="relative z-10 w-full px-6 pb-24 pt-36 text-center lg:px-10 lg:pb-28">
        <motion.nav
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          aria-label="Breadcrumb"
          className="mb-10 flex items-center justify-center gap-2 font-body text-[11px] uppercase tracking-[0.22em] text-white/75"
        >
          <Link href={routes.home} className="transition hover:text-[#D4AF37]">
            {hero.breadcrumbHome || "Home"}
          </Link>
          <ChevronRight className="h-3 w-3 text-[#D4AF37]/80" strokeWidth={1.5} />
          <span className="text-[#D4AF37]">{hero.breadcrumbCurrent || "About Us"}</span>
        </motion.nav>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08 }}
          className="font-display text-sm uppercase tracking-[0.38em] text-[#D4AF37] md:text-base"
        >
          {hero.title}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.14 }}
          className="mx-auto mt-5 max-w-4xl font-display text-4xl font-light leading-tight text-white md:text-5xl lg:text-6xl"
        >
          {hero.subtitle}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.22 }}
          className="mx-auto mt-6 max-w-2xl font-body text-sm leading-relaxed text-white/85 md:text-[15px]"
        >
          {hero.description}
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.85, duration: 0.8 }}
          className="mt-14 flex flex-col items-center gap-2"
        >
          <span className="font-body text-[10px] uppercase tracking-[0.28em] text-white/55">
            Scroll
          </span>
          <span className="h-10 w-px animate-pulse bg-gradient-to-b from-[#D4AF37] to-transparent" />
        </motion.div>
      </div>
    </section>
  );
}
