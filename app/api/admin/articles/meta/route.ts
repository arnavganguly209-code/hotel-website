import { NextResponse } from "next/server";
import { assertSameOrigin, getAdminSessionUser } from "@/lib/admin/auth";
import { loadArticlesContent, mutateArticlesContent, slugifyArticle } from "@/lib/admin/articles";
import { isDatabaseAvailable } from "@/lib/db";
import type { SiteContent } from "@/lib/cms/types";

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

export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if ("error" in auth && auth.error) return auth.error;
  const content = await loadArticlesContent();
  return NextResponse.json({
    success: true,
    categories: content.articleCategories,
    tags: content.articleTags,
    authors: content.articleAuthors,
    articlesPage: content.articlesPage,
    mediaLibrary: content.mediaLibrary,
  });
}

export async function PUT(req: Request) {
  const auth = await requireAdmin(req);
  if ("error" in auth && auth.error) return auth.error;

  const body = (await req.json().catch(() => ({}))) as {
    categories?: SiteContent["articleCategories"];
    tags?: SiteContent["articleTags"];
    authors?: SiteContent["articleAuthors"];
    articlesPage?: SiteContent["articlesPage"];
    mediaLibrary?: SiteContent["mediaLibrary"];
  };

  const content = await mutateArticlesContent((current) => ({
    ...current,
    articleCategories: body.categories
      ? body.categories.map((c, i) => ({
          ...c,
          slug: slugifyArticle(c.slug || c.name) || `category-${i}`,
          order: typeof c.order === "number" ? c.order : i,
          enabled: c.enabled !== false,
        }))
      : current.articleCategories,
    articleTags: body.tags
      ? body.tags.map((t, i) => ({
          ...t,
          slug: slugifyArticle(t.slug || t.name) || `tag-${i}`,
        }))
      : current.articleTags,
    articleAuthors: body.authors ?? current.articleAuthors,
    articlesPage: body.articlesPage
      ? { ...current.articlesPage, ...body.articlesPage }
      : current.articlesPage,
    mediaLibrary: body.mediaLibrary ?? current.mediaLibrary,
  }));

  return NextResponse.json({
    success: true,
    categories: content.articleCategories,
    tags: content.articleTags,
    authors: content.articleAuthors,
    articlesPage: content.articlesPage,
    mediaLibrary: content.mediaLibrary,
  });
}
