import { NextResponse } from "next/server";
import { assertSameOrigin, getAdminSessionUser } from "@/lib/admin/auth";
import {
  estimateReadingTime,
  loadArticlesContent,
  mutateArticlesContent,
  normalizeArticle,
  slugifyArticle,
  type CmsArticle,
} from "@/lib/admin/articles";
import { analyzeArticleSeo } from "@/lib/admin/article-seo";
import { isDatabaseAvailable } from "@/lib/db";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

async function requireAdmin(req: Request) {
  if (!isDatabaseAvailable()) {
    return { error: NextResponse.json({ success: false, error: "Database not configured" }, { status: 503 }) };
  }
  if (!assertSameOrigin(req)) {
    return { error: NextResponse.json({ success: false, error: "Invalid request" }, { status: 403 }) };
  }
  const user = await getAdminSessionUser();
  if (!user) {
    return { error: NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 }) };
  }
  return { user };
}

export async function GET(req: Request, { params }: Params) {
  const auth = await requireAdmin(req);
  if ("error" in auth && auth.error) return auth.error;
  const { id } = await params;
  const content = await loadArticlesContent();
  const article = content.articles.find((a) => a.id === id);
  if (!article) {
    return NextResponse.json({ success: false, error: "Article not found" }, { status: 404 });
  }
  const normalized = normalizeArticle(article);
  return NextResponse.json({
    success: true,
    article: normalized,
    seo: analyzeArticleSeo(normalized),
    categories: content.articleCategories,
    tags: content.articleTags,
    authors: content.articleAuthors,
    mediaLibrary: content.mediaLibrary,
  });
}

export async function PUT(req: Request, { params }: Params) {
  const auth = await requireAdmin(req);
  if ("error" in auth && auth.error) return auth.error;
  const { id } = await params;
  const payload = (await req.json().catch(() => null)) as Partial<CmsArticle> | null;
  if (!payload) {
    return NextResponse.json({ success: false, error: "Invalid body" }, { status: 400 });
  }

  let saved: CmsArticle | null = null;
  await mutateArticlesContent((current) => {
    const idx = current.articles.findIndex((a) => a.id === id);
    if (idx < 0) return current;
    const prev = current.articles[idx];
    const nextSlug = slugifyArticle(payload.slug || payload.title || prev.slug) || prev.slug;
    const collision = current.articles.some((a) => a.id !== id && a.slug === nextSlug);
    const slug = collision ? `${nextSlug}-${Date.now().toString(36)}` : nextSlug;

    const merged: CmsArticle = normalizeArticle({
      ...prev,
      ...payload,
      id: prev.id,
      slug,
      seo: { ...prev.seo, ...(payload.seo || {}) },
      tagIds: payload.tagIds ?? prev.tagIds,
      faq: payload.faq ?? prev.faq,
      toc: payload.toc ?? prev.toc,
      readingTime:
        payload.readingTime && payload.readingTime > 0
          ? payload.readingTime
          : estimateReadingTime(payload.body ?? prev.body),
      updatedAt: new Date().toISOString(),
    });

    if (payload.body !== undefined || payload.title !== undefined) {
      merged.revisions = [
        {
          id: `rev-${Date.now()}`,
          savedAt: new Date().toISOString(),
          title: merged.title,
          body: merged.body,
        },
        ...(prev.revisions || []),
      ].slice(0, 20);
    }

    if (merged.status === "published" && !merged.publishedAt) {
      merged.publishedAt = new Date().toISOString();
    }
    if (merged.status === "scheduled" && !merged.scheduledAt) {
      merged.scheduledAt = merged.publishedAt || new Date().toISOString();
    }

    const articles = [...current.articles];
    articles[idx] = merged;
    saved = merged;
    return { ...current, articles };
  });

  if (!saved) {
    return NextResponse.json({ success: false, error: "Article not found" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    article: saved,
    seo: analyzeArticleSeo(saved),
  });
}

export async function DELETE(req: Request, { params }: Params) {
  const auth = await requireAdmin(req);
  if ("error" in auth && auth.error) return auth.error;
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const hard = searchParams.get("hard") === "1";

  await mutateArticlesContent((current) => ({
    ...current,
    articles: hard
      ? current.articles.filter((a) => a.id !== id)
      : current.articles.map((a) =>
          a.id === id
            ? { ...a, status: "trash" as const, updatedAt: new Date().toISOString() }
            : a
        ),
  }));

  return NextResponse.json({ success: true });
}
