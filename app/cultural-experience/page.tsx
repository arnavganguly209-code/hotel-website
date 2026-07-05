import type { Metadata } from "next";
import { getContent } from "@/lib/cms/store";
import { InnerPageHero } from "@/components/shared/InnerPageHero";
import { CulturalExperiencePage } from "@/sections/pages/CulturalExperiencePage";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent();
  const { seo } = content.culturalExperiencePage;
  return {
    title: seo.title,
    description: seo.description,
    alternates: seo.canonical ? { canonical: seo.canonical } : undefined,
    openGraph: {
      title: seo.title,
      description: seo.description,
      images: seo.ogImage ? [{ url: seo.ogImage }] : undefined,
    },
  };
}

export default async function CulturalExperienceRoute() {
  const content = await getContent();
  const page = content.culturalExperiencePage;
  const media = page.hero.media;

  return (
    <>
      <InnerPageHero
        title={page.hero.title}
        subtitle={page.hero.subtitle}
        description={page.hero.description}
        imageSrc={media.type === "image" ? media.imageSrc || page.hero.imageSrc : page.hero.imageSrc}
        videoSrc={media.type === "video" ? media.videoSrc : undefined}
        mediaType={media.type}
        overlay="gold"
      />
      <CulturalExperiencePage content={page} />
    </>
  );
}
