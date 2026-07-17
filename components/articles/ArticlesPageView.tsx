"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, Search, User } from "lucide-react";
import { ArticlesHero } from "@/components/articles/ArticlesHero";
import { SafeImage } from "@/components/shared/SafeImage";
import type { SiteContent } from "@/lib/cms/types";
import { articleDetailPath, routes } from "@/lib/navigation";

type Article = SiteContent["articles"][number];

interface ArticlesPageViewProps {
  page: SiteContent["articlesPage"];
  articles: Article[];
  categories: SiteContent["articleCategories"];
  tags: SiteContent["articleTags"];
  authors: SiteContent["articleAuthors"];
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function ArticlesPageView({
  page,
  articles,
  categories,
  tags,
  authors,
}: ArticlesPageViewProps) {
  const gold = page.goldColor || "#C5A059";
  const heading = page.headingColor || "#062C24";
  const body = page.bodyColor || "#5A635C";
  const topBg = page.backgroundTop || "#F9F6EF";
  const bottomBg = page.backgroundBottom || "#E8F0E9";

  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [tagId, setTagId] = useState("all");

  const published = useMemo(
    () =>
      articles
        .filter((a) => a.status === "published")
        .sort((a, b) => {
          if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        }),
    [articles]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return published.filter((a) => {
      if (categoryId !== "all" && a.categoryId !== categoryId) return false;
      if (tagId !== "all" && !a.tagIds.includes(tagId)) return false;
      if (!q) return true;
      return (
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.seo.keywords.toLowerCase().includes(q)
      );
    });
  }, [published, query, categoryId, tagId]);

  const featured =
    published.find((a) => a.featured) || published.find((a) => a.pinned) || published[0];
  const gridItems =
    categoryId === "all" && !query && tagId === "all"
      ? filtered.filter((a) => a.id !== featured?.id)
      : filtered;

  const catMap = Object.fromEntries(categories.map((c) => [c.id, c]));
  const authorMap = Object.fromEntries(authors.map((a) => [a.id, a]));
  const recent = published.slice(0, 5);
  const popular = [...published].sort((a, b) => b.readingTime - a.readingTime).slice(0, 5);
  const featuredList = published.filter((a) => a.featured).slice(0, 4);
  const enabledCats = categories.filter((c) => c.enabled !== false).sort((a, b) => a.order - b.order);

  return (
    <div className="overflow-x-clip">
      <ArticlesHero hero={page.hero} />

      <section
        className="px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
        style={{
          background: `linear-gradient(180deg, ${topBg} 0%, ${bottomBg} 100%)`,
        }}
      >
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <p
            className="font-body text-[11px] uppercase tracking-[0.34em]"
            style={{ color: gold }}
          >
            {page.eyebrow}
          </p>
          <h2
            className="mt-3 font-display text-3xl font-light md:text-4xl"
            style={{ color: heading }}
          >
            {page.title}
          </h2>
          <p className="mt-4 font-body text-sm leading-relaxed" style={{ color: body }}>
            {page.description}
          </p>
          <div className="mx-auto mt-6 flex items-center justify-center gap-3" aria-hidden>
            <span className="h-px w-12" style={{ backgroundColor: `${gold}77` }} />
            <span className="h-1.5 w-1.5 rotate-45" style={{ backgroundColor: gold }} />
            <span className="h-px w-12" style={{ backgroundColor: `${gold}77` }} />
          </div>
        </div>

        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_320px]">
          <div className="space-y-12">
            {featured && categoryId === "all" && !query && tagId === "all" ? (
              <FeaturedCard
                article={featured}
                category={catMap[featured.categoryId]?.name}
                author={authorMap[featured.authorId]?.name}
                gold={gold}
                heading={heading}
                body={body}
              />
            ) : null}

            <div className="columns-1 gap-6 space-y-6 sm:columns-2 xl:columns-3">
              {gridItems.map((article, i) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  category={catMap[article.categoryId]?.name}
                  author={authorMap[article.authorId]?.name}
                  gold={gold}
                  heading={heading}
                  body={body}
                  delay={i * 0.04}
                />
              ))}
            </div>

            {gridItems.length === 0 ? (
              <p className="py-16 text-center font-body text-sm" style={{ color: body }}>
                No articles match your filters.
              </p>
            ) : null}
          </div>

          <aside className="space-y-8 lg:sticky lg:top-28 lg:self-start">
            <div
              className="rounded-2xl border bg-white/70 p-5 backdrop-blur-sm"
              style={{ borderColor: `${gold}44` }}
            >
              <label className="relative block">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/35" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={page.sidebar.searchPlaceholder}
                  className="w-full rounded-full border border-black/10 bg-white py-2.5 pl-10 pr-4 font-body text-sm outline-none focus:border-[#C5A059]"
                />
              </label>
            </div>

            <SidebarBlock title={page.sidebar.categoriesTitle} gold={gold} heading={heading}>
              <button
                type="button"
                onClick={() => setCategoryId("all")}
                className="block w-full text-left font-body text-sm transition hover:text-[#C5A059]"
                style={{ color: categoryId === "all" ? gold : body }}
              >
                All Categories
              </button>
              {enabledCats.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategoryId(c.id)}
                  className="mt-2 block w-full text-left font-body text-sm transition hover:text-[#C5A059]"
                  style={{ color: categoryId === c.id ? gold : body }}
                >
                  {c.name}
                </button>
              ))}
            </SidebarBlock>

            <SidebarBlock title={page.sidebar.recentTitle} gold={gold} heading={heading}>
              {recent.map((a) => (
                <Link
                  key={a.id}
                  href={articleDetailPath(a.slug)}
                  className="mt-3 block font-body text-sm leading-snug transition hover:text-[#C5A059]"
                  style={{ color: body }}
                >
                  {a.title}
                </Link>
              ))}
            </SidebarBlock>

            <SidebarBlock title={page.sidebar.popularTitle} gold={gold} heading={heading}>
              {popular.map((a) => (
                <Link
                  key={a.id}
                  href={articleDetailPath(a.slug)}
                  className="mt-3 block font-body text-sm leading-snug transition hover:text-[#C5A059]"
                  style={{ color: body }}
                >
                  {a.title}
                </Link>
              ))}
            </SidebarBlock>

            <SidebarBlock title={page.sidebar.featuredTitle} gold={gold} heading={heading}>
              {featuredList.map((a) => (
                <Link
                  key={a.id}
                  href={articleDetailPath(a.slug)}
                  className="mt-3 block font-body text-sm leading-snug transition hover:text-[#C5A059]"
                  style={{ color: body }}
                >
                  {a.title}
                </Link>
              ))}
            </SidebarBlock>

            <SidebarBlock title={page.sidebar.tagsTitle} gold={gold} heading={heading}>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setTagId("all")}
                  className="rounded-full border px-3 py-1 font-body text-[10px] uppercase tracking-wider"
                  style={{
                    borderColor: tagId === "all" ? gold : `${gold}44`,
                    color: tagId === "all" ? "#fff" : heading,
                    background: tagId === "all" ? gold : "transparent",
                  }}
                >
                  All
                </button>
                {tags.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTagId(t.id)}
                    className="rounded-full border px-3 py-1 font-body text-[10px] uppercase tracking-wider"
                    style={{
                      borderColor: tagId === t.id ? gold : `${gold}44`,
                      color: tagId === t.id ? "#fff" : heading,
                      background: tagId === t.id ? gold : "transparent",
                    }}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </SidebarBlock>

            <div
              className="rounded-2xl border p-6 text-center"
              style={{
                borderColor: `${gold}55`,
                background: `linear-gradient(160deg, #0A1F19 0%, #14352C 100%)`,
              }}
            >
              <p className="font-display text-xl text-white">{page.sidebar.newsletterTitle}</p>
              <p className="mt-2 font-body text-xs text-white/70">
                {page.sidebar.newsletterDescription}
              </p>
              <Link
                href={routes.contact}
                className="mt-5 inline-flex rounded-full px-6 py-2.5 font-body text-[10px] font-semibold uppercase tracking-[0.18em] text-[#0A1F19]"
                style={{ backgroundColor: gold }}
              >
                {page.sidebar.newsletterButton}
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <section className="relative overflow-hidden px-6 py-20 lg:px-10">
        <div className="absolute inset-0 bg-[#0A1F19]" />
        <div className="relative z-10 mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-light text-white md:text-4xl">
            {page.newsletterCta.title}
          </h2>
          <p className="mt-4 font-body text-sm text-white/75">{page.newsletterCta.description}</p>
          <Link
            href={routes.contact}
            className="mt-8 inline-flex rounded-full px-8 py-3.5 font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0A1F19]"
            style={{ backgroundColor: gold }}
          >
            {page.newsletterCta.buttonText}
          </Link>
        </div>
      </section>
    </div>
  );
}

function SidebarBlock({
  title,
  gold,
  heading,
  children,
}: {
  title: string;
  gold: string;
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl border bg-white/70 p-5 backdrop-blur-sm"
      style={{ borderColor: `${gold}44` }}
    >
      <p
        className="font-body text-[10px] font-semibold uppercase tracking-[0.24em]"
        style={{ color: gold }}
      >
        {title}
      </p>
      <div className="mt-3" style={{ color: heading }}>
        {children}
      </div>
    </div>
  );
}

function FeaturedCard({
  article,
  category,
  author,
  gold,
  heading,
  body,
}: {
  article: Article;
  category?: string;
  author?: string;
  gold: string;
  heading: string;
  body: string;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="overflow-hidden rounded-2xl border bg-white/80 shadow-[0_24px_60px_rgba(15,42,34,0.1)]"
      style={{ borderColor: `${gold}66` }}
    >
      <div className="grid md:grid-cols-2">
        <div className="relative min-h-[280px] md:min-h-[360px]">
          <SafeImage
            src={article.coverImage}
            alt={article.coverAlt || article.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>
        <div className="flex flex-col justify-center p-8 lg:p-10">
          <p
            className="font-body text-[10px] uppercase tracking-[0.24em]"
            style={{ color: gold }}
          >
            {category || "Featured"}
          </p>
          <h3
            className="mt-3 font-display text-2xl font-light leading-snug md:text-3xl"
            style={{ color: heading }}
          >
            {article.title}
          </h3>
          <p className="mt-4 font-body text-sm leading-relaxed" style={{ color: body }}>
            {article.excerpt}
          </p>
          <div
            className="mt-5 flex flex-wrap gap-4 font-body text-xs"
            style={{ color: body }}
          >
            <span className="inline-flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" /> {author || "Editorial"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> {article.readingTime} min
            </span>
            <span>{formatDate(article.publishedAt)}</span>
          </div>
          <Link
            href={articleDetailPath(article.slug)}
            className="mt-8 inline-flex w-fit rounded-full px-7 py-3 font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-white"
            style={{ backgroundColor: gold }}
          >
            Read Article
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

function ArticleCard({
  article,
  category,
  author,
  gold,
  heading,
  body,
  delay,
}: {
  article: Article;
  category?: string;
  author?: string;
  gold: string;
  heading: string;
  body: string;
  delay: number;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="mb-6 break-inside-avoid overflow-hidden rounded-2xl border bg-white/80 shadow-[0_18px_40px_rgba(15,42,34,0.08)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(15,42,34,0.14)]"
      style={{ borderColor: `${gold}55` }}
    >
      <Link href={articleDetailPath(article.slug)} className="group block">
        <div className="relative aspect-[4/3] overflow-hidden">
          <SafeImage
            src={article.coverImage}
            alt={article.coverAlt || article.title}
            fill
            className="object-cover transition duration-700 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
          />
        </div>
        <div className="p-5">
          <p
            className="font-body text-[9px] uppercase tracking-[0.22em]"
            style={{ color: gold }}
          >
            {category || "Article"}
          </p>
          <h3
            className="mt-2 font-display text-xl font-light leading-snug"
            style={{ color: heading }}
          >
            {article.title}
          </h3>
          <p className="mt-2 line-clamp-3 font-body text-sm leading-relaxed" style={{ color: body }}>
            {article.excerpt}
          </p>
          <div className="mt-4 flex flex-wrap gap-3 font-body text-[11px]" style={{ color: body }}>
            <span>{author}</span>
            <span>{article.readingTime} min</span>
            <span>{formatDate(article.publishedAt)}</span>
          </div>
          <span
            className="mt-4 inline-block font-body text-[10px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: gold }}
          >
            Read More →
          </span>
        </div>
      </Link>
    </motion.article>
  );
}
