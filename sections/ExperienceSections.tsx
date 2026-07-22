"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { LuxuryImageBox } from "@/components/shared/LuxuryImageBox";
import { MotionSection } from "@/components/shared/MotionSection";
import { fadeUp, luxuryStagger } from "@/lib/animations";
import { routes } from "@/lib/navigation";
import type { SiteContent } from "@/lib/cms/types";

interface ExperienceSectionsProps {
  experiences: SiteContent["experiences"];
}

const EXPERIENCE_META: Record<string, { eyebrow: string; href: string; cta: string }> = {
  dining: { eyebrow: "Fine Dining", href: routes.restaurant, cta: "Explore Restaurant" },
  cafe: { eyebrow: "Lobby Café", href: routes.restaurant, cta: "View Café Experience" },
  lounge: { eyebrow: "Rooftop Experience", href: routes.restaurant, cta: "Explore Sky Lounge" },
  spa: { eyebrow: "Spa & Wellness", href: routes.spa, cta: "Explore Wellness" },
  culture: { eyebrow: "Nepali Heritage", href: routes.culturalExperience, cta: "Explore Culture" },
  room: { eyebrow: "Accommodations", href: routes.rooms, cta: "View Rooms" },
  gallery: { eyebrow: "Gallery", href: routes.gallery, cta: "View Gallery" },
};

export function ExperienceSections({ experiences }: ExperienceSectionsProps) {
  return (
    <>
      {experiences.map((exp, index) => {
        const imageLeft = exp.imagePosition === "left";
        const paragraphs = exp.content.split(/\n\n+/).filter(Boolean);
        const meta = EXPERIENCE_META[exp.variant] ?? EXPERIENCE_META.dining;
        const bgStyle =
          index % 2 === 0
            ? { background: "linear-gradient(180deg, #FFF9F2 0%, #FAF6EE 100%)" }
            : { background: "linear-gradient(180deg, #F6ECD7 0%, #EAF2E8 100%)" };

        return (
          <MotionSection
            key={exp.id}
            id={exp.id}
            className="section-padding section-glow relative overflow-hidden"
            style={bgStyle}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(201,164,76,0.04)_0%,transparent_55%)]" />
            <div className="relative mx-auto max-w-7xl">
              <div className="grid items-stretch gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20">
                <motion.div
                  variants={fadeUp}
                  className={`relative min-h-[400px] lg:min-h-[580px] ${imageLeft ? "order-1" : "order-1 lg:order-2"}`}
                >
                  <LuxuryImageBox
                    src={exp.imageSrc}
                    alt={exp.title}
                    label={exp.title}
                    variant={exp.variant}
                    className="h-full min-h-[400px] w-full lg:min-h-[580px]"
                  />
                </motion.div>

                <motion.div
                  variants={luxuryStagger}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-80px" }}
                  className={`flex flex-col justify-center lg:min-h-[580px] ${imageLeft ? "order-2" : "order-2 lg:order-1"}`}
                >
                  <motion.p
                    variants={fadeUp}
                    className="mb-4 text-[11px] font-semibold uppercase tracking-[0.32em] text-luxury-gold-label"
                  >
                    {meta.eyebrow}
                  </motion.p>
                  <motion.h2
                    variants={fadeUp}
                    className="font-display text-3xl font-medium leading-[1.12] text-luxury-forest md:text-4xl lg:text-[2.75rem]"
                  >
                    {exp.title}
                  </motion.h2>
                  <motion.div
                    variants={fadeUp}
                    className="my-6 h-px w-20 bg-gradient-to-r from-luxury-gold via-luxury-gold/40 to-transparent"
                  />
                  <motion.div
                    variants={fadeUp}
                    className="space-y-5 text-[15px] leading-[1.85] text-luxury-muted md:text-base"
                  >
                    {paragraphs.slice(0, 3).map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </motion.div>
                  <motion.div variants={fadeUp}>
                    <Link
                      href={meta.href}
                      prefetch
                      className="group mt-10 inline-flex items-center gap-2.5 rounded-full border border-luxury-gold/30 bg-luxury-gold px-7 py-3.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white shadow-luxury-gold transition-all duration-500 hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      {meta.cta}
                      <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
                    </Link>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </MotionSection>
        );
      })}
    </>
  );
}
