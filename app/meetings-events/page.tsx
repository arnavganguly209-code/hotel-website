import type { Metadata } from "next";
import { getContent } from "@/lib/cms/store";
import { InnerPageHero } from "@/components/shared/InnerPageHero";
import { MeetingsEventsPage } from "@/sections/pages/MeetingsEventsPage";
import { siteConfig } from "@/lib/config";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent();
  const { seo, hero } = content.meetingsEventsPage;
  const title = seo.title || "Meetings & Events";
  const description =
    seo.description ||
    `Host exceptional meetings and events at ${siteConfig.name}, Kathmandu.`;

  return {
    title,
    description,
    keywords: seo.keywords,
    alternates: seo.canonical ? { canonical: seo.canonical } : undefined,
    openGraph: {
      title,
      description,
      url: seo.canonical || "/meetings-events",
      type: "website",
      images: seo.ogImage ? [{ url: seo.ogImage, alt: hero.title }] : undefined,
    },
  };
}

function eventSchema(content: Awaited<ReturnType<typeof getContent>>) {
  const page = content.meetingsEventsPage;
  return {
    "@context": "https://schema.org",
    "@type": "EventVenue",
    name: `${content.hotel.name} — Meetings & Events`,
    description: page.seo.description,
    url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://hotel.theglobalorbit.com"}/meetings-events`,
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
