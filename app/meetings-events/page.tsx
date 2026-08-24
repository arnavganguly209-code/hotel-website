import type { Metadata } from "next";
import { getContent } from "@/lib/cms/store";
import { InnerPageHero } from "@/components/shared/InnerPageHero";
import { MeetingsEventsPage } from "@/sections/pages/MeetingsEventsPage";
import { siteConfig } from "@/lib/config";
import { metadataForPath } from "@/lib/seo/page-catalog";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent();
  return metadataForPath(content, "/meetings-events");
}

function eventSchema(content: Awaited<ReturnType<typeof getContent>>) {
  const page = content.meetingsEventsPage;
  return {
    "@context": "https://schema.org",
    "@type": "EventVenue",
    name: `${content.hotel.name} — Meetings & Events`,
    description: page.seo.description,
    url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://hotelthamelpark.com"}/meetings-events`,
    image: page.hero.media.imageSrc || page.hero.imageSrc,
    address: {
      "@type": "PostalAddress",
      streetAddress: content.hotel.address,
      addressLocality: "Kathmandu",
      addressCountry: "NP",
    },
    telephone: content.hotel.phone,
    maximumAttendeeCapacity: 400,
  };
}

export default async function MeetingsEventsRoute() {
  const content = await getContent();
  const page = content.meetingsEventsPage;
  const heroMedia = page.hero.media;
  const heroImage =
    heroMedia.type === "image"
      ? heroMedia.imageSrc || page.hero.imageSrc
      : page.hero.imageSrc;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema(content)) }}
      />
      <InnerPageHero
        title={page.hero.title}
        subtitle={page.hero.subtitle}
        description={page.hero.description}
        imageSrc={heroImage}
        videoSrc={heroMedia.type === "video" ? heroMedia.videoSrc : undefined}
        mediaType={heroMedia.type}
        overlay="gold"
        ctaText={page.hero.ctaText}
        ctaHref={page.hero.ctaHref}
      />
      <MeetingsEventsPage content={page} />
    </>
  );
}
