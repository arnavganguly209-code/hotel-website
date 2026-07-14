import type { Metadata } from "next";
import { getContent } from "@/lib/cms/store";
import { InnerPageHero } from "@/components/shared/InnerPageHero";
import { MasonryGallery } from "@/components/shared/MasonryGallery";
import { SectionHeading } from "@/components/shared/SectionHeading";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent();
  return {
    title: "Gallery",
    description: `Visual journey through ${content.hotel.name} — luxury hospitality in Kathmandu.`,
  };
}

export default async function GalleryRoute() {
  const content = await getContent();

  return (
    <>
      <InnerPageHero
        title={content.gallerySection.title}
        subtitle={content.gallerySection.eyebrow}
        description={content.gallerySection.description}
        imageSrc={content.gallery[0]?.src}
        height="medium"
      />
      <section className="section-padding bg-luxury-cream-light">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow={content.gallerySection.eyebrow}
            title={content.gallerySection.title}
            description={content.gallerySection.description}
            className="mb-4"
          />
          <MasonryGallery
            items={content.gallery
              .filter((g) => g.active !== false && Boolean(g.src))
              .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
              .map((g) => ({
                id: g.id,
                src: g.src,
                title: g.title,
                category: g.category,
              }))}
            columns={3}
          />
        </div>
      </section>
    </>
  );
}
