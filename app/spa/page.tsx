import type { Metadata } from "next";
import { getContent } from "@/lib/cms/store";
import { buildPageMetadata, buildBreadcrumbSchema } from "@/lib/seo/page-metadata";
import { SITE_URL } from "@/lib/seo";
import { SpaHero } from "@/components/spa/SpaHero";
import { SpaPage } from "@/sections/pages/SpaPage";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent();
  const seo = content.spaPage.seo ?? {
    title: "Spa & Wellness | Hotel Thamel Park",
    description: `Luxury spa and wellness at ${content.hotel.name}, Kathmandu.`,
  };
  const meta = buildPageMetadata(seo, "/spa", content.hotel.name);
  if (seo.keywords) {
    return { ...meta, keywords: seo.keywords };
  }
  return meta;
}

export default async function SpaRoute() {
  const content = await getContent();
  const page = content.spaPage;
  const hotel = content.hotel;

  const breadcrumb = buildBreadcrumbSchema([
    { name: page.hero.breadcrumbHome || "Home", url: "/" },
    { name: page.hero.breadcrumbCurrent || "Spa & Wellness", url: "/spa" },
  ]);

  const spaSchema = {
    "@context": "https://schema.org",
    "@type": "DaySpa",
    name: `${hotel.name} Spa & Wellness`,
    description: page.seo.description || page.hero.description,
    image: page.hero.imageSrc?.startsWith("http")
      ? page.hero.imageSrc
      : `${SITE_URL}${page.hero.imageSrc || ""}`,
    url: `${SITE_URL}/spa`,
    telephone: hotel.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: hotel.address || "Thamel",
      addressLocality: "Kathmandu",
      addressCountry: "NP",
    },
  };

  const faqItems = page.faq.items.filter((f) => f.enabled !== false);
  const faqSchema =
    faqItems.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqItems.map((f) => ({
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(spaSchema) }}
      />
      {faqSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      ) : null}
      <SpaHero hero={page.hero} />
      <SpaPage content={page} />
    </>
  );
}
