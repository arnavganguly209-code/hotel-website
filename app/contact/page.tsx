import type { Metadata } from "next";
import { getContent } from "@/lib/cms/store";
import { ContactHero } from "@/components/contact/ContactHero";
import { ContactPage } from "@/sections/pages/ContactPage";
import { siteConfig } from "@/lib/config";
import { SITE_URL } from "@/lib/seo";
import { buildBreadcrumbSchema, buildPageMetadata } from "@/lib/seo/page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent();
  const { seo } = content.contactPage;
  return buildPageMetadata(
    {
      title: seo.title || "Contact | Hotel Thamel Park",
      description:
        seo.description ||
        `Contact ${content.hotel.name || siteConfig.name} for reservations and concierge assistance.`,
      canonical: seo.canonical,
      ogImage: seo.ogImage,
    },
    "/contact",
    content.hotel.name
  );
}

function contactSchema(content: Awaited<ReturnType<typeof getContent>>) {
  const page = content.contactPage;
  return {
    "@context": "https://schema.org",
    "@type": "Hotel",
    name: content.hotel.name || siteConfig.name,
    description: page.seo.description,
    url: `${SITE_URL}/contact`,
    image: page.hero.imageSrc || page.seo.ogImage,
    telephone: page.phone || content.hotel.phone,
    email: page.email || content.hotel.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: page.address || content.hotel.address,
      addressLocality: "Kathmandu",
      addressCountry: "NP",
    },
  };
}

export default async function ContactRoute() {
  const content = await getContent();
  const breadcrumb = buildBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Contact", url: "/contact" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema(content)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <ContactHero hero={content.contactPage.hero} />
      <ContactPage content={content} />
    </>
  );
}
