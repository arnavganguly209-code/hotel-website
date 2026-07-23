import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getContent } from "@/lib/cms/store";
import { ArticleDetailView } from "@/components/articles/ArticleDetailView";
import { articleDetailPath } from "@/lib/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const content = await getContent();
  const article = content.articles.find(
    (a) => a.slug === slug && a.status !== "trash"
  );
  if (!article) return { title: "Article" };

  const metaTitle = article.seo.title || article.title;
  const metaDescription = article.seo.description || article.excerpt;
  const keywords = article.seo.keywords
    ? article.seo.keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean)
    : undefined;

  return {
    title: metaTitle,
    description: metaDescription,
    keywords,
    alternates: {
      canonical: article.seo.canonical || articleDetailPath(article.slug),
    },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url: article.seo.canonical || articleDetailPath(article.slug),
      type: "article",
      publishedTime: article.publishedAt,
      images: [
        {
          url: article.seo.ogImage || article.coverImage,
          alt: article.coverAlt || article.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: article.seo.twitterTitle || metaTitle,
      description: article.seo.twitterDescription || metaDescription,
      images: [article.seo.ogImage || article.coverImage],
    },
  };
}

export default async function ArticleDetailRoute({ params }: Props) {
  const { slug } = await params;
  const content = await getContent();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hotel.theglobalorbit.com";

  const published = content.articles
    .filter((a) => a.status === "published")
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

  const article = published.find((a) => a.slug === slug);
  if (!article) notFound();

  const index = published.findIndex((a) => a.id === article.id);
  const prev = index < published.length - 1 ? published[index + 1] : null;
  const next = index > 0 ? published[index - 1] : null;

  const category = content.articleCategories.find((c) => c.id === article.categoryId);
  const author = content.articleAuthors.find((a) => a.id === article.authorId);
  const related = article.relatedIds
    .map((id) => published.find((a) => a.id === id))
    .filter(Boolean)
    .slice(0, 3) as typeof published;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    image: article.coverImage,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    author: {
      "@type": "Person",
      name: author?.name || "Editorial Team",
    },
    publisher: {
      "@type": "Organization",
      name: content.hotel.name,
    },
    mainEntityOfPage: `${siteUrl}${articleDetailPath(article.slug)}`,
  };

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
      {
        "@type": "ListItem",
        position: 3,
        name: article.title,
        item: `${siteUrl}${articleDetailPath(article.slug)}`,
      },
    ],
  };

  const faqSchema =
    article.faq.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: article.faq.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer },
          })),
        }
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      {faqSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      ) : null}
      <ArticleDetailView
        page={content.articlesPage}
        article={article}
        categoryName={category?.name}
        author={author}
        tags={content.articleTags}
        related={related}
        prev={prev}
        next={next}
        siteUrl={siteUrl}
      />
    </>
  );
}
