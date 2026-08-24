import type { Metadata } from "next";
import { getContent } from "@/lib/cms/store";
import { ContactHero } from "@/components/contact/ContactHero";
import { ContactPage } from "@/sections/pages/ContactPage";
import { siteConfig } from "@/lib/config";
import { SITE_URL } from "@/lib/seo";
import { buildBreadcrumbSchema } from "@/lib/seo/page-metadata";
import { metadataForPath } from "@/lib/seo/page-catalog";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent();
  return metadataForPath(content, "/contact");
}

function contactSchema(content: Awaited<ReturnType<typeof getContent>>) {
  const page = content.contactPage;
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: `Contact ${content.hotel.name || siteConfig.name}`,
    description: page.seo.description,
    url: `${SITE_URL}/contact`,
    mainEntity: { "@id": `${SITE_URL}/#hotel` },
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
