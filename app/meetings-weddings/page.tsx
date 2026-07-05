import type { Metadata } from "next";
import Link from "next/link";
import { InnerPageHero } from "@/components/shared/InnerPageHero";
import { MeetingsPage } from "@/sections/pages/MeetingsPage";
import { pageHeroMedia } from "@/lib/media";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "Meetings & Weddings",
  description: `Host exceptional events at ${siteConfig.name}. Luxury meetings and weddings in Kathmandu.`,
};

export default function MeetingsRoute() {
  return (
    <>
      <InnerPageHero
        title="Meetings & Weddings"
        subtitle="Celebrations"
        description="Extraordinary venues for life's most memorable occasions."
        imageSrc={pageHeroMedia.meetings}
        overlay="gold"
      />
      <MeetingsPage />
    </>
  );
}
