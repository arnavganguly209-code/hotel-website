import type { Metadata } from "next";
import { getContent } from "@/lib/cms/store";
import { InnerPageHero } from "@/components/shared/InnerPageHero";
import { SpaPage } from "@/sections/pages/SpaPage";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent();
  return {
    title: "Spa & Wellness",
    description: `Luxury spa and wellness treatments at ${content.hotel.name}, Kathmandu.`,
  };
}

export default async function SpaRoute() {
  const content = await getContent();

  return (
    <>
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
