import { getContent } from "@/lib/cms/store";
import { Hero } from "@/sections/Hero";
import { Overview } from "@/sections/Overview";
import { RoomsSection } from "@/sections/RoomsSection";
import { ExperienceSections } from "@/sections/ExperienceSections";
import { NepaliCulture } from "@/sections/NepaliCulture";
import { FacilitiesSection } from "@/sections/FacilitiesSection";
import { FineDiningSection } from "@/sections/FineDiningSection";
import { LobbyCafeSection } from "@/sections/LobbyCafeSection";
import { RooftopExperienceSection } from "@/sections/RooftopExperienceSection";
import { SpaWellnessHomeSection } from "@/sections/SpaWellnessHomeSection";
import { GalleryHomeSection } from "@/sections/GalleryHomeSection";
import { ReviewsSection } from "@/sections/ReviewsSection";
import { ContactHomeSection } from "@/sections/ContactHomeSection";
import { FinalCTA } from "@/sections/FinalCTA";
import type { SiteContent } from "@/lib/cms/types";

function isEnabled(section: { enabled: boolean }) {
  return section.enabled !== false;
}

export default async function HomePage() {
  const content = await getContent();
  const { homeSections: hs } = content;

  const sections: Array<{ key: string; order: number; node: React.ReactNode }> = [];

  if (isEnabled(hs.hero)) {
    sections.push({
      key: "hero",
      order: hs.hero.order,
      node: <Hero content={content.hero} theme={content.theme} rooms={content.rooms} />,
    });
  }
  if (isEnabled(hs.welcome)) {
    sections.push({ key: "welcome", order: hs.welcome.order, node: <Overview content={content.overview} /> });
  }
  if (isEnabled(hs.aboutPreview)) {
    sections.push({ key: "aboutPreview", order: hs.aboutPreview.order, node: <NepaliCulture content={content.culture} /> });
  }
  if (isEnabled(hs.rooms)) {
    sections.push({ key: "rooms", order: hs.rooms.order, node: <RoomsSection rooms={content.rooms} section={content.roomsSection} /> });
  }
  if (isEnabled(hs.dining)) {
    const remainingExperiences = content.experiences.filter(
      (e) =>
        e.variant !== "spa" &&
        e.variant !== "dining" &&
        e.variant !== "cafe" &&
        e.variant !== "lounge"
    );
    sections.push({
      key: "dining",
      order: hs.dining.order,
      node: (
        <>
          <FineDiningSection section={content.fineDiningSection} />
          {content.lobbyCafeSection.enabled !== false ? (
            <LobbyCafeSection section={content.lobbyCafeSection} />
          ) : null}
          {content.rooftopExperienceSection.enabled !== false ? (
            <RooftopExperienceSection
              section={content.rooftopExperienceSection}
            />
          ) : null}
          {remainingExperiences.length > 0 ? (
            <ExperienceSections experiences={remainingExperiences} />
          ) : null}
        </>
      ),
    });
  }
  if (isEnabled(hs.spa)) {
    sections.push({
      key: "spa",
      order: hs.spa.order,
      node:
        content.spaWellnessSection.enabled !== false ? (
          <SpaWellnessHomeSection section={content.spaWellnessSection} />
        ) : null,
    });
  }
  if (isEnabled(hs.facilities)) {
    sections.push({
      key: "facilities",
      order: hs.facilities.order,
      node: (
        <FacilitiesSection facilities={content.facilities} section={content.facilitiesSection} />
      ),
    });
  }
  if (isEnabled(hs.gallery)) {
    sections.push({
      key: "gallery",
      order: hs.gallery.order,
      node: <GalleryHomeSection gallery={content.gallery} section={content.gallerySection} />,
    });
  }
  if (isEnabled(hs.testimonials)) {
    sections.push({ key: "testimonials", order: hs.testimonials.order, node: <ReviewsSection reviews={content.reviews} /> });
  }
  if (isEnabled(hs.cta)) {
    sections.push({ key: "cta", order: hs.cta.order, node: <FinalCTA meta={hs.cta} /> });
  }

  sections.push({
    key: "contact",
    order: 99,
    node: <ContactHomeSection contact={content.contact} hotel={content.hotel} />,
  });

  sections.sort((a, b) => a.order - b.order);

  return <>{sections.map((s) => <div key={s.key}>{s.node}</div>)}</>;
}
