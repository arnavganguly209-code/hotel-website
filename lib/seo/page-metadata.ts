import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";
import type { PageSeo } from "@/lib/cms/types";

export function buildPageMetadata(
  seo: PageSeo,
  path: string,
  siteName = "Hotel Thamel Park & Spa"
): Metadata {
  const url = `${SITE_URL}${path === "/" ? "" : path}`;
  const ogImage = seo.ogImage ?? "/media/hero/hero-background.png";

  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: seo.canonical ?? url },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url,
      siteName,
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: seo.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: [ogImage],
    },
  };
}

export function buildBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
