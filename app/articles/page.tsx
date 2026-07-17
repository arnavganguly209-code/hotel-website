import type { Metadata } from "next";
import { getContent } from "@/lib/cms/store";
import { ArticlesPageView } from "@/components/articles/ArticlesPageView";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent();
  const { seo, hero } = content.articlesPage;
  const title = seo.title || "Articles";
  const description = seo.description || hero.description;

  return {
    title,
    description,
    keywords: seo.keywords,
    alternates: seo.canonical ? { canonical: seo.canonical } : undefined,
    openGraph: {
      title,
      description,
      url: seo.canonical || "/articles",
      type: "website",
      images: seo.ogImage ? [{ url: seo.ogImage, alt: hero.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: seo.ogImage ? [seo.ogImage] : undefined,
    },
  };
}

export default async function ArticlesRoute() {
  const content = await getContent();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hotel.theglobalorbit.com";

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
