"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { SafeImage } from "@/components/shared/SafeImage";
import { MountainBackdrop } from "@/components/about/MountainBackdrop";
import { hasMediaSrc } from "@/lib/cms/media-url";
import type { SiteContent } from "@/lib/cms/types";
import { routes } from "@/lib/navigation";

interface AboutHeroProps {
  hero: SiteContent["aboutPage"]["hero"];
}

export function AboutHero({ hero }: AboutHeroProps) {
  return (
    <section className="relative isolate overflow-hidden bg-[#F7F4EF]">
      {/* Full-bleed cover */}
      <div className="relative h-[58vh] min-h-[420px] max-h-[720px] w-full overflow-hidden lg:h-[68vh]">
        {hasMediaSrc(hero.imageSrc) ? (
          <SafeImage
            src={hero.imageSrc}
            alt={hero.subtitle || "Hotel Thamel Park"}
            fill
            priority
            fadeIn={false}
            objectFit="cover"
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-[#14352C]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#F7F4EF] via-[#F7F4EF]/25 to-black/25" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#F7F4EF] to-transparent" />
      </div>

      {/* Cream storytelling band with mountain silhouette */}
      <div className="relative -mt-16 px-6 pb-16 pt-4 sm:px-8 lg:-mt-20 lg:px-10 lg:pb-20">
        <MountainBackdrop />
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <motion.nav
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            aria-label="Breadcrumb"
            className="mb-8 flex items-center justify-center gap-2 font-body text-[11px] uppercase tracking-[0.22em] text-[#5A635C]"
          >
            <Link href={routes.home} className="transition hover:text-[#C9A227]">
              {hero.breadcrumbHome || "Home"}
            </Link>
            <ChevronRight className="h-3 w-3 text-[#C9A227]/80" strokeWidth={1.5} />
            <span className="text-[#14352C]">{hero.breadcrumbCurrent || "About"}</span>
          </motion.nav>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.06 }}
            className="font-body text-[11px] font-semibold uppercase tracking-[0.32em] text-[#C9A227]"
          >
            {hero.title}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.12 }}
            className="mt-4 font-display text-4xl font-light leading-[1.12] text-[#14352C] sm:text-5xl lg:text-6xl"
          >
            {hero.subtitle}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl font-body text-sm leading-[1.85] text-[#5A635C] md:text-[15px]"
          >
            {hero.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.75, duration: 0.8 }}
            className="mt-12 flex flex-col items-center gap-2"
          >
            <span className="font-body text-[10px] uppercase tracking-[0.28em] text-[#8A938C]">
              Discover
            </span>
            <span className="h-11 w-px animate-pulse bg-gradient-to-b from-[#C9A227] to-transparent" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
