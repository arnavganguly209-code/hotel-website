import type { Metadata } from "next";
import { getContent } from "@/lib/cms/store";
import { ArticlesPageView } from "@/components/articles/ArticlesPageView";
import { metadataForPath } from "@/lib/seo/page-catalog";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent();
  return metadataForPath(content, "/articles");
}

export default async function ArticlesRoute() {
  const content = await getContent();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hotelthamelpark.com";

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      {
        "@type": "ListItem",
        position: 2,
        name: "Articles",
        item: `${siteUrl}/articles`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <ArticlesPageView
        page={content.articlesPage}
        articles={content.articles}
        categories={content.articleCategories}
        tags={content.articleTags}
        authors={content.articleAuthors}
      />
    </>
  );
}
