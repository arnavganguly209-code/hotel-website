import type { Metadata } from "next";
import { getContent } from "@/lib/cms/store";
import { InnerPageHero } from "@/components/shared/InnerPageHero";
import { CulturalExperiencePage } from "@/sections/pages/CulturalExperiencePage";
import { metadataForPath } from "@/lib/seo/page-catalog";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent();
  return metadataForPath(content, "/cultural-experience");
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
