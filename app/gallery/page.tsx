import type { Metadata } from "next";
import { getContent } from "@/lib/cms/store";
import { InnerPageHero } from "@/components/shared/InnerPageHero";
import { LuxuryGalleryGrid } from "@/components/shared/LuxuryGalleryGrid";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent();
  const { seo, hero } = content.galleryPage;
  const title = seo.title || "Gallery";
  const description =
    seo.description ||
    `Visual journey through ${content.hotel.name} — luxury hospitality in Kathmandu.`;

  return {
    title,
    description,
    keywords: seo.keywords,
    alternates: seo.canonical ? { canonical: seo.canonical } : undefined,
    openGraph: {
      title,
      description,
      url: seo.canonical || "/gallery",
      type: "website",
      images: seo.ogImage
        ? [{ url: seo.ogImage, alt: hero.title }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: seo.ogImage ? [seo.ogImage] : undefined,
    },
  };
}

export default async function GalleryRoute() {
  const content = await getContent();
  const page = content.galleryPage;
  const gold = page.goldColor || "#C5A059";
  const heading = page.headingColor || "#062C24";
  const body = page.bodyColor || "#5A635C";
  const topBg = page.backgroundTop || "#F9F6EF";
  const bottomBg = page.backgroundBottom || "#E8F0E9";

  const heroImage =
    page.hero.media?.imageSrc || page.hero.imageSrc || content.gallery[0]?.src;

  const items = content.gallery
    .filter((g) => g.active !== false && Boolean(g.src))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((g) => ({
      id: g.id,
      src: g.src,
      title: g.title,
      description: g.description,
      category: g.category,
      alt: g.alt,
    }));

  const categories = [...content.galleryCategories]
    .filter((c) => c.enabled !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((c) => c.name);

  const schema = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: `${content.hotel.name} Gallery`,
    description: page.seo.description,
    url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://hotel.theglobalorbit.com"}/gallery`,
    image: items.slice(0, 6).map((item) => item.src),
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: process.env.NEXT_PUBLIC_SITE_URL || "https://hotel.theglobalorbit.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Gallery",
        item: `${process.env.NEXT_PUBLIC_SITE_URL || "https://hotel.theglobalorbit.com"}/gallery`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <InnerPageHero
        title={page.hero.title}
        subtitle={page.hero.subtitle || page.eyebrow}
        description={page.hero.description || page.description}
        imageSrc={heroImage}
        videoSrc={
          page.hero.media?.type === "video" ? page.hero.media.videoSrc : undefined
        }
        mediaType={page.hero.media?.type || "image"}
        overlay="gold"
      />
      <section
        className="relative overflow-x-clip"
        style={{
          background: `linear-gradient(180deg, ${topBg} 0%, ${topBg} 40%, ${bottomBg} 100%)`,
        }}
      >
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <p
              className="font-body text-[12px] font-semibold uppercase"
              style={{ color: gold, letterSpacing: "0.34em" }}
            >
              {page.eyebrow}
            </p>
            <h2
              className="mt-4 font-display text-3xl font-semibold uppercase tracking-[0.03em] md:text-4xl"
              style={{ color: heading }}
            >
              {page.title}
            </h2>
            <p
              className="mx-auto mt-5 max-w-xl font-body text-[15px] leading-[1.85]"
              style={{ color: body }}
            >
              {page.description}
            </p>
            <div className="mx-auto mt-6 flex items-center justify-center gap-3" aria-hidden>
              <span className="h-px w-12" style={{ backgroundColor: `${gold}77` }} />
              <span className="h-1.5 w-1.5 rotate-45" style={{ backgroundColor: gold }} />
              <span className="h-px w-12" style={{ backgroundColor: `${gold}77` }} />
            </div>
          </div>

          <LuxuryGalleryGrid
            items={items}
            categories={categories}
            showFilters={page.showFilters !== false}
            columns={page.gridColumns || 3}
            goldColor={gold}
            headingColor={heading}
            borderColor={page.borderColor}
          />
        </div>
      </section>
    </>
  );
}
