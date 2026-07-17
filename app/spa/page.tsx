import type { Metadata } from "next";
import { getContent } from "@/lib/cms/store";
import { buildPageMetadata, buildBreadcrumbSchema } from "@/lib/seo/page-metadata";
import { InnerPageHero } from "@/components/shared/InnerPageHero";
import { SpaPage } from "@/sections/pages/SpaPage";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent();
  const seo = content.spaPage.seo ?? {
    title: "Spa & Wellness",
    description: `Luxury spa and wellness treatments at ${content.hotel.name}, Kathmandu.`,
  };
  return buildPageMetadata(seo, "/spa", content.hotel.name);
}

export default async function SpaRoute() {
  const content = await getContent();
  const breadcrumb = buildBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Spa & Wellness", url: "/spa" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <InnerPageHero
        title={content.spaPage.hero.title}
        subtitle={content.spaPage.hero.subtitle}
        description={content.spaPage.hero.description}
        imageSrc={content.spaPage.hero.imageSrc}
      />
      <SpaPage content={content.spaPage} />
    </>
  );
}
