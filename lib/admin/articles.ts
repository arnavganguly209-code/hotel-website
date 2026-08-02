import type { SiteContent } from "@/lib/cms/types";
import { getContent, saveContent } from "@/lib/cms/store";
import { revalidateSiteContent } from "@/lib/cms/revalidate";

export type CmsArticle = SiteContent["articles"][number];
export type ArticleStatus = CmsArticle["status"];

export function slugifyArticle(input: string): string {
  return (input || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 120);
}

export function estimateReadingTime(html: string): number {
  const text = (html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = text ? text.split(" ").length : 0;
  return Math.max(1, Math.ceil(words / 200));
}

export function extractExcerpt(html: string, max = 180): string {
  const text = (html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trim()}…`;
}

export function buildTocFromHtml(html: string): CmsArticle["toc"] {
  const toc: CmsArticle["toc"] = [];
  const re = /<h([23])[^>]*(?:id=["']([^"']+)["'])?[^>]*>([\s\S]*?)<\/h\1>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html || ""))) {
    const level = Number(match[1]) as 2 | 3;
    const label = match[3].replace(/<[^>]+>/g, "").trim();
    if (!label) continue;
    const id = match[2] || slugifyArticle(label) || `h-${toc.length + 1}`;
    toc.push({ id, label, level });
  }
  return toc;
}

export function emptyArticleSeo(title = ""): CmsArticle["seo"] {
  return {
    title,
    description: "",
    keywords: "",
    canonical: "",
    ogImage: "",
    focusKeyword: "",
    twitterTitle: "",
    twitterDescription: "",
    ogTitle: "",
    ogDescription: "",
    twitterImage: "",
    robots: "index,follow",
    schemaType: "Article",
    breadcrumbTitle: "",
  };
}

export function createBlankArticle(
  content: SiteContent,
  overrides: Partial<CmsArticle> = {}
): CmsArticle {
  const order = content.articles.length
    ? Math.max(...content.articles.map((a) => a.order ?? 0)) + 1
    : 0;
  const generatedId = `article-${Date.now()}`;
  const title = overrides.title || "New Article";
  const slug = overrides.slug || slugifyArticle(title) || `new-article-${order}`;
  const base: CmsArticle = {
    id: generatedId,
    slug,
    title,
    subtitle: "",
    excerpt: "",
    body: "<p>Start writing your luxury editorial story…</p>",
    coverImage: "",
    coverAlt: "",
    categoryId: content.articleCategories[0]?.id || "",
    tagIds: [],
    authorId: content.articleAuthors[0]?.id || "",
    readingTime: 1,
    publishedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: "draft",
    featured: false,
    pinned: false,
    allowComments: true,
    relatedIds: [],
    seo: emptyArticleSeo(title),
    faq: [],
    toc: [],
    revisions: [],
    scheduledAt: "",
    views: 0,
    internalNotes: "",
    order,
  };
  return {
    ...base,
    ...overrides,
    id: overrides.id || generatedId,
    seo: { ...emptyArticleSeo(title), ...(overrides.seo || {}) },
  };
}

/** Auto-publish due scheduled articles; returns whether content changed. */
export function applyScheduledPublishes(content: SiteContent): {
  content: SiteContent;
  changed: boolean;
} {
  const now = Date.now();
  let changed = false;
  const articles = content.articles.map((article) => {
    if (article.status !== "scheduled") return article;
    const when = article.scheduledAt || article.publishedAt;
    if (!when) return article;
    const ts = Date.parse(when);
    if (!Number.isFinite(ts) || ts > now) return article;
    changed = true;
    return {
      ...article,
      status: "published" as const,
      publishedAt: article.publishedAt || new Date(ts).toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });
  if (!changed) return { content, changed: false };
  return { content: { ...content, articles }, changed: true };
}

export async function loadArticlesContent(): Promise<SiteContent> {
  const content = await getContent();
  const { content: next, changed } = applyScheduledPublishes(content);
  if (changed) {
    await saveContent(next);
    revalidateSiteContent();
  }
  return next;
}

export async function mutateArticlesContent(
  mutator: (content: SiteContent) => SiteContent
): Promise<SiteContent> {
  const current = await loadArticlesContent();
  const next = mutator(current);
  await saveContent(next);
  revalidateSiteContent();
  return next;
}

export function normalizeArticle(article: CmsArticle): CmsArticle {
  const body = article.body || "";
  const readingTime =
    typeof article.readingTime === "number" && article.readingTime > 0
      ? article.readingTime
      : estimateReadingTime(body);
  const excerpt = (article.excerpt || "").trim() || extractExcerpt(body);
  const toc =
    article.toc && article.toc.length > 0 ? article.toc : buildTocFromHtml(body);
  const seo = {
    ...emptyArticleSeo(article.title),
    ...(article.seo || {}),
  };
  if (!seo.title) seo.title = article.title;
  if (!seo.description) seo.description = excerpt;
  if (!seo.canonical) seo.canonical = `/articles/${article.slug}`;
  if (!seo.ogImage) seo.ogImage = article.coverImage || "";
  if (!seo.ogTitle) seo.ogTitle = seo.title;
  if (!seo.ogDescription) seo.ogDescription = seo.description;
  if (!seo.twitterTitle) seo.twitterTitle = seo.title;
  if (!seo.twitterDescription) seo.twitterDescription = seo.description;
  if (!seo.twitterImage) seo.twitterImage = seo.ogImage;
  if (!seo.breadcrumbTitle) seo.breadcrumbTitle = article.title;
  if (!seo.robots) seo.robots = "index,follow";
  if (!seo.schemaType) seo.schemaType = "Article";

  return {
    ...article,
    readingTime,
    excerpt,
    toc,
    seo,
    views: typeof article.views === "number" ? article.views : 0,
    internalNotes: article.internalNotes || "",
    scheduledAt: article.scheduledAt || "",
    updatedAt: article.updatedAt || article.publishedAt || new Date().toISOString(),
  };
}
