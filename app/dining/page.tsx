import type { Metadata } from "next";
import { getContent } from "@/lib/cms/store";
import { buildPageMetadata, buildBreadcrumbSchema } from "@/lib/seo/page-metadata";
import { InnerPageHero } from "@/components/shared/InnerPageHero";
import { DiningPage } from "@/sections/pages/DiningPage";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent();
  const seo = content.diningPage.seo ?? {
    title: "Dining",
    description: `Fine dining and culinary experiences at ${content.hotel.name}, Kathmandu.`,
  };
  return buildPageMetadata(seo, "/dining", content.hotel.name);
}

export default async function DiningRoute() {
  const content = await getContent();
  const breadcrumb = buildBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Dining", url: "/dining" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <InnerPageHero
        title={content.diningPage.hero.title}
        subtitle={content.diningPage.hero.subtitle}
        description={content.diningPage.hero.description}
        imageSrc={content.diningPage.hero.imageSrc}
      />
      <DiningPage content={content.diningPage} />
    </>
  );
}
