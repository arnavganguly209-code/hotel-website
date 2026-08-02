import { NextResponse } from "next/server";
import { assertSameOrigin, getAdminSessionUser } from "@/lib/admin/auth";
import {
  createBlankArticle,
  loadArticlesContent,
  mutateArticlesContent,
  normalizeArticle,
  type CmsArticle,
} from "@/lib/admin/articles";
import { isDatabaseAvailable } from "@/lib/db";

export const dynamic = "force-dynamic";

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

function enrichList(content: Awaited<ReturnType<typeof loadArticlesContent>>) {
  const catMap = Object.fromEntries(content.articleCategories.map((c) => [c.id, c]));
  const authorMap = Object.fromEntries(content.articleAuthors.map((a) => [a.id, a]));
  return content.articles.map((article) => {
    const a = normalizeArticle(article);
    return {
      ...a,
      categoryName: catMap[a.categoryId]?.name || "—",
      authorName: authorMap[a.authorId]?.name || "—",
    };
  });
}

export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if ("error" in auth && auth.error) return auth.error;

  const content = await loadArticlesContent();
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim().toLowerCase();
  const status = (searchParams.get("status") || "all").trim();
  const categoryId = (searchParams.get("categoryId") || "").trim();
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const pageSize = Math.min(50, Math.max(5, Number(searchParams.get("pageSize") || 12)));

  let items = enrichList(content);

  if (status === "all" || !status) {
    items = items.filter((a) => a.status !== "trash");
  } else if (status === "drafts") {
    items = items.filter((a) => a.status === "draft");
  } else if (status === "scheduled") {
    items = items.filter((a) => a.status === "scheduled");
  } else {
    items = items.filter((a) => a.status === status);
  }

  if (categoryId) items = items.filter((a) => a.categoryId === categoryId);
  if (q) {
    items = items.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.slug.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.authorName.toLowerCase().includes(q) ||
        a.categoryName.toLowerCase().includes(q)
    );
  }
  if (from) {
    const t = Date.parse(from);
    if (Number.isFinite(t)) items = items.filter((a) => Date.parse(a.publishedAt) >= t);
  }
  if (to) {
    const t = Date.parse(to);
    if (Number.isFinite(t)) items = items.filter((a) => Date.parse(a.publishedAt) <= t);
  }

  items.sort((a, b) => Date.parse(b.updatedAt || b.publishedAt) - Date.parse(a.updatedAt || a.publishedAt));

  const total = items.length;
  const start = (page - 1) * pageSize;
  const pageItems = items.slice(start, start + pageSize);

  return NextResponse.json({
    success: true,
    total,
    page,
    pageSize,
    articles: pageItems,
    categories: content.articleCategories,
    tags: content.articleTags,
    authors: content.articleAuthors,
    articlesPage: content.articlesPage,
  });
}

export async function POST(req: Request) {
  const auth = await requireAdmin(req);
  if ("error" in auth && auth.error) return auth.error;

  const body = (await req.json().catch(() => ({}))) as Partial<CmsArticle> & { action?: string };
  const content = await mutateArticlesContent((current) => {
    if (body.action === "duplicate" && body.id) {
      const source = current.articles.find((a) => a.id === body.id);
      if (!source) return current;
      const copy = createBlankArticle(current, {
        ...source,
        id: `article-${Date.now()}`,
        title: `${source.title} (Copy)`,
        slug: `${source.slug}-copy`,
        status: "draft",
        featured: false,
        pinned: false,
        views: 0,
        revisions: [],
        seo: {
          ...source.seo,
          title: `${source.title} (Copy)`,
          canonical: `/articles/${source.slug}-copy`,
        },
      });
      return { ...current, articles: [...current.articles, normalizeArticle(copy)] };
    }

    const created = normalizeArticle(createBlankArticle(current, body));
    return { ...current, articles: [...current.articles, created] };
  });

  const article = content.articles[content.articles.length - 1];
  return NextResponse.json({ success: true, article });
}

export async function PATCH(req: Request) {
  const auth = await requireAdmin(req);
  if ("error" in auth && auth.error) return auth.error;

  const body = (await req.json().catch(() => ({}))) as {
    ids?: string[];
    action?: "publish" | "unpublish" | "delete" | "trash" | "draft" | "archive";
  };
  const ids = new Set(body.ids || []);
  if (!ids.size || !body.action) {
    return NextResponse.json({ success: false, error: "ids and action required" }, { status: 400 });
  }

  await mutateArticlesContent((current) => ({
    ...current,
    articles: current.articles
      .map((article) => {
        if (!ids.has(article.id)) return article;
        if (body.action === "delete") return null;
        if (body.action === "trash") {
          return { ...article, status: "trash" as const, updatedAt: new Date().toISOString() };
        }
        if (body.action === "publish") {
          return {
            ...article,
            status: "published" as const,
            publishedAt: article.publishedAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        }
        if (body.action === "unpublish" || body.action === "draft") {
          return { ...article, status: "draft" as const, updatedAt: new Date().toISOString() };
        }
        if (body.action === "archive") {
          return { ...article, status: "archived" as const, updatedAt: new Date().toISOString() };
        }
        return article;
      })
      .filter(Boolean) as CmsArticle[],
  }));

  return NextResponse.json({ success: true });
}
