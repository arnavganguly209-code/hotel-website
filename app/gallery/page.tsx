import type { Metadata } from "next";
import { getContent } from "@/lib/cms/store";
import { GalleryPage } from "@/components/gallery/GalleryPage";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent();
  const { seo, hero } = content.galleryPage;
  const title = seo.title || "Gallery";
  const description =
    seo.description ||
    `Visual journey through ${content.hotel.name} — luxury hospitality in Kathmandu.`;

  return {
    title,
    description,
    keywords: seo.keywords,
    alternates: seo.canonical ? { canonical: seo.canonical } : undefined,
    openGraph: {
      title,
      description,
      url: seo.canonical || "/gallery",
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

export default async function GalleryRoute() {
  const content = await getContent();
  const page = content.galleryPage;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hotel.theglobalorbit.com";

  const items = content.gallery
    .filter((g) => g.active !== false && Boolean(g.src))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((g) => ({
      id: g.id,
      src: g.src,
      title: g.title,
      description: g.description,
      category: g.category,
      alt: g.alt,
      type: g.type || "image",
      poster: g.poster,
      featured: g.featured === true,
    }));

  const categories = [...content.galleryCategories]
    .filter((c) => c.enabled !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((c) => c.name);

  const imageSchema = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: `${content.hotel.name} Gallery`,
    description: page.seo.description,
    url: `${siteUrl}/gallery`,
    image: items.filter((i) => i.type !== "video").slice(0, 8).map((item) => ({
      "@type": "ImageObject",
      contentUrl: item.src.startsWith("http") ? item.src : `${siteUrl}${item.src}`,
      name: item.title,
      description: item.description || item.alt || item.title,
    })),
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: page.hero.breadcrumbHome || "Home",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: page.hero.breadcrumbCurrent || "Gallery",
        item: `${siteUrl}/gallery`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(imageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <GalleryPage
        page={page}
        items={items}
        categories={categories}
        hotelName={content.hotel.name}
      />
    </>
  );
}
