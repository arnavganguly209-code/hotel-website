import type { Metadata } from "next";
import { getContent } from "@/lib/cms/store";
import { buildPageMetadata } from "@/lib/seo/page-metadata";
import { InnerPageHero } from "@/components/shared/InnerPageHero";
import { RoomsPage } from "@/sections/pages/RoomsPage";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent();
  return buildPageMetadata(content.roomsPage.seo, "/rooms", content.hotel.name);
}

export default async function RoomsRoute() {
  const content = await getContent();

  return (
    <>
      <InnerPageHero
        title={content.roomsSection.title}
        subtitle={content.roomsSection.eyebrow}
        description={content.roomsSection.description}
        imageSrc={content.rooms[0]?.imageSrc}
      />
      <RoomsPage rooms={content.rooms} />
    </>
  );
}
