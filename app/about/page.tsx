import type { Metadata } from "next";
import { getContent } from "@/lib/cms/store";
import { AboutHero } from "@/components/about/AboutHero";
import { AboutPage } from "@/sections/pages/AboutPage";
import { siteConfig } from "@/lib/config";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent();
  const { seo, hero } = content.aboutPage;
  const title = seo.title || "About | Hotel Thamel Park";
  const description =
    seo.description ||
    `Discover the story of ${content.hotel.name || siteConfig.name} in Thamel, Kathmandu.`;

  return {
    title,
    description,
    keywords: seo.keywords,
    alternates: seo.canonical ? { canonical: seo.canonical } : undefined,
    openGraph: {
      title,
      description,
      url: seo.canonical || "/about",
      type: "website",
      images: seo.ogImage ? [{ url: seo.ogImage, alt: hero.title }] : undefined,
    },
  };
}

function aboutSchema(content: Awaited<ReturnType<typeof getContent>>) {
  const page = content.aboutPage;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hotel.theglobalorbit.com";
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: page.seo.title,
    description: page.seo.description,
    url: `${siteUrl}/about`,
    mainEntity: {
      "@type": "Hotel",
      name: content.hotel.name || siteConfig.name,
      description: page.story.content,
      image: page.hero.imageSrc,
      address: {
        "@type": "PostalAddress",
        streetAddress: content.hotel.address,
        addressLocality: "Kathmandu",
        addressCountry: "NP",
      },
      telephone: content.hotel.phone,
    },
  };
}

export default async function AboutRoute() {
  const content = await getContent();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema(content)) }}
      />
      <AboutHero hero={content.aboutPage.hero} />
      <AboutPage content={content.aboutPage} />
    </>
  );
}
