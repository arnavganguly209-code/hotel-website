import type { Metadata } from "next";
import { getContent } from "@/lib/cms/store";
import { AboutHero } from "@/components/about/AboutHero";
import { AboutPage } from "@/sections/pages/AboutPage";
import { SITE_URL } from "@/lib/seo";
import { buildBreadcrumbSchema } from "@/lib/seo/page-metadata";
import { siteConfig } from "@/lib/config";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent();
  const { seo, hero } = content.aboutPage;
  const title =
    seo.title || "About Hotel Thamel Park | Luxury Hotel in Thamel, Kathmandu";
  const description =
    seo.description ||
    `Discover ${content.hotel.name || siteConfig.name} in Thamel, Kathmandu — luxury rooms, Korean dining, spa wellness, and genuine Nepalese hospitality.`;
  const canonical = seo.canonical || "/about";
  const ogImage = seo.ogImage || hero.imageSrc;

  return {
    title,
    description,
    keywords: seo.keywords,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      siteName: content.hotel.name || siteConfig.name,
      images: ogImage
        ? [{ url: ogImage, alt: hero.subtitle || "Hotel Thamel Park" }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

function aboutSchema(content: Awaited<ReturnType<typeof getContent>>) {
  const page = content.aboutPage;
  const siteUrl = SITE_URL;
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: page.seo.title,
    description: page.seo.description,
    url: `${siteUrl}/about`,
    isPartOf: {
      "@type": "WebSite",
      name: content.hotel.name || siteConfig.name,
      url: siteUrl,
    },
    mainEntity: {
      "@type": "Hotel",
      name: content.hotel.name || siteConfig.name,
      description: page.story.content,
      image: page.hero.imageSrc,
      url: siteUrl,
      address: {
        "@type": "PostalAddress",
        streetAddress: content.hotel.address,
        addressLocality: "Kathmandu",
        addressCountry: "NP",
      },
      telephone: content.hotel.phone,
      email: content.hotel.email,
      amenityFeature: page.services.items
        .filter((i) => i.enabled !== false)
        .map((i) => ({
          "@type": "LocationFeatureSpecification",
          name: i.title,
          value: true,
        })),
    },
  };
}

export default async function AboutRoute() {
  const content = await getContent();
  const breadcrumb = buildBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "About", url: "/about" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema(content)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <AboutHero hero={content.aboutPage.hero} />
      <AboutPage content={content.aboutPage} />
    </>
  );
}
