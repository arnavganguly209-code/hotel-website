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

export function ExperienceSections({ experiences }: ExperienceSectionsProps) {
  return (
    <>
      {experiences.map((exp, index) => {
        const imageLeft = exp.imagePosition === "left";
        const paragraphs = exp.content.split(/\n\n+/).filter(Boolean);
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
            <div className="mx-auto max-w-7xl">
              <div className="grid items-stretch gap-12 lg:grid-cols-2 lg:gap-20">
                <motion.div
                  variants={fadeUp}
                  className={`flex ${imageLeft ? "order-1" : "order-1 lg:order-2"}`}
                >
                  <div className="relative w-full">
                    <LuxuryImageBox
                      src={exp.imageSrc}
                      alt={exp.title}
                      label={exp.title}
                      variant={exp.variant}
                      className="aspect-[4/5] h-full max-h-[480px] min-h-[360px] w-full"
                    />
                    <div className="pointer-events-none absolute -bottom-3 -right-3 h-full w-full rounded-[28px] border border-luxury-gold/15" />
                  </div>
                </motion.div>

                <motion.div
                  variants={luxuryStagger}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className={`flex flex-col justify-center lg:max-h-[480px] ${imageLeft ? "order-2" : "order-2 lg:order-1"}`}
                >
                  <motion.p variants={fadeUp} className="mb-4 text-[11px] font-semibold uppercase tracking-[0.3em] text-luxury-gold-label">
                    Experience
                  </motion.p>
                  <motion.h2 variants={fadeUp} className="font-display text-3xl font-normal leading-tight text-luxury-forest md:text-4xl lg:text-[2.5rem]">
                    {exp.title}
                  </motion.h2>
                  <motion.div variants={fadeUp} className="my-5 h-px w-16 bg-gradient-to-r from-luxury-gold/50 to-transparent" />
                  <motion.div variants={fadeUp} className="space-y-4 text-base leading-[1.8] text-luxury-muted md:text-[17px]">
                    {paragraphs.slice(0, 2).map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </motion.div>
                  <motion.div variants={fadeUp}>
                    <Link
                      href={exp.variant === "spa" ? routes.spa : routes.dining}
                      className="group mt-10 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-luxury-forest transition-colors duration-500 hover:text-luxury-gold"
                    >
                      Explore More
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
