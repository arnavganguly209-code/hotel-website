import type { Metadata } from "next";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { BRAND_OG_IMAGE_PATH, brandAsset } from "@/lib/brand";
import type { PageSeo } from "@/lib/cms/types";
import { parseRobots } from "@/lib/seo/robots";

export function buildPageMetadata(
  seo: PageSeo & { keywords?: string },
  path: string,
  siteName = SITE_NAME
): Metadata {
  const url = `${SITE_URL}${path === "/" ? "" : path}`;
  const ogImage = seo.ogImage ?? brandAsset(BRAND_OG_IMAGE_PATH);
  const rawCanonical = seo.canonical ?? url;
  const canonical = rawCanonical.startsWith("http")
    ? rawCanonical
    : `${SITE_URL}${rawCanonical.startsWith("/") ? rawCanonical : `/${rawCanonical}`}`;
  const ogTitle = seo.ogTitle || seo.title;
  const ogDescription = seo.ogDescription || seo.description;

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    robots: parseRobots(seo.robots),
    alternates: { canonical },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: canonical,
      siteName,
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: ogTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
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
      item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}
