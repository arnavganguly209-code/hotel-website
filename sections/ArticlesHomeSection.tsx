"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { ArticlesHomeSlider } from "@/components/home/ArticlesHomeSlider";
import { luxuryFadeUp, luxuryStagger } from "@/lib/animations";
import { articleDetailPath } from "@/lib/navigation";
import type { SiteContent } from "@/lib/cms/types";

interface ArticlesHomeSectionProps {
  articles: SiteContent["articles"];
  section: SiteContent["articlesHomeSection"];
  categories: SiteContent["articleCategories"];
  authors: SiteContent["articleAuthors"];
}

export function ArticlesHomeSection({
  articles,
  section,
  categories,
  authors,
}: ArticlesHomeSectionProps) {
  if (section.enabled === false) return null;

  const gold = section.goldColor || "#D4AF37";
  const heading = section.headingColor || "#0F2420";
  const body = section.bodyColor || "#5A6B60";
  const topBg = section.backgroundTop || "#FAF6EE";
  const bottomBg = section.backgroundBottom || "#F4EFE4";
  const padY = section.sectionPaddingY ?? 88;
  const limit = section.articleLimit ?? 9;

  const categoryMap = useMemo(
    () =>
      Object.fromEntries(
        categories.filter((c) => c.enabled !== false).map((c) => [c.id, c.name])
      ),
    [categories]
  );

  const authorMap = useMemo(
    () => Object.fromEntries(authors.map((a) => [a.id, a.name])),
    [authors]
  );

  const published = useMemo(
    () =>
      [...articles]
        .filter((a) => a.status === "published" && Boolean(a.slug?.trim()))
        .sort(
          (a, b) =>
            new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        )
        .slice(0, Math.max(1, limit)),
    [articles, limit]
  );

  const structuredData = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: section.title,
      description: section.description,
      itemListElement: published.map((article, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: articleDetailPath(article.slug),
        name: article.title,
      })),
    }),
    [published, section.title, section.description]
  );

  if (!published.length) return null;

  return (
    <section
      id="latest-articles"
      aria-label={`${section.eyebrow} — ${section.title}`}
      className="relative overflow-x-clip"
      style={{
        background: `linear-gradient(180deg, ${topBg} 0%, ${topBg} 55%, ${bottomBg} 100%)`,
      }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div
        className="relative mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8"
        style={{ paddingTop: padY, paddingBottom: padY }}
      >
        <motion.div
          variants={luxuryStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="mx-auto mb-12 max-w-3xl text-center md:mb-14"
        >
          <motion.p
            variants={luxuryFadeUp}
            className="mb-5 font-body text-[12px] font-semibold uppercase sm:text-[13px]"
            style={{ color: gold, letterSpacing: "0.34em" }}
          >
            {section.eyebrow}
          </motion.p>

          <motion.h2
            variants={luxuryFadeUp}
            className="font-display text-[1.95rem] font-semibold leading-[1.18] tracking-[0.02em] sm:text-3xl md:text-[2.35rem] lg:text-[2.5rem]"
            style={{ color: heading }}
          >
            {section.title}
          </motion.h2>

          <motion.div
            variants={luxuryFadeUp}
            className="mx-auto mt-5 flex items-center justify-center gap-3"
            aria-hidden
          >
            <span className="h-px w-12" style={{ backgroundColor: `${gold}66` }} />
            <span
              className="h-1.5 w-1.5 rotate-45"
              style={{ backgroundColor: `${gold}BB` }}
            />
            <span className="h-px w-12" style={{ backgroundColor: `${gold}66` }} />
          </motion.div>

          {section.description ? (
            <motion.p
              variants={luxuryFadeUp}
              className="mx-auto mt-7 max-w-2xl font-body text-[15px] font-medium leading-[1.85] md:text-base"
              style={{ color: body }}
            >
              {section.description}
            </motion.p>
          ) : null}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative px-2 sm:px-6 md:px-10"
        >
          <ArticlesHomeSlider
            articles={published}
            section={section}
            categoryMap={categoryMap}
            authorMap={authorMap}
          />
        </motion.div>
      </div>
    </section>
  );
}
