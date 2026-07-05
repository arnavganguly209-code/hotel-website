"use client";

import { SectionHeading } from "@/components/shared/SectionHeading";
import { MasonryGallery } from "@/components/shared/MasonryGallery";
import { SectionPreviewLink } from "@/components/shared/SectionPreviewLink";
import { galleryImages } from "@/lib/media";
import { routes } from "@/lib/navigation";

export function GalleryPreview() {
  return (
    <section id="gallery" className="relative px-6 py-28 lg:px-8 lg:py-36">
      <div className="absolute inset-0 bg-luxury-cream" />
      <div className="relative mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Visual Journey"
          title="The Art of Luxury"
          description="Moments of elegance captured across our world of hospitality."
        />
        <MasonryGallery items={galleryImages.slice(0, 6)} columns={3} />
        <SectionPreviewLink href={routes.gallery} label="View Full Gallery" />
      </div>
    </section>
  );
}
