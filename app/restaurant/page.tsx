import type { Metadata } from "next";
import { getContent } from "@/lib/cms/store";
import { buildPageMetadata, buildBreadcrumbSchema } from "@/lib/seo/page-metadata";
import { SITE_URL } from "@/lib/seo";
import { DiningHero } from "@/components/dining/DiningHero";
import { DiningPage } from "@/sections/pages/DiningPage";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent();
  const seo = content.diningPage.seo ?? {
    title: "Restaurant | Hotel Thamel Park",
    description: `Fine dining at ${content.hotel.name}, Kathmandu.`,
  };
  const meta = buildPageMetadata(seo, "/restaurant", content.hotel.name);
  if (seo.keywords) {
    return { ...meta, keywords: seo.keywords };
  }
  return meta;
}

export default async function RestaurantRoute() {
  const content = await getContent();
  const page = content.diningPage;
  const hotel = content.hotel;

  const breadcrumb = buildBreadcrumbSchema([
    { name: page.hero.breadcrumbHome || "Home", url: "/" },
    { name: page.hero.breadcrumbCurrent || "Restaurant", url: "/restaurant" },
  ]);

  const restaurants = page.venues
    .filter((v) => v.enabled !== false)
    .map((v) => ({
      "@type": "Restaurant",
      name: v.name,
      description: v.description,
      image: v.imageSrc?.startsWith("http") ? v.imageSrc : `${SITE_URL}${v.imageSrc}`,
      servesCuisine: v.cuisine,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Kathmandu",
        addressCountry: "NP",
        streetAddress: hotel.address || "Thamel",
      },
      telephone: hotel.phone,
    }));

  const restaurantSchema = {
    "@context": "https://schema.org",
    "@graph": restaurants,
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
            acceptedAnswer: {
              "@type": "Answer",
              text: f.answer,
            },
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantSchema) }}
      />
      {faqSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      ) : null}
      <DiningHero hero={page.hero} />
      <DiningPage content={page} />
    </>
  );
}
