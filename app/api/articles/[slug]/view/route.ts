import { NextResponse } from "next/server";
import { mutateArticlesContent } from "@/lib/admin/articles";
import { isDatabaseAvailable } from "@/lib/db";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

/** Public view counter for published articles. */
export async function POST(_req: Request, { params }: Params) {
  if (!isDatabaseAvailable()) {
    return NextResponse.json({ success: false }, { status: 503 });
  }
  const { slug } = await params;
  let views = 0;
  await mutateArticlesContent((content) => ({
    ...content,
    articles: content.articles.map((article) => {
      if (article.slug !== slug || article.status !== "published") return article;
      views = (article.views || 0) + 1;
      return { ...article, views };
    }),
  }));
  return NextResponse.json({ success: true, views });
}
