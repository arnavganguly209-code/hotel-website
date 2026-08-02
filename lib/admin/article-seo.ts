import type { CmsArticle } from "@/lib/admin/articles-shared";

export type SeoCheckLevel = "good" | "ok" | "bad";

export type SeoCheck = {
  id: string;
  label: string;
  level: SeoCheckLevel;
  detail: string;
};

export type SeoAnalysis = {
  score: number;
  checks: SeoCheck[];
  wordCount: number;
  charCount: number;
};

function stripHtml(html: string): string {
  return (html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function levelScore(level: SeoCheckLevel): number {
  if (level === "good") return 100;
  if (level === "ok") return 60;
  return 20;
}

export function analyzeArticleSeo(article: CmsArticle): SeoAnalysis {
  const title = (article.seo?.title || article.title || "").trim();
  const meta = (article.seo?.description || article.excerpt || "").trim();
  const focus = (article.seo?.focusKeyword || "").trim().toLowerCase();
  const slug = (article.slug || "").trim();
  const bodyText = stripHtml(article.body || "");
  const words = bodyText ? bodyText.split(/\s+/).length : 0;
  const bodyLower = bodyText.toLowerCase();
  const density =
    focus && words
      ? Math.round(
          ((bodyLower.match(new RegExp(focus.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi")) || [])
            .length /
            words) *
            1000
        ) / 10
      : 0;

  const hCount = (article.body.match(/<h[1-6][^>]*>/gi) || []).length;
  const imgCount = (article.body.match(/<img\b/gi) || []).length;
  const imgWithAlt = (article.body.match(/<img\b[^>]*alt=["'][^"']+["']/gi) || []).length;
  const internalLinks = (article.body.match(/href=["']\/[^"']*["']/gi) || []).length;
  const externalLinks = (article.body.match(/href=["']https?:\/\/[^"']*["']/gi) || []).length;

  const checks: SeoCheck[] = [
    {
      id: "title",
      label: "SEO title length",
      level: title.length >= 30 && title.length <= 60 ? "good" : title.length > 0 ? "ok" : "bad",
      detail: `${title.length} chars (ideal 30–60)`,
    },
    {
      id: "meta",
      label: "Meta description",
      level: meta.length >= 120 && meta.length <= 160 ? "good" : meta.length >= 70 ? "ok" : "bad",
      detail: `${meta.length} chars (ideal 120–160)`,
    },
    {
      id: "focus",
      label: "Focus keyword",
      level: !focus
        ? "bad"
        : title.toLowerCase().includes(focus) && bodyLower.includes(focus)
          ? "good"
          : "ok",
      detail: focus
        ? `“${focus}” · density ~${density}%`
        : "Add a focus keyword",
    },
    {
      id: "slug",
      label: "URL slug",
      level: slug && slug.length <= 75 && !slug.includes(" ") ? "good" : "bad",
      detail: slug || "Missing slug",
    },
    {
      id: "headings",
      label: "Heading structure",
      level: hCount >= 2 ? "good" : hCount === 1 ? "ok" : "bad",
      detail: `${hCount} headings in body`,
    },
    {
      id: "alts",
      label: "Image alt text",
      level:
        imgCount === 0 ? "ok" : imgWithAlt === imgCount ? "good" : imgWithAlt > 0 ? "ok" : "bad",
      detail:
        imgCount === 0
          ? "No inline images"
          : `${imgWithAlt}/${imgCount} images have alt`,
    },
    {
      id: "links",
      label: "Internal / external links",
      level: internalLinks + externalLinks >= 2 ? "good" : internalLinks + externalLinks >= 1 ? "ok" : "bad",
      detail: `${internalLinks} internal · ${externalLinks} external`,
    },
    {
      id: "words",
      label: "Word count",
      level: words >= 600 ? "good" : words >= 300 ? "ok" : "bad",
      detail: `${words} words`,
    },
    {
      id: "cover",
      label: "Cover image",
      level: article.coverImage ? "good" : "bad",
      detail: article.coverImage ? "Cover set" : "Add a featured cover image",
    },
    {
      id: "readability",
      label: "Readability",
      level: words > 0 && words / Math.max(1, (article.body.match(/<p\b/gi) || []).length) < 120 ? "good" : "ok",
      detail: "Prefer short paragraphs and clear headings",
    },
  ];

  const score = Math.round(
    checks.reduce((sum, c) => sum + levelScore(c.level), 0) / checks.length
  );

  return {
    score,
    checks,
    wordCount: words,
    charCount: bodyText.length,
  };
}
