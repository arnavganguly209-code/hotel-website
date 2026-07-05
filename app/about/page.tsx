import type { Metadata } from "next";
import { getContent } from "@/lib/cms/store";
import { InnerPageHero } from "@/components/shared/InnerPageHero";
import { AboutPage } from "@/sections/pages/AboutPage";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent();
  return {
    title: "About",
    description: `Discover the story of ${content.hotel.name} — premium hospitality in the heart of Thamel, Kathmandu.`,
  };
}

export default async function AboutRoute() {
  const content = await getContent();

  return (
    <>
      <InnerPageHero
        title={content.aboutPage.hero.title}
        subtitle={content.aboutPage.hero.subtitle}
        description={content.aboutPage.hero.description}
        imageSrc={content.aboutPage.hero.imageSrc}
      />
      <AboutPage content={content.aboutPage} />
    </>
  );
}
