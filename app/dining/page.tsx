import type { Metadata } from "next";
import { getContent } from "@/lib/cms/store";
import { InnerPageHero } from "@/components/shared/InnerPageHero";
import { DiningPage } from "@/sections/pages/DiningPage";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent();
  return {
    title: "Dining",
    description: `Fine dining and culinary experiences at ${content.hotel.name}, Kathmandu.`,
  };
}

export default async function DiningRoute() {
  const content = await getContent();

  return (
    <>
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
