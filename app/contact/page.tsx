import type { Metadata } from "next";
import { getContent } from "@/lib/cms/store";
import { ContactHero } from "@/components/contact/ContactHero";
import { ContactPage } from "@/sections/pages/ContactPage";
import { siteConfig } from "@/lib/config";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent();
  const { seo, hero } = content.contactPage;
  const title = seo.title || "Contact | Hotel Thamel Park";
  const description =
    seo.description ||
    `Contact ${content.hotel.name || siteConfig.name} for reservations and concierge assistance.`;

  return {
    title,
    description,
    keywords: seo.keywords,
    alternates: seo.canonical ? { canonical: seo.canonical } : undefined,
    openGraph: {
      title,
      description,
      url: seo.canonical || "/contact",
      type: "website",
      images: seo.ogImage ? [{ url: seo.ogImage, alt: hero.title }] : undefined,
    },
  };
}

function contactSchema(content: Awaited<ReturnType<typeof getContent>>) {
  const page = content.contactPage;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hotel.theglobalorbit.com";
  return {
    "@context": "https://schema.org",
    "@type": "Hotel",
    name: content.hotel.name || siteConfig.name,
    description: page.seo.description,
    url: `${siteUrl}/contact`,
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema(content)) }}
      />
      <ContactHero hero={content.contactPage.hero} />
      <ContactPage content={content} />
    </>
  );
}
