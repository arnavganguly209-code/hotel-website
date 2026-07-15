"use client";

import { motion } from "framer-motion";
import { LuxuryShowcaseSlider } from "@/components/home/LuxuryShowcaseSlider";
import { LuxuryShowcaseStats } from "@/components/home/LuxuryShowcaseStats";
import { luxuryFadeUp, luxuryStagger } from "@/lib/animations";
import type { SiteContent } from "@/lib/cms/types";

interface OverviewProps {
  content: SiteContent["overview"];
}

/**
 * Luxury Showcase — first homepage content section BELOW the Hero.
 * Not a hero/banner/fullscreen surface.
 */
export function Overview({ content }: OverviewProps) {
  const gold = content.goldColor || "#C8A145";
  const heading = content.headingColor || "#0F2420";
  const body = content.bodyColor || "#5A6B60";
  const topBg = content.backgroundTop || "#FAF6EE";
  const bottomBg = content.backgroundBottom || "#0F2A22";
  const padY = content.spacing?.sectionPaddingY ?? 96;
  const description =
    content.content.split(/\n\n+/).filter(Boolean)[0] || content.content;

  return (
    <section
      id="overview"
      aria-label="Welcome showcase"
      className="relative overflow-hidden"
      style={{
        background: `linear-gradient(180deg, ${topBg} 0%, ${topBg} 42%, ${bottomBg} 72%, ${bottomBg} 100%)`,
      }}
    >
      <div
        className="relative mx-auto max-w-[1320px] px-3 sm:px-5 lg:px-6"
        style={{ paddingTop: padY }}
      >
        <motion.div
          variants={luxuryStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mx-auto max-w-3xl text-center"
        >
          <motion.p
            variants={luxuryFadeUp}
            className="mb-5 font-display text-[11px] font-semibold uppercase"
            style={{ color: gold, letterSpacing: "0.38em" }}
          >
            {content.eyebrow}
          </motion.p>

          <motion.h2
            variants={luxuryFadeUp}
            className="font-display text-[1.85rem] font-bold uppercase leading-[1.2] tracking-[0.02em] sm:text-3xl md:text-4xl lg:text-[2.65rem]"
            style={{ color: heading }}
          >
            {content.title}
          </motion.h2>

          <motion.div
            variants={luxuryFadeUp}
            className="mx-auto mt-6 flex items-center justify-center gap-3"
            aria-hidden
          >
            <span className="h-px w-12" style={{ backgroundColor: `${gold}66` }} />
            <span
              className="h-1.5 w-1.5 rotate-45"
              style={{ backgroundColor: `${gold}BB` }}
            />
            <span className="h-px w-12" style={{ backgroundColor: `${gold}66` }} />
          </motion.div>

          <motion.p
            variants={luxuryFadeUp}
            className="mx-auto mt-7 max-w-2xl font-body text-[15px] font-medium leading-[1.85] md:text-base"
            style={{ color: body }}
          >
            {description}
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 mt-10 md:mt-12"
        >
          <LuxuryShowcaseSlider
            slider={content.slider}
            goldColor={gold}
            maxHeight={content.spacing?.sliderMaxHeight ?? 520}
          />
        </motion.div>
      </div>

      <LuxuryShowcaseStats
        stats={content.stats}
        goldColor={gold}
        bandBackground={bottomBg}
      />
    </section>
  );
}
