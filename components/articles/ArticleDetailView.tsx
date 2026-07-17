"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Facebook,
  Linkedin,
  User,
} from "lucide-react";
import { SafeImage } from "@/components/shared/SafeImage";
import type { SiteContent } from "@/lib/cms/types";
import { articleDetailPath, routes } from "@/lib/navigation";

type Article = SiteContent["articles"][number];

interface ArticleDetailViewProps {
  page: SiteContent["articlesPage"];
  article: Article;
  categoryName?: string;
  author?: SiteContent["articleAuthors"][number];
  tags: SiteContent["articleTags"];
  related: Article[];
  prev?: Article | null;
  next?: Article | null;
  siteUrl: string;
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

export function ArticleDetailView({
  page,
  article,
  categoryName,
  author,
  tags,
  related,
  prev,
  next,
  siteUrl,
}: ArticleDetailViewProps) {
  const gold = page.goldColor || "#C5A059";
  const heading = page.headingColor || "#062C24";
  const body = page.bodyColor || "#5A635C";
  const topBg = page.backgroundTop || "#F9F6EF";
  const shareUrl = `${siteUrl}${articleDetailPath(article.slug)}`;
  const articleTags = tags.filter((t) => article.tagIds.includes(t.id));

  return (
    <article className="overflow-x-clip">
      <header className="relative min-h-[56vh] md:min-h-[64vh]">
        <SafeImage
          src={article.coverImage}
          alt={article.coverAlt || article.title}
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-[#0A1F19]/55" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#F9F6EF] to-transparent" />
        <div className="relative z-10 mx-auto flex min-h-[56vh] max-w-4xl flex-col justify-end px-6 pb-16 pt-32 md:min-h-[64vh] md:pb-20">
          <nav
            aria-label="Breadcrumb"
            className="mb-6 flex flex-wrap items-center gap-2 font-body text-[11px] uppercase tracking-[0.2em] text-white/75"
          >
            <Link href={routes.home} className="hover:text-[#D4AF37]">
              Home
            </Link>
            <ChevronRight className="h-3 w-3 text-[#D4AF37]" />
            <Link href={routes.articles} className="hover:text-[#D4AF37]">
              Articles
            </Link>
            <ChevronRight className="h-3 w-3 text-[#D4AF37]" />
            <span className="text-[#D4AF37]">{categoryName || "Story"}</span>
          </nav>
          <p
            className="font-body text-[11px] uppercase tracking-[0.28em]"
            style={{ color: gold }}
          >
            {categoryName}
          </p>
          <h1 className="mt-3 font-display text-3xl font-light leading-tight text-white md:text-5xl">
            {article.title}
          </h1>
          <div className="mt-6 flex flex-wrap gap-4 font-body text-xs text-white/80">
            <span className="inline-flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" /> {author?.name || "Editorial"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> {article.readingTime} min read
            </span>
            <span>{formatDate(article.publishedAt)}</span>
          </div>
        </div>
      </header>

      <div
        className="px-4 py-14 sm:px-6 lg:px-8"
        style={{ background: `linear-gradient(180deg, ${topBg}, #E8F0E9)` }}
      >
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[220px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-6">
              <div>
                <p
                  className="font-body text-[10px] uppercase tracking-[0.24em]"
                  style={{ color: gold }}
                >
                  Contents
                </p>
                <nav className="mt-3 space-y-2">
                  {article.toc.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className="block font-body text-xs leading-snug transition hover:text-[#C5A059]"
                      style={{
                        color: body,
                        paddingLeft: item.level === 3 ? 12 : 0,
                      }}
                    >
                      {item.label}
                    </a>
                  ))}
                </nav>
              </div>
              <div>
                <p
                  className="font-body text-[10px] uppercase tracking-[0.24em]"
                  style={{ color: gold }}
                >
                  Share
                </p>
                <div className="mt-3 flex gap-2">
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full border"
                    style={{ borderColor: `${gold}55`, color: heading }}
                    aria-label="Share on Facebook"
                  >
                    <Facebook className="h-4 w-4" />
                  </a>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full border"
                    style={{ borderColor: `${gold}55`, color: heading }}
                    aria-label="Share on LinkedIn"
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </aside>

          <div>
            <div
              className="article-prose mx-auto max-w-3xl font-body text-[16px] leading-[1.9]"
              style={{ color: body }}
              dangerouslySetInnerHTML={{ __html: article.body }}
            />

            {articleTags.length > 0 ? (
              <div className="mx-auto mt-10 flex max-w-3xl flex-wrap gap-2">
                {articleTags.map((t) => (
                  <span
                    key={t.id}
                    className="rounded-full border px-3 py-1 font-body text-[10px] uppercase tracking-wider"
                    style={{ borderColor: `${gold}55`, color: heading }}
                  >
                    {t.name}
                  </span>
                ))}
              </div>
            ) : null}

            {author ? (
              <div
                className="mx-auto mt-12 flex max-w-3xl gap-5 rounded-2xl border bg-white/70 p-6"
                style={{ borderColor: `${gold}44` }}
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full">
                  <SafeImage
                    src={author.photo}
                    alt={author.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
                <div>
                  <p className="font-display text-lg" style={{ color: heading }}>
                    {author.name}
                  </p>
                  <p
                    className="font-body text-[10px] uppercase tracking-[0.2em]"
                    style={{ color: gold }}
                  >
                    {author.designation}
                  </p>
                  <p className="mt-2 font-body text-sm" style={{ color: body }}>
                    {author.bio}
                  </p>
                </div>
              </div>
            ) : null}

            <div className="mx-auto mt-10 flex max-w-3xl justify-between gap-4 border-t border-black/10 pt-8">
              {prev ? (
                <Link
                  href={articleDetailPath(prev.slug)}
                  className="group flex max-w-[45%] items-start gap-2"
                >
                  <ChevronLeft className="mt-1 h-4 w-4 shrink-0" style={{ color: gold }} />
                  <span>
                    <span
                      className="block font-body text-[10px] uppercase tracking-wider"
                      style={{ color: gold }}
                    >
                      Previous
                    </span>
                    <span
                      className="mt-1 block font-display text-base leading-snug group-hover:underline"
                      style={{ color: heading }}
                    >
                      {prev.title}
                    </span>
                  </span>
                </Link>
              ) : (
                <span />
              )}
              {next ? (
                <Link
                  href={articleDetailPath(next.slug)}
                  className="group flex max-w-[45%] items-start gap-2 text-right"
                >
                  <span>
                    <span
                      className="block font-body text-[10px] uppercase tracking-wider"
                      style={{ color: gold }}
                    >
                      Next
                    </span>
                    <span
                      className="mt-1 block font-display text-base leading-snug group-hover:underline"
                      style={{ color: heading }}
                    >
                      {next.title}
                    </span>
                  </span>
                  <ChevronRight className="mt-1 h-4 w-4 shrink-0" style={{ color: gold }} />
                </Link>
              ) : null}
            </div>

            {related.length > 0 ? (
              <div className="mx-auto mt-16 max-w-3xl">
                <p
                  className="font-body text-[11px] uppercase tracking-[0.28em]"
                  style={{ color: gold }}
                >
                  Related Articles
                </p>
                <div className="mt-6 grid gap-5 sm:grid-cols-3">
                  {related.map((r) => (
                    <Link
                      key={r.id}
                      href={articleDetailPath(r.slug)}
                      className="group overflow-hidden rounded-xl border bg-white/80"
                      style={{ borderColor: `${gold}44` }}
                    >
                      <div className="relative aspect-[4/3]">
                        <SafeImage
                          src={r.coverImage}
                          alt={r.coverAlt || r.title}
                          fill
                          className="object-cover transition duration-500 group-hover:scale-105"
                          sizes="200px"
                        />
                      </div>
                      <p
                        className="p-3 font-display text-sm leading-snug"
                        style={{ color: heading }}
                      >
                        {r.title}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mx-auto mt-16 max-w-3xl rounded-2xl px-8 py-10 text-center"
              style={{ background: "#0A1F19" }}
            >
              <h2 className="font-display text-2xl text-white md:text-3xl">
                {page.newsletterCta.title}
              </h2>
              <p className="mt-3 font-body text-sm text-white/70">
                {page.newsletterCta.description}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link
                  href={routes.book}
                  className="rounded-full px-7 py-3 font-body text-[10px] font-semibold uppercase tracking-[0.18em] text-[#0A1F19]"
                  style={{ backgroundColor: gold }}
                >
                  Book Your Stay
                </Link>
                <Link
                  href={routes.contact}
                  className="rounded-full border border-white/40 px-7 py-3 font-body text-[10px] font-semibold uppercase tracking-[0.18em] text-white"
                >
                  {page.newsletterCta.buttonText}
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .article-prose h2 {
          font-family: var(--font-display), Georgia, serif;
          color: ${heading};
          font-size: 1.75rem;
          font-weight: 300;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
          scroll-margin-top: 6rem;
        }
        .article-prose h3 {
          font-family: var(--font-display), Georgia, serif;
          color: ${heading};
          font-size: 1.25rem;
          font-weight: 400;
          margin-top: 1.75rem;
          margin-bottom: 0.75rem;
          scroll-margin-top: 6rem;
        }
        .article-prose p {
          margin-bottom: 1.15rem;
        }
        .article-prose p.lead::first-letter,
        .article-prose > p:first-of-type::first-letter {
          float: left;
          font-family: var(--font-display), Georgia, serif;
          font-size: 3.4rem;
          line-height: 0.85;
          padding-right: 0.45rem;
          padding-top: 0.35rem;
          color: ${gold};
          font-weight: 300;
        }
        .article-prose a {
          color: ${gold};
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .article-prose ul,
        .article-prose ol {
          margin: 1rem 0 1.25rem 1.25rem;
        }
        .article-prose li {
          margin-bottom: 0.4rem;
        }
        .article-prose blockquote {
          border-left: 2px solid ${gold};
          padding-left: 1.25rem;
          margin: 1.5rem 0;
          font-style: italic;
          color: ${heading};
        }
        .article-prose img {
          border-radius: 1rem;
          margin: 1.5rem 0;
        }
      `}</style>
    </article>
  );
}
